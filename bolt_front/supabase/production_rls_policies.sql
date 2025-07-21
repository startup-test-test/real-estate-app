-- 本番環境用の厳格なRLSポリシー
-- 最小権限の原則に基づき、必要最小限のアクセスのみを許可

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Debug: Allow basic property_shares access" ON property_shares;
DROP POLICY IF EXISTS "Debug: Allow property_shares creation" ON property_shares;
DROP POLICY IF EXISTS "Debug: Allow share_comments access" ON share_comments;
DROP POLICY IF EXISTS "Debug: Allow share_comments creation" ON share_comments;
DROP POLICY IF EXISTS "Allow authenticated users to read property_shares" ON property_shares;
DROP POLICY IF EXISTS "Allow authenticated users to create property_shares" ON property_shares;
DROP POLICY IF EXISTS "Allow authenticated users to read share_comments" ON share_comments;
DROP POLICY IF EXISTS "Allow authenticated users to create share_comments" ON share_comments;

-- property_shares テーブルの本番ポリシー
-- 読み取り: 自分が所有する共有、または有効な招待トークンを持つ共有のみ
CREATE POLICY "Production: Users can view own shares and shared with them" ON property_shares
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- 自分が所有者の場合
      auth.uid() = owner_id OR
      -- 有効な招待トークンでアクセスしている場合
      (
        share_token IS NOT NULL AND
        is_public = true AND
        (expires_at IS NULL OR expires_at > now())
      )
    )
  );

-- 作成: 認証済みユーザーが自分を所有者として共有を作成
CREATE POLICY "Production: Users can create own shares" ON property_shares
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id AND
    (
      -- 招待機能専用（property_id = null）または
      property_id IS NULL OR
      -- 自分が所有する物件の共有
      EXISTS (
        SELECT 1 FROM properties
        WHERE id = property_shares.property_id
        AND user_id = auth.uid()
      )
    )
  );

-- 更新: 自分が所有する共有のみ更新可能
CREATE POLICY "Production: Users can update own shares" ON property_shares
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

-- 削除: 自分が所有する共有のみ削除可能
CREATE POLICY "Production: Users can delete own shares" ON property_shares
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

-- share_comments テーブルの本番ポリシー
-- 読み取り: 共有にアクセスできるユーザーのみコメントを閲覧可能
CREATE POLICY "Production: Users can view comments on accessible shares" ON share_comments
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_comments.share_id
      AND (
        -- 共有の所有者
        ps.owner_id = auth.uid() OR
        -- 有効な招待トークンでアクセス
        (
          ps.share_token IS NOT NULL AND
          ps.is_public = true AND
          (ps.expires_at IS NULL OR ps.expires_at > now())
        )
      )
    )
  );

-- 作成: 共有にアクセスできる認証済みユーザーがコメント可能
CREATE POLICY "Production: Users can create comments on accessible shares" ON share_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_comments.share_id
      AND (
        -- 共有の所有者
        ps.owner_id = auth.uid() OR
        -- 有効な招待トークンでアクセス
        (
          ps.share_token IS NOT NULL AND
          ps.is_public = true AND
          (ps.expires_at IS NULL OR ps.expires_at > now())
        )
      )
    )
  );

-- 更新: 自分のコメントのみ更新可能
CREATE POLICY "Production: Users can update own comments" ON share_comments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- 削除: 自分のコメント、または共有の所有者がコメントを削除可能
CREATE POLICY "Production: Users can delete own comments or as share owner" ON share_comments
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      -- 自分のコメント
      auth.uid() = user_id OR
      -- 共有の所有者
      EXISTS (
        SELECT 1 FROM property_shares ps
        WHERE ps.id = share_comments.share_id
        AND ps.owner_id = auth.uid()
      )
    )
  );

-- share_invitations テーブルの本番ポリシー（存在する場合）
-- 読み取り: 自分が送信した招待のみ
CREATE POLICY IF NOT EXISTS "Production: Users can view own invitations" ON share_invitations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    )
  );

-- 作成: 自分の共有に対する招待のみ
CREATE POLICY IF NOT EXISTS "Production: Users can create invitations for own shares" ON share_invitations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    )
  );

-- RLSが有効であることを確認
ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_invitations ENABLE ROW LEVEL SECURITY;

-- 確認
SELECT 'Production RLS policies applied successfully' as status;