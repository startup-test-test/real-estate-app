// 不動産取引事例検索用カスタムフック

import { useState } from 'react';

// モック用の型定義
interface RealEstateTradeData {
  Type?: string;
  Prefecture?: string;
  Municipality?: string;
  DistrictName?: string;
  TradePrice?: string;
  PricePerUnit?: string;
  FloorPlan?: string;
  Area?: string;
  UnitPrice?: string;
  LandShape?: string;
  Frontage?: string;
  TotalFloorArea?: string;
  BuildingYear?: string;
  Structure?: string;
  Use?: string;
  Purpose?: string;
  Direction?: string;
  Classification?: string;
  Breadth?: string;
  CityPlanning?: string;
  CoverageRatio?: string;
  FloorAreaRatio?: string;
  Period?: string;
  Renovation?: string;
  Remarks?: string;
  NearestStation?: string;
  TimeToNearestStation?: string;
}

export interface SearchFormData {
  prefecture: string;
  city: string;
  district?: string;
  propertyType: string;
  period: string;
}

export interface SearchResult {
  transactions: any[];
  statistics: any;
  rawData: RealEstateTradeData[];
  searchParams: SearchFormData;
  isMock?: boolean;
}

export const useRealEstateSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchTransactions = async (formData: SearchFormData) => {
    if (!formData.prefecture || !formData.city) {
      setError('都道府県と市区町村は必須です');
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      // モックAPI呼び出しをシミュレート
      console.log('不動産検索パラメータ:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // モックデータを生成
      const mockData = generateMockData(formData);
      const convertedData = convertToAnalysisFormat(mockData);
      const statistics = calculateStatistics(mockData);

      const result: SearchResult = {
        transactions: convertedData,
        statistics,
        rawData: mockData,
        searchParams: formData
      };

      setResults(result);
      return result;

    } catch (error) {
      console.error('不動産取引事例検索エラー:', error);
      const errorMessage = error instanceof Error ? error.message : '検索に失敗しました';
      setError(errorMessage);
      
      // エラー時はモックデータを返す（開発用）
      const mockResult = createMockResult(formData);
      setResults(mockResult);
      return mockResult;
      
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  const exportToCsv = (filename?: string) => {
    if (!results) return;

    const csvHeaders = [
      'ID', '住所', '価格(万円)', '単価(万円/㎡)', '建物面積(㎡)', 
      '土地面積(㎡)', '築年', '構造', '取引時期', '物件種別', '最寄駅', '徒歩(分)',
      '用途', '都市計画', '建ぺい率(%)', '容積率(%)', '前面道路', '備考'
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...results.transactions.map((t: any) => [
        t.id,
        `"${t.address}"`,
        t.price,
        t.pricePerSqm,
        t.buildingArea,
        t.landArea,
        t.buildYear,
        t.structure,
        `"${t.transactionDate}"`,
        `"${t.propertyType}"`,
        `"${t.nearestStation || ''}"`,
        t.walkingDistance || '',
        `"${t.purpose || ''}"`,
        `"${t.cityPlanning || ''}"`,
        t.buildingCoverage || '',
        t.floorAreaRatio || '',
        `"${t.frontRoad || ''}"`,
        `"${t.remarks || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `取引事例_${results.searchParams.prefecture}${results.searchParams.city}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    searchTransactions,
    clearResults,
    exportToCsv,
    isSearching,
    results,
    error
  };
};

// モックデータ生成（開発用）
const createMockResult = (formData: SearchFormData): SearchResult => {
  const mockTransactions = [
    {
      id: 'RE001',
      address: `${formData.prefecture}${formData.city}${formData.district || ''}1丁目`,
      price: 8500,
      pricePerSqm: 85.2,
      buildingArea: 99.8,
      landArea: 120.5,
      buildYear: 1995,
      structure: 'RC',
      transactionDate: `${formData.period}年第3四半期`,
      propertyType: formData.propertyType === '1' ? '宅地' : '中古マンション等',
      nearestStation: 'JR山手線 五反田駅',
      walkingDistance: 5,
      purpose: '住宅',
      cityPlanning: '第一種住居地域',
      buildingCoverage: 60,
      floorAreaRatio: 200,
      frontRoad: '南 6m 市道',
      remarks: ''
    },
    {
      id: 'RE002',
      address: `${formData.prefecture}${formData.city}${formData.district || ''}2丁目`,
      price: 6200,
      pricePerSqm: 78.9,
      buildingArea: 78.6,
      landArea: 95.2,
      buildYear: 1988,
      structure: 'RC',
      transactionDate: `${formData.period}年第2四半期`,
      propertyType: formData.propertyType === '1' ? '宅地' : '中古マンション等',
      nearestStation: 'JR山手線 五反田駅',
      walkingDistance: 8,
      purpose: '住宅',
      cityPlanning: '第一種住居地域',
      buildingCoverage: 60,
      floorAreaRatio: 160,
      frontRoad: '東 4m 私道',
      remarks: ''
    },
    {
      id: 'RE003',
      address: `${formData.prefecture}${formData.city}${formData.district || ''}3丁目`,
      price: 12000,
      pricePerSqm: 92.3,
      buildingArea: 130.0,
      landArea: 150.8,
      buildYear: 2001,
      structure: 'RC',
      transactionDate: `${formData.period}年第1四半期`,
      propertyType: formData.propertyType === '1' ? '宅地' : '中古マンション等',
      nearestStation: 'JR山手線 五反田駅',
      walkingDistance: 3,
      purpose: '住宅',
      cityPlanning: '第一種住居地域',
      buildingCoverage: 80,
      floorAreaRatio: 300,
      frontRoad: '北 8m 区道',
      remarks: ''
    }
  ];

  const mockStatistics = {
    totalCount: mockTransactions.length,
    averagePrice: Math.round(mockTransactions.reduce((sum, t) => sum + t.price, 0) / mockTransactions.length),
    averagePricePerSqm: Math.round(mockTransactions.reduce((sum, t) => sum + t.pricePerSqm, 0) / mockTransactions.length * 100) / 100,
    priceRange: {
      min: Math.min(...mockTransactions.map(t => t.price)),
      max: Math.max(...mockTransactions.map(t => t.price))
    },
    averageArea: Math.round(mockTransactions.reduce((sum, t) => sum + t.landArea, 0) / mockTransactions.length),
    averageAge: new Date().getFullYear() - Math.round(mockTransactions.reduce((sum, t) => sum + t.buildYear, 0) / mockTransactions.length)
  };

  return {
    transactions: mockTransactions,
    statistics: mockStatistics,
    rawData: [] as RealEstateTradeData[],
    searchParams: formData,
    isMock: true
  };
};

// モックデータ生成関数
const generateMockData = (formData: SearchFormData): RealEstateTradeData[] => {
  const mockDataItems: RealEstateTradeData[] = [];
  const count = Math.floor(Math.random() * 10) + 5; // 5-15件のデータ
  
  for (let i = 0; i < count; i++) {
    const basePrice = Math.floor(Math.random() * 10000) + 2000; // 2000-12000万円
    const area = Math.floor(Math.random() * 150) + 50; // 50-200㎡
    
    mockDataItems.push({
      Type: formData.propertyType === '1' ? '宅地(土地)' : '中古マンション等',
      Prefecture: formData.prefecture,
      Municipality: formData.city,
      DistrictName: formData.district || `${i + 1}丁目`,
      TradePrice: String(basePrice * 10000),
      Area: String(area),
      UnitPrice: String(Math.floor(basePrice * 10000 / area)),
      BuildingYear: formData.propertyType === '2' ? `平成${Math.floor(Math.random() * 20) + 10}年` : undefined,
      Structure: formData.propertyType === '2' ? 'RC' : undefined,
      Period: `${formData.period}年第${Math.floor(Math.random() * 4) + 1}四半期`,
      NearestStation: `JR山手線 駅${Math.floor(Math.random() * 5) + 1}`,
      TimeToNearestStation: String(Math.floor(Math.random() * 15) + 3),
      Use: '住宅',
      Purpose: '住宅',
      CityPlanning: '第一種住居地域',
      CoverageRatio: String(Math.floor(Math.random() * 20) + 60),
      FloorAreaRatio: String(Math.floor(Math.random() * 100) + 150),
      Direction: '南',
      Classification: '区道',
      Breadth: String(Math.floor(Math.random() * 4) + 4)
    });
  }
  
  return mockDataItems;
};

// 分析用フォーマットへの変換関数
const convertToAnalysisFormat = (data: RealEstateTradeData[]) => {
  return data.map((item, index) => ({
    id: `RE${String(index + 1).padStart(3, '0')}`,
    address: `${item.Prefecture}${item.Municipality}${item.DistrictName || ''}`,
    price: item.TradePrice ? Math.round(parseInt(item.TradePrice) / 10000) : 0,
    pricePerSqm: item.UnitPrice ? Math.round(parseInt(item.UnitPrice) / 10000) : 0,
    buildingArea: item.Area ? parseFloat(item.Area) : 0,
    landArea: item.Area ? parseFloat(item.Area) : 0,
    buildYear: item.BuildingYear ? parseInt(item.BuildingYear.replace(/[^ -9]/g, '')) + 1988 : null,
    structure: item.Structure || '',
    transactionDate: item.Period || '',
    propertyType: item.Type || '',
    nearestStation: item.NearestStation || '',
    walkingDistance: item.TimeToNearestStation ? parseInt(item.TimeToNearestStation) : null,
    purpose: item.Purpose || '',
    cityPlanning: item.CityPlanning || '',
    buildingCoverage: item.CoverageRatio ? parseInt(item.CoverageRatio) : null,
    floorAreaRatio: item.FloorAreaRatio ? parseInt(item.FloorAreaRatio) : null,
    frontRoad: `${item.Direction || '南'} ${item.Breadth || '6'}m ${item.Classification || '区道'}`,
    remarks: item.Remarks || ''
  }));
};

// 統計情報の計算関数
const calculateStatistics = (data: RealEstateTradeData[]) => {
  const prices = data
    .map(item => item.TradePrice ? parseInt(item.TradePrice) / 10000 : 0)
    .filter(price => price > 0);
  
  const areas = data
    .map(item => item.Area ? parseFloat(item.Area) : 0)
    .filter(area => area > 0);
  
  const unitPrices = data
    .map(item => item.UnitPrice ? parseInt(item.UnitPrice) / 10000 : 0)
    .filter(price => price > 0);

  return {
    totalCount: data.length,
    averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    averagePricePerSqm: unitPrices.length > 0 ? Math.round(unitPrices.reduce((a, b) => a + b, 0) / unitPrices.length * 100) / 100 : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    },
    averageArea: areas.length > 0 ? Math.round(areas.reduce((a, b) => a + b, 0) / areas.length) : 0,
    averageAge: 0 // モックデータのため年齢計算は省略
  };
};