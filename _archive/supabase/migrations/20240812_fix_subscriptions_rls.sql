-- subscriptionsテーブルのRLSポリシーを修正
-- 406エラーの解決

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for users" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for users" ON subscriptions;

-- 新しいポリシーを作成
-- ユーザーは自分のサブスクリプションを読み取り可能
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- サービスロールは全ての操作が可能（Edge Functions用）
CREATE POLICY "Service role can manage all subscriptions"
ON subscriptions FOR ALL
TO service_role
USING (true);

-- ユーザーは自分のサブスクリプションを作成可能
CREATE POLICY "Users can create own subscription"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のサブスクリプションを更新可能
CREATE POLICY "Users can update own subscription"
ON subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);