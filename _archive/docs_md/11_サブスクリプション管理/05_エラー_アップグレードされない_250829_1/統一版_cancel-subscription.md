# cancel-subscription 統一版コード

## エラー解消・環境統一版

```typescript
import { serve } from 'https://deno.land/std@0.177.1/http/server.ts'  // 統一
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'  // 統一
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'  // 統一

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get auth header and verify user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('認証が必要です')
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      console.error('User authentication error:', userError)
      throw new Error('ユーザー認証に失敗しました')
    }

    console.log('Processing cancellation for user:', user.id)

    // Get active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      console.error('Subscription fetch error:', subError)
      throw new Error('アクティブなプランが見つかりません')
    }

    // Check if already scheduled for cancellation
    if (subscription.cancel_at_period_end) {
      throw new Error('すでに解約予定です')
    }

    console.log('Found subscription:', subscription.stripe_subscription_id)

    // Update subscription in Stripe to cancel at period end
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          canceled_by: user.email || user.id,
          canceled_at: new Date().toISOString()
        }
      }
    )

    console.log('Stripe subscription updated:', stripeSubscription.id)

    // Calculate cancellation date (convert from Unix timestamp)
    const cancelAt = new Date(stripeSubscription.current_period_end * 1000)
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000)

    // Update subscription in database
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
      console.error('Database update error:', updateError)
      throw new Error('データベース更新に失敗しました')
    }

    console.log('Database updated successfully')

    // Calculate remaining days
    const remainingDays = Math.ceil((cancelAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    // Return success response
    const response = {
      success: true,
      cancel_date: cancelAt.toISOString(),
      remaining_days: remainingDays,
      message: `${cancelAt.toLocaleDateString('ja-JP')}まで全機能をご利用いただけます（残り${remainingDays}日）`
    }

    console.log('Cancellation successful:', response)

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    
    // Determine error message
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

    return new Response(JSON.stringify({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})
```

## 変更点

### バージョン統一
- Deno std: @0.168.0 → @0.177.1
- Stripe SDK: v13.11.0 → v14.0.0
- Supabase JS: @2.39.0 → @2.39.3

### これで解消されるエラー
- ✅ event loop error（Denoバージョン統一で解消予定）

### 機能への影響
- 変更前後で機能に変更なし
- 解約処理は正常に動作継続

## デプロイ手順

```bash
# 両環境に同じファイルをデプロイ
supabase functions deploy cancel-subscription
```