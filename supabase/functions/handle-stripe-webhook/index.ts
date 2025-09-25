// Supabase Edge Functions（Deno Deploy互換）版：Stripe Webhook
import Stripe from 'https://esm.sh/stripe@14.0.0?target=denonext';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  // Stripe API Version - 2023-10-16 is stable
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // CORS（ブラウザから直叩きしないWebhookでも残してOK）
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { status: 200, headers });

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) return new Response('No signature', { status: 400, headers });

    // 署名検証は raw body 必須
    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
        undefined,
        cryptoProvider,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session: any = event.data.object;
        const userId = session.metadata?.user_id;
        if (!userId) {
          console.log('No user_id found in checkout session metadata');
          break;
        }

        console.log(`Checkout completed for user: ${userId}`);

        // 購読詳細を取得
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(
              String(session.subscription),
            );

            const subscriptionData: any = {
              user_id: userId,
              stripe_subscription_id: sub.id,
              stripe_customer_id: sub.customer as string,
              status: 'active',
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              // 新規アップグレード時は解約フラグを必ずクリア
              cancel_at_period_end: false,
              cancel_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Add stripe_price_id if available
            if (sub.items?.data?.[0]?.price?.id) {
              subscriptionData.stripe_price_id = sub.items.data[0].price.id;
            }

            const { error } = await supabase.from('subscriptions').upsert(
              subscriptionData,
              { onConflict: 'user_id' },
            );

            if (error) {
              console.error('Error saving subscription:', error);
            } else {
              console.log('Subscription created/updated for user:', userId, 'Subscription ID:', sub.id);

              // サブスクリプション成功時は使用回数もリセット
              const { error: usageError } = await supabase
                .from('user_usage')
                .upsert(
                  {
                    user_id: userId,
                    usage_count: 0,
                    period_start_date: new Date().toISOString(),
                    period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'user_id' }
                );

              if (usageError) {
                console.error('Error resetting usage count:', usageError);
              } else {
                console.log('Usage count reset for user:', userId);
              }
            }
          } catch (subError) {
            console.error('Error retrieving subscription details:', subError);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub: any = event.data.object;

        // Map Stripe status to our system status
        let status = 'inactive';
        if (sub.status === 'active') status = 'active';
        else if (sub.status === 'trialing') status = 'trialing';
        else if (sub.status === 'past_due') status = 'past_due';
        else if (sub.status === 'canceled' || sub.status === 'cancelled') status = 'cancelled';

        console.log(`Updating subscription ${sub.id} with status: ${status}, cancel_at: ${sub.cancel_at}, cancel_at_period_end: ${sub.cancel_at_period_end}`);

        const updateData: any = {
          status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end || false,
          cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        };

        // 特別処理: アクティブになった時、過去に解約予定だった場合の処理
        if (status === 'active' && !sub.cancel_at_period_end && !sub.cancel_at) {
          console.log(`Reactivating subscription for ${sub.id} - clearing any previous cancellation`);
          updateData.cancel_at_period_end = false;
          updateData.cancel_at = null;
        }

        // Add stripe_price_id if available
        if (sub.items?.data?.[0]?.price?.id) {
          updateData.stripe_price_id = sub.items.data[0].price.id;
        }

        // If subscription is cancelled, set cancelled_at
        if (status === 'cancelled' && !updateData.cancelled_at) {
          updateData.cancelled_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', sub.id);

        if (error) {
          console.error('Error updating subscription:', error);
        } else {
          console.log('Subscription successfully updated:', sub.id, 'Status:', status);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub: any = event.data.object;
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);

        if (error) console.error('Error cancelling subscription:', error);
        else console.log('Subscription cancelled:', sub.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice: any = event.data.object;
        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', String(invoice.subscription));
          if (error) console.error('Error updating subscription status:', error);
          else console.log('Subscription status updated to active');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice: any = event.data.object;
        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', String(invoice.subscription));
          if (error) console.error('Error updating subscription status:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});