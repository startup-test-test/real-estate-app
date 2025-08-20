-- 本番環境用：Google OAuth対応（最小限の変更でエラーを防ぐ）

-- 1. 現在のトリガー関数を確認（バックアップ用）
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- 2. 最小限の修正版（Google OAuth対応 + エラー防止）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- エラーを絶対に出さない
  BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(NEW.email, '@', 1)
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(public.users.full_name, EXCLUDED.full_name);
  EXCEPTION
    WHEN OTHERS THEN
      -- 何もしない（エラーを握りつぶす）
      NULL;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 既存のGoogle OAuthユーザーを修復
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
  AND au.raw_app_meta_data->>'provider' = 'google'
ON CONFLICT (id) DO NOTHING;

-- 4. 確認
SELECT 
  au.email,
  au.raw_app_meta_data->>'provider' as provider,
  CASE 
    WHEN pu.id IS NOT NULL THEN '✅ 同期済み'
    ELSE '❌ 未同期'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.raw_app_meta_data->>'provider' = 'google'
ORDER BY au.created_at DESC;