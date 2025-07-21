-- SEC-040: Edge Function監査ログテーブル
-- Service Role Keyの使用を追跡するための監査ログ

-- 監査ログテーブルの作成
CREATE TABLE IF NOT EXISTS edge_function_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_edge_function_audit_logs_function_name ON edge_function_audit_logs(function_name);
CREATE INDEX idx_edge_function_audit_logs_action ON edge_function_audit_logs(action);
CREATE INDEX idx_edge_function_audit_logs_performed_at ON edge_function_audit_logs(performed_at);

-- RLSの有効化
ALTER TABLE edge_function_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 読み取りは管理者のみ
CREATE POLICY "Admin can read audit logs" ON edge_function_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLSポリシー: 書き込みはService Role Keyのみ（Edge Functions用）
-- Edge FunctionsはService Role Keyを使用するため、RLSをバイパスして書き込み可能

-- コメント
COMMENT ON TABLE edge_function_audit_logs IS 'Edge Functionsの監査ログ（SEC-040対策）';
COMMENT ON COLUMN edge_function_audit_logs.function_name IS 'Edge Function名';
COMMENT ON COLUMN edge_function_audit_logs.action IS '実行されたアクション';
COMMENT ON COLUMN edge_function_audit_logs.details IS 'アクションの詳細（機密情報はマスク済み）';
COMMENT ON COLUMN edge_function_audit_logs.performed_at IS 'アクション実行時刻';

-- 古いログを自動削除する関数（90日以上前のログを削除）
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM edge_function_audit_logs
  WHERE performed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 定期的なクリーンアップのスケジュール設定
-- 注: Supabaseではpg_cronを使用してスケジュール設定が可能
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');