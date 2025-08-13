-- 解約予定をキャンセルして、アクティブな状態に戻す
-- Supabase SQL Editorで実行

-- 1. 現在の状態を確認
SELECT 
  user_id,
  status,
  cancel_at_period_end,
  cancel_at,
  stripe_subscription_id
FROM subscriptions 
WHERE user_id = auth.uid();

-- 2. 解約予定をキャンセル（アクティブに戻す）
UPDATE subscriptions 
SET 
  cancel_at_period_end = false,
  cancel_at = NULL,
  status = 'active',
  updated_at = NOW()
WHERE user_id = auth.uid();

-- 3. 更新後の状態を確認
SELECT 
  user_id,
  status,
  cancel_at_period_end,
  cancel_at,
  stripe_subscription_id
FROM subscriptions 
WHERE user_id = auth.uid();

-- 結果：
-- cancel_at_period_end が false になり
-- cancel_at が NULL になれば成功