-- テスト用: 特定ユーザーの使用回数をリセット
-- 注意: これはテスト環境でのみ使用してください

-- 現在の使用状況を確認
SELECT 
  u.email,
  uu.usage_count,
  uu.period_start_date,
  uu.period_end_date,
  s.status as subscription_status
FROM user_usage uu
JOIN auth.users u ON uu.user_id = u.id
LEFT JOIN subscriptions s ON s.user_id = u.id;

-- 特定のユーザーの使用回数をリセット（メールアドレスで指定）
-- 'your-email@example.com' を実際のメールアドレスに置き換えてください
UPDATE user_usage
SET 
  usage_count = 0,
  period_start_date = NOW(),
  period_end_date = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- または、全ユーザーの使用回数をリセット（開発環境用）
-- UPDATE user_usage
-- SET 
--   usage_count = 0,
--   period_start_date = NOW(),
--   period_end_date = NOW() + INTERVAL '30 days',
--   updated_at = NOW();

-- リセット後の確認
SELECT 
  u.email,
  uu.usage_count,
  uu.period_start_date,
  uu.period_end_date
FROM user_usage uu
JOIN auth.users u ON uu.user_id = u.id;