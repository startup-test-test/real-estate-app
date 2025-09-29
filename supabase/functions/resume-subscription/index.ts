import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      httpClient: Stripe.createFetchHttpClient(),
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

    console.log('Processing resume for user:', user.id)

    // Get active subscription that is scheduled for cancellation
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('cancel_at_period_end', true)
      .single()

    if (subError || !subscription) {
      console.error('Subscription fetch error:', subError)
      throw new Error('解約予定のプランが見つかりません')
    }

    console.log('Found subscription to resume:', subscription.stripe_subscription_id)

    // Check if this is a test subscription
    const isTestMode = subscription.stripe_subscription_id.startsWith('sub_test_')
    
    if (!isTestMode) {
      // Production mode: Update subscription in Stripe to resume
      // IMPORTANT: proration_behavior: 'none' prevents immediate charging
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: false,
          proration_behavior: 'none', // 即座の課金を防ぐ
          metadata: {
            resumed_by: user.email || user.id,
            resumed_at: new Date().toISOString()
          }
        }
      )

      console.log('Stripe subscription resumed:', stripeSubscription.id)
    } else {
      console.log('Test mode detected, skipping Stripe API call')
    }
    
    // Update subscription in database
    const { data: updatedSubscription, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        cancel_at: null,
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

    // Return success response
    const response = {
      success: true,
      message: 'プレミアムプランを継続します'
    }

    console.log('Resume successful:', response)

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
    console.error('Resume subscription error:', error)
    
    // Determine error message
    let errorMessage = '解約取り消し処理中にエラーが発生しました'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('認証')) {
        errorMessage = error.message
        statusCode = 401
      } else if (error.message.includes('見つかりません')) {
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
// Deploy trigger Thu Aug 14 04:04:53 AM UTC 2025
