-- 招待機能の property_shares を修正

-- property_id を nullable に変更（招待機能専用レコード用）
ALTER TABLE property_shares 
ALTER COLUMN property_id DROP NOT NULL;

-- RLSポリシーを招待機能に対応するよう修正
DROP POLICY IF EXISTS "Users can create shares for their properties" ON property_shares;

-- 新しい作成ポリシー（property_idがnullの場合も許可）
CREATE POLICY "Users can create shares" ON property_shares
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    (
      property_id IS NULL OR  -- 招待機能専用
      EXISTS (
        SELECT 1 FROM properties
        WHERE id = property_shares.property_id
        AND user_id = auth.uid()
      )
    )
  );

-- コメント用のポリシーも修正（より緩い条件）
DROP POLICY IF EXISTS "Users can view comments" ON share_comments;
DROP POLICY IF EXISTS "Users can create comments" ON share_comments;

CREATE POLICY "Users can view share comments" ON share_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_comments.share_id 
      AND ps.owner_id = auth.uid()
    ) OR
    -- 招待されたユーザーも閲覧可能
    EXISTS (
      SELECT 1 FROM share_invitations si
      JOIN property_shares ps ON si.share_id = ps.id
      WHERE ps.id = share_comments.share_id
      AND si.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Users can create share comments" ON share_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      EXISTS (
        SELECT 1 FROM property_shares ps
        WHERE ps.id = share_comments.share_id 
        AND ps.owner_id = auth.uid()
      ) OR
      -- 招待されたユーザーもコメント可能
      EXISTS (
        SELECT 1 FROM share_invitations si
        JOIN property_shares ps ON si.share_id = ps.id
        WHERE ps.id = share_comments.share_id
        AND si.email = auth.jwt()->>'email'
      )
    )
  );

-- デバッグ用: 全ユーザーがコメント作成可能にする一時的なポリシー
-- 本番環境では削除してください
CREATE POLICY "Temp: All authenticated users can create comments" ON share_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Temp: All authenticated users can view comments" ON share_comments
  FOR SELECT USING (true);