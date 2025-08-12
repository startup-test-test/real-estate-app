-- 1. カラムが存在しない場合は追加
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 2. データを挿入
INSERT INTO subscriptions (
  user_id,
  status,
  stripe_subscription_id,
  stripe_customer_id,
  stripe_price_id,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  '591142c5-738a-4bfd-bf01-638da0b1453f',
  'active',
  'sub_manual_test_' || gen_random_uuid(),
  'cus_SqxS7r2YXFMlO4',
  'price_1RvChRR8rkVVzR7nAeDvfiur',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET 
  status = 'active',
  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days',
  updated_at = NOW();

-- 3. 結果を確認
SELECT * FROM subscriptions WHERE user_id = '591142c5-738a-4bfd-bf01-638da0b1453f';