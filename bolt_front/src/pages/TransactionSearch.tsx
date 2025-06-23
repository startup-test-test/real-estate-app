import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';

const TransactionSearch: React.FC = () => {
  const [addressForm, setAddressForm] = useState({
    postalCode: '',
    prefecture: '',
    city: '',
    district: '',
    chome: '',
    banchi: '',
    go: ''
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [searchFilters, setSearchFilters] = useState({
    propertyType: '1', // 1:宅地, 2:中古マンション等
    priceRange: 'all',
    period: '2024',
    buildingType: 'all'
  });

  const handleInputChange = (field: string, value: string) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    if (!addressForm.prefecture || !addressForm.city) {
      setSearchError('都道府県と市区町村は必須です');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      // 検索パラメータを構築
      const searchParams = {
        prefecture: addressForm.prefecture,
        city: addressForm.city,
        district: addressForm.district,
        propertyType: searchFilters.propertyType,
        period: searchFilters.period,
        priceRange: searchFilters.priceRange,
        buildingType: searchFilters.buildingType
      };

      console.log('検索パラメータ:', searchParams);

      // バックエンドAPIが未実装のため、直接モックデータを表示
      console.log('バックエンドAPI未実装のため、モックデータを表示します...');
      
      // 2秒の待機時間でAPI呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 10件のモックデータを生成（最寄駅情報は削除）
      const mockTransactions = [
        {
          id: 'RE001',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}2丁目15-3`,
          price: 8500,
          pricePerSqm: 85.2,
          buildingArea: 99.8,
          landArea: 120.5,
          buildYear: 1995,
          structure: 'RC',
          transactionDate: '2024年第3四半期',
          propertyType: '一棟マンション',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 60,
          floorAreaRatio: 200,
          frontRoad: '南 6m 市道',
          remarks: ''
        },
        {
          id: 'RE002',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}3丁目8-12`,
          price: 6200,
          pricePerSqm: 78.9,
          buildingArea: 78.6,
          landArea: 95.2,
          buildYear: 1988,
          structure: 'RC',
          transactionDate: '2024年第2四半期',
          propertyType: '一棟アパート',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 60,
          floorAreaRatio: 160,
          frontRoad: '東 4m 私道',
          remarks: ''
        },
        {
          id: 'RE003',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}1丁目22-7`,
          price: 12000,
          pricePerSqm: 92.3,
          buildingArea: 130.0,
          landArea: 150.8,
          buildYear: 2001,
          structure: 'RC',
          transactionDate: '2024年第1四半期',
          propertyType: '一棟マンション',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 80,
          floorAreaRatio: 300,
          frontRoad: '北 8m 区道',
          remarks: ''
        },
        {
          id: 'RE004',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}4丁目5-18`,
          price: 4800,
          pricePerSqm: 72.1,
          buildingArea: 66.6,
          landArea: 85.3,
          buildYear: 1985,
          structure: 'W',
          transactionDate: '2024年第4四半期',
          propertyType: '戸建て',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 60,
          floorAreaRatio: 150,
          frontRoad: '西 5m 市道',
          remarks: ''
        },
        {
          id: 'RE005',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}5丁目12-9`,
          price: 7300,
          pricePerSqm: 81.5,
          buildingArea: 89.6,
          landArea: 105.2,
          buildYear: 1992,
          structure: 'RC',
          transactionDate: '2024年第3四半期',
          propertyType: '一棟アパート',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 60,
          floorAreaRatio: 180,
          frontRoad: '南 5m 市道',
          remarks: ''
        },
        {
          id: 'RE006',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}6丁目3-15`,
          price: 5400,
          pricePerSqm: 76.8,
          buildingArea: 70.3,
          landArea: 88.7,
          buildYear: 1989,
          structure: 'W',
          transactionDate: '2024年第2四半期',
          propertyType: '戸建て',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 60,
          floorAreaRatio: 160,
          frontRoad: '東 4m 私道',
          remarks: ''
        },
        {
          id: 'RE007',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}7丁目18-6`,
          price: 9800,
          pricePerSqm: 88.9,
          buildingArea: 110.2,
          landArea: 135.8,
          buildYear: 1998,
          structure: 'RC',
          transactionDate: '2024年第1四半期',
          propertyType: '一棟マンション',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 70,
          floorAreaRatio: 250,
          frontRoad: '北 7m 区道',
          remarks: ''
        },
        {
          id: 'RE008',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}8丁目25-11`,
          price: 3800,
          pricePerSqm: 69.4,
          buildingArea: 54.8,
          landArea: 72.5,
          buildYear: 1983,
          structure: 'W',
          transactionDate: '2024年第4四半期',
          propertyType: '戸建て',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 60,
          floorAreaRatio: 140,
          frontRoad: '西 4m 市道',
          remarks: ''
        },
        {
          id: 'RE009',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}9丁目7-22`,
          price: 11500,
          pricePerSqm: 94.2,
          buildingArea: 122.1,
          landArea: 148.3,
          buildYear: 2003,
          structure: 'RC',
          transactionDate: '2024年第3四半期',
          propertyType: '一棟マンション',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 80,
          floorAreaRatio: 280,
          frontRoad: '南 8m 区道',
          remarks: ''
        },
        {
          id: 'RE010',
          address: `${addressForm.prefecture}${addressForm.city}${addressForm.district || ''}10丁目14-8`,
          price: 6800,
          pricePerSqm: 79.3,
          buildingArea: 85.7,
          landArea: 98.4,
          buildYear: 1991,
          structure: 'RC',
          transactionDate: '2024年第2四半期',
          propertyType: '一棟アパート',
          purpose: '住宅',
          cityPlanning: '第一種住居地域',
          buildingCoverage: 60,
          floorAreaRatio: 170,
          frontRoad: '東 6m 市道',
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
        averageArea: Math.round(mockTransactions.reduce((sum, t) => sum + t.buildingArea, 0) / mockTransactions.length),
        averageAge: new Date().getFullYear() - Math.round(mockTransactions.reduce((sum, t) => sum + t.buildYear, 0) / mockTransactions.length)
      };

      setSearchResults({
        transactions: mockTransactions,
        statistics: mockStatistics,
        isMock: true,
        searchParams: {
          ...addressForm,
          ...searchFilters
        }
      });

    } catch (error) {
      console.error('検索エラー:', error);
      setSearchError(error instanceof Error ? error.message : '検索に失敗しました');
    } finally {
      setIsSearching(false);
    }
  };

  const prefectures = [
    '都道府県を選択',
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}万円`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Search className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">AI取引事例検索</h1>
          </div>
          <p className="text-gray-600">
            国土交通省の不動産取引価格情報データベースから、指定エリアの実際の取引事例を検索・分析します。
          </p>
        </div>

        <div className="space-y-6">
          {/* Address Input Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">検索対象エリアの住所入力</h2>
            </div>

            <div className="space-y-4">
              {/* 郵便番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="例: 1410031"
                    value={addressForm.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 text-sm">
                    郵便番号から住所を自動入力
                  </button>
                </div>
              </div>

              {/* 都道府県・市区町村 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    都道府県 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded">必須</span>
                  </label>
                  <select
                    value={addressForm.prefecture}
                    onChange={(e) => handleInputChange('prefecture', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {prefectures.map((pref, index) => (
                      <option key={index} value={index === 0 ? '' : pref}>
                        {pref}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    市区町村 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded">必須</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例: 品川区"
                    value={addressForm.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 町域・丁目・番地・号 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">町域</label>
                  <input
                    type="text"
                    placeholder="例: 西五反田"
                    value={addressForm.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">丁目</label>
                  <input
                    type="text"
                    placeholder="例: 2"
                    value={addressForm.chome}
                    onChange={(e) => handleInputChange('chome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">番地</label>
                  <input
                    type="text"
                    placeholder="例: 15"
                    value={addressForm.banchi}
                    onChange={(e) => handleInputChange('banchi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">号</label>
                  <input
                    type="text"
                    placeholder="例: 3"
                    value={addressForm.go}
                    onChange={(e) => handleInputChange('go', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">検索条件</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">物件種別</label>
                <select
                  value={searchFilters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="1">宅地（土地）</option>
                  <option value="2">中古マンション等</option>
                  <option value="3">農地</option>
                  <option value="4">林地</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">価格帯</label>
                <select
                  value={searchFilters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="under3000">3,000万円未満</option>
                  <option value="3000-5000">3,000-5,000万円</option>
                  <option value="5000-8000">5,000-8,000万円</option>
                  <option value="8000-12000">8,000万円-1.2億円</option>
                  <option value="over12000">1.2億円以上</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">取引時期</label>
                <select
                  value={searchFilters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="2024">2024年</option>
                  <option value="2023">2023年</option>
                  <option value="2022">2022年</option>
                  <option value="2021">2021年</option>
                  <option value="2020">2020年</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">建物構造</label>
                <select
                  value={searchFilters.buildingType}
                  onChange={(e) => handleFilterChange('buildingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="rc">RC造</option>
                  <option value="src">SRC造</option>
                  <option value="steel">鉄骨造</option>
                  <option value="wood">木造</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button
              onClick={handleSearch}
              disabled={isSearching || !addressForm.prefecture || !addressForm.city}
              className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
                isSearching || !addressForm.prefecture || !addressForm.city
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  国土交通省データベース検索中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Zap className="h-5 w-5 mr-2" />
                  AI取引事例検索を実行する
                </div>
              )}
            </button>
            
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                データソース: 
                <a 
                  href="https://www.reinfolib.mlit.go.jp/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 ml-1"
                >
                  国土交通省 不動産情報ライブラリ
                  <ExternalLink className="h-3 w-3 inline ml-1" />
                </a>
              </p>
            </div>
          </div>

          {/* Error Display */}
          {searchError && !searchResults && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">検索エラー</div>
                  <div className="text-sm text-red-600 mt-1">{searchError}</div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">検索結果</h3>
                  <div className="flex items-center space-x-3">
                    {searchResults.isMock && (
                      <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        <Info className="h-4 w-4 mr-1" />
                        モックデータ
                      </div>
                    )}
                    <span className="text-sm text-gray-600">
                      {searchResults.statistics.totalCount}件の取引事例が見つかりました
                    </span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">平均価格</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(searchResults.statistics.averagePrice)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">平均単価</div>
                    <div className="text-xl font-bold text-blue-600">
                      {searchResults.statistics.averagePricePerSqm}万円/㎡
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">価格帯</div>
                    <div className="text-sm font-bold text-purple-600">
                      {formatCurrency(searchResults.statistics.priceRange.min)} 〜<br/>
                      {formatCurrency(searchResults.statistics.priceRange.max)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">平均面積</div>
                    <div className="text-xl font-bold text-orange-600">
                      {searchResults.statistics.averageArea}㎡
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">平均築年数</div>
                    <div className="text-xl font-bold text-red-600">
                      {searchResults.statistics.averageAge}年
                    </div>
                  </div>
                </div>

                {/* Transaction List */}
                <div className="space-y-4">
                  {searchResults.transactions.map((transaction: any) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{transaction.address}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {transaction.propertyType}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {transaction.transactionDate}
                            </span>
                          </div>
                        </div>
                        <button className="flex items-center px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 text-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          詳細
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">取引価格</span>
                          <div className="font-bold text-lg text-green-600">{formatCurrency(transaction.price)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">単価</span>
                          <div className="font-medium">{transaction.pricePerSqm}万円/㎡</div>
                        </div>
                        <div>
                          <span className="text-gray-500">建物面積</span>
                          <div className="font-medium">{transaction.buildingArea}㎡</div>
                        </div>
                        <div>
                          <span className="text-gray-500">土地面積</span>
                          <div className="font-medium">{transaction.landArea}㎡</div>
                        </div>
                        <div>
                          <span className="text-gray-500">築年</span>
                          <div className="font-medium">{transaction.buildYear}年</div>
                        </div>
                        <div>
                          <span className="text-gray-500">構造</span>
                          <div className="font-medium">{transaction.structure}</div>
                        </div>
                      </div>

                      {transaction.frontRoad && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">前面道路:</span> {transaction.frontRoad}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">開発環境モード</div>
                      <div className="text-sm text-blue-600 mt-1">
                        現在はバックエンドAPI未実装のため、モックデータを表示しています。本番環境では実際の国土交通省データベースから取得します。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Information */}
          <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Info className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">データについて</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">データソース</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 国土交通省 不動産取引価格情報</li>
                  <li>• 実際の取引事例データ</li>
                  <li>• 四半期ごとに更新</li>
                  <li>• 全国の取引データを網羅</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">検索精度</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 市区町村レベルでの絞り込み</li>
                  <li>• 物件種別による分類</li>
                  <li>• 取引時期による期間指定</li>
                  <li>• 統計情報の自動計算</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSearch;