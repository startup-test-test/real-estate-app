// 不動産投資アプリケーション - 型定義（メインエクスポート）

// 分離された型定義をインポート
export * from './simulation';
export * from './forms';
export * from './results';

// Supabaseデータベース型定義
export interface Property {
  id: string;
  property_name: string;
  location: string;
  purchase_price: number;
  monthly_rent: number;
  building_area: number;
  land_area: number;
  year_built: number;
  property_type: '戸建' | '区分マンション' | '一棟アパート' | '一棟マンション';
  created_at: string;
  updated_at: string;
  user_id: string;
}