-- 安全なデバッグ用ポリシー（RLS無効化の代替）

-- 既存の制限的なポリシーを削除
DROP POLICY IF EXISTS "Users can view their own shares" ON property_shares;
DROP POLICY IF EXISTS "Authenticated users can create shares" ON property_shares;
DROP POLICY IF EXISTS "Users can create shares" ON property_shares;
DROP POLICY IF EXISTS "Users can view share comments" ON share_comments;
DROP POLICY IF EXISTS "Users can create share comments" ON share_comments;

-- より安全で緩い一時的ポリシー
CREATE POLICY "Debug: Allow basic property_shares access" ON property_shares
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = owner_id OR
      share_token IS NOT NULL  -- 招待トークンがある場合は閲覧可能
    )
  );

CREATE POLICY "Debug: Allow property_shares creation" ON property_shares
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "Debug: Allow share_comments access" ON share_comments  
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM property_shares ps 
        WHERE ps.id = share_comments.share_id 
        AND (ps.owner_id = auth.uid() OR ps.share_token IS NOT NULL)
      )
    )
  );

CREATE POLICY "Debug: Allow share_comments creation" ON share_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- 確認
SELECT 'Safe debug policies created' as status;