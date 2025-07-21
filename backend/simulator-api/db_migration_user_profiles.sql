-- SEC-073: ユーザープロファイルテーブル作成マイグレーション
-- Supabase用のSQL migration script

-- user_profilesテーブル作成
CREATE TABLE IF NOT EXISTS user_profiles (
    -- 基本情報
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    
    -- ユーザーロール
    role VARCHAR(20) NOT NULL DEFAULT 'STANDARD' CHECK (role IN ('STANDARD', 'PREMIUM', 'ADMIN')),
    
    -- アカウント状態
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    
    -- ログイン統計
    login_count INTEGER NOT NULL DEFAULT 0,
    
    -- インデックス用のカラム（検索性能向上）
    email_normalized VARCHAR(255) GENERATED ALWAYS AS (LOWER(email)) STORED
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_normalized ON user_profiles(email_normalized);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) ポリシー設定
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 管理者は全てのユーザーを表示可能
CREATE POLICY "admin_can_view_all_users" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.role = 'ADMIN'
            AND admin_profile.is_active = TRUE
        )
    );

-- ユーザーは自分のプロファイルのみ表示可能
CREATE POLICY "users_can_view_own_profile" ON user_profiles
    FOR SELECT USING (user_id = auth.uid());

-- 管理者は他のユーザーのプロファイルを更新可能
CREATE POLICY "admin_can_update_users" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.role = 'ADMIN'
            AND admin_profile.is_active = TRUE
        )
    );

-- ユーザーは自分のプロファイルを更新可能（roleは除く）
CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid() 
        AND role = (SELECT role FROM user_profiles WHERE user_id = auth.uid())
    );

-- 管理者はユーザーを作成可能
CREATE POLICY "admin_can_insert_users" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.role = 'ADMIN'
            AND admin_profile.is_active = TRUE
        )
    );

-- システムは新規ユーザーのプロファイルを作成可能
CREATE POLICY "system_can_insert_new_users" ON user_profiles
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND role = 'STANDARD'
    );

-- 初期管理者アカウントを作成する関数
CREATE OR REPLACE FUNCTION create_initial_admin(
    admin_email TEXT,
    admin_name TEXT DEFAULT 'System Administrator'
)
RETURNS UUID AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- auth.usersテーブルにユーザーを作成（実際の実装ではSupabase Auth UIで作成）
    -- ここではプロファイルのみ作成
    
    -- 既存の管理者をチェック
    IF EXISTS (SELECT 1 FROM user_profiles WHERE role = 'ADMIN' AND is_active = TRUE) THEN
        RAISE NOTICE 'Admin user already exists';
        RETURN NULL;
    END IF;
    
    -- 仮のUUIDを生成（実際の実装ではauth.users.idを使用）
    admin_user_id := gen_random_uuid();
    
    -- 管理者プロファイルを作成
    INSERT INTO user_profiles (
        user_id, 
        email, 
        full_name, 
        role, 
        is_active,
        created_at
    ) VALUES (
        admin_user_id,
        admin_email,
        admin_name,
        'ADMIN',
        TRUE,
        NOW()
    );
    
    RETURN admin_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザープロファイル統計ビュー
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = TRUE) as active_users,
    COUNT(*) FILTER (WHERE is_active = FALSE) as inactive_users,
    AVG(login_count) as avg_login_count,
    MAX(last_login) as last_activity
FROM user_profiles 
GROUP BY role;

-- ログイン履歴テーブル（オプション）
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    failure_reason TEXT
);

-- ログイン履歴のインデックス
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_time ON login_history(login_time);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON login_history(success);

-- ログイン履歴のRLS
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- 管理者は全てのログイン履歴を表示可能
CREATE POLICY "admin_can_view_all_login_history" ON login_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.role = 'ADMIN'
            AND admin_profile.is_active = TRUE
        )
    );

-- ユーザーは自分のログイン履歴のみ表示可能
CREATE POLICY "users_can_view_own_login_history" ON login_history
    FOR SELECT USING (user_id = auth.uid());

-- システムはログイン履歴を記録可能
CREATE POLICY "system_can_insert_login_history" ON login_history
    FOR INSERT WITH CHECK (TRUE);

-- 古いログイン履歴を削除する関数（保持期間: 90日）
CREATE OR REPLACE FUNCTION cleanup_old_login_history()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM login_history 
    WHERE login_time < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- コメント追加
COMMENT ON TABLE user_profiles IS 'ユーザープロファイル情報を格納するテーブル';
COMMENT ON COLUMN user_profiles.user_id IS 'auth.users.idを参照するユーザーID';
COMMENT ON COLUMN user_profiles.email IS 'ユーザーのメールアドレス';
COMMENT ON COLUMN user_profiles.full_name IS 'ユーザーのフルネーム';
COMMENT ON COLUMN user_profiles.role IS 'ユーザーロール（STANDARD, PREMIUM, ADMIN）';
COMMENT ON COLUMN user_profiles.is_active IS 'アカウントがアクティブかどうか';
COMMENT ON COLUMN user_profiles.login_count IS '累計ログイン回数';
COMMENT ON COLUMN user_profiles.last_login IS '最終ログイン日時';

COMMENT ON TABLE login_history IS 'ユーザーのログイン履歴を記録するテーブル';
COMMENT ON COLUMN login_history.success IS 'ログインが成功したかどうか';
COMMENT ON COLUMN login_history.failure_reason IS 'ログイン失敗時の理由';

-- マイグレーション完了メッセージ
DO $$ 
BEGIN 
    RAISE NOTICE 'User profiles migration completed successfully';
    RAISE NOTICE 'Tables created: user_profiles, login_history';
    RAISE NOTICE 'RLS policies applied for security';
    RAISE NOTICE 'To create initial admin: SELECT create_initial_admin(''admin@example.com'', ''System Admin'');';
END $$;