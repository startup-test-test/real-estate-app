// index.ts — Supabase Edge Functions（Deno Deploy互換）版：Stripe Webhook 完全版
// 依存：Stripe（denonextビルド）, supabase-js（JSR）
// 環境変数：STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'https://esm.sh/stripe@14.0.0?target=denonext';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ====== Env 必須チェック ======
const need = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;
for (const k of need) {
  if (!Deno.env.get(k)) throw new Error(`Missing env: ${k}`);
}

// ====== 初期化 ======
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20',
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ====== ユーティリティ ======
const headersBase = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (obj: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...headersBase, 'Content-Type': 'application/json', ...headers },
  });

const toISO = (sec?: number | null) =>
  typeof sec === 'number' ? new Date(sec * 1000).toISOString() : null;

const mapStatus = (s: string) =>
  s === 'active' ? 'active'
  : s === 'trialing' ? 'trialing'
  : s === 'past_due' ? 'past_due'
  : s === 'canceled' ? 'cancelled'
  : s === 'unpaid' ? 'unpaid'
  : s === 'paused' ? 'paused'
  : /* incomplete / incomplete_expired など */ 'inactive';

const getCustomerId = (c: unknown) =>
  typeof c === 'string' ? c : (c && (c as { id?: string }).id) || null;

// ====== メイン ======
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { status: 200, headers: headersBase });

  try {
    // Stripe 署名検証（raw body 必須）
    const sig = req.headers.get('stripe-signature');
    if (!sig) return json({ error: 'No signature' }, 400);

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider,
    );

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    // ====== 重複（再送）防止：一意制約で弾く ======
    const { error: dupErr } = await supabase
      .from('stripe_events')
      .insert({ id: event.id });
    if (dupErr) {
      // 23505 = unique_violation（既処理）
      if ((dupErr as any).code === '23505') {
        console.warn('Duplicate event, skipping:', event.id);
        return json({ received: true });
      }
      console.error('Event log insert error:', dupErr);
      // ここで失敗しても本処理は続ける（監視用テーブルなので）
    }

    switch (event.type) {
      // ---- Checkout 完了：初回購読開始タイミング ----
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session?.metadata?.user_id as string | undefined;
        if (!userId) break;

        console.log(`Checkout completed for user: ${userId}`);
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(String(session.subscription));
          const { error } = await supabase
            .from('subscriptions')
            .upsert(
              {
                user_id: userId,
                stripe_subscription_id: sub.id,
                stripe_customer_id: getCustomerId(sub.customer),
                status: mapStatus(sub.status),
                current_period_start: toISO(sub.current_period_start),
                current_period_end: toISO(sub.current_period_end),
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

      // ---- サブスク作成/更新/削除 ----
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: mapStatus(sub.status),
            current_period_start: toISO(sub.current_period_start),
            current_period_end: toISO(sub.current_period_end),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        if (error) console.error('Error updating subscription:', error);
        else console.log('Subscription updated for:', sub.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
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

      // ---- 請求イベント ----
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
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
        const invoice = event.data.object as any;
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

    return json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return json({ error: 'Webhook processing failed' }, 500);
  }
});