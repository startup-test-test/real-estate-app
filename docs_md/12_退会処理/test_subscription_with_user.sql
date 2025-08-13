-- Step 1: まずユーザーを確認
SELECT id, email FROM auth.users LIMIT 5;

-- Step 2: 上記で確認したユーザーIDを使って、subscriptionsテーブルの現状を確認
-- 'YOUR_USER_ID' を実際のユーザーIDに置き換えてください
SELECT * FROM subscriptions;

-- Step 3: テスト用サブスクリプションを作成
-- 'YOUR_USER_ID' を実際のユーザーIDに置き換えてください
INSERT INTO subscriptions (
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  current_period_end,
  created_at,
  updated_at,
  cancel_at_period_end,
  cancel_at
) VALUES (
  gen_random_uuid(),
  'YOUR_USER_ID', -- ここに実際のユーザーIDを入力
  'cus_test_' || substr(gen_random_uuid()::text, 1, 14),
  'sub_test_' || substr(gen_random_uuid()::text, 1, 14),
  'active',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW(),
  false,
  NULL
)
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'active',
  cancel_at_period_end = false,
  cancel_at = NULL,
  current_period_end = NOW() + INTERVAL '30 days',
  updated_at = NOW();

-- Step 4: 作成されたデータを確認
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID';