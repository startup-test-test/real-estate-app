-- ========================================
-- publicロールのポリシーを完全に削除
-- ========================================

-- subscriptionsテーブルのpublicポリシーを削除
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can create own subscription" ON subscriptions;

-- user_usageテーブルのpublicポリシーを削除
DROP POLICY IF EXISTS "Users can insert their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can view their own usage" ON user_usage;

-- usage_historyテーブルのpublicポリシーを削除
DROP POLICY IF EXISTS "Users can insert their own history" ON usage_history;
DROP POLICY IF EXISTS "Users can view their own history" ON usage_history;

-- publicロールからの権限を完全に削除
REVOKE ALL ON subscriptions FROM public;
REVOKE ALL ON user_usage FROM public;
REVOKE ALL ON usage_history FROM public;

-- 最終確認：残っているポリシーを表示
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('subscriptions', 'user_usage', 'usage_history')
ORDER BY tablename, policyname;

-- 権限の確認
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('subscriptions', 'user_usage', 'usage_history')
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee, privilege_type;