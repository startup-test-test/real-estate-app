-- 本番環境のusersテーブル修正

-- 1. usersテーブルの現在の構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. full_nameカラムが存在しない場合は追加
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3. 既存のGoogle OAuthユーザーを修復（full_nameカラム追加後）
INSERT INTO public.users (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  )
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  full_name = COALESCE(
    EXCLUDED.full_name,
    public.users.full_name
  );

-- 4. 通常のメール/パスワードユーザーも修復
INSERT INTO public.users (id, email)
SELECT 
  au.id,
  au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND (au.raw_app_meta_data->>'provider' IS NULL 
       OR au.raw_app_meta_data->>'provider' = 'email')
ON CONFLICT (id) DO NOTHING;

-- 5. 結果確認
SELECT 
  COUNT(*) as total_auth_users,
  COUNT(CASE WHEN pu.id IS NOT NULL THEN 1 END) as synced_users,
  COUNT(CASE WHEN pu.id IS NULL THEN 1 END) as unsynced_users
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;