-- 手動でサブスクリプションレコードを作成
-- StripeのWebhookが正常に処理されるまでの一時対処

INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  '3641e3a8-a15d-46fb-ae33-5efcceb76d6f',
  'cus_MANUAL_TEMP',
  'sub_MANUAL_TEMP',
  'active',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'active',
  current_period_end = NOW() + INTERVAL '30 days',
  updated_at = NOW();

-- 作成されたレコードを確認
SELECT * FROM subscriptions 
WHERE user_id = '3641e3a8-a15d-46fb-ae33-5efcceb76d6f';