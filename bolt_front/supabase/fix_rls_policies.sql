-- RLSポリシーの無限再帰を修正

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view shares they have access to" ON property_shares;
DROP POLICY IF EXISTS "Users can create shares for their properties" ON property_shares;
DROP POLICY IF EXISTS "Owners can update their shares" ON property_shares;
DROP POLICY IF EXISTS "Owners can delete their shares" ON property_shares;

-- シンプルなポリシーを再作成
-- 1. SELECT: ユーザーは自分がオーナーの共有のみ閲覧可能
CREATE POLICY "Users can view their own shares" ON property_shares
  FOR SELECT USING (auth.uid() = owner_id);

-- 2. INSERT: 認証されたユーザーは共有を作成可能
CREATE POLICY "Authenticated users can create shares" ON property_shares
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 3. UPDATE: オーナーのみ更新可能
CREATE POLICY "Owners can update their shares" ON property_shares
  FOR UPDATE USING (auth.uid() = owner_id);

-- 4. DELETE: オーナーのみ削除可能
CREATE POLICY "Owners can delete their shares" ON property_shares
  FOR DELETE USING (auth.uid() = owner_id);

-- share_invitationsテーブルのポリシーも簡素化
DROP POLICY IF EXISTS "Users can view invitations related to them" ON share_invitations;
DROP POLICY IF EXISTS "Share owners can create invitations" ON share_invitations;
DROP POLICY IF EXISTS "Share owners can update invitations" ON share_invitations;

-- シンプルなポリシーを再作成
CREATE POLICY "Users can view relevant invitations" ON share_invitations
  FOR SELECT USING (
    auth.uid() = invited_by OR 
    auth.uid() = accepted_by OR 
    email = auth.jwt()->>'email'
  );

CREATE POLICY "Users can create invitations" ON share_invitations
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can update invitations" ON share_invitations
  FOR UPDATE USING (
    auth.uid() = invited_by OR 
    auth.uid() = accepted_by
  );

-- share_commentsテーブルのポリシーも簡素化
DROP POLICY IF EXISTS "Users can view comments on accessible shares" ON share_comments;
DROP POLICY IF EXISTS "Users with comment permission can create comments" ON share_comments;

-- シンプルなポリシーを再作成
CREATE POLICY "Users can view comments" ON share_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM property_shares 
      WHERE id = share_comments.share_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments" ON share_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_shares 
      WHERE id = share_comments.share_id 
      AND owner_id = auth.uid()
    )
  );