-- 共有・招待機能のためのデータベーススキーマ

-- 1. property_shares テーブル（物件共有の基本情報）
CREATE TABLE IF NOT EXISTS property_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  share_token VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  settings JSONB DEFAULT '{"allow_comments": true, "allow_download": false}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_property_shares_owner ON property_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_shares_token ON property_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_property_shares_property ON property_shares(property_id);

-- 2. share_invitations テーブル（招待管理）
CREATE TABLE IF NOT EXISTS share_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES property_shares(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'commenter' CHECK (role IN ('viewer', 'commenter', 'editor')),
  user_type VARCHAR(50) DEFAULT 'general' CHECK (user_type IN ('family', 'tax_accountant', 'consultant', 'general')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  accepted_by UUID REFERENCES auth.users(id),
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_invitations_share ON share_invitations(share_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON share_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON share_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON share_invitations(status);

-- 3. share_comments テーブル（コメント）
CREATE TABLE IF NOT EXISTS share_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES property_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  parent_id UUID REFERENCES share_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_comments_share ON share_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON share_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON share_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON share_comments(created_at DESC);

-- 4. comment_reactions テーブル（リアクション）
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES share_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reaction VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id, reaction)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON comment_reactions(user_id);

-- 5. share_access_logs テーブル（アクセスログ）
CREATE TABLE IF NOT EXISTS share_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES property_shares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  invitation_id UUID REFERENCES share_invitations(id),
  action VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_access_logs_share ON share_access_logs(share_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON share_access_logs(created_at DESC);

-- 関数: 招待トークン生成
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 関数: 共有トークン生成
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- トリガー: 招待トークン自動生成
CREATE OR REPLACE FUNCTION set_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_token IS NULL THEN
    NEW.invitation_token := generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_token
  BEFORE INSERT ON share_invitations
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_token();

-- トリガー: 共有トークン自動生成
CREATE OR REPLACE FUNCTION set_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL THEN
    NEW.share_token := generate_share_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_share_token
  BEFORE INSERT ON property_shares
  FOR EACH ROW
  EXECUTE FUNCTION set_share_token();

-- トリガー: updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_shares_updated_at BEFORE UPDATE ON property_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_share_invitations_updated_at BEFORE UPDATE ON share_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_share_comments_updated_at BEFORE UPDATE ON share_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) ポリシー

-- property_shares テーブルのRLS
ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares they have access to" ON property_shares
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM share_invitations
      WHERE share_id = property_shares.id
      AND accepted_by = auth.uid()
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can create shares for their properties" ON property_shares
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_shares.property_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their shares" ON property_shares
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shares" ON property_shares
  FOR DELETE USING (auth.uid() = owner_id);

-- share_invitations テーブルのRLS
ALTER TABLE share_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations related to them" ON share_invitations
  FOR SELECT USING (
    auth.uid() = invited_by OR
    auth.uid() = accepted_by OR
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM property_shares
      WHERE id = share_invitations.share_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Share owners can create invitations" ON share_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_shares
      WHERE id = share_invitations.share_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Share owners can update invitations" ON share_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM property_shares
      WHERE id = share_invitations.share_id
      AND owner_id = auth.uid()
    )
  );

-- share_comments テーブルのRLS
ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can update their own comments" ON share_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON share_comments
  FOR DELETE USING (auth.uid() = user_id);

-- comment_reactions テーブルのRLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions on accessible comments" ON comment_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM share_comments sc
      JOIN property_shares ps ON sc.share_id = ps.id
      WHERE sc.id = comment_reactions.comment_id
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

CREATE POLICY "Users can manage their own reactions" ON comment_reactions
  FOR ALL USING (auth.uid() = user_id);