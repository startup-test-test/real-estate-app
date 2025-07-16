interface MockProperty {
  id: string;
  property_name: string;
  location: string;
  property_type: string;
  year_built: number;
  purchase_price: number;
  monthly_rent: number;
  building_area: number;
  land_area: number;
}

interface MockSimulation {
  id: string;
  property_id: string;
  input_data: MockProperty;
  result_data: {
    [key: string]: number;
  };
  cash_flow_table: Array<{
    年次: number;
    満室想定収入: number;
    実効収入: number;
    経費: number;
    営業CF: number;
    累計CF: number;
  }>;
}

interface MockShareData {
  id: string;
  property_id: string;
  owner_id: string;
  share_token: string;
  title: string;
  description: string;
  settings: {
    allow_comments: boolean;
    allow_download: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const createMockProperty = (shareData: any): MockProperty => {
  return {
    id: shareData.property_id,
    property_name: shareData.title || '共有された物件',
    location: '東京都',
    property_type: '区分マンション',
    year_built: 2020,
    purchase_price: 5000,
    monthly_rent: 120000,
    building_area: 50,
    land_area: 0
  };
};

export const createMockSimulation = (shareData: any): MockSimulation => {
  const mockProperty = createMockProperty(shareData);
  
  return {
    id: 'mock-sim-id',
    property_id: shareData.property_id,
    input_data: mockProperty,
    result_data: {
      '表面利回り（%）': 8.5,
      'IRR（%）': 12.3,
      'CCR（%）': 15.2,
      '月間キャッシュフロー（円）': 25000
    },
    cash_flow_table: [
      { 年次: 1, 満室想定収入: 1440000, 実効収入: 1400000, 経費: 200000, 営業CF: 300000, 累計CF: 300000 },
      { 年次: 2, 満室想定収入: 1440000, 実効収入: 1400000, 経費: 205000, 営業CF: 295000, 累計CF: 595000 },
      { 年次: 3, 満室想定収入: 1440000, 実効収入: 1400000, 経費: 210000, 営業CF: 290000, 累計CF: 885000 },
      { 年次: 4, 満室想定収入: 1440000, 実効収入: 1400000, 経費: 215000, 営業CF: 285000, 累計CF: 1170000 },
      { 年次: 5, 満室想定収入: 1440000, 実効収入: 1400000, 経費: 220000, 営業CF: 280000, 累計CF: 1450000 }
    ]
  };
};

export const createFallbackShareData = (token: string): MockShareData => {
  return {
    id: `fallback-${token}`,
    property_id: `fallback-property-${token}`,
    owner_id: 'fallback-owner',
    share_token: token,
    title: 'フォールバック共有',
    description: 'デモ用の共有です',
    settings: { 
      allow_comments: true, 
      allow_download: false 
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};