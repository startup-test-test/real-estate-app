-- Migration: Google OAuth認証対応のトリガー修正
-- Created: 2025-08-20
-- Purpose: Google OAuthでログインしたユーザーもpublic.usersテーブルに自動登録されるようにする

-- 既存のトリガー関数を削除
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 改良版のトリガー関数を作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- ログ出力（デバッグ用）
  RAISE NOTICE 'New user created: %, email: %, provider: %', 
    NEW.id, 
    NEW.email,
    NEW.raw_app_meta_data->>'provider';

  -- usersテーブルに挿入（エラーを防ぐためON CONFLICTを使用）
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)  -- メールアドレスの@より前を名前として使用
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(
      public.users.full_name,
      EXCLUDED.full_name
    ),
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生してもauth.usersへの挿入は続行
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを再作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 既存のOAuthユーザーのデータを修復
-- auth.usersに存在するがpublic.usersに存在しないユーザーを追加
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;  -- 既に存在する場合はスキップ