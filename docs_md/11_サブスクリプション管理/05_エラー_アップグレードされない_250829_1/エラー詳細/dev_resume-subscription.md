エラーログ
| event_message                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | event_type        | function_id                          | id                                   | level | timestamp        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------ | ------------------------------------ | ----- | ---------------- |
| event loop error: Error: Deno.core.runMicrotasks() is not supported in this environment
    at Object.core.runMicrotasks (https://deno.land/std@0.177.1/node/_core.ts:23:11)
    at processTicksAndRejections (https://deno.land/std@0.177.1/node/_next_tick.ts:50:10)
    at https://deno.land/std@0.177.1/node/process.ts:288:7
    at innerInvokeEventListeners (ext:deno_web/02_event.js:757:7)
    at invokeEventListeners (ext:deno_web/02_event.js:804:5)
    at dispatch (ext:deno_web/02_event.js:661:9)
    at dispatchEvent (ext:deno_web/02_event.js:1041:12)
    at dispatchBeforeUnloadEvent (ext:runtime/bootstrap.js:425:15) | UncaughtException | e0ed9840-2cd3-4305-843e-7239d306b46f | e938894c-a71a-4d1c-804f-5e8470e16f74 | error | 1756375660127000 |
| event loop error: Error: Deno.core.runMicrotasks() is not supported in this environment
    at Object.core.runMicrotasks (https://deno.land/std@0.177.1/node/_core.ts:23:11)
    at processTicksAndRejections (https://deno.land/std@0.177.1/node/_next_tick.ts:50:10)
    at https://deno.land/std@0.177.1/node/process.ts:288:7
    at innerInvokeEventListeners (ext:deno_web/02_event.js:757:7)
    at invokeEventListeners (ext:deno_web/02_event.js:804:5)
    at dispatch (ext:deno_web/02_event.js:661:9)
    at dispatchEvent (ext:deno_web/02_event.js:1041:12)
    at dispatchBeforeUnloadEvent (ext:runtime/bootstrap.js:425:15) | UncaughtException | e0ed9840-2cd3-4305-843e-7239d306b46f | d45b51e6-81bc-42fc-a245-789c6a17c914 | error | 1756375659838000 |
| Resume successful: { success: true, message: "プレミアムプランを継続します" }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Log               | e0ed9840-2cd3-4305-843e-7239d306b46f | abec3aff-f109-4e84-a2f8-bd4b4cad650a | info  | 1756375461034000 |
| Database updated successfully
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Log               | e0ed9840-2cd3-4305-843e-7239d306b46f | fee825e9-9d58-4283-9f27-b18a5360ede7 | info  | 1756375461033000 |
| Stripe subscription resumed: sub_1RvvkbR8rkVVzR7nucb9GNqw
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Log               | e0ed9840-2cd3-4305-843e-7239d306b46f | bb2528f1-c8b3-46f4-9021-e0da6477a6c5 | info  | 1756375460945000 |
| Found subscription to resume: sub_1RvvkbR8rkVVzR7nucb9GNqw
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Log               | e0ed9840-2cd3-4305-843e-7239d306b46f | 201259be-6aa0-46dc-839a-38de3079cf3d | info  | 1756375460327000 |
| Processing resume for user: 591142c5-738a-4bfd-bf01-638da0b1453f
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Log               | e0ed9840-2cd3-4305-843e-7239d306b46f | dd024e0a-959c-4f4f-acc5-a872c97edf09 | info  | 1756375460240000 |
| Listening on http://localhost:9999/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Log               | e0ed9840-2cd3-4305-843e-7239d306b46f | 51715846-0248-403a-9c00-406d8fb25e19 | info  | 1756375460110000 |
| booted (time: 59ms)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Boot              | e0ed9840-2cd3-4305-843e-7239d306b46f | e5991edb-d9a2-43d1-885f-1483f6d92adb | log   | 1756375460090000 |
| Listening on http://localhost:9999/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Log               | e0ed9840-2cd3-4305-843e-7239d306b46f | a7005964-0751-4ba4-a922-102178e65b2c | info  | 1756375459830000 |
| booted (time: 103ms)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Boot              | e0ed9840-2cd3-4305-843e-7239d306b46f | 93e37bf5-ce60-4fe4-9300-207595da6e13 | log   | 1756375459800000 |



エラー内容
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';
// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    });
  }
  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    // Get auth header and verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('認証が必要です');
    }
    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error('User authentication error:', userError);
      throw new Error('ユーザー認証に失敗しました');
    }
    console.log('Processing resume for user:', user.id);
    // Get active subscription that is scheduled for cancellation
    const { data: subscription, error: subError } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').eq('cancel_at_period_end', true).single();
    if (subError || !subscription) {
      console.error('Subscription fetch error:', subError);
      throw new Error('解約予定のプランが見つかりません');
    }
    console.log('Found subscription to resume:', subscription.stripe_subscription_id);
    // Check if this is a test subscription
    const isTestMode = subscription.stripe_subscription_id.startsWith('sub_test_');
    if (!isTestMode) {
      // Production mode: Update subscription in Stripe to resume
      const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false,
        metadata: {
          resumed_by: user.email || user.id,
          resumed_at: new Date().toISOString()
        }
      });
      console.log('Stripe subscription resumed:', stripeSubscription.id);
    } else {
      console.log('Test mode detected, skipping Stripe API call');
    }
    // Update subscription in database
    const { data: updatedSubscription, error: updateError } = await supabaseAdmin.from('subscriptions').update({
      cancel_at_period_end: false,
      cancel_at: null,
      updated_at: new Date().toISOString()
    }).eq('id', subscription.id).select().single();
    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('データベース更新に失敗しました');
    }
    console.log('Database updated successfully');
    // Return success response
    const response = {
      success: true,
      message: 'プレミアムプランを継続します'
    };
    console.log('Resume successful:', response);
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    // Determine error message
    let errorMessage = '解約取り消し処理中にエラーが発生しました';
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('認証')) {
        errorMessage = error.message;
        statusCode = 401;
      } else if (error.message.includes('見つかりません')) {
        errorMessage = error.message;
        statusCode = 400;
      } else {
        errorMessage = error.message || errorMessage;
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
    });
  }
}) // Deploy trigger Thu Aug 14 04:04:53 AM UTC 2025
;