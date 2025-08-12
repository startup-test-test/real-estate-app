-- テーブルの存在とカラムを確認
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'user_usage', 'usage_history')
ORDER BY table_name, ordinal_position;

-- RLSの状態を確認
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('subscriptions', 'user_usage', 'usage_history');

-- 現在のRLSポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('subscriptions', 'user_usage', 'usage_history');