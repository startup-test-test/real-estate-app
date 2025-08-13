-- 全テーブルのRLS設定状況を確認

SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ 有効'
        ELSE '❌ 無効'
    END as "RLS状態"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY 
    CASE WHEN rowsecurity = false THEN 0 ELSE 1 END,
    tablename;

-- 共有機能関連テーブルのRLS詳細確認
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN (
    'property_shares',
    'share_invitations', 
    'share_comments',
    'share_access_logs',
    'comment_reactions'
)
ORDER BY tablename, policyname;