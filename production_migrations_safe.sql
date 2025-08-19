-- ========================================
-- 本番環境用マイグレーションスクリプト（安全版）
-- 作成日: 2025年8月19日
-- 既存のオブジェクトを考慮したバージョン
-- ========================================

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
  status TEXT DEFAULT 'inactive',
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  cancel_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========================================
-- 3. 利用履歴テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  feature_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 4. インデックス作成
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_period_end ON user_usage(period_end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_created_at ON usage_history(created_at);

-- ========================================
-- 5. RLS (Row Level Security) の有効化
-- ========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_usage' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'subscriptions' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'usage_history' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ========================================
-- 6. RLSポリシーの作成（既存チェック付き）
-- ========================================

-- user_usageテーブルのポリシー
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_usage' 
    AND policyname = 'Users can view own usage'
  ) THEN
    CREATE POLICY "Users can view own usage" ON user_usage
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_usage' 
    AND policyname = 'Users can update own usage'
  ) THEN
    CREATE POLICY "Users can update own usage" ON user_usage
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_usage' 
    AND policyname = 'Users can insert own usage'
  ) THEN
    CREATE POLICY "Users can insert own usage" ON user_usage
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- subscriptionsテーブルのポリシー
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can view own subscription'
  ) THEN
    CREATE POLICY "Users can view own subscription" ON subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can update own subscription'
  ) THEN
    CREATE POLICY "Users can update own subscription" ON subscriptions
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can insert own subscription'
  ) THEN
    CREATE POLICY "Users can insert own subscription" ON subscriptions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- usage_historyテーブルのポリシー
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usage_history' 
    AND policyname = 'Users can view own history'
  ) THEN
    CREATE POLICY "Users can view own history" ON usage_history
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usage_history' 
    AND policyname = 'Users can insert own history'
  ) THEN
    CREATE POLICY "Users can insert own history" ON usage_history
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ========================================
-- 7. 関数の作成
-- ========================================

-- 利用期間をリセットする関数
CREATE OR REPLACE FUNCTION reset_usage_period()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.period_end_date < NOW() THEN
    NEW.period_start_date := NOW();
    NEW.period_end_date := NOW() + INTERVAL '30 days';
    NEW.usage_count := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成（存在チェック付き）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'reset_usage_period_trigger'
  ) THEN
    CREATE TRIGGER reset_usage_period_trigger
    BEFORE UPDATE ON user_usage
    FOR EACH ROW
    EXECUTE FUNCTION reset_usage_period();
  END IF;
END $$;

-- ========================================
-- 8. 初期データの挿入
-- ========================================

-- 既存ユーザーのuser_usageレコードを作成
INSERT INTO user_usage (user_id, usage_count, period_start_date, period_end_date)
SELECT 
  id as user_id,
  0 as usage_count,
  NOW() as period_start_date,
  NOW() + INTERVAL '30 days' as period_end_date
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_usage WHERE user_usage.user_id = auth.users.id
);

-- ========================================
-- 9. テーブル構造の確認
-- ========================================
SELECT 'Tables created successfully' as status;

-- テーブル一覧を表示
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_usage', 'subscriptions', 'usage_history');