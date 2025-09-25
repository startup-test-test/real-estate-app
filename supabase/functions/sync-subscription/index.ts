// Manual subscription sync function for emergency use
import Stripe from 'https://esm.sh/stripe@14.0.0?target=denonext';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SyncRequest {
  stripe_subscription_id?: string;
  user_id?: string;
  force_update?: boolean;
}

Deno.serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body: SyncRequest = await req.json();
    const { stripe_subscription_id, user_id, force_update = false } = body;

    let subscriptionsToSync: any[] = [];

    if (stripe_subscription_id) {
      // Sync specific subscription
      console.log(`Syncing specific subscription: ${stripe_subscription_id}`);
      try {
        const sub = await stripe.subscriptions.retrieve(stripe_subscription_id);
        subscriptionsToSync.push(sub);
      } catch (error) {
        console.error('Error retrieving subscription from Stripe:', error);
        return new Response(
          JSON.stringify({ error: 'Subscription not found in Stripe' }),
          { status: 404, headers }
        );
      }
    } else if (user_id) {
      // Sync all subscriptions for a user
      console.log(`Syncing subscriptions for user: ${user_id}`);
      const { data: userSubs } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user_id);

      if (!userSubs || userSubs.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No subscriptions found for user' }),
          { status: 404, headers }
        );
      }

      for (const userSub of userSubs) {
        try {
          const sub = await stripe.subscriptions.retrieve(userSub.stripe_subscription_id);
          subscriptionsToSync.push(sub);
        } catch (error) {
          console.error(`Error retrieving subscription ${userSub.stripe_subscription_id}:`, error);
        }
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Either stripe_subscription_id or user_id is required' }),
        { status: 400, headers }
      );
    }

    const results = [];

    for (const sub of subscriptionsToSync) {
      try {
        // Map Stripe status to our system status
        let status = 'inactive';
        if (sub.status === 'active') status = 'active';
        else if (sub.status === 'trialing') status = 'trialing';
        else if (sub.status === 'past_due') status = 'past_due';
        else if (sub.status === 'canceled' || sub.status === 'cancelled') status = 'cancelled';

        const updateData: any = {
          status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end || false,
          cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        };

        // Add stripe_price_id if available
        if (sub.items?.data?.[0]?.price?.id) {
          updateData.stripe_price_id = sub.items.data[0].price.id;
        }

        // If subscription is cancelled, set cancelled_at
        if (status === 'cancelled' && sub.canceled_at) {
          updateData.cancelled_at = new Date(sub.canceled_at * 1000).toISOString();
        }

        console.log(`Updating subscription ${sub.id} with data:`, updateData);

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', sub.id);

        if (error) {
          console.error('Error updating subscription in database:', error);
          results.push({
            subscription_id: sub.id,
            success: false,
            error: error.message,
          });
        } else {
          console.log(`Successfully synced subscription: ${sub.id}`);
          results.push({
            subscription_id: sub.id,
            success: true,
            status: status,
            cancel_at: sub.cancel_at,
            cancel_at_period_end: sub.cancel_at_period_end,
          });
        }
      } catch (error) {
        console.error(`Error processing subscription ${sub.id}:`, error);
        results.push({
          subscription_id: sub.id,
          success: false,
          error: error.message,
        });
      }
    }

    // Also run cleanup for expired subscriptions
    const { data: cleanupResult } = await supabase
      .rpc('cleanup_expired_subscriptions');

    return new Response(
      JSON.stringify({
        message: 'Subscription sync completed',
        results,
        cleaned_up_expired: cleanupResult || 0,
      }),
      { status: 200, headers }
    );

  } catch (err) {
    console.error('Error in sync function:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers }
    );
  }
});