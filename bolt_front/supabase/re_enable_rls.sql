-- RLSを再有効化（テスト後に実行）

-- property_shares テーブルのRLSを再有効化
ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;

-- share_comments テーブルのRLSを再有効化
ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;

-- より緩いポリシーを作成
DROP POLICY IF EXISTS "Temp: All authenticated users can create comments" ON share_comments;
DROP POLICY IF EXISTS "Temp: All authenticated users can view comments" ON share_comments;

-- 招待機能用の緩いポリシー
CREATE POLICY "Allow authenticated users to read property_shares" ON property_shares
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to create property_shares" ON property_shares  
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow authenticated users to read share_comments" ON share_comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to create share_comments" ON share_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'RLS re-enabled with permissive policies' as status;