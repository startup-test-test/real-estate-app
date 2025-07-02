-- 一時的にRLSを無効化してコメント機能をテスト
-- ⚠️ これは開発/テスト用です。本番環境では使用しないでください。

-- share_commentsテーブルのRLSを無効化
ALTER TABLE share_comments DISABLE ROW LEVEL SECURITY;

-- property_sharesテーブルのRLSを無効化  
ALTER TABLE property_shares DISABLE ROW LEVEL SECURITY;

-- テスト完了後は以下で再有効化してください:
-- ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;