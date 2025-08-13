// ⚠️ 重要：Stripeで実際に課金を止めるためのEdge Function
// 現在の簡易版を置き換える必要があります

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    // ⭐ Stripe APIキーが必要
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured - 課金は停止されません')
    }
    
    // Stripe初期化
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('認証が必要です')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('ユーザー認証に失敗しました')
    }

    console.log('Processing cancellation for user:', user.id)

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      throw new Error('アクティブなプランが見つかりません')
    }

    if (subscription.cancel_at_period_end) {
      throw new Error('すでに解約予定です')
    }

    // ⭐⭐⭐ 重要：Stripeで実際に解約処理 ⭐⭐⭐
    console.log('Canceling Stripe subscription:', subscription.stripe_subscription_id)
    
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { 
        cancel_at_period_end: true, // 期間終了時に解約
        metadata: {
          canceled_by: user.email || user.id,
          canceled_at: new Date().toISOString()
        }
      }
    )

    console.log('Stripe subscription updated - 課金は期間終了時に停止されます')

    // Stripeから実際の解約日を取得
    const cancelAt = new Date(stripeSubscription.current_period_end * 1000)
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000)
    
    // データベースを更新
    const { data: updatedSubscription, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancel_at: cancelAt.toISOString(),
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: cancelAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()
      .single()

    if (updateError) {
      throw new Error('データベース更新に失敗しました')
    }

    const remainingDays = Math.ceil(
      (cancelAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    const response = {
      success: true,
      cancel_date: cancelAt.toISOString(),
      remaining_days: remainingDays,
      message: `${cancelAt.toLocaleDateString('ja-JP')}まで全機能をご利用いただけます（あと${remainingDays}日）`,
      stripe_status: 'canceled_at_period_end' // Stripeでの解約状態
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Cancel subscription error:', error)
    
    let errorMessage = '解約処理中にエラーが発生しました'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('認証')) {
        errorMessage = error.message
        statusCode = 401
      } else if (error.message.includes('見つかりません') || error.message.includes('すでに')) {
        errorMessage = error.message
        statusCode = 400
      } else {
        errorMessage = error.message || errorMessage
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})