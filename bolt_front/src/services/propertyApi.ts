/**
 * Property API Service
 * Renderにデプロイされた不動産価格検索APIとの通信を管理
 */

import { getApiUrl } from '../config/api.config';

// APIのベースURL
const API_BASE_URL = getApiUrl();
console.log('PropertyApi using URL:', API_BASE_URL); // デバッグログ追加

/**
 * APIレスポンスの基本型
 */
interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  count?: number;
  message?: string;
  error_code?: string;
  detail?: string;
}

/**
 * 都道府県データ型
 */
export interface Prefecture {
  code: string;
  name: string;
}

/**
 * 市区町村データ型
 */
export interface City {
  code: string;
  name: string;
}

/**
 * Property APIクライアント
 */
export class PropertyApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * APIリクエストの共通処理
   */
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<any> {
    return this.fetchApi('/');
  }

  /**
   * 詳細ヘルスチェック
   */
  async detailedHealthCheck(): Promise<any> {
    return this.fetchApi('/health');
  }

  /**
   * 都道府県リストを取得
   */
  async getPrefectures(): Promise<ApiResponse<Prefecture[]>> {
    return this.fetchApi<ApiResponse<Prefecture[]>>('/api/prefectures');
  }

  /**
   * 市区町村リストを取得
   */
  async getCities(prefectureCode: string): Promise<ApiResponse<City[]>> {
    return this.fetchApi<ApiResponse<City[]>>(`/api/cities/${prefectureCode}`);
  }

  /**
   * 地区リストを取得
   */
  async getDistricts(prefectureCode: string, cityCode?: string): Promise<ApiResponse<any[]>> {
    const url = cityCode
      ? `/api/districts/${prefectureCode}?municipality_code=${cityCode}`
      : `/api/districts/${prefectureCode}`;
    return this.fetchApi<ApiResponse<any[]>>(url);
  }

  /**
   * 不動産価格を検索
   */
  async searchProperties(params: {
    prefecture: string;
    city?: string;
    district?: string;
    property_type?: string;
    year?: number;
    quarter?: number;
    min_area?: number;
    max_area?: number;
    min_year?: number;
    max_year?: number;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();

    // 必須パラメータ
    queryParams.append('prefecture', params.prefecture);

    // オプションパラメータ
    if (params.city) queryParams.append('city', params.city);
    if (params.district) queryParams.append('district', params.district);
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.year) queryParams.append('year', params.year.toString());
    if (params.quarter) queryParams.append('quarter', params.quarter.toString());
    if (params.min_area) queryParams.append('min_area', params.min_area.toString());
    if (params.max_area) queryParams.append('max_area', params.max_area.toString());
    if (params.min_year) queryParams.append('min_year', params.min_year.toString());
    if (params.max_year) queryParams.append('max_year', params.max_year.toString());

    return this.fetchApi<ApiResponse<any[]>>(`/api/search?${queryParams.toString()}`);
  }

  /**
   * 公示地価データを取得
   */
  async getLandPrices(params: {
    prefecture: string;
    city?: string;
    district?: string;
    year?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();

    queryParams.append('prefecture', params.prefecture);
    if (params.city) queryParams.append('city', params.city);
    if (params.district) queryParams.append('district', params.district);
    if (params.year) queryParams.append('year', params.year);

    return this.fetchApi<ApiResponse<any[]>>(`/api/land-prices?${queryParams.toString()}`);
  }

  /**
   * AI市場分析サマリーを生成
   */
  async generateMarketAnalysisSummary(params: {
    marketData: any;
    similarProperties: any[];
    landPriceData?: any[];
    targetArea?: number;
    targetYear?: number;
  }): Promise<ApiResponse<{
    summary: string;
    key_insights: string[];
    recommendations: string[];
  }>> {
    return this.fetchApi<ApiResponse<{
      summary: string;
      key_insights: string[];
      recommendations: string[];
    }>>('/api/market-analysis-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        market_data: params.marketData,
        similar_properties: params.similarProperties,
        land_price_data: params.landPriceData || [],
        target_area: params.targetArea,
        target_year: params.targetYear
      }),
    });
  }

  // 機械学習分析API
  async analyzeWithML(properties: any[], analysisType: string = 'full'): Promise<ApiResponse<any>> {
    return this.fetchApi<ApiResponse<any>>('/api/ml/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties,
        analysis_type: analysisType
      }),
    });
  }

  // シンプルML分析API（フロントエンド用）
  async simpleMLAnalysis(properties: any[]): Promise<ApiResponse<any>> {
    return this.fetchApi<ApiResponse<any>>('/api/ml/simple-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties,
        analysis_type: 'full'
      }),
    });
  }
}

// シングルトンインスタンスをエクスポート
export const propertyApi = new PropertyApiClient();