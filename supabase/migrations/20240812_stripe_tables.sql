-- Stripe決済機能用テーブル作成
-- 作成日: 2025年8月12日
-- 月3回制限のフリーミアムモデル対応

-- ========================================
-- 1. ユーザー利用状況テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  period_start_date TIMESTAMP DEFAULT NOW(),
  period_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========================================
-- 2. サブスクリプション管理テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive', -- active, canceled, past_due
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========================================
-- 3. 利用履歴テーブル（分析用）
-- ========================================
CREATE TABLE IF NOT EXISTS usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'simulator', 'market_analysis', etc
  feature_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 4. インデックス作成
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_period_end ON user_usage(period_end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_created_at ON usage_history(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_history_feature_type ON usage_history(feature_type);

-- ========================================
-- 5. RLS（Row Level Security）有効化
-- ========================================
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. RLSポリシー設定
-- ========================================

-- user_usage: ユーザーは自分のデータのみアクセス可能
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage" ON user_usage
  FOR ALL USING (auth.uid() = user_id);

-- subscriptions: ユーザーは自分のサブスクリプションのみアクセス可能
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- usage_history: ユーザーは自分の履歴のみ閲覧可能
DROP POLICY IF EXISTS "Users can view own history" ON usage_history;
CREATE POLICY "Users can view own history" ON usage_history
  FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- 7. 期間チェック・リセット関数（30日ごとの自動リセット）
-- ========================================
CREATE OR REPLACE FUNCTION check_and_reset_usage(p_user_id UUID)
RETURNS TABLE(current_count INTEGER, period_end TIMESTAMP) AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- 現在の使用状況を取得
  SELECT * INTO v_usage FROM user_usage WHERE user_id = p_user_id;
  
  -- レコードが存在しない場合は新規作成
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, usage_count, period_start_date, period_end_date)
    VALUES (p_user_id, 0, NOW(), NOW() + INTERVAL '30 days')
    RETURNING usage_count, period_end_date INTO current_count, period_end;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- 期間が過ぎていたらリセット
  IF v_usage.period_end_date < NOW() THEN
    UPDATE user_usage 
    SET usage_count = 0,
        period_start_date = NOW(),
        period_end_date = NOW() + INTERVAL '30 days',
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

-- ========================================
-- 8. 使用回数インクリメント関数
-- ========================================
CREATE OR REPLACE FUNCTION increment_usage_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- 使用回数を1増やす
  UPDATE user_usage 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING usage_count INTO v_new_count;
  
  -- レコードが存在しない場合は作成
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, usage_count)
    VALUES (p_user_id, 1)
    RETURNING usage_count INTO v_new_count;
  END IF;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. サブスクリプション状態確認関数
-- ========================================
CREATE OR REPLACE FUNCTION is_premium_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status 
  FROM subscriptions 
  WHERE user_id = p_user_id;
  
  RETURN v_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. 更新日時自動更新トリガー
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_usageテーブルのトリガー
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- subscriptionsテーブルのトリガー
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 実行確認メッセージ
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Stripe決済用テーブルの作成が完了しました';
  RAISE NOTICE '- user_usage: 利用状況管理';
  RAISE NOTICE '- subscriptions: サブスクリプション管理';
  RAISE NOTICE '- usage_history: 利用履歴';
  RAISE NOTICE '月3回制限のフリーミアムモデル対応完了';
END $$;