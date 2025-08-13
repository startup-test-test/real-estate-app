-- ========================================
-- 月次リセット機能の修正
-- 毎月同じ日付にリセットするように変更
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
    -- 次の月の同じ日を計算（例：今日が13日なら来月の13日）
    v_next_reset_date := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '12 days')::TIMESTAMP;
    
    INSERT INTO user_usage (user_id, usage_count, period_start_date, period_end_date)
    VALUES (p_user_id, 0, NOW(), v_next_reset_date)
    RETURNING usage_count, period_end_date INTO current_count, period_end;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- 期間が過ぎていたらリセット
  IF v_usage.period_end_date < NOW() THEN
    -- 次の月の12日を計算
    v_next_reset_date := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' + INTERVAL '12 days')::TIMESTAMP;
    
    -- もし今日が12日以前なら、今月の12日にする
    IF EXTRACT(DAY FROM NOW()) <= 12 THEN
      v_next_reset_date := (DATE_TRUNC('month', NOW()) + INTERVAL '12 days')::TIMESTAMP;
    END IF;
    
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

-- 既存のユーザーのリセット日を修正（9月12日に設定）
UPDATE user_usage
SET period_end_date = '2025-09-12 00:00:00'::TIMESTAMP
WHERE period_end_date IS NOT NULL
  AND period_end_date > NOW();