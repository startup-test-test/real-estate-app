-- subscriptionsテーブルの構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 既存のデータを確認
SELECT * FROM subscriptions LIMIT 1;

-- もしcurrent_period_startとcurrent_period_endカラムが存在しない場合、追加する
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;