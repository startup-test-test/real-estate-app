-- ========================================
-- 月次リセット機能の修正
-- 毎月1日に全ユーザーの利用回数をリセットするように変更
-- ========================================

-- check_and_reset_usage関数を更新
CREATE OR REPLACE FUNCTION check_and_reset_usage(p_user_id UUID)
RETURNS TABLE(current_count INTEGER, period_end TIMESTAMP) AS $$
DECLARE
  v_usage RECORD;
  v_next_reset_date TIMESTAMP;
BEGIN
  -- 現在の使用状況を取得
  SELECT * INTO v_usage FROM user_usage WHERE user_id = p_user_id;
  
  -- レコードが存在しない場合は新規作成
  IF NOT FOUND THEN
    -- 次の月初（1日）を計算
    v_next_reset_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
    
    INSERT INTO user_usage (user_id, usage_count, period_start_date, period_end_date)
    VALUES (p_user_id, 0, NOW(), v_next_reset_date)
    RETURNING usage_count, period_end_date INTO current_count, period_end;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- 期間が過ぎていたらリセット
  IF v_usage.period_end_date < NOW() THEN
    -- 次の月初（1日）を計算
    v_next_reset_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
    
    UPDATE user_usage 
    SET usage_count = 0,
        period_start_date = NOW(),
        period_end_date = v_next_reset_date,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING usage_count, period_end_date INTO current_count, period_end;
  ELSE
    -- 期間内の場合は現在の値を返す
    current_count := v_usage.usage_count;
    period_end := v_usage.period_end_date;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のユーザーのリセット日を次の月初（9月1日）に統一
UPDATE user_usage
SET period_end_date = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
WHERE period_end_date IS NOT NULL;