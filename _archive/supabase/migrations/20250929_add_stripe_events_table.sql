-- =====================================================
-- URGENT: Fix for duplicate Stripe webhook processing
-- Issue: User was charged 3 times due to missing idempotency
-- Date: 2025-09-29
-- =====================================================

-- Create stripe_events table to track processed webhook events
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY, -- Stripe Event ID (e.g., evt_xxx) - ensures idempotency
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at
  ON public.stripe_events(processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type
  ON public.stripe_events(event_type);

CREATE INDEX IF NOT EXISTS idx_stripe_events_user_id
  ON public.stripe_events(user_id)
  WHERE user_id IS NOT NULL;

-- Enable RLS for security
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (webhook handlers)
CREATE POLICY "Service role only" ON public.stripe_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE public.stripe_events IS
  'Tracks processed Stripe webhook events to prevent duplicate processing and billing';

COMMENT ON COLUMN public.stripe_events.id IS
  'Unique Stripe event ID - primary mechanism for ensuring idempotency';

COMMENT ON COLUMN public.stripe_events.event_type IS
  'Type of Stripe event (e.g., customer.subscription.updated)';

COMMENT ON COLUMN public.stripe_events.metadata IS
  'Additional event data for debugging and auditing';

-- Create cleanup function to remove old events (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_stripe_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.stripe_events
  WHERE processed_at < NOW() - INTERVAL '30 days';

  RAISE NOTICE 'Cleaned up % old stripe events', FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_old_stripe_events() TO service_role;

-- Optional: Schedule cleanup with pg_cron (if extension is available)
-- This will run daily at 3 AM
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing job if it exists
    PERFORM cron.unschedule('cleanup-stripe-events');

    -- Schedule new job
    PERFORM cron.schedule(
      'cleanup-stripe-events',
      '0 3 * * *',
      'SELECT cleanup_old_stripe_events()'
    );

    RAISE NOTICE 'Scheduled daily cleanup job for stripe_events table';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule cron job: %', SQLERRM;
END;
$$;