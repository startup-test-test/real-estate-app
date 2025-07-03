-- シンプルなコメントシステム用のテーブル
-- 既存の複雑な制約を排除して、基本的なコメント機能を実装

-- 1. シンプルなコメントテーブルを作成
CREATE TABLE IF NOT EXISTS simple_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  content TEXT NOT NULL,
  page_id VARCHAR(255) NOT NULL, -- 簡単な文字列ID（URLパスなど）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_simple_comments_page_id ON simple_comments(page_id);
CREATE INDEX IF NOT EXISTS idx_simple_comments_user_id ON simple_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_simple_comments_created_at ON simple_comments(created_at DESC);

-- 3. RLSポリシーを設定（シンプル版）
ALTER TABLE simple_comments ENABLE ROW LEVEL SECURITY;

-- 誰でもコメントを見ることができる
DROP POLICY IF EXISTS "Anyone can view simple comments" ON simple_comments;
CREATE POLICY "Anyone can view simple comments" ON simple_comments
  FOR SELECT USING (true);

-- ログインユーザーはコメントを投稿できる
DROP POLICY IF EXISTS "Authenticated users can post simple comments" ON simple_comments;
CREATE POLICY "Authenticated users can post simple comments" ON simple_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のコメントを編集・削除できる
DROP POLICY IF EXISTS "Users can edit their own simple comments" ON simple_comments;
CREATE POLICY "Users can edit their own simple comments" ON simple_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own simple comments" ON simple_comments;
CREATE POLICY "Users can delete their own simple comments" ON simple_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE 'シンプルコメントテーブルの作成が完了しました';
END $$;