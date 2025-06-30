-- 共有データ保存用テーブル
CREATE TABLE IF NOT EXISTS public.simulation_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id VARCHAR(12) UNIQUE NOT NULL, -- 短縮URL用のID
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 共有作成者（削除されてもデータは残る）
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE, -- 元の物件データ
  
  -- シミュレーション結果データ
  simulation_data JSONB NOT NULL, -- シミュレーション結果の完全なコピー
  property_data JSONB NOT NULL, -- 物件情報のコピー
  
  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'), -- 7日後に期限切れ
  view_count INTEGER DEFAULT 0, -- 閲覧回数
  
  -- アクセス制御（Phase 2用に準備）
  password_hash TEXT, -- パスワード保護（オプション）
  max_views INTEGER, -- 最大閲覧回数（オプション）
  
  -- インデックス
  CONSTRAINT share_id_length CHECK (LENGTH(share_id) = 12)
);

-- 期限切れデータを自動削除するための関数
CREATE OR REPLACE FUNCTION delete_expired_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM public.simulation_shares
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 毎日実行されるスケジュール（pg_cronが必要）
-- SELECT cron.schedule('delete-expired-shares', '0 0 * * *', 'SELECT delete_expired_shares();');

-- インデックスの作成
CREATE INDEX idx_share_id ON public.simulation_shares(share_id);
CREATE INDEX idx_expires_at ON public.simulation_shares(expires_at);
CREATE INDEX idx_user_id ON public.simulation_shares(user_id);

-- RLSポリシー
ALTER TABLE public.simulation_shares ENABLE ROW LEVEL SECURITY;

-- 誰でも有効な共有データを読めるポリシー
CREATE POLICY "Anyone can view valid shares" ON public.simulation_shares
  FOR SELECT
  USING (expires_at > NOW());

-- ログインユーザーは自分の共有を作成できる
CREATE POLICY "Users can create their own shares" ON public.simulation_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の共有を削除できる
CREATE POLICY "Users can delete their own shares" ON public.simulation_shares
  FOR DELETE
  USING (auth.uid() = user_id);

-- 閲覧回数を更新できる（誰でも）
CREATE POLICY "Anyone can increment view count" ON public.simulation_shares
  FOR UPDATE
  USING (expires_at > NOW())
  WITH CHECK (true);