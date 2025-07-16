-- Simulationsテーブルのスキーマ修正
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
END $$;