-- ========================================
-- よりセキュアなRLS修正版
-- ========================================

-- 1. 権限を最小限に設定（GRANTをより制限的に）
REVOKE ALL ON subscriptions FROM anon;  -- 匿名ユーザーの権限を削除
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;  -- 必要最小限の権限のみ

REVOKE ALL ON user_usage FROM anon;
GRANT SELECT, INSERT, UPDATE ON user_usage TO authenticated;

REVOKE ALL ON usage_history FROM anon;
GRANT SELECT, INSERT ON usage_history TO authenticated;  -- 履歴は更新不要

-- 2. RLSポリシーの再作成（既存のものを削除して作り直し）
-- subscriptionsテーブル
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON subscriptions;

CREATE POLICY "subscriptions_select_policy" ON subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_policy" ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_policy" ON subscriptions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- user_usageテーブル
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can insert own usage" ON user_usage;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_usage;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_usage;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_usage;

CREATE POLICY "user_usage_select_policy" ON user_usage
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "user_usage_insert_policy" ON user_usage
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_usage_update_policy" ON user_usage
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- usage_historyテーブル
DROP POLICY IF EXISTS "Users can view own history" ON usage_history;
DROP POLICY IF EXISTS "Users can insert own history" ON usage_history;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON usage_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON usage_history;

CREATE POLICY "usage_history_select_policy" ON usage_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "usage_history_insert_policy" ON usage_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. RLSが有効であることを確認
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- 4. 最終確認クエリ
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('subscriptions', 'user_usage', 'usage_history');

-- ポリシーの確認
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('subscriptions', 'user_usage', 'usage_history')
ORDER BY tablename, policyname;