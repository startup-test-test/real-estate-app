-- より安全な解約キャンセル方法
-- Supabase SQL Editorで実行

-- Step 1: まず自分のユーザーIDとメールを確認
SELECT id, email 
FROM auth.users 
WHERE email = 'あなたのメールアドレス';  -- ここにあなたのメールを入力

-- Step 2: 上記で確認したIDを使って、現在の状態を確認
-- 'your-user-id-here' を実際のIDに置き換える
SELECT 
  user_id,
  status,
  cancel_at_period_end,
  cancel_at,
  stripe_subscription_id
FROM subscriptions 
WHERE user_id = 'your-user-id-here';  -- ここに上記で確認したIDを入力

-- Step 3: 特定のユーザーIDの解約をキャンセル
-- 実行前に必ずIDを確認！
UPDATE subscriptions 
SET 
  cancel_at_period_end = false,
  cancel_at = NULL,
  status = 'active',
  updated_at = NOW()
WHERE user_id = 'your-user-id-here'  -- ここに上記で確認したIDを入力
  AND cancel_at_period_end = true;    -- 念のため、解約予定のものだけを対象

-- Step 4: 更新結果を確認
SELECT 
  user_id,
  status,
  cancel_at_period_end,
  cancel_at
FROM subscriptions 
WHERE user_id = 'your-user-id-here';  -- ここに上記で確認したIDを入力

-- 💡 ポイント：
-- - 特定のuser_idを指定しているので、そのユーザーだけが対象
-- - AND cancel_at_period_end = true で二重の安全確認
-- - 他のユーザーには一切影響しません