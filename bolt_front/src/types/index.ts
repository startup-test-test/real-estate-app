// 不動産投資アプリケーション - 型定義

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

export interface Simulation {
  id: string;
  property_id: string;
  simulation_name: string;
  input_data: SimulationInputData;
  result_data: SimulationResultData;
  created_at: string;
  user_id: string;
}

export interface MarketAnalysis {
  id: string;
  location: string;
  analysis_data: MarketAnalysisData;
  created_at: string;
}

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
}

// シミュレーション結果データ型
export interface SimulationResultData {
  '表面利回り（%）': number;
  'IRR（%）': number | null;
  'CCR（%）': number;
  'DSCR（返済余裕率）': number;
  '月間キャッシュフロー（円）': number;
  '年間キャッシュフロー（円）': number;
  '総投資額（円）': number;
  '自己資金（円）': number;
  '借入額（円）': number;
}

// キャッシュフロー詳細データ型
export interface CashFlowData {
  年次: number;
  満室想定収入: number;
  '空室率（%）': number;
  実効収入: number;
  経費: number;
  大規模修繕: number;
  ローン返済: number;
  営業CF: number;
  累計CF: number;
}

// 市場分析データ型
export interface MarketAnalysisData {
  statistics: {
    median_price: number;
    user_price: number;
    deviation: number;
    evaluation: string;
  };
  similar_properties: SimilarProperty[];
}

export interface SimilarProperty {
  取引時期: string;
  所在地: string;
  '面積(㎡)': number;
  築年: number | null;
  構造: string;
  '取引価格(万円)': number;
  '平米単価(万円/㎡)': number;
  最寄駅: string;
  駅距離: string;
}

// 人口統計データ型
export interface CensusData {
  population: number;
  households: number;
  averageAge: number;
  incomeLevel: string;
  populationChange: number;
}

// 駅情報データ型
export interface StationData {
  name: string;
  line: string;
  distance: number;
  walkTime: number;
}

// 分析結果データ型
export interface AnalysisResult {
  score: number;
  factors: string[];
  recommendation: string;
  marketTrend: 'upward' | 'stable' | 'downward';
  investmentAdvice: string;
}

// API応答型
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message?: string;
}

// Supabase認証ユーザー型の拡張
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}