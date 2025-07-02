-- データベース修正用SQL
-- Supabaseでこれらのテーブルを作成・修正します

-- 1. property_shares テーブル（既存の場合は上書き）
CREATE TABLE IF NOT EXISTS property_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  title VARCHAR(255),
  description TEXT,
  settings JSONB DEFAULT '{"allow_comments": true, "allow_download": false}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. share_comments テーブル
CREATE TABLE IF NOT EXISTS share_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES property_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  parent_id UUID REFERENCES share_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. comment_reactions テーブル
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES share_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id, reaction)
);

-- 4. RLSポリシーを設定（シンプルバージョン）
ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- property_shares のポリシー
DROP POLICY IF EXISTS "Users can manage their own shares" ON property_shares;
CREATE POLICY "Users can manage their own shares" ON property_shares
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Anyone can view shares" ON property_shares;
CREATE POLICY "Anyone can view shares" ON property_shares
  FOR SELECT USING (true);

-- share_comments のポリシー
DROP POLICY IF EXISTS "Users can view all comments" ON share_comments;
CREATE POLICY "Users can view all comments" ON share_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post comments" ON share_comments;
CREATE POLICY "Authenticated users can post comments" ON share_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can edit their own comments" ON share_comments;
CREATE POLICY "Users can edit their own comments" ON share_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON share_comments;
CREATE POLICY "Users can delete their own comments" ON share_comments
  FOR DELETE USING (auth.uid() = user_id);

-- comment_reactions のポリシー
DROP POLICY IF EXISTS "Users can view all reactions" ON comment_reactions;
CREATE POLICY "Users can view all reactions" ON comment_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own reactions" ON comment_reactions;
CREATE POLICY "Users can manage their own reactions" ON comment_reactions
  FOR ALL USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_property_shares_property_id ON property_shares(property_id);
CREATE INDEX IF NOT EXISTS idx_property_shares_owner_id ON property_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_shares_token ON property_shares(share_token);

CREATE INDEX IF NOT EXISTS idx_share_comments_share_id ON share_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_share_comments_user_id ON share_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_share_comments_created_at ON share_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);