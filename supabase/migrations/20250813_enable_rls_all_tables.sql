-- 共有機能関連の全テーブルにRLSを有効化（まだ存在しない場合に備えて）

-- property_sharesテーブル
ALTER TABLE IF EXISTS public.property_shares ENABLE ROW LEVEL SECURITY;

-- share_invitationsテーブル  
ALTER TABLE IF EXISTS public.share_invitations ENABLE ROW LEVEL SECURITY;

-- share_commentsテーブル
ALTER TABLE IF EXISTS public.share_comments ENABLE ROW LEVEL SECURITY;

-- comment_reactionsテーブル
ALTER TABLE IF EXISTS public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- 基本的なポリシーを設定（存在しない場合）

-- property_shares: オーナーのみアクセス可能
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_shares' 
        AND policyname = 'Owners can manage their shares'
    ) THEN
        CREATE POLICY "Owners can manage their shares"
        ON public.property_shares
        FOR ALL
        USING (auth.uid() = owner_id);
    END IF;
END $$;

-- share_invitations: 招待関係者のみアクセス可能
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'share_invitations' 
        AND policyname = 'Users can view relevant invitations'
    ) THEN
        CREATE POLICY "Users can view relevant invitations"
        ON public.share_invitations
        FOR SELECT
        USING (
            auth.uid() = invited_by OR 
            auth.uid() = accepted_by OR 
            email = auth.jwt()->>'email'
        );
    END IF;
END $$;

-- share_comments: 共有関係者のみアクセス可能
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'share_comments' 
        AND policyname = 'Share participants can view comments'
    ) THEN
        CREATE POLICY "Share participants can view comments"
        ON public.share_comments
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.property_shares ps
                WHERE ps.id = share_comments.share_id
                AND (ps.owner_id = auth.uid() OR ps.is_public = true)
            )
        );
    END IF;
END $$;