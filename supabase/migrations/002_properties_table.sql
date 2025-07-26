-- properties テーブルを作成（存在しない場合）

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
  EXECUTE FUNCTION update_updated_at_column();