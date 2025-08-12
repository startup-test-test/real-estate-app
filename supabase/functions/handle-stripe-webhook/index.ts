import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  try {
    // Webhook署名の検証
    const signature = req.headers.get('stripe-signature')!
    const body = await req.text()
    
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Supabaseクライアント作成
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // イベントタイプに応じて処理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        
        if (!userId) {
          console.error('User ID not found in session metadata')
          break
        }

        // サブスクリプション情報を取得
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Supabaseにサブスクリプション情報を保存
        const { error: insertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0].price.id,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (insertError) {
          console.error('Error saving subscription:', insertError)
        } else {
          console.log('Subscription created/updated for user:', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) break

        // サブスクリプション状態を更新
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'inactive',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
        } else {
          console.log('Subscription updated for:', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // サブスクリプションを無効化
        const { error: deleteError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (deleteError) {
          console.error('Error cancelling subscription:', deleteError)
        } else {
          console.log('Subscription cancelled:', subscription.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          // 支払い成功時の処理
          console.log('Payment succeeded for subscription:', subscriptionId)
          
          // サブスクリプションのステータスを確実にactiveにする
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('Error updating subscription status:', error)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          // 支払い失敗時の処理
          console.log('Payment failed for subscription:', subscriptionId)
          
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('Error updating subscription status:', error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500 }
    )
  }
})