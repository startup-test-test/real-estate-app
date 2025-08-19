-- 初期テーブル作成
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users profile table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create properties table
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  land_area DECIMAL(10,2) NOT NULL,
  building_area DECIMAL(10,2) NOT NULL,
  year_built INTEGER NOT NULL,
  property_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties table
CREATE POLICY "Users can view their own properties" ON public.properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" ON public.properties
  FOR DELETE USING (auth.uid() = user_id);

-- Create simulations table
CREATE TABLE public.simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  simulation_data JSONB NOT NULL,
  results JSONB NOT NULL,
  cash_flow_table JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on simulations table
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for simulations table
CREATE POLICY "Users can view their own simulations" ON public.simulations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own simulations" ON public.simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulations" ON public.simulations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations" ON public.simulations
  FOR DELETE USING (auth.uid() = user_id);

-- Create market_analyses table
CREATE TABLE public.market_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on market_analyses table
ALTER TABLE public.market_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for market_analyses table
CREATE POLICY "Users can view their own market analyses" ON public.market_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own market analyses" ON public.market_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own market analyses" ON public.market_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own market analyses" ON public.market_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_simulations_updated_at 
  BEFORE UPDATE ON public.simulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_analyses_updated_at 
  BEFORE UPDATE ON public.market_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();-- properties テーブルを作成（存在しない場合）

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  purchase_price NUMERIC DEFAULT 0,
  monthly_rent NUMERIC DEFAULT 0,
  building_area NUMERIC DEFAULT 0,
  land_area NUMERIC DEFAULT 0,
  year_built INTEGER DEFAULT 2024,
  property_type VARCHAR(50) DEFAULT '区分マンション',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC);

-- RLS (Row Level Security) ポリシー
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の物件のみアクセス可能
CREATE POLICY "Users can only access their own properties" ON properties
  FOR ALL USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();-- Simulationsテーブルのスキーマ修正
-- useSupabaseData.tsのコードに合わせて必要なフィールドを追加

-- 1. 必要なフィールドを追加
ALTER TABLE public.simulations 
ADD COLUMN IF NOT EXISTS simulation_name VARCHAR(255);

ALTER TABLE public.simulations 
ADD COLUMN IF NOT EXISTS share_token VARCHAR(255) UNIQUE;

-- input_data と result_data カラムを追加（既存のsimulation_dataとresultsと並行）
ALTER TABLE public.simulations 
ADD COLUMN IF NOT EXISTS input_data JSONB;

ALTER TABLE public.simulations 
ADD COLUMN IF NOT EXISTS result_data JSONB;

-- 2. インデックスを追加
CREATE INDEX IF NOT EXISTS idx_simulations_share_token ON public.simulations(share_token);
CREATE INDEX IF NOT EXISTS idx_simulations_name ON public.simulations(simulation_name);

-- 3. 共有トークン生成関数
CREATE OR REPLACE FUNCTION generate_simulation_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 4. 既存データの移行（simulation_dataをinput_dataに、resultsをresult_dataに）
UPDATE public.simulations 
SET 
  input_data = simulation_data,
  result_data = results
WHERE input_data IS NULL OR result_data IS NULL;

-- 5. RLSポリシーを更新（share_tokenでの共有アクセスを許可）
DROP POLICY IF EXISTS "Users can view their own simulations" ON public.simulations;
CREATE POLICY "Users can view their own simulations" ON public.simulations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (share_token IS NOT NULL AND share_token != '')
  );

-- UPDATE権限も同様に更新
DROP POLICY IF EXISTS "Users can update their own simulations" ON public.simulations;
CREATE POLICY "Users can update their own simulations" ON public.simulations
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== Simulations スキーマ修正完了 ===';
  RAISE NOTICE '1. simulation_name カラム追加: ✅';
  RAISE NOTICE '2. share_token カラム追加: ✅';  
  RAISE NOTICE '3. input_data/result_data カラム追加: ✅';
  RAISE NOTICE '4. インデックス追加: ✅';
  RAISE NOTICE '5. RLSポリシー更新: ✅';
  RAISE NOTICE '=== 修正完了しました ===';
END $$;-- 完全なスキーマ更新: データベース仕様書に準拠
-- 作成日: 2025-07-02

-- 1. 外部キー制約の復元
ALTER TABLE property_shares 
ADD CONSTRAINT property_shares_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- property_idをNOT NULL制約に戻す
ALTER TABLE property_shares 
ALTER COLUMN property_id SET NOT NULL;

-- 2. 仕様書準拠のRLSポリシーに更新

-- property_shares テーブルのポリシー更新
DROP POLICY IF EXISTS "Users can view their own shares" ON property_shares;
DROP POLICY IF EXISTS "Authenticated users can create shares" ON property_shares;
DROP POLICY IF EXISTS "Owners can update their shares" ON property_shares;
DROP POLICY IF EXISTS "Owners can delete their shares" ON property_shares;

-- 仕様書準拠のポリシー作成
CREATE POLICY "Users can view shares they have access to" ON property_shares
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM share_invitations si
      WHERE si.share_id = property_shares.id
      AND si.accepted_by = auth.uid()
      AND si.status = 'accepted'
    )
  );

CREATE POLICY "Users can create shares for their properties" ON property_shares
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_shares.property_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their shares" ON property_shares
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shares" ON property_shares
  FOR DELETE USING (auth.uid() = owner_id);

-- share_invitations テーブルのポリシー更新
DROP POLICY IF EXISTS "Users can view relevant invitations" ON share_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON share_invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON share_invitations;

CREATE POLICY "Users can view invitations related to them" ON share_invitations
  FOR SELECT USING (
    auth.uid() = invited_by OR
    auth.uid() = accepted_by OR
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Share owners can create invitations" ON share_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Share owners can update invitations" ON share_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM property_shares ps
      WHERE ps.id = share_invitations.share_id
      AND ps.owner_id = auth.uid()
    ) OR
    auth.uid() = accepted_by  -- 招待者も受諾可能
  );

-- share_comments テーブルのポリシー更新
DROP POLICY IF EXISTS "Users can view comments" ON share_comments;
DROP POLICY IF EXISTS "Users can create comments" ON share_comments;

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

-- comment_reactions テーブルのポリシー更新（既存のものを保持）
-- 既存のポリシーが適切なため変更不要

-- 3. 不足している関数の追加

-- 期限切れ招待のクリーンアップ関数
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE share_invitations 
  SET status = 'expired'
  WHERE expires_at < CURRENT_TIMESTAMP 
  AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- 4. パフォーマンス向上のための追加インデックス

-- 複合インデックス（高頻度クエリ用）
CREATE INDEX IF NOT EXISTS idx_invitations_share_status 
ON share_invitations(share_id, status);

CREATE INDEX IF NOT EXISTS idx_invitations_accepted_by_status 
ON share_invitations(accepted_by, status);

CREATE INDEX IF NOT EXISTS idx_comments_share_created 
ON share_comments(share_id, created_at DESC);

-- 5. データ整合性確保のための制約追加

-- 共有期限の論理チェック
ALTER TABLE property_shares 
ADD CONSTRAINT check_expires_at_future 
CHECK (expires_at IS NULL OR expires_at > created_at);

-- 招待期限の論理チェック  
ALTER TABLE share_invitations
ADD CONSTRAINT check_invitation_expires_future
CHECK (expires_at > created_at);

-- コメント内容の空白チェック
ALTER TABLE share_comments
ADD CONSTRAINT check_content_not_empty
CHECK (trim(content) != '');

-- 6. セキュリティ強化

-- 共有トークンの複雑性確保
ALTER TABLE property_shares
ADD CONSTRAINT check_share_token_length
CHECK (length(share_token) >= 32);

-- 招待トークンの複雑性確保
ALTER TABLE share_invitations  
ADD CONSTRAINT check_invitation_token_length
CHECK (length(invitation_token) >= 64);

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== スキーマ更新完了 ===';
  RAISE NOTICE '1. 外部キー制約復元: ✅';
  RAISE NOTICE '2. RLSポリシー仕様書準拠: ✅';  
  RAISE NOTICE '3. セキュリティ制約追加: ✅';
  RAISE NOTICE '4. パフォーマンスインデックス追加: ✅';
  RAISE NOTICE '=== 全て完了しました ===';
END $$;-- subscriptionsテーブルのRLSポリシーを修正
-- 406エラーの解決

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for users" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for users" ON subscriptions;

-- 新しいポリシーを作成
-- ユーザーは自分のサブスクリプションを読み取り可能
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- サービスロールは全ての操作が可能（Edge Functions用）
CREATE POLICY "Service role can manage all subscriptions"
ON subscriptions FOR ALL
TO service_role
USING (true);

-- ユーザーは自分のサブスクリプションを作成可能
CREATE POLICY "Users can create own subscription"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のサブスクリプションを更新可能
CREATE POLICY "Users can update own subscription"
ON subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);-- Stripe決済機能用テーブル作成
-- 作成日: 2025年8月12日
-- 月3回制限のフリーミアムモデル対応

-- ========================================
-- 1. ユーザー利用状況テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  period_start_date TIMESTAMP DEFAULT NOW(),
  period_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========================================
-- 2. サブスクリプション管理テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive', -- active, canceled, past_due
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ========================================
-- 3. 利用履歴テーブル（分析用）
-- ========================================
CREATE TABLE IF NOT EXISTS usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'simulator', 'market_analysis', etc
  feature_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 4. インデックス作成
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_period_end ON user_usage(period_end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_history_created_at ON usage_history(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_history_feature_type ON usage_history(feature_type);

-- ========================================
-- 5. RLS（Row Level Security）有効化
-- ========================================
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. RLSポリシー設定
-- ========================================

-- user_usage: ユーザーは自分のデータのみアクセス可能
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage" ON user_usage
  FOR ALL USING (auth.uid() = user_id);

-- subscriptions: ユーザーは自分のサブスクリプションのみアクセス可能
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- usage_history: ユーザーは自分の履歴のみ閲覧可能
DROP POLICY IF EXISTS "Users can view own history" ON usage_history;
CREATE POLICY "Users can view own history" ON usage_history
  FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- 7. 期間チェック・リセット関数（30日ごとの自動リセット）
-- ========================================
CREATE OR REPLACE FUNCTION check_and_reset_usage(p_user_id UUID)
RETURNS TABLE(current_count INTEGER, period_end TIMESTAMP) AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- 現在の使用状況を取得
  SELECT * INTO v_usage FROM user_usage WHERE user_id = p_user_id;
  
  -- レコードが存在しない場合は新規作成
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, usage_count, period_start_date, period_end_date)
    VALUES (p_user_id, 0, NOW(), NOW() + INTERVAL '30 days')
    RETURNING usage_count, period_end_date INTO current_count, period_end;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- 期間が過ぎていたらリセット
  IF v_usage.period_end_date < NOW() THEN
    UPDATE user_usage 
    SET usage_count = 0,
        period_start_date = NOW(),
        period_end_date = NOW() + INTERVAL '30 days',
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING usage_count, period_end_date INTO current_count, period_end;
  ELSE
    -- 期間内の場合は現在の値を返す
    current_count := v_usage.usage_count;
    period_end := v_usage.period_end_date;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. 使用回数インクリメント関数
-- ========================================
CREATE OR REPLACE FUNCTION increment_usage_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- 使用回数を1増やす
  UPDATE user_usage 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING usage_count INTO v_new_count;
  
  -- レコードが存在しない場合は作成
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, usage_count)
    VALUES (p_user_id, 1)
    RETURNING usage_count INTO v_new_count;
  END IF;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. サブスクリプション状態確認関数
-- ========================================
CREATE OR REPLACE FUNCTION is_premium_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status 
  FROM subscriptions 
  WHERE user_id = p_user_id;
  
  RETURN v_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. 更新日時自動更新トリガー
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_usageテーブルのトリガー
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- subscriptionsテーブルのトリガー
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 実行確認メッセージ
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Stripe決済用テーブルの作成が完了しました';
  RAISE NOTICE '- user_usage: 利用状況管理';
  RAISE NOTICE '- subscriptions: サブスクリプション管理';
  RAISE NOTICE '- usage_history: 利用履歴';
  RAISE NOTICE '月3回制限のフリーミアムモデル対応完了';
END $$;-- Migration: Add cancellation fields to subscriptions table
-- Date: 2025-08-13
-- Purpose: Support subscription cancellation feature

-- Add cancel_at_period_end column to track cancellation status
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Add cancel_at column to store the cancellation date
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMP WITH TIME ZONE;

-- Add current_period_start column if not exists
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at_period_end 
ON subscriptions(cancel_at_period_end) 
WHERE cancel_at_period_end = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at 
ON subscriptions(cancel_at) 
WHERE cancel_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Flag indicating if subscription will be cancelled at period end';
COMMENT ON COLUMN subscriptions.cancel_at IS 'Date when the subscription will be cancelled';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start date of the current billing period';

-- RLS Policy: Ensure users can only view their own subscription
-- (Should already exist, but adding if not)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

-- Create policy for users to view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to update their own subscription (for cancellation)
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for service role to manage all subscriptions
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;

CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');-- 共有機能関連の全テーブルにRLSを有効化（まだ存在しない場合に備えて）

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
END $$;-- ========================================
-- 月次リセット機能の修正
-- 毎月1日に全ユーザーの利用回数をリセットするように変更
-- ========================================

-- check_and_reset_usage関数を更新
CREATE OR REPLACE FUNCTION check_and_reset_usage(p_user_id UUID)
RETURNS TABLE(current_count INTEGER, period_end TIMESTAMP) AS $$
DECLARE
  v_usage RECORD;
  v_next_reset_date TIMESTAMP;
BEGIN
  -- 現在の使用状況を取得
  SELECT * INTO v_usage FROM user_usage WHERE user_id = p_user_id;
  
  -- レコードが存在しない場合は新規作成
  IF NOT FOUND THEN
    -- 次の月初（1日）を計算
    v_next_reset_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
    
    INSERT INTO user_usage (user_id, usage_count, period_start_date, period_end_date)
    VALUES (p_user_id, 0, NOW(), v_next_reset_date)
    RETURNING usage_count, period_end_date INTO current_count, period_end;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- 期間が過ぎていたらリセット
  IF v_usage.period_end_date < NOW() THEN
    -- 次の月初（1日）を計算
    v_next_reset_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
    
    UPDATE user_usage 
    SET usage_count = 0,
        period_start_date = NOW(),
        period_end_date = v_next_reset_date,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING usage_count, period_end_date INTO current_count, period_end;
  ELSE
    -- 期間内の場合は現在の値を返す
    current_count := v_usage.usage_count;
    period_end := v_usage.period_end_date;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のユーザーのリセット日を次の月初（9月1日）に統一
UPDATE user_usage
SET period_end_date = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
WHERE period_end_date IS NOT NULL;https://ooya.tech//ooya.tech/public_htmln-- 二重決済防止のためのUNIQUE制約を追加
-- 1ユーザーにつき、アクティブで解約予定でないサブスクリプションは1つまで

-- 既存のインデックスがあれば削除
DROP INDEX IF EXISTS idx_one_active_subscription_per_user;

-- 新しいUNIQUE制約を追加
-- statusが'active'で、cancel_at_period_endがfalseの場合、user_idはユニークでなければならない
CREATE UNIQUE INDEX idx_one_active_subscription_per_user 
ON subscriptions(user_id) 
WHERE status = 'active' AND cancel_at_period_end = false;

-- コメントを追加
COMMENT ON INDEX idx_one_active_subscription_per_user IS 
'各ユーザーは1つのアクティブなサブスクリプションのみ持つことができる（解約予定のものは除く）';