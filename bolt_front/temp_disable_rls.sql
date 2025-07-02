-- 一時的にRLSを無効化してテスト用のコメント投稿を可能にする
-- ⚠️ 本番環境では実行しないでください

-- share_comments テーブルのRLSを一時的に無効化
ALTER TABLE share_comments DISABLE ROW LEVEL SECURITY;

-- property_shares テーブルのRLSを一時的に無効化
ALTER TABLE property_shares DISABLE ROW LEVEL SECURITY;

-- share_invitations テーブルのRLSを一時的に無効化
ALTER TABLE share_invitations DISABLE ROW LEVEL SECURITY;

-- 実行後は以下のコマンドで再有効化してください：
-- ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY; 
-- ALTER TABLE share_invitations ENABLE ROW LEVEL SECURITY;