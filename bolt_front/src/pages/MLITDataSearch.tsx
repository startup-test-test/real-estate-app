import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Building, 
  Calendar,
  DollarSign,
  Ruler,
  TrendingUp,
  Filter,
  Eye,
  BarChart3,
  Info,
  Zap,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Loader,
  ExternalLink,
  Database,
  Download
} from 'lucide-react';

interface Prefecture {
  code: string;
  name: string;
}

interface City {
  code: string;
  name: string;
  prefecture_code: string;
}

interface District {
  code: string;
  name: string;
  city_code: string;
}

interface TransactionData {
  type: string;
  region: string;
  municipality_code: string;
  prefecture: string;
  municipality: string;
  district_name: string;
  nearest_station?: string;
  time_to_station?: number;
  trade_price: number;
  price_per_unit?: number;
  unit_price?: number;
  floor_plan?: string;
  area: number;
  land_shape?: string;
  frontage?: number;
  total_floor_area?: number;
  building_year?: string;
  structure?: string;
  use?: string;
  purpose?: string;
  direction?: string;
  classification?: string;
  breadth?: number;
  city_planning?: string;
  coverage_ratio?: number;
  floor_area_ratio?: number;
  period: string;
  remarks?: string;
}

interface SearchParams {
  prefectureCode: string;
  prefectureName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  year: string;
  quarter: string;
  priceClassification: string;
}

const MLITDataSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    prefectureCode: '',
    prefectureName: '',
    cityCode: '',
    cityName: '',
    districtCode: '',
    districtName: '',
    year: '2024',
    quarter: '',
    priceClassification: '01'
  });

  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const API_BASE_URL = 'http://localhost:8000/api';

  // フォールバック用の都道府県データ
  const fallbackPrefectures: Prefecture[] = [
    { code: '01', name: '北海道' },
    { code: '02', name: '青森県' },
    { code: '03', name: '岩手県' },
    { code: '04', name: '宮城県' },
    { code: '05', name: '秋田県' },
    { code: '06', name: '山形県' },
    { code: '07', name: '福島県' },
    { code: '08', name: '茨城県' },
    { code: '09', name: '栃木県' },
    { code: '10', name: '群馬県' },
    { code: '11', name: '埼玉県' },
    { code: '12', name: '千葉県' },
    { code: '13', name: '東京都' },
    { code: '14', name: '神奈川県' },
    { code: '15', name: '新潟県' },
    { code: '16', name: '富山県' },
    { code: '17', name: '石川県' },
    { code: '18', name: '福井県' },
    { code: '19', name: '山梨県' },
    { code: '20', name: '長野県' },
    { code: '21', name: '岐阜県' },
    { code: '22', name: '静岡県' },
    { code: '23', name: '愛知県' },
    { code: '24', name: '三重県' },
    { code: '25', name: '滋賀県' },
    { code: '26', name: '京都府' },
    { code: '27', name: '大阪府' },
    { code: '28', name: '兵庫県' },
    { code: '29', name: '奈良県' },
    { code: '30', name: '和歌山県' },
    { code: '31', name: '鳥取県' },
    { code: '32', name: '島根県' },
    { code: '33', name: '岡山県' },
    { code: '34', name: '広島県' },
    { code: '35', name: '山口県' },
    { code: '36', name: '徳島県' },
    { code: '37', name: '香川県' },
    { code: '38', name: '愛媛県' },
    { code: '39', name: '高知県' },
    { code: '40', name: '福岡県' },
    { code: '41', name: '佐賀県' },
    { code: '42', name: '長崎県' },
    { code: '43', name: '熊本県' },
    { code: '44', name: '大分県' },
    { code: '45', name: '宮崎県' },
    { code: '46', name: '鹿児島県' },
    { code: '47', name: '沖縄県' }
  ];

  // 都道府県一覧を取得
  useEffect(() => {
    // 即座にフォールバックデータを設定
    setPrefectures(fallbackPrefectures);
    setSearchParams(prev => ({
      ...prev,
      prefectureCode: '13',
      prefectureName: '東京都'
    }));
    
    const fetchPrefectures = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/prefectures`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        console.log('都道府県データ取得成功:', data.length, '件');
        setPrefectures(data);
        
        // APIから取得できた場合も東京都を選択
        const tokyo = data.find((p: Prefecture) => p.name === '東京都');
        if (tokyo) {
          setSearchParams(prev => ({
            ...prev,
            prefectureCode: tokyo.code,
            prefectureName: tokyo.name
          }));
          loadCities(tokyo.code);
        }
      } catch (error) {
        console.error('都道府県データの取得エラー:', error);
        // フォールバックデータは既に設定済みなのでそのまま使用
        loadCities('13');
      }
    };
    
    // APIの取得は遅延実行し、まずはフォールバックデータを使用
    setTimeout(fetchPrefectures, 100);
  }, []);

  // 市区町村一覧を取得
  const loadCities = async (prefectureCode: string) => {
    setIsLoadingCities(true);
    setCities([]);
    setDistricts([]);
    
    // フォールバック用の市区町村データ
    const fallbackCitiesData: { [key: string]: City[] } = {
      '13': [  // 東京都
        { code: '13101', name: '千代田区', prefecture_code: '13' },
        { code: '13102', name: '中央区', prefecture_code: '13' },
        { code: '13103', name: '港区', prefecture_code: '13' },
        { code: '13104', name: '新宿区', prefecture_code: '13' },
        { code: '13105', name: '文京区', prefecture_code: '13' },
        { code: '13106', name: '台東区', prefecture_code: '13' },
        { code: '13107', name: '墨田区', prefecture_code: '13' },
        { code: '13108', name: '江東区', prefecture_code: '13' },
        { code: '13109', name: '品川区', prefecture_code: '13' },
        { code: '13110', name: '目黒区', prefecture_code: '13' },
        { code: '13111', name: '大田区', prefecture_code: '13' },
        { code: '13112', name: '世田谷区', prefecture_code: '13' },
        { code: '13113', name: '渋谷区', prefecture_code: '13' },
        { code: '13114', name: '中野区', prefecture_code: '13' },
        { code: '13115', name: '杉並区', prefecture_code: '13' },
        { code: '13201', name: '八王子市', prefecture_code: '13' },
        { code: '13202', name: '立川市', prefecture_code: '13' },
        { code: '13203', name: '武蔵野市', prefecture_code: '13' },
        { code: '13204', name: '三鷹市', prefecture_code: '13' },
        { code: '13209', name: '町田市', prefecture_code: '13' }
      ],
      '27': [  // 大阪府
        { code: '27100', name: '大阪市', prefecture_code: '27' },
        { code: '27140', name: '堺市', prefecture_code: '27' },
        { code: '27203', name: '豊中市', prefecture_code: '27' },
        { code: '27205', name: '吹田市', prefecture_code: '27' },
        { code: '27207', name: '高槻市', prefecture_code: '27' }
      ],
      '14': [  // 神奈川県
        { code: '14100', name: '横浜市', prefecture_code: '14' },
        { code: '14130', name: '川崎市', prefecture_code: '14' },
        { code: '14150', name: '相模原市', prefecture_code: '14' },
        { code: '14201', name: '横須賀市', prefecture_code: '14' },
        { code: '14204', name: '鎌倉市', prefecture_code: '14' }
      ]
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/cities/${prefectureCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('市区町村データの取得に失敗しました');
      const data = await response.json();
      
      console.log(`${prefectureCode}の市区町村データ取得成功:`, data.length, '件');
      setCities(data);
      
      // デフォルトで最初の市区町村を選択
      if (data.length > 0) {
        setSearchParams(prev => ({
          ...prev,
          cityCode: data[0].code,
          cityName: data[0].name,
          districtCode: '',
          districtName: ''
        }));
        loadDistricts(data[0].code);
      }
    } catch (error) {
      console.error('市区町村データの取得エラー:', error);
      
      // フォールバックデータを使用
      const fallbackCities = fallbackCitiesData[prefectureCode] || [
        { code: `${prefectureCode}01`, name: '主要市区町村', prefecture_code: prefectureCode }
      ];
      
      setCities(fallbackCities);
      
      if (fallbackCities.length > 0) {
        setSearchParams(prev => ({
          ...prev,
          cityCode: fallbackCities[0].code,
          cityName: fallbackCities[0].name,
          districtCode: '',
          districtName: ''
        }));
        loadDistricts(fallbackCities[0].code);
      }
    } finally {
      setIsLoadingCities(false);
    }
  };

  // 地区一覧を取得
  const loadDistricts = async (cityCode: string) => {
    setIsLoadingDistricts(true);
    setDistricts([]);
    
    // フォールバック用の地区データ
    const fallbackDistricts: District[] = [
      { code: `${cityCode}001`, name: '1丁目', city_code: cityCode },
      { code: `${cityCode}002`, name: '2丁目', city_code: cityCode },
      { code: `${cityCode}003`, name: '3丁目', city_code: cityCode },
      { code: `${cityCode}004`, name: '4丁目', city_code: cityCode },
      { code: `${cityCode}005`, name: '5丁目', city_code: cityCode }
    ];
    
    try {
      const response = await fetch(`${API_BASE_URL}/districts/${cityCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('地区データの取得に失敗しました');
      const data = await response.json();
      
      console.log(`${cityCode}の地区データ取得成功:`, data.length, '件');
      setDistricts(data.length > 0 ? data : fallbackDistricts);
      
      // デフォルトで最初の地区を選択
      const districtsToUse = data.length > 0 ? data : fallbackDistricts;
      if (districtsToUse.length > 0) {
        setSearchParams(prev => ({
          ...prev,
          districtCode: districtsToUse[0].code,
          districtName: districtsToUse[0].name
        }));
      }
    } catch (error) {
      console.error('地区データの取得エラー:', error);
      
      // フォールバックデータを使用
      setDistricts(fallbackDistricts);
      setSearchParams(prev => ({
        ...prev,
        districtCode: fallbackDistricts[0].code,
        districtName: fallbackDistricts[0].name
      }));
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  // 都道府県変更時
  const handlePrefectureChange = (code: string) => {
    const prefecture = prefectures.find(p => p.code === code);
    if (prefecture) {
      setSearchParams(prev => ({
        ...prev,
        prefectureCode: code,
        prefectureName: prefecture.name,
        cityCode: '',
        cityName: '',
        districtCode: '',
        districtName: ''
      }));
      loadCities(code);
    }
  };

  // 市区町村変更時
  const handleCityChange = (code: string) => {
    const city = cities.find(c => c.code === code);
    if (city) {
      setSearchParams(prev => ({
        ...prev,
        cityCode: code,
        cityName: city.name,
        districtCode: '',
        districtName: ''
      }));
      loadDistricts(code);
    }
  };

  // 地区変更時
  const handleDistrictChange = (code: string) => {
    const district = districts.find(d => d.code === code);
    if (district) {
      setSearchParams(prev => ({
        ...prev,
        districtCode: code,
        districtName: district.name
      }));
    }
  };

  // 検索実行
  const handleSearch = async () => {
    if (!searchParams.prefectureCode || !searchParams.cityCode) {
      setSearchError('都道府県と市区町村を選択してください');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setTransactions([]);

    try {
      const params = new URLSearchParams({
        year: searchParams.year,
        prefecture_code: searchParams.prefectureCode,
        city_code: searchParams.cityCode,
        price_classification: searchParams.priceClassification
      });

      if (searchParams.quarter) {
        params.append('quarter', searchParams.quarter);
      }
      
      if (searchParams.districtName) {
        params.append('district_name', searchParams.districtName);
      }

      console.log('検索パラメータ:', Object.fromEntries(params));
      
      const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('検索結果:', data.total_count, '件取得');
      
      setTransactions(data.transactions || []);
      setTotalCount(data.total_count || 0);
      
      if (data.note) {
        console.log('データソース:', data.data_source, '-', data.note);
      }
      
    } catch (error) {
      console.error('検索エラー:', error);
      setSearchError(error instanceof Error ? error.message : '検索に失敗しました');
    } finally {
      setIsSearching(false);
    }
  };

  // 価格をフォーマット
  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}億円`;
    } else if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}万円`;
    } else {
      return `${price.toLocaleString()}円`;
    }
  };

  // 平米単価を計算
  const calculateUnitPrice = (transaction: TransactionData) => {
    if (transaction.unit_price) {
      return `${(transaction.unit_price / 10000).toFixed(1)}万円/㎡`;
    } else if (transaction.area > 0) {
      return `${(transaction.trade_price / transaction.area / 10000).toFixed(1)}万円/㎡`;
    }
    return '-';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Database className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">MLIT不動産取引データ検索</h1>
          </div>
          <p className="text-gray-600">
            国土交通省不動産情報ライブラリAPIから、実際の不動産取引データを検索・表示します。
          </p>
        </div>

        <div className="space-y-6">
          {/* 地域選択フォーム */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">地域選択</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* 都道府県 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <select
                  value={searchParams.prefectureCode}
                  onChange={(e) => handlePrefectureChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">都道府県を選択してください</option>
                  {prefectures.length > 0 ? (
                    prefectures.map((pref) => (
                      <option key={pref.code} value={pref.code}>
                        {pref.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>読み込み中...</option>
                  )}
                </select>
                {prefectures.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    都道府県データを読み込み中です...
                  </p>
                )}
              </div>

              {/* 市区町村 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  市区町村 <span className="text-red-500">*</span>
                </label>
                <select
                  value={searchParams.cityCode}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!searchParams.prefectureCode || isLoadingCities}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">市区町村を選択</option>
                  {isLoadingCities ? (
                    <option disabled>読み込み中...</option>
                  ) : (
                    cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 地区 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地区（任意）
                </label>
                <select
                  value={searchParams.districtCode}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!searchParams.cityCode || isLoadingDistricts}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">地区を選択（全域）</option>
                  {isLoadingDistricts ? (
                    <option disabled>読み込み中...</option>
                  ) : (
                    districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* 検索条件 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">取引年</label>
                <select
                  value={searchParams.year}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2024">2024年</option>
                  <option value="2023">2023年</option>
                  <option value="2022">2022年</option>
                  <option value="2021">2021年</option>
                  <option value="2020">2020年</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">四半期</label>
                <select
                  value={searchParams.quarter}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, quarter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">全四半期</option>
                  <option value="1">第1四半期（1-3月）</option>
                  <option value="2">第2四半期（4-6月）</option>
                  <option value="3">第3四半期（7-9月）</option>
                  <option value="4">第4四半期（10-12月）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">データ種別</label>
                <select
                  value={searchParams.priceClassification}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, priceClassification: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="01">不動産取引価格情報</option>
                  <option value="02">成約価格情報</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchParams.prefectureCode || !searchParams.cityCode}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isSearching || !searchParams.prefectureCode || !searchParams.cityCode
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      検索中...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Search className="h-4 w-4 mr-2" />
                      検索実行
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {searchError && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">エラー</div>
                  <div className="text-sm text-red-600 mt-1">{searchError}</div>
                </div>
              </div>
            </div>
          )}

          {/* 検索結果 */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">検索結果</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {totalCount}件の取引データ
                  </span>
                  <button className="flex items-center px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 text-sm">
                    <Download className="h-4 w-4 mr-1" />
                    CSV出力
                  </button>
                </div>
              </div>

              {/* テーブル */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物件情報</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">価格</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">面積・単価</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">建物情報</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">立地情報</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引時期</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.type}</div>
                            <div className="text-sm text-gray-500">{transaction.district_name}</div>
                            <div className="text-xs text-gray-400">{transaction.use}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {formatPrice(transaction.trade_price)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{transaction.area}㎡</div>
                            <div className="text-sm text-blue-600">{calculateUnitPrice(transaction)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{transaction.structure || '-'}</div>
                            <div className="text-sm text-gray-500">{transaction.building_year || '-'}</div>
                            {transaction.total_floor_area && (
                              <div className="text-xs text-gray-400">延床: {transaction.total_floor_area}㎡</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            {transaction.nearest_station && (
                              <div className="text-sm text-gray-900">
                                {transaction.nearest_station}
                                {transaction.time_to_station && ` (${transaction.time_to_station}分)`}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">{transaction.city_planning || '-'}</div>
                            {transaction.direction && transaction.breadth && (
                              <div className="text-xs text-gray-400">
                                {transaction.direction} {transaction.breadth}m {transaction.classification}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.period}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 情報 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center mb-4">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">データについて</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">データソース</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 国土交通省 不動産情報ライブラリAPI</li>
                  <li>• 実際の不動産取引価格情報</li>
                  <li>• 四半期ごとに更新される公的データ</li>
                  <li>• 全国の取引データを網羅</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">利用上の注意</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• データは匿名化されており個人は特定できません</li>
                  <li>• 取引価格は実際の成約価格を反映</li>
                  <li>• 一部データが欠損している場合があります</li>
                  <li>• 商用利用可能（出典明記要）</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLITDataSearch;