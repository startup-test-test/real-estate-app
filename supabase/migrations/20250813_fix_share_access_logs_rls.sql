-- share_access_logsテーブルのRLSを有効化し、適切なポリシーを設定

-- 1. RLSを有効化
ALTER TABLE public.share_access_logs ENABLE ROW LEVEL SECURITY;

-- 2. 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Share owners can view access logs" ON public.share_access_logs;
DROP POLICY IF EXISTS "System can insert access logs" ON public.share_access_logs;

-- 3. 新しいRLSポリシーを作成

-- 共有の所有者は自分の共有のアクセスログを閲覧可能
CREATE POLICY "Share owners can view access logs" 
ON public.share_access_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.property_shares ps
    WHERE ps.id = share_access_logs.share_id
    AND ps.owner_id = auth.uid()
  )
);

-- 認証されたユーザーは自分のアクセスログを閲覧可能
CREATE POLICY "Users can view their own access logs"
ON public.share_access_logs
FOR SELECT
USING (
  user_id = auth.uid()
);

-- システム（認証済みユーザー）はアクセスログを挿入可能
-- ただし、実際の共有が存在する場合のみ
CREATE POLICY "Authenticated users can insert access logs"
ON public.share_access_logs
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.property_shares ps
    WHERE ps.id = share_id
    AND ps.share_token IS NOT NULL
  )
);

-- 4. テーブルの権限を適切に設定
REVOKE ALL ON public.share_access_logs FROM anon;
GRANT SELECT ON public.share_access_logs TO authenticated;
GRANT INSERT ON public.share_access_logs TO authenticated;

-- 5. インデックスを追加してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_share_access_logs_share_id ON public.share_access_logs(share_id);
CREATE INDEX IF NOT EXISTS idx_share_access_logs_user_id ON public.share_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_share_access_logs_created_at ON public.share_access_logs(created_at DESC);