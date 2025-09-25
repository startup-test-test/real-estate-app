// Automated subscription sync function - runs periodically
import Stripe from 'https://esm.sh/stripe@14.0.0?target=denonext';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers });
  }

  try {
    console.log('Starting automated subscription sync...');

    // Get all active subscriptions from our database
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, user_id, status, cancel_at, updated_at')
      .in('status', ['active', 'trialing', 'past_due'])
      .not('stripe_subscription_id', 'is', null);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found to sync');
      return new Response(
        JSON.stringify({ message: 'No subscriptions to sync', synced: 0 }),
        { status: 200, headers }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions to check`);

    const results = [];
    let syncedCount = 0;
    let errorCount = 0;

    for (const subscription of subscriptions) {
      try {
        // Get current status from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        // Check if sync is needed
        const needsSync = shouldSyncSubscription(subscription, stripeSubscription);

        if (needsSync) {
          console.log(`Syncing subscription ${subscription.stripe_subscription_id}`);

          // Map Stripe status to our system status
          let status = 'inactive';
          if (stripeSubscription.status === 'active') status = 'active';
          else if (stripeSubscription.status === 'trialing') status = 'trialing';
          else if (stripeSubscription.status === 'past_due') status = 'past_due';
          else if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'cancelled') status = 'cancelled';

          const updateData: any = {
            status,
            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
            cancel_at: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          };

          // Add stripe_price_id if available
          if (stripeSubscription.items?.data?.[0]?.price?.id) {
            updateData.stripe_price_id = stripeSubscription.items.data[0].price.id;
          }

          // If subscription is cancelled, set cancelled_at
          if (status === 'cancelled' && stripeSubscription.canceled_at) {
            updateData.cancelled_at = new Date(stripeSubscription.canceled_at * 1000).toISOString();
          }

          const { error: updateError } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', subscription.stripe_subscription_id);

          if (updateError) {
            console.error(`Error updating subscription ${subscription.stripe_subscription_id}:`, updateError);
            errorCount++;
            results.push({
              subscription_id: subscription.stripe_subscription_id,
              user_id: subscription.user_id,
              success: false,
              error: updateError.message,
            });
          } else {
            syncedCount++;
            results.push({
              subscription_id: subscription.stripe_subscription_id,
              user_id: subscription.user_id,
              success: true,
              old_status: subscription.status,
              new_status: status,
              cancel_at: stripeSubscription.cancel_at,
            });
          }
        } else {
          results.push({
            subscription_id: subscription.stripe_subscription_id,
            user_id: subscription.user_id,
            success: true,
            message: 'No sync needed',
          });
        }

      } catch (error) {
        console.error(`Error processing subscription ${subscription.stripe_subscription_id}:`, error);
        errorCount++;
        results.push({
          subscription_id: subscription.stripe_subscription_id,
          user_id: subscription.user_id,
          success: false,
          error: error.message,
        });
      }
    }

    // Run cleanup for expired subscriptions
    const { data: cleanupResult } = await supabase
      .rpc('cleanup_expired_subscriptions');

    console.log(`Sync completed. Synced: ${syncedCount}, Errors: ${errorCount}, Cleaned up: ${cleanupResult || 0}`);

    return new Response(
      JSON.stringify({
        message: 'Automated sync completed',
        total_checked: subscriptions.length,
        synced: syncedCount,
        errors: errorCount,
        cleaned_up_expired: cleanupResult || 0,
        timestamp: new Date().toISOString(),
        details: results,
      }),
      { status: 200, headers }
    );

  } catch (err) {
    console.error('Error in auto-sync function:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers }
    );
  }
});

// Helper function to determine if subscription needs syncing
function shouldSyncSubscription(dbSubscription: any, stripeSubscription: any): boolean {
  // Always sync if status has changed
  const stripeStatus = mapStripeStatus(stripeSubscription.status);
  if (dbSubscription.status !== stripeStatus) {
    return true;
  }

  // Sync if cancel_at has changed
  const stripeCancel = stripeSubscription.cancel_at
    ? new Date(stripeSubscription.cancel_at * 1000).toISOString()
    : null;
  const dbCancel = dbSubscription.cancel_at;

  if (stripeCancel !== dbCancel) {
    return true;
  }

  // Sync if hasn't been updated in the last 24 hours and subscription is active
  if (dbSubscription.status === 'active' && dbSubscription.updated_at) {
    const lastUpdate = new Date(dbSubscription.updated_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (lastUpdate < oneDayAgo) {
      return true;
    }
  }

  return false;
}

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'past_due';
    case 'canceled':
    case 'cancelled': return 'cancelled';
    default: return 'inactive';
  }
}