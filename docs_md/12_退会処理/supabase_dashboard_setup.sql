-- ========================================
-- Supabase SQL Editor で実行するSQL
-- 実行日: 2025年8月13日
-- 目的: プラン解約機能のデータベース設定
-- ========================================

-- 1. subscriptionsテーブルに解約関連カラムを追加
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;

-- 2. インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at_period_end 
ON subscriptions(cancel_at_period_end) 
WHERE cancel_at_period_end = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at 
ON subscriptions(cancel_at) 
WHERE cancel_at IS NOT NULL;

-- 3. カラムにコメントを追加（ドキュメント化）
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Flag indicating if subscription will be cancelled at period end';
COMMENT ON COLUMN subscriptions.cancel_at IS 'Date when the subscription will be cancelled';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start date of the current billing period';

-- 4. RLSポリシーの確認と更新
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;

-- ユーザーが自分のサブスクリプションを見れるポリシー
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーが自分のサブスクリプションを更新できるポリシー
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- サービスロールが全てのサブスクリプションを管理できるポリシー
CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- 5. 動作確認用のSELECT文
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_name = 'subscriptions'
  AND column_name IN ('cancel_at_period_end', 'cancel_at', 'current_period_start')
ORDER BY 
  ordinal_position;