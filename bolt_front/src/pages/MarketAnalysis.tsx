import React, { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Search, 
  BarChart3,
  Building,
  Users,
  DollarSign,
  Percent,
  Calendar,
  Target,
  ArrowUpRight,
  Info,
  Zap,
  FileText,
  Download,
  Train,
  Home,
  Activity,
  TrendingDown
} from 'lucide-react';

interface CensusData {
  year: number;
  age0to14: number;
  age15to64: number;
  age65plus: number;
  total: number;
}

interface StationData {
  stationName: string;
  line: string;
  dailyPassengers: number;
  yearlyChange: number;
}

interface AnalysisResult {
  censusData2020: {
    age0to14: number;
    age15to64: number;
    age65plus: number;
    total: number;
  };
  futurePopulation: CensusData[];
  stationData: StationData[];
  marketAnalysis: {
    populationTrend: 'increasing' | 'stable' | 'decreasing';
    agingRate: number;
    workingAgeRatio: number;
    rentalDemandForecast: 'high' | 'medium' | 'low';
    investmentRecommendation: string;
  };
}

const MarketAnalysis: React.FC = () => {
  const [searchType, setSearchType] = useState<'address' | 'station'>('address');
  const [addressForm, setAddressForm] = useState({
    prefecture: '',
    city: '',
    district: '',
    chome: ''
  });
  
  const [stationForm, setStationForm] = useState({
    region: '',
    line: '',
    station: '',
    stationText: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    if (searchType === 'address') {
      setAddressForm(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setStationForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    
    // 3秒の分析時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // モックデータを生成（指定されたデータ構造に基づく）
    const mockResult: AnalysisResult = {
      censusData2020: {
        age0to14: 161,
        age15to64: 676,
        age65plus: 206,
        total: 1071
      },
      futurePopulation: [
        { year: 2025, age0to14: 140.5574, age15to64: 766.2123, age65plus: 220.4790, total: 1127.2487 },
        { year: 2030, age0to14: 118.9495, age15to64: 855.7620, age65plus: 234.6119, total: 1209.3234 },
        { year: 2035, age0to14: 145.7852, age15to64: 893.5599, age65plus: 256.4095, total: 1295.7545 },
        { year: 2040, age0to14: 167.0667, age15to64: 882.3913, age65plus: 303.9614, total: 1353.4195 },
        { year: 2045, age0to14: 178.2551, age15to64: 864.1969, age65plus: 333.6232, total: 1376.0753 },
        { year: 2050, age0to14: 166.2695, age15to64: 886.6062, age65plus: 328.5646, total: 1381.4402 },
        { year: 2055, age0to14: 147.2670, age15to64: 934.1744, age65plus: 308.6466, total: 1390.0880 },
        { year: 2060, age0to14: 127.2159, age15to64: 983.7630, age65plus: 288.0630, total: 1399.0418 },
        { year: 2065, age0to14: 125.8873, age15to64: 994.1905, age65plus: 289.6434, total: 1409.7212 },
        { year: 2070, age0to14: 131.6705, age15to64: 935.9846, age65plus: 343.8146, total: 1411.4697 }
      ],
      stationData: [
        { stationName: '大宮駅', line: 'JR東北本線', dailyPassengers: 245000, yearlyChange: 2.3 },
        { stationName: '大宮駅', line: 'JR高崎線', dailyPassengers: 180000, yearlyChange: 1.8 },
        { stationName: '大宮駅', line: 'JR京浜東北線', dailyPassengers: 320000, yearlyChange: 3.1 },
        { stationName: '北大宮駅', line: 'JR川越線', dailyPassengers: 12000, yearlyChange: -0.5 },
        { stationName: '大宮公園駅', line: '東武野田線', dailyPassengers: 8500, yearlyChange: 0.2 }
      ],
      marketAnalysis: {
        populationTrend: 'increasing',
        agingRate: 24.3,
        workingAgeRatio: 70.5,
        rentalDemandForecast: 'high',
        investmentRecommendation: 'このエリアは2070年まで人口増加が続く見込みで、特に生産年齢人口（15-64歳）が安定しており、賃貸需要の継続的な成長が期待できます。駅周辺の利便性も高く、不動産投資に適したエリアと評価されます。'
      }
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
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

  const regions = ['関東地方', '関西地方', '中部地方', '東北地方', '九州地方', '中国地方', '四国地方', '北海道', '沖縄'];
  const lines = ['JR東海道本線', 'JR山手線', 'JR中央線', 'JR京浜東北線', '東急東横線', '小田急線', '京王線', '西武線'];

  // 人口推移グラフコンポーネント
  const PopulationChart = ({ data }: { data: CensusData[] }) => {
    const maxTotal = Math.max(...data.map(d => d.total));
    const chartHeight = 300;
    const chartWidth = 800;
    const padding = 60;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          将来推計人口（250mメッシュ）
        </h4>
        
        <div className="overflow-x-auto">
          <svg width={chartWidth} height={chartHeight + padding} className="w-full min-w-[800px]">
            {/* 背景グリッド */}
            {[0, 400, 800, 1200, 1600].map((value) => {
              const y = chartHeight - (value / maxTotal) * chartHeight + padding/2;
              return (
                <g key={value}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* X軸ラベル */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
              return (
                <text
                  key={item.year}
                  x={x}
                  y={chartHeight + padding/2 + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {item.year}
                </text>
              );
            })}

            {/* エリアチャート（積み上げ） */}
            {/* 65歳以上（下部） */}
            <path
              d={data.map((item, index) => {
                const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - (item.age65plus / maxTotal) * chartHeight + padding/2;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ') + ` L ${chartWidth - padding} ${chartHeight + padding/2} L ${padding} ${chartHeight + padding/2} Z`}
              fill="#f59e0b"
              opacity={0.7}
            />

            {/* 15-64歳（中部） */}
            <path
              d={data.map((item, index) => {
                const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - ((item.age65plus + item.age15to64) / maxTotal) * chartHeight + padding/2;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ') + ' ' + data.slice().reverse().map((item, index) => {
                const x = padding + ((data.length - 1 - index) / (data.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - (item.age65plus / maxTotal) * chartHeight + padding/2;
                return `L ${x} ${y}`;
              }).join(' ') + ' Z'}
              fill="#10b981"
              opacity={0.7}
            />

            {/* 0-14歳（上部） */}
            <path
              d={data.map((item, index) => {
                const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - (item.total / maxTotal) * chartHeight + padding/2;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ') + ' ' + data.slice().reverse().map((item, index) => {
                const x = padding + ((data.length - 1 - index) / (data.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - ((item.age65plus + item.age15to64) / maxTotal) * chartHeight + padding/2;
                return `L ${x} ${y}`;
              }).join(' ') + ' Z'}
              fill="#3b82f6"
              opacity={0.7}
            />

            {/* 総人口ライン */}
            <path
              d={data.map((item, index) => {
                const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - (item.total / maxTotal) * chartHeight + padding/2;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#1f2937"
              strokeWidth="3"
              fill="none"
            />

            {/* データポイント */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
              const y = chartHeight - (item.total / maxTotal) * chartHeight + padding/2;
              return (
                <circle
                  key={item.year}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#1f2937"
                />
              );
            })}
          </svg>
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 opacity-70 mr-2"></div>
            <span className="text-gray-600">0-14歳</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 opacity-70 mr-2"></div>
            <span className="text-gray-600">15-64歳（生産年齢人口）</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 opacity-70 mr-2"></div>
            <span className="text-gray-600">65歳以上</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-gray-800 mr-2"></div>
            <span className="text-gray-600">総人口</span>
          </div>
        </div>
      </div>
    );
  };

  const isFormValid = searchType === 'address' 
    ? addressForm.prefecture && addressForm.city
    : stationForm.region || stationForm.stationText;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">AI市場分析</h1>
          </div>
          <p className="text-gray-600">
            国勢調査データ、将来推計人口、駅別乗降客数を分析し、エリアの投資価値を詳細に評価します。
          </p>
        </div>

        {!analysisResult ? (
          <div className="space-y-6">
            {/* Search Type Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">検索方法を選択</h2>
              
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="address"
                    checked={searchType === 'address'}
                    onChange={(e) => setSearchType(e.target.value as 'address' | 'station')}
                    className="w-5 h-5 text-blue-600 mr-3"
                  />
                  <span className="text-lg font-medium text-gray-900">住所からの場合</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="station"
                    checked={searchType === 'station'}
                    onChange={(e) => setSearchType(e.target.value as 'address' | 'station')}
                    className="w-5 h-5 text-blue-600 mr-3"
                  />
                  <span className="text-lg font-medium text-gray-900">路線・駅名からの場合</span>
                </label>
              </div>
            </div>

            {/* Input Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchType === 'address' ? '住所入力' : '路線・駅名入力'}
                </h2>
              </div>

              {searchType === 'address' ? (
                /* Address Form */
                <div className="space-y-4">
                  <div>
                    <select
                      value={addressForm.prefecture}
                      onChange={(e) => handleInputChange('prefecture', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      {prefectures.map((pref, index) => (
                        <option key={index} value={index === 0 ? '' : pref}>
                          {pref}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={addressForm.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      disabled={!addressForm.prefecture}
                    >
                      <option value="">市区町村</option>
                      {addressForm.prefecture === '埼玉県' && (
                        <>
                          <option value="さいたま市">さいたま市</option>
                          <option value="川越市">川越市</option>
                          <option value="熊谷市">熊谷市</option>
                          <option value="川口市">川口市</option>
                        </>
                      )}
                      {addressForm.prefecture === '東京都' && (
                        <>
                          <option value="千代田区">千代田区</option>
                          <option value="中央区">中央区</option>
                          <option value="港区">港区</option>
                          <option value="新宿区">新宿区</option>
                          <option value="品川区">品川区</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={addressForm.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      disabled={!addressForm.city}
                    >
                      <option value="">選択してください</option>
                      {addressForm.city === 'さいたま市' && (
                        <>
                          <option value="大宮区">大宮区</option>
                          <option value="浦和区">浦和区</option>
                          <option value="中央区">中央区</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={addressForm.chome}
                      onChange={(e) => handleInputChange('chome', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      disabled={!addressForm.district}
                    >
                      <option value="">選択してください</option>
                      {addressForm.district === '大宮区' && (
                        <>
                          <option value="天沼町">天沼町</option>
                          <option value="大門町">大門町</option>
                          <option value="錦町">錦町</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                /* Station Form */
                <div className="space-y-4">
                  <div>
                    <select
                      value={stationForm.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">関東地方</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={stationForm.line}
                      onChange={(e) => handleInputChange('line', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">路線</option>
                      {lines.map((line) => (
                        <option key={line} value={line}>{line}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={stationForm.station}
                      onChange={(e) => handleInputChange('station', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    >
                      <option value="">駅</option>
                      <option value="大宮駅">大宮駅</option>
                      <option value="浦和駅">浦和駅</option>
                      <option value="川越駅">川越駅</option>
                    </select>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="文字入力から駅を選択"
                      value={stationForm.stationText}
                      onChange={(e) => handleInputChange('stationText', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                  </div>
                </div>
              )}

              {/* Analysis Button */}
              <div className="mt-8">
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || !isFormValid}
                  className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
                    isAnalyzing || !isFormValid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      AI市場分析中...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Zap className="h-5 w-5 mr-2" />
                      AI市場分析を実行する
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h2 className="text-xl font-bold text-green-800">AI市場分析完了</h2>
                  <p className="text-green-600 mt-1">
                    {searchType === 'address' 
                      ? `${addressForm.prefecture}${addressForm.city}${addressForm.district}${addressForm.chome}` 
                      : `${stationForm.station || stationForm.stationText}`
                    }エリアの市場分析結果をご確認ください。
                  </p>
                </div>
              </div>
            </div>

            {/* 2020年国勢調査データ */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="h-5 w-5 text-blue-600 mr-2" />
                国勢調査（250mメッシュ 人口）- 2020年
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">０～１４歳</div>
                  <div className="text-2xl font-bold text-blue-600">{analysisResult.censusData2020.age0to14}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">１５～６４歳</div>
                  <div className="text-2xl font-bold text-green-600">{analysisResult.censusData2020.age15to64}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">６５歳以上</div>
                  <div className="text-2xl font-bold text-yellow-600">{analysisResult.censusData2020.age65plus}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">人口総数</div>
                  <div className="text-2xl font-bold text-purple-600">{analysisResult.censusData2020.total}</div>
                </div>
              </div>
            </div>

            {/* 将来推計人口グラフ */}
            <PopulationChart data={analysisResult.futurePopulation} />

            {/* 将来推計人口データテーブル */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 text-purple-600 mr-2" />
                  将来推計人口250mメッシュ（詳細データ）
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">対象年</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">０～１４歳</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">１５～６４歳</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">６５歳以上</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">人口総数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analysisResult.futurePopulation.map((row) => (
                      <tr key={row.year} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.year}年</td>
                        <td className="px-4 py-3 text-right">{row.age0to14.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right">{row.age15to64.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right">{row.age65plus.toFixed(4)}</td>
                        <td className="px-4 py-3 text-right font-medium text-blue-600">{row.total.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 駅別乗降客数データ */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Train className="h-5 w-5 text-green-600 mr-2" />
                駅別乗降客数データ
              </h3>
              
              <div className="space-y-4">
                {analysisResult.stationData.map((station, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{station.stationName}</div>
                      <div className="text-sm text-gray-600">{station.line}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {station.dailyPassengers.toLocaleString()}人/日
                      </div>
                      <div className={`text-sm flex items-center ${
                        station.yearlyChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {station.yearlyChange >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {station.yearlyChange >= 0 ? '+' : ''}{station.yearlyChange}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 市場分析サマリー */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-indigo-600 mr-2" />
                AI市場分析サマリー
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">人口トレンド</div>
                  <div className="text-xl font-bold text-green-600 capitalize">
                    {analysisResult.marketAnalysis.populationTrend === 'increasing' ? '増加傾向' : 
                     analysisResult.marketAnalysis.populationTrend === 'stable' ? '安定' : '減少傾向'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">生産年齢人口比率</div>
                  <div className="text-xl font-bold text-blue-600">
                    {analysisResult.marketAnalysis.workingAgeRatio}%
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">賃貸需要予測</div>
                  <div className="text-xl font-bold text-purple-600 capitalize">
                    {analysisResult.marketAnalysis.rentalDemandForecast === 'high' ? '高' :
                     analysisResult.marketAnalysis.rentalDemandForecast === 'medium' ? '中' : '低'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800 mb-2">投資判断</div>
                    <p className="text-sm text-blue-700">
                      {analysisResult.marketAnalysis.investmentRecommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setAnalysisResult(null)}
                className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Search className="h-5 w-5 mr-2" />
                別のエリアを分析
              </button>
              <button className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                <Download className="h-5 w-5 mr-2" />
                分析結果をPDFで出力
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysis;