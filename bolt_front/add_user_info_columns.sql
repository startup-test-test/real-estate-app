-- share_commentsテーブルにユーザー情報カラムを追加
-- これにより、コメント投稿時にユーザー情報を保存できます

ALTER TABLE share_comments 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- 既存のコメントにユーザー情報を更新（現在のログインユーザーの情報を使用）
-- 注意: これは一度だけ実行してください
UPDATE share_comments 
SET 
  user_email = COALESCE(user_email, 'user@example.com'),
  user_name = COALESCE(user_name, 'ユーザー')
WHERE user_email IS NULL OR user_name IS NULL;