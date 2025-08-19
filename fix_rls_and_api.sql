-- ========================================
-- RLSとAPI公開設定の修正
-- ========================================

-- 1. まず既存のRLSポリシーを確認
SELECT policyname, tablename, cmd, qual 
FROM pg_policies 
WHERE tablename = 'subscriptions';

-- 2. subscriptionsテーブルのRLSを一時的に無効化（テスト用）
-- 注意: 本番環境では推奨されません
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- 3. subscriptionsテーブルを公開APIで利用可能にする
-- SupabaseダッシュボードのAPI設定で確認が必要
GRANT ALL ON subscriptions TO anon;
GRANT ALL ON subscriptions TO authenticated;

-- 4. テーブルの権限を確認
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM 
    information_schema.role_table_grants 
WHERE 
    table_name = 'subscriptions';

-- 5. RLSを再度有効化して、シンプルなポリシーを作成
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;

-- 新しいシンプルなポリシーを作成
CREATE POLICY "Enable read access for authenticated users" ON subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" ON subscriptions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. user_usageテーブルも同様に修正
ALTER TABLE user_usage DISABLE ROW LEVEL SECURITY;
GRANT ALL ON user_usage TO anon;
GRANT ALL ON user_usage TO authenticated;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can insert own usage" ON user_usage;

-- 新しいシンプルなポリシーを作成
CREATE POLICY "Enable read access for authenticated users" ON user_usage
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON user_usage
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" ON user_usage
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. usage_historyテーブルも同様に修正
ALTER TABLE usage_history DISABLE ROW LEVEL SECURITY;
GRANT ALL ON usage_history TO anon;
GRANT ALL ON usage_history TO authenticated;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own history" ON usage_history;
DROP POLICY IF EXISTS "Users can insert own history" ON usage_history;

-- 新しいシンプルなポリシーを作成
CREATE POLICY "Enable read access for authenticated users" ON usage_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON usage_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 8. 最終確認
SELECT 
    tablename,
    policyname,
    permissive,
    roles
FROM pg_policies
WHERE tablename IN ('subscriptions', 'user_usage', 'usage_history')
ORDER BY tablename, policyname;