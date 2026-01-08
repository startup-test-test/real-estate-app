-- Migration: Add cancellation fields to subscriptions table
-- Date: 2025-08-13
-- Purpose: Support subscription cancellation feature

-- Add cancel_at_period_end column to track cancellation status
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Add cancel_at column to store the cancellation date
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMP WITH TIME ZONE;

-- Add current_period_start column if not exists
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at_period_end 
ON subscriptions(cancel_at_period_end) 
WHERE cancel_at_period_end = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at 
ON subscriptions(cancel_at) 
WHERE cancel_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Flag indicating if subscription will be cancelled at period end';
COMMENT ON COLUMN subscriptions.cancel_at IS 'Date when the subscription will be cancelled';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start date of the current billing period';

-- RLS Policy: Ensure users can only view their own subscription
-- (Should already exist, but adding if not)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

-- Create policy for users to view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to update their own subscription (for cancellation)
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for service role to manage all subscriptions
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;

CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');