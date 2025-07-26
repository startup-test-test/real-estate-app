-- 完全なスキーマ更新: データベース仕様書に準拠
-- 作成日: 2025-07-02

-- 1. 外部キー制約の復元
ALTER TABLE property_shares 
ADD CONSTRAINT property_shares_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- property_idをNOT NULL制約に戻す
ALTER TABLE property_shares 
ALTER COLUMN property_id SET NOT NULL;

-- 2. 仕様書準拠のRLSポリシーに更新

-- property_shares テーブルのポリシー更新
DROP POLICY IF EXISTS "Users can view their own shares" ON property_shares;
DROP POLICY IF EXISTS "Authenticated users can create shares" ON property_shares;
DROP POLICY IF EXISTS "Owners can update their shares" ON property_shares;
DROP POLICY IF EXISTS "Owners can delete their shares" ON property_shares;

-- 仕様書準拠のポリシー作成
CREATE POLICY "Users can view shares they have access to" ON property_shares
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM share_invitations si
      WHERE si.share_id = property_shares.id
      AND si.accepted_by = auth.uid()
      AND si.status = 'accepted'
    )
  );

CREATE POLICY "Users can create shares for their properties" ON property_shares
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_shares.property_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their shares" ON property_shares
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shares" ON property_shares
  FOR DELETE USING (auth.uid() = owner_id);

-- share_invitations テーブルのポリシー更新
DROP POLICY IF EXISTS "Users can view relevant invitations" ON share_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON share_invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON share_invitations;

CREATE POLICY "Users can view invitations related to them" ON share_invitations
  FOR SELECT USING (
    auth.uid() = invited_by OR
    auth.uid() = accepted_by OR
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Share owners can create invitations" ON share_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Share owners can update invitations" ON share_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    ) OR
    auth.uid() = accepted_by  -- 招待者も受諾可能
  );

-- share_comments テーブルのポリシー更新
DROP POLICY IF EXISTS "Users can view comments" ON share_comments;
DROP POLICY IF EXISTS "Users can create comments" ON share_comments;

CREATE POLICY "Users can view comments on accessible shares" ON share_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_comments.share_id
      AND (
        ps.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM share_invitations si
          WHERE si.share_id = ps.id
          AND si.accepted_by = auth.uid()
          AND si.status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Users with comment permission can create comments" ON share_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_comments.share_id
      AND (
        ps.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM share_invitations si
          WHERE si.share_id = ps.id
          AND si.accepted_by = auth.uid()
          AND si.status = 'accepted'
          AND si.role IN ('commenter', 'editor')
        )
      )
    )
  );

-- comment_reactions テーブルのポリシー更新（既存のものを保持）
-- 既存のポリシーが適切なため変更不要

-- 3. 不足している関数の追加

-- 期限切れ招待のクリーンアップ関数
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE share_invitations 
  SET status = 'expired'
  WHERE expires_at < CURRENT_TIMESTAMP 
  AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- 4. パフォーマンス向上のための追加インデックス

-- 複合インデックス（高頻度クエリ用）
CREATE INDEX IF NOT EXISTS idx_invitations_share_status 
ON share_invitations(share_id, status);

CREATE INDEX IF NOT EXISTS idx_invitations_accepted_by_status 
ON share_invitations(accepted_by, status);

CREATE INDEX IF NOT EXISTS idx_comments_share_created 
ON share_comments(share_id, created_at DESC);

-- 5. データ整合性確保のための制約追加

-- 共有期限の論理チェック
ALTER TABLE property_shares 
ADD CONSTRAINT check_expires_at_future 
CHECK (expires_at IS NULL OR expires_at > created_at);

-- 招待期限の論理チェック  
ALTER TABLE share_invitations
ADD CONSTRAINT check_invitation_expires_future
CHECK (expires_at > created_at);

-- コメント内容の空白チェック
ALTER TABLE share_comments
ADD CONSTRAINT check_content_not_empty
CHECK (trim(content) != '');

-- 6. セキュリティ強化

-- 共有トークンの複雑性確保
ALTER TABLE property_shares
ADD CONSTRAINT check_share_token_length
CHECK (length(share_token) >= 32);

-- 招待トークンの複雑性確保
ALTER TABLE share_invitations  
ADD CONSTRAINT check_invitation_token_length
CHECK (length(invitation_token) >= 64);

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== スキーマ更新完了 ===';
  RAISE NOTICE '1. 外部キー制約復元: ✅';
  RAISE NOTICE '2. RLSポリシー仕様書準拠: ✅';  
  RAISE NOTICE '3. セキュリティ制約追加: ✅';
  RAISE NOTICE '4. パフォーマンスインデックス追加: ✅';
  RAISE NOTICE '=== 全て完了しました ===';
END $$;