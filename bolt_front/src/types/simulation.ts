/**
 * シミュレーション関連の型定義
 */

// 結果データ型をインポート
import type { SimulationResultData } from './results';

// シミュレーション入力データ型
export interface SimulationInputData {
  // 物件基本情報
  property_name: string;
  location: string;
  year_built: number;
  property_type: string;
  land_area: number;
  building_area: number;
  road_price: number;

  // 取得費用
  purchase_price: number;
  building_price: number;
  other_costs: number;
  renovation_cost: number;

  // 収支条件
  monthly_rent: number;
  management_fee: number;
  fixed_cost: number;
  property_tax: number;
  vacancy_rate: number;
  rent_decline: number;

  // 借入条件
  loan_type: '元利均等' | '元金均等';
  loan_amount: number;
  interest_rate: number;
  loan_years: number;

  // 出口戦略
  holding_years: number;
  exit_cap_rate: number;
  market_value: number;
  
  // 税金条件
  ownership_type: '個人' | '法人';
  effective_tax_rate: number;
  
  // 大規模修繕設定
  major_repair_cycle: number;
  major_repair_cost: number;
  
  // 減価償却設定
  building_price_for_depreciation: number;
  depreciation_years: number;
  
  // 物件ブックマーク
  property_url?: string;
  property_memo?: string;
  property_image_url?: string;
  property_image_file?: File;
}

// Supabaseデータベースのシミュレーション型
export interface Simulation {
  id: string;
  property_id: string;
  simulation_name: string;
  input_data: SimulationInputData;
  result_data: SimulationResultData;
  created_at: string;
  user_id: string;
}

// PDF生成用の型エイリアス
export type SimulationResult = Simulation & {
  // 追加のプロパティをオプションで追加
  property_price?: number;
  down_payment?: number;
  monthly_rent?: number;
  irr?: number;
  ccr?: number;
  noi?: number;
  annual_cash_flow?: number;
};

// キャッシュフロー詳細データ型
export interface CashFlowData {
  年次: number;
  満室想定収入: number;
  '空室率（%）': number;
  実効収入: number;
  経費: number;
  減価償却: number;
  税金: number;
  大規模修繕: number;
  初期リフォーム: number;
  ローン返済: number;
  営業CF: number;
  累計CF: number;
}