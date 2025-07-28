/**
 * 結果・分析関連の型定義
 */

// シミュレーション結果データ型
export interface SimulationResultData {
  '表面利回り（%）': number;
  '実質利回り（%）': number;
  'IRR（%）': number | null;
  'CCR（%）': number;
  'ROI（%）': number;
  'DSCR（返済余裕率）': number;
  '月間キャッシュフロー（円）': number;
  '年間キャッシュフロー（円）': number;
  'NOI（円）': number;
  'LTV（%）': number;
  '想定売却価格（万円）': number;
  '残債（万円）': number;
  '売却コスト（万円）': number;
  '売却益（万円）': number;
  '総投資額（円）': number;
  '自己資金（円）': number;
  '借入額（円）': number;
  '積算評価合計（万円）': number;
  '収益還元評価額（万円）': number;
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

export interface MarketAnalysis {
  id: string;
  location: string;
  analysis_data: MarketAnalysisData;
  created_at: string;
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