import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  MapPin,
  Search,
  Building,
  Home,
  BarChart3,
  DollarSign,
  Users,
  Activity,
  ChevronRight,
  Loader,
  AlertCircle,
  Info,
  Ruler,
  Calendar
} from 'lucide-react';
import { propertyApi } from '../services/propertyApi';

const MarketAnalysis: React.FC = () => {
  const navigate = useNavigate();

  // フォーム状態（streamlit_app.pyと同じロジック）
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('02'); // デフォルト: 戸建て
  const [targetArea, setTargetArea] = useState<number>(100); // 希望延床面積（必須）
  const [targetYear, setTargetYear] = useState<number>(2015); // 建築年（必須）

  // 固定値（streamlit_app.pyと同じ）
  const areaTolerance = 10; // ±10㎡
  const yearTolerance = 5; // ±5年

  // API関連の状態
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [prefectures, setPrefectures] = useState<Array<{code: string, name: string}>>([]);
  const [cities, setCities] = useState<Array<{code: string, name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{code: string, name: string}>>([]);
  const [error, setError] = useState<string | null>(null);

  // 都道府県リストを取得
  React.useEffect(() => {
    const loadPrefectures = async () => {
      try {
        const response = await propertyApi.getPrefectures();
        if (response.status === 'success' && response.data) {
          setPrefectures(response.data);
        }
      } catch (err) {
        console.error('都道府県リスト取得エラー:', err);
      }
    };
    loadPrefectures();
  }, []);

  // 市区町村リストを取得
  React.useEffect(() => {
    if (selectedPrefecture) {
      const loadCities = async () => {
        try {
          const response = await propertyApi.getCities(selectedPrefecture);
          if (response.status === 'success' && response.data) {
            setCities(response.data);
            setSelectedCity(''); // 都道府県が変わったらリセット
            setSelectedDistrict(''); // 地区もリセット
          }
        } catch (err) {
          console.error('市区町村リスト取得エラー:', err);
        }
      };
      loadCities();
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [selectedPrefecture]);

  // 地区リストを取得
  React.useEffect(() => {
    if (selectedPrefecture && selectedCity) {
      const loadDistricts = async () => {
        try {
          const response = await propertyApi.getDistricts(selectedPrefecture, selectedCity);
          if (response.status === 'success' && response.data) {
            // APIの返却形式に応じて調整（文字列配列または{name, code}配列）
            const districtData = response.data.map((item: any) => {
              if (typeof item === 'string') {
                return { code: item, name: item };
              }
              // API returns {name: string, code: string} where both are the same
              return { code: item.name || item.code, name: item.name || item.code };
            });
            setDistricts(districtData);
            setSelectedDistrict(''); // 市区町村が変わったらリセット
          }
        } catch (err) {
          console.error('地区リスト取得エラー:', err);
          setDistricts([]);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedPrefecture, selectedCity]);

  // 物件種別の選択肢（streamlit_app.pyと同じ）
  const propertyTypes = [
    { code: '01', name: '土地' },
    { code: '02', name: '戸建て' },
    { code: '07', name: 'マンション' }
  ];

  // 市場分析実行（streamlit_app.pyと同じロジック）
  const handleAnalyze = async () => {
    // 必須項目のチェック
    const errors = [];
    if (!selectedPrefecture) errors.push('都道府県を選択してください');
    if (!selectedCity) errors.push('市区町村を選択してください');
    // 地区名は現在任意
    if (!selectedPropertyType) errors.push('物件種別を選択してください');

    if (errors.length > 0) {
      setError(errors.join('、'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setYearlyData([]);

    try {
      const currentYear = new Date().getFullYear();
      const promises = [];

      // 直近3年分のデータを取得（streamlit_app.pyと同じ）
      for (let i = 0; i < 3; i++) {
        const year = currentYear - i;
        // 全四半期のデータを取得
        for (let quarter = 1; quarter <= 4; quarter++) {
          promises.push(
            propertyApi.searchProperties({
              prefecture: selectedPrefecture,
              city: selectedCity,
              district: selectedDistrict || undefined,  // Send district name directly
              property_type: selectedPropertyType === '07' ? 'マンション' :
                           selectedPropertyType === '02' ? '戸建' : '土地',
              year: year,
              quarter: quarter,
              min_area: targetArea - areaTolerance,
              max_area: targetArea + areaTolerance,
              min_year: targetYear - yearTolerance,
              max_year: targetYear + yearTolerance
            })
          );
        }
      }

      const responses = await Promise.all(promises);
      console.log('API Responses:', responses); // デバッグ用
      const allData: any[] = [];
      const yearlyResults: any[] = [];

      // 年ごとにデータを集計
      for (let i = 0; i < 3; i++) {
        const year = currentYear - i;
        const yearData: any[] = [];

        // その年の4四半期分のデータを結合
        for (let q = 0; q < 4; q++) {
          const response = responses[i * 4 + q];
          console.log(`Year ${year} Q${q + 1} response:`, response); // デバッグ用
          if (response.status === 'success' && response.data) {
            yearData.push(...response.data);
          }
        }

        if (yearData.length > 0) {
          // 価格と面積の統計を計算
          const prices = yearData.map(item => item.price || item.取引価格 || 0);
          const areas = yearData.map(item => item.building_area || item.面積 || 0);

          const totalPrice = prices.reduce((sum, price) => sum + price, 0);
          const avgPrice = totalPrice / prices.length;
          const totalArea = areas.reduce((sum, area) => sum + area, 0);
          const avgPricePerSqm = totalArea > 0 ? totalPrice / totalArea : 0;

          yearlyResults.push({
            year: year,
            averagePrice: Math.round(avgPrice / 10000), // 万円単位
            totalTransactions: yearData.length,
            averagePricePerSqm: Math.round(avgPricePerSqm),
            data: yearData,
            // 四分位数の計算
            q25: Math.round(getPercentile(prices, 0.25) / 10000),
            q50: Math.round(getPercentile(prices, 0.50) / 10000),
            q75: Math.round(getPercentile(prices, 0.75) / 10000)
          });

          allData.push(...yearData);
        }
      }

      if (yearlyResults.length > 0) {
        setYearlyData(yearlyResults);

        // 最新年のデータを基準に設定
        const latestData = yearlyResults[0];
        const previousData = yearlyResults[1];

        let priceChange = 0;
        if (previousData && previousData.averagePrice > 0) {
          priceChange = ((latestData.averagePrice - previousData.averagePrice) / previousData.averagePrice) * 100;
        }

        // クラスタリング分析の準備（簡易版）
        const clusters = performSimpleClustering(allData);

        setMarketData({
          prefecture: selectedPrefecture,
          city: selectedCity,
          district: selectedDistrict || '全体',
          averagePrice: latestData.averagePrice,
          priceChange: priceChange,
          totalTransactions: latestData.totalTransactions,
          averagePricePerSqm: latestData.averagePricePerSqm,
          yearlyData: yearlyResults,
          clusters: clusters,
          q25: latestData.q25,
          q50: latestData.q50,
          q75: latestData.q75,
          similarPropertiesCount: allData.length
        });
      } else {
        setError('該当するデータが見つかりませんでした。条件を変更して再度お試しください。');
      }
    } catch (err) {
      console.error('分析エラー:', err);
      setError('分析中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // パーセンタイル計算
  const getPercentile = (arr: number[], percentile: number) => {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile);
    return sorted[index] || 0;
  };

  // 簡易クラスタリング（価格帯でグループ分け）
  const performSimpleClustering = (data: any[]) => {
    if (data.length < 10) return null;

    const prices = data.map(item => item.price || item.取引価格 || 0).sort((a, b) => a - b);
    const q33 = getPercentile(prices, 0.33);
    const q66 = getPercentile(prices, 0.66);

    const clusters = [
      {
        name: 'エントリー',
        count: prices.filter(p => p <= q33).length,
        avgPrice: Math.round(prices.filter(p => p <= q33).reduce((s, p) => s + p, 0) / prices.filter(p => p <= q33).length / 10000)
      },
      {
        name: '中価格帯',
        count: prices.filter(p => p > q33 && p <= q66).length,
        avgPrice: Math.round(prices.filter(p => p > q33 && p <= q66).reduce((s, p) => s + p, 0) / prices.filter(p => p > q33 && p <= q66).length / 10000)
      },
      {
        name: '高価格帯',
        count: prices.filter(p => p > q66).length,
        avgPrice: Math.round(prices.filter(p => p > q66).reduce((s, p) => s + p, 0) / prices.filter(p => p > q66).length / 10000)
      }
    ];

    return clusters;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto pt-5 lg:pt-0">
        {/* ヘッダー */}
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI市場分析</h1>
            <p className="text-gray-600 mt-1">
              エリアの市場動向と価格分布をAIが詳細に分析します
            </p>
          </div>
        </div>

        {/* 分析条件入力セクション */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">分析条件を設定</h2>
          </div>

          <div className="space-y-6">
            {/* エリア選択（第1行） */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">エリア選択</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 都道府県選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    都道府県 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPrefecture}
                    onChange={(e) => {
                      setSelectedPrefecture(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {prefectures.map((pref) => (
                      <option key={pref.code} value={pref.code}>
                        {pref.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 市区町村選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    市区町村 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedPrefecture}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">選択してください</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 地区名（任意） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地区名
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity || districts.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">全体</option>
                    {districts.map((district) => (
                      <option key={district.name} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 物件条件（第2行） */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">物件条件</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 物件種別 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Home className="inline h-4 w-4 mr-1" />
                    物件種別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.code} value={type.code}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 希望延床面積 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="inline h-4 w-4 mr-1" />
                    希望延床面積 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={targetArea}
                      onChange={(e) => setTargetArea(Number(e.target.value))}
                      min={10}
                      max={500}
                      step={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <span className="ml-2 text-sm text-gray-600">㎡</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">±{areaTolerance}㎡の範囲で検索</p>
                </div>

                {/* 建築年 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    建築年 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={targetYear}
                      onChange={(e) => setTargetYear(Number(e.target.value))}
                      min={1950}
                      max={new Date().getFullYear()}
                      step={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <span className="ml-2 text-sm text-gray-600">年</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">±{yearTolerance}年の範囲で検索</p>
                </div>
              </div>
            </div>

            {/* 分析期間（自動設定） */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 分析実行ボタン */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`flex items-center justify-center px-10 py-5 rounded-lg font-semibold text-xl transition-all duration-200 min-h-[64px] ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  AI市場分析を実行する
                </>
              )}
            </button>
          </div>
        </div>

        {/* 分析結果表示セクション */}
        {marketData && (
          <div className="space-y-6">
            {/* 類似物件の価格分布（streamlit_app.pyと同じ） */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🎯 あなたの条件に近い物件の価格分布
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                延床面積 {targetArea}±{areaTolerance}㎡、建築年 {targetYear}±{yearTolerance}年
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">下位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}万円以下
                  </p>
                  <p className="text-xs text-gray-500 mt-1">類似物件の25%がこの価格以下</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">中央値レンジ</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}〜{marketData.q75?.toLocaleString() || 0}万円
                  </p>
                  <p className="text-xs text-gray-500 mt-1">類似物件の50%がこの範囲内</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">上位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q75?.toLocaleString() || 0}万円以上
                  </p>
                  <p className="text-xs text-gray-500 mt-1">類似物件の25%がこの価格以上</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">該当件数</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.similarPropertiesCount || 0}件
                  </p>
                  <p className="text-xs text-gray-500 mt-1">条件に合致する物件数</p>
                </div>
              </div>
            </div>

            {/* サマリーカード */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">市場分析結果</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 平均価格 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">平均取引価格</span>
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.averagePrice?.toLocaleString() || 0}万円
                  </p>
                  <p className={`text-sm mt-1 ${marketData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    前年比 {marketData.priceChange >= 0 ? '+' : ''}{marketData.priceChange?.toFixed(1) || 0}%
                  </p>
                </div>

                {/* 取引件数 */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">取引件数</span>
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.totalTransactions || 0}件
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    最新年度
                  </p>
                </div>

                {/* 平米単価 */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">平均平米単価</span>
                    <Home className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.averagePricePerSqm?.toLocaleString() || 0}円
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    /㎡
                  </p>
                </div>

                {/* 市場活性度 */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">市場活性度</span>
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.totalTransactions > 100 ? '高' : marketData.totalTransactions > 50 ? '中' : '低'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    流動性評価
                  </p>
                </div>
              </div>
            </div>

            {/* AIクラスタリング分析 */}
            {marketData.clusters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Activity className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">AI自動クラスタリング分析</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  📊 3つの物件グループを自動検出:
                </p>
                <div className="space-y-2">
                  {marketData.clusters.map((cluster: any) => (
                    <div key={cluster.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-900">{cluster.name}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({Math.round((cluster.count / marketData.similarPropertiesCount) * 100)}%)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          平均{cluster.avgPrice.toLocaleString()}万円
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({cluster.count}件)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3年間の推移 */}
            {marketData.yearlyData && marketData.yearlyData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Activity className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">過去3年間の価格推移</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">年度</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">平均価格（万円）</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">取引件数</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">平米単価（円）</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {marketData.yearlyData.map((yearData: any, index: number) => (
                        <tr key={yearData.year} className={index === 0 ? 'bg-blue-50' : ''}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {yearData.year}年 {index === 0 && <span className="text-blue-600 font-semibold">（最新）</span>}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {yearData.averagePrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {yearData.totalTransactions}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            {yearData.averagePricePerSqm.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 重要事項 */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">重要事項</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 本分析は公開データの統計処理による参考情報です</li>
                    <li>• 不動産の投資判断や購入の推奨ではありません</li>
                    <li>• 個別物件の適正価格を示すものではありません</li>
                    <li>• 実際の取引には宅地建物取引士にご相談ください</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/simulator')}
                className="flex-1 md:flex-none px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
              >
                このエリアでシミュレーション
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* 初期状態の説明 */}
        {!marketData && !isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              市場分析を開始しましょう
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              エリア・物件条件を設定して「検索実行」ボタンをクリックすると、
              直近3年間の市場動向をAIが分析します。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysis;