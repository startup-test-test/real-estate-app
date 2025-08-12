-- 1. subscriptionsテーブルの全データを確認
SELECT * FROM subscriptions;

-- 2. もしデータが空の場合、手動でテストデータを挿入
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  stripe_price_id,
  status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  '591142c5-738a-4bfd-bf01-638da0b1453f',
  'sub_test_' || gen_random_uuid(),
  'cus_SqxS7r2YXFMlO4',
  'price_1RvChRR8rkVVzR7nAeDvfiur',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET 
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days',
  updated_at = NOW();

-- 3. 挿入後、再度確認
SELECT * FROM subscriptions WHERE user_id = '591142c5-738a-4bfd-bf01-638da0b1453f';