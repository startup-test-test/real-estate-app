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
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider,
    );

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session: any = event.data.object;
        const userId = session.metadata?.user_id;
        if (!userId) break;

        console.log(`Checkout completed for user: ${userId}`);

        // 購読詳細を取得
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            String(session.subscription),
          );
          const { error } = await supabase.from('subscriptions').upsert(
            {
              user_id: userId,
              stripe_subscription_id: sub.id,
              stripe_customer_id: sub.customer as string,
              status: 'active',
              current_period_start: new Date(
                sub.current_period_start * 1000,
              ).toISOString(),
              current_period_end: new Date(
                sub.current_period_end * 1000,
              ).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );
          if (error) console.error('Error saving subscription:', error);
          else console.log('Subscription created/updated for user:', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub: any = event.data.object;
        const status =
          sub.status === 'active'
            ? 'active'
            : sub.status === 'trialing'
              ? 'trialing'
              : sub.status === 'past_due'
                ? 'past_due'
                : 'inactive';

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status,
            current_period_start: new Date(
              sub.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              sub.current_period_end * 1000,
            ).toISOString(),
            // 解約予定情報を追加
            cancel_at_period_end: sub.cancel_at_period_end || false,
            cancel_at: sub.cancel_at
              ? new Date(sub.cancel_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);

        if (error) console.error('Error updating subscription:', error);
        else console.log('Subscription updated for:', sub.id);
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