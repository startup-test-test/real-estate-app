-- 1. subscriptionsテーブルのデータを確認
SELECT * FROM subscriptions 
WHERE user_id = '591142c5-738a-4bfd-bf01-638da0b1453f';

-- 2. もしデータが入っていない場合、手動で挿入してテスト
-- INSERT INTO subscriptions (
--   user_id,
--   stripe_subscription_id,
--   stripe_customer_id,
--   stripe_price_id,
--   status,
--   current_period_start,
--   current_period_end,
--   created_at,
--   updated_at
-- ) VALUES (
--   '591142c5-738a-4bfd-bf01-638da0b1453f',
--   'sub_manual_test_' || NOW(),
--   'cus_SqxS7r2YXFMlO4',
--   'price_1RvChRR8rkVVzR7nAeDvfiur',
--   'active',
--   NOW(),
--   NOW() + INTERVAL '30 days',
--   NOW(),
--   NOW()
-- ) ON CONFLICT (user_id) 
-- DO UPDATE SET 
--   status = 'active',
--   updated_at = NOW();