-- 解約予定をキャンセル（自分のアカウントのみ）
-- このまま実行してOK！

-- 1. 現在の自分の状態を確認
SELECT 
  user_id,
  status,
  cancel_at_period_end,
  cancel_at,
  stripe_subscription_id
FROM subscriptions 
WHERE user_id = auth.uid();

-- 2. 自分の解約予定をキャンセル
UPDATE subscriptions 
SET 
  cancel_at_period_end = false,
  cancel_at = NULL,
  status = 'active',
  updated_at = NOW()
WHERE user_id = auth.uid()
  AND cancel_at_period_end = true;

-- 3. 更新後の状態を確認
SELECT 
  user_id,
  status,
  cancel_at_period_end,
  cancel_at
FROM subscriptions 
WHERE user_id = auth.uid();

-- 成功すると：
-- cancel_at_period_end: false
-- cancel_at: null
-- status: active
-- になります