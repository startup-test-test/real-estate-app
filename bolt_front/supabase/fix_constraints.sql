-- 一時的にproperty_sharesテーブルのproperty_id制約を削除

-- 既存の外部キー制約を削除
ALTER TABLE property_shares 
DROP CONSTRAINT IF EXISTS property_shares_property_id_fkey;

-- property_idカラムをNULL許可に変更
ALTER TABLE property_shares 
ALTER COLUMN property_id DROP NOT NULL;