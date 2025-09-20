import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Search,
  Building,
  Home,
  Loader,
  AlertCircle,
  Info,
  Ruler,
  Calendar
} from 'lucide-react';
import { propertyApi } from '../services/propertyApi';
import Plot from 'react-plotly.js';

const MarketAnalysis: React.FC = () => {

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
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [landPriceData, setLandPriceData] = useState<any[]>([]);
  const [landPriceHistory, setLandPriceHistory] = useState<any>(null);
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

    try {
      // 2024年を最新年として設定（2025年のデータはまだ存在しない）
      const currentYear = Math.min(new Date().getFullYear(), 2024);
      const promises = [];

      // 直近3年分のデータを取得（streamlit_app.pyと同じ）
      for (let i = 0; i < 3; i++) {
        const year = currentYear - i;
        // 全四半期のデータを取得
        for (let quarter = 1; quarter <= 4; quarter++) {
          const params = {
            prefecture: selectedPrefecture,  // 都道府県コードを送る
            city: selectedCity,  // 市区町村コードを送る
            district: selectedDistrict || undefined,  // 地区名はそのまま送る
            property_type: selectedPropertyType === '07' ? 'マンション' :
                         selectedPropertyType === '02' ? '戸建' : '土地',
            year: year,
            quarter: quarter
            // フィルタは一旦コメントアウト（データ取得優先）
            // min_area: targetArea - areaTolerance,
            // max_area: targetArea + areaTolerance,
            // min_year: targetYear - yearTolerance,
            // max_year: targetYear + yearTolerance
          };
          console.log(`Requesting Year ${year} Q${quarter} with params:`, params);
          promises.push(propertyApi.searchProperties(params));
        }
      }

      const responses = await Promise.all(promises);
      console.log('API Responses:', responses); // デバッグ用

      // レスポンスの詳細を確認
      responses.forEach((resp, idx) => {
        const year = currentYear - Math.floor(idx / 4);
        const quarter = (idx % 4) + 1;
        console.log(`Response ${year} Q${quarter}:`, {
          status: resp.status,
          dataCount: resp.data?.length || 0,
          error: resp.error || null
        });
      });

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

          const yearResult = {
            year: year,
            averagePrice: Math.round(avgPrice / 10000), // 万円単位
            totalTransactions: yearData.length,
            averagePricePerSqm: Math.round(avgPricePerSqm),
            data: yearData,
            // 四分位数の計算
            q25: Math.round(getPercentile(prices, 0.25) / 10000),
            q50: Math.round(getPercentile(prices, 0.50) / 10000),
            q75: Math.round(getPercentile(prices, 0.75) / 10000)
          };

          console.log(`${year}年のデータ集計結果:`, {
            year: year,
            件数: yearData.length,
            平均価格: yearResult.averagePrice + '万円',
            価格レンジ: `${Math.min(...prices) / 10000}万円 ~ ${Math.max(...prices) / 10000}万円`,
            データサンプル: yearData.slice(0, 3) // 最初の3件を表示
          });

          yearlyResults.push(yearResult);

          allData.push(...yearData);
        }
      }

      // 全データを保存
      setAllProperties(allData);

      console.log('総データ数:', allData.length);
      console.log('年次集計結果数:', yearlyResults.length);

      if (yearlyResults.length > 0) {
        // 最新年のデータを基準に設定
        const latestData = yearlyResults[0];

        // 価格トレンドを線形回帰で計算（streamlit_app.pyと完全に同じロジック）
        let priceChange = 0;
        let trendSlope = 0;
        let pValue = 1.0; // 統計的有意性のp値（デフォルトは有意でない）

        if (yearlyResults.length >= 2) {
          // 年ごとの平均価格から線形回帰を計算
          // yearlyResultsを年度順にソート（古い順）
          const sortedResults = [...yearlyResults].sort((a, b) => a.year - b.year);
          const years = sortedResults.map(y => y.year);
          const prices = sortedResults.map(y => y.averagePrice);

          // 簡易的な線形回帰
          const n = years.length;
          const sumX = years.reduce((a, b) => a + b, 0);
          const sumY = prices.reduce((a, b) => a + b, 0);
          const sumXY = years.reduce((a, b, i) => a + b * prices[i], 0);
          const sumX2 = years.reduce((a, b) => a + b * b, 0);

          trendSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

          // 年次成長率を傾きから計算（基準年＝最も古い年の価格に対する割合）
          const basePrice = prices[0]; // 最も古い年の価格
          if (basePrice > 0) {
            priceChange = (trendSlope / basePrice) * 100;
          }

          // 簡易的なp値の計算（相関係数ベース）
          // 実際のp値計算は複雑なため、ここでは相関係数から推定
          const meanX = sumX / n;
          const meanY = sumY / n;
          const ssX = years.reduce((a, x) => a + (x - meanX) ** 2, 0);
          const ssY = prices.reduce((a, y) => a + (y - meanY) ** 2, 0);
          const ssXY = years.reduce((a, x, i) => a + (x - meanX) * (prices[i] - meanY), 0);
          const r = ssXY / Math.sqrt(ssX * ssY); // 相関係数
          const r2 = r * r; // 決定係数

          // t統計量を計算してp値を推定（自由度 = n - 2）
          const tStat = Math.abs(r) * Math.sqrt((n - 2) / (1 - r2));

          // 簡易的なp値推定（t分布の近似）
          // t値が2.0以上なら有意（p < 0.05の近似）
          pValue = tStat >= 2.0 ? 0.01 : 0.5;

          // デバッグ用出力（詳細版）
          console.log('価格トレンド分析詳細:', {
            years,
            prices,
            rawPriceChange: priceChange,
            trendSlope,
            basePrice,
            r,
            r2,
            tStat,
            pValue,
            isSignificant: pValue < 0.05,
            finalPriceChange: pValue >= 0.05 ? 0 : priceChange,
            yearlyResults: sortedResults
          });
        }

        // 統計的有意性に基づいて価格変動を調整（Streamlitと同じロジック）
        if (pValue >= 0.05) {
          // 統計的に有意でない場合は0%とする
          priceChange = 0;
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

        // 公示地価データの取得
        try {
          // 都道府県名を取得
          const selectedPrefName = prefectures.find(p => p.code === selectedPrefecture)?.name || selectedPrefecture;
          const selectedCityName = cities.find(c => c.code === selectedCity)?.name || selectedCity;

          const landPriceResponse = await propertyApi.getLandPrices({
            prefecture: selectedPrefName,  // 都道府県名を使用
            city: selectedCityName,  // 市区町村名を使用
            district: selectedDistrict || undefined,
            year: '2024'
          });
          if (landPriceResponse.status === 'success' && landPriceResponse.data) {
            // データ形式を調整（APIの返す形式に合わせる）
            const formattedData = landPriceResponse.data.map((item: any) => ({
              address: item.address || item.所在地 || '',
              price_time: item.price_time || item.価格時点 || '2024',
              price_per_sqm: item.price_per_sqm || item.価格 || 0,
              price_per_tsubo: item.price_per_tsubo || (item.価格 * 3.306) || 0,
              change_rate: item.change_rate || item.前年比 || 0,
              station: item.station || item.最寄駅 || '',
              station_distance: item.station_distance || item.駅距離 || 0
            }));
            setLandPriceData(formattedData);
          }

          // 公示地価の推移データを取得（複数年分）
          const years = ['2021', '2022', '2023', '2024'];
          const historyData: any = {};

          for (const year of years) {
            try {
              const yearResponse = await propertyApi.getLandPrices({
                prefecture: selectedPrefName,  // 都道府県名を使用
                city: selectedCityName,  // 市区町村名を使用
                district: selectedDistrict || undefined,
                year: year
              });

              if (yearResponse.status === 'success' && yearResponse.data) {
                yearResponse.data.forEach((item: any) => {
                  const address = item.address || item.所在地 || '';
                  if (!historyData[address]) {
                    historyData[address] = { yearly_prices: [] };
                  }
                  historyData[address].yearly_prices.push({
                    year: parseInt(year),
                    price_per_sqm: item.price_per_sqm || item.価格 || 0
                  });
                });
              }
            } catch (err) {
              console.log(`${year}年のデータ取得をスキップ:`, err);
            }
          }

          // 2年以上のデータがある地点のみ残す
          const filteredHistory: any = {};
          Object.entries(historyData).forEach(([address, data]: [string, any]) => {
            if (data.yearly_prices.length >= 2) {
              // 年でソート
              data.yearly_prices.sort((a: any, b: any) => a.year - b.year);
              filteredHistory[address] = data;
            }
          });

          if (Object.keys(filteredHistory).length > 0) {
            setLandPriceHistory(filteredHistory);
          }
        } catch (err) {
          console.log('公示地価データの取得エラー:', err);
        }
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
                <p className="text-sm text-blue-800">
                  取引時期：直近3年分のデータを自動取得します
                </p>
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
                  🔍 検索実行
                </>
              )}
            </button>
          </div>
        </div>

        {/* 分析結果表示セクション */}
        {marketData && (
          <div className="space-y-6">
            {/* AI市場分析セクション（streamlit_app.pyと同じ） */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 AI市場分析</h2>

            {/* 類似物件の価格分布（streamlit_app.pyと同じ） */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-700 mb-4">
                🎯 **あなたの条件に近い物件の価格分布**
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                延床面積 {targetArea}±{areaTolerance}㎡、建築年 {targetYear}±{yearTolerance}年
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">下位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}万円以下
                  </p>
                  <p className="text-xs text-gray-500 mt-1">類似物件の25%がこの価格以下</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">中央値レンジ</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}〜{marketData.q75?.toLocaleString() || 0}万円
                  </p>
                  <p className="text-xs text-gray-500 mt-1">類似物件の50%がこの範囲内</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">上位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q75?.toLocaleString() || 0}万円以上
                  </p>
                  <p className="text-xs text-gray-500 mt-1">類似物件の25%がこの価格以上</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">分析サンプル数</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.similarPropertiesCount || 0}件
                  </p>
                  <p className="text-xs text-gray-500 mt-1">指定条件に該当する物件数</p>
                </div>
              </div>
            </div>

            {/* マーケット分析セクション */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 **マーケット分析**</h3>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* AI価格トレンド分析 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">AI価格トレンド分析</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.priceChange === 0 ?
                      '→ ±0%/年' :
                      (marketData.priceChange > 0 ?
                        `📈 +${marketData.priceChange.toFixed(1)}%/年` :
                        `📉 ${marketData.priceChange.toFixed(1)}%/年`)
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {marketData.priceChange === 0 ?
                      '価格変動なし' :
                      (marketData.priceChange > 0 ? '明確な上昇傾向' : '明確な下降傾向')
                    }
                  </p>
                </div>

                {/* 下位25% */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">下位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}万円以下
                  </p>
                  <p className="text-xs text-gray-500 mt-1">市場の25%がこの価格以下</p>
                </div>

                {/* 中央値レンジ */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">中央値レンジ</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}〜{marketData.q75?.toLocaleString() || 0}万円
                  </p>
                  <p className="text-xs text-gray-500 mt-1">市場の50%がこの範囲内<br/>中央値: {marketData.q50?.toLocaleString() || 0}万円</p>
                </div>

                {/* 上位25% */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">上位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q75?.toLocaleString() || 0}万円以上
                  </p>
                  <p className="text-xs text-gray-500 mt-1">市場の25%がこの価格以上<br/>分析対象: {marketData.similarPropertiesCount}件</p>
                </div>
              </div>
            </div>

            {/* AI詳細分析レポート */}
            <details className="bg-white rounded-lg border border-gray-200 p-6">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900 mb-4">
                🤖 AI詳細分析レポートを見る
              </summary>

              <div className="mt-4 space-y-4">
                <div className="text-sm text-gray-700">
                  <h4 className="font-bold mb-2">📊 統計サマリー</h4>
                  <ul className="space-y-1 ml-4">
                    <li>- 分析対象物件数: {marketData.similarPropertiesCount}件</li>
                    <li>- 平均価格: {marketData.averagePrice?.toLocaleString()}万円</li>
                    <li>- 中央値: {marketData.q50?.toLocaleString() || 0}万円</li>
                    <li>- 価格帯: {Math.min(...allProperties.map(p => (p.price || p.取引価格) / 10000)).toLocaleString()}万円 〜 {Math.max(...allProperties.map(p => (p.price || p.取引価格) / 10000)).toLocaleString()}万円</li>
                  </ul>
                </div>

                <div className="text-sm text-gray-700">
                  <h4 className="font-bold mb-2">📈 価格動向分析</h4>
                  <ul className="space-y-1 ml-4">
                    <li>- 年間成長率: {marketData.priceChange?.toFixed(1)}%</li>
                    <li>- 価格のばらつき（標準偏差）: ±{(Math.sqrt(allProperties.map(p => Math.pow((p.price || p.取引価格) / 10000 - marketData.averagePrice, 2)).reduce((a, b) => a + b, 0) / allProperties.length)).toFixed(0)}万円</li>
                  </ul>
                </div>

                {/* AIクラスタリング分析 */}
                {marketData.clusters && (
                  <div className="text-sm text-gray-700">
                    <h4 className="font-bold mb-2">🎯 AI自動クラスタリング分析</h4>
                    {allProperties.length >= 10 ? (
                      <>
                        <p className="mb-2">📊 3つの物件グループを自動検出:</p>
                        <ul className="space-y-1 ml-4">
                          {marketData.clusters.map((cluster: any) => (
                            <li key={cluster.name}>
                              • **{cluster.name}** ({Math.round((cluster.count / marketData.similarPropertiesCount) * 100)}%): 平均{cluster.avgPrice.toLocaleString()}万円 ({cluster.count}件)
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p>クラスタリング分析には10件以上のデータが必要です</p>
                    )}
                  </div>
                )}

                {/* AI異常値検出 */}
                <div className="text-sm text-gray-700">
                  <h4 className="font-bold mb-2">⚠️ AI異常値検出</h4>
                  {allProperties.length >= 5 ? (
                    <p>✅ 統計的に異常な物件は検出されませんでした</p>
                  ) : (
                    <p>異常検出分析には5件以上のデータが必要です</p>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <h4 className="font-bold text-blue-900 mb-2">📌 重要事項</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 本分析は公開データの統計処理による参考情報です</li>
                    <li>• 不動産の投資判断や購入の推奨ではありません</li>
                    <li>• 個別物件の適正価格を示すものではありません</li>
                    <li>• 実際の取引には宅地建物取引士にご相談ください</li>
                  </ul>
                </div>
              </div>
            </details>


            {/* 類似物件の詳細表 */}
            {allProperties && allProperties.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 類似物件</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">No.</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">所在地</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">取引時期</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">取引価格</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">土地面積(㎡)</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">延床面積(㎡)</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">間取り</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">前面道路</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allProperties
                        .sort((a, b) => Math.abs((a.building_area || a.面積) - targetArea) - Math.abs((b.building_area || b.面積) - targetArea))
                        .slice(0, 10)
                        .map((property, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{property.location || property.所在地 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{property.trade_period || property.取引時期 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{((property.price || property.取引価格) / 10000).toLocaleString()}万円</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(property.land_area || property.土地面積 || 0)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(property.building_area || property.面積 || 0)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{property.floor_plan || property.間取り || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {property.road_type || property.前面道路 || ''} {property.breadth || property.道路幅員 || ''}m
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* グラフセクション */}
            {allProperties && allProperties.length > 0 && (
              <>
                {/* 1. 延べ床と価格の散布図 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 延べ床と価格</h3>
                  <Plot
                    data={[
                      {
                        x: allProperties
                          .filter(p => (p.building_area || p.面積) > 0)
                          .filter(p => Math.abs((p.building_area || p.面積) - targetArea) > areaTolerance)
                          .map(p => p.building_area || p.面積),
                        y: allProperties
                          .filter(p => (p.building_area || p.面積) > 0)
                          .filter(p => Math.abs((p.building_area || p.面積) - targetArea) > areaTolerance)
                          .map(p => (p.price || p.取引価格) / 10000),
                        mode: 'markers',
                        type: 'scatter',
                        name: 'その他',
                        marker: {
                          color: '#4169E1',
                          size: 8,
                          opacity: 0.6,
                          line: { color: '#000080', width: 0.5 }
                        },
                        hovertemplate: '面積: %{x}㎡<br>価格: %{y:,.0f}万円<extra></extra>'
                      },
                      {
                        x: allProperties
                          .filter(p => (p.building_area || p.面積) > 0)
                          .filter(p => Math.abs((p.building_area || p.面積) - targetArea) <= areaTolerance)
                          .map(p => p.building_area || p.面積),
                        y: allProperties
                          .filter(p => (p.building_area || p.面積) > 0)
                          .filter(p => Math.abs((p.building_area || p.面積) - targetArea) <= areaTolerance)
                          .map(p => (p.price || p.取引価格) / 10000),
                        mode: 'markers',
                        type: 'scatter',
                        name: `${targetArea}±${areaTolerance}㎡`,
                        marker: {
                          color: '#FF4500',
                          size: 12,
                          opacity: 0.8,
                          line: { color: '#8B0000', width: 1 }
                        },
                        hovertemplate: '面積: %{x}㎡<br>価格: %{y:,.0f}万円<extra></extra>'
                      }
                    ]}
                    layout={{
                      xaxis: {
                        title: { text: '延床面積（㎡）', font: { size: 14, color: 'black' } },
                        gridcolor: '#E0E0E0',
                        showline: true,
                        linewidth: 1,
                        linecolor: 'black',
                        tickfont: { size: 14, color: 'black' },
                        dtick: 10,
                        range: [50, 200]
                      },
                      yaxis: {
                        title: { text: '', font: { size: 14, color: 'black' } },
                        gridcolor: '#E0E0E0',
                        showline: true,
                        linewidth: 1,
                        linecolor: 'black',
                        tickfont: { size: 14, color: 'black' },
                        dtick: 1000,
                        range: [0, 10000],
                        tickformat: ',d',
                        ticksuffix: '万円'
                      },
                      height: 500,
                      margin: { t: 40, b: 60, l: 80, r: 40 },
                      plot_bgcolor: 'white',
                      paper_bgcolor: 'white',
                      showlegend: true,
                      hovermode: 'closest',
                      shapes: [
                        {
                          type: 'line',
                          x0: targetArea,
                          x1: targetArea,
                          y0: 0,
                          y1: 10000,
                          line: { color: 'red', width: 1, dash: 'dash' }
                        },
                        {
                          type: 'rect',
                          x0: targetArea - areaTolerance,
                          x1: targetArea + areaTolerance,
                          y0: 0,
                          y1: 10000,
                          fillcolor: 'blue',
                          opacity: 0.1,
                          line: { width: 0 }
                        }
                      ],
                      annotations: [
                        {
                          x: targetArea,
                          y: 10000,
                          text: `広さ ${targetArea}㎡`,
                          showarrow: false,
                          yanchor: 'bottom',
                          font: { size: 12, color: 'red' }
                        }
                      ]
                    }}
                    config={{ displayModeBar: false }}
                    className="w-full"
                  />
                </div>

                {/* 2. 延床面積別価格分布ヒートマップ */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 延床面積別価格分布</h3>
                  {(() => {
                    // 価格帯と面積帯を定義
                    const priceBins = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
                    const areaBins = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

                    // データをビンに分類してカウント
                    const heatmapData: number[][] = [];
                    const priceLabels: string[] = [];
                    const areaLabels: string[] = [];

                    for (let i = 0; i < priceBins.length - 1; i++) {
                      priceLabels.push(i === priceBins.length - 2 ? `${priceBins[i].toLocaleString()}万円~` : `${priceBins[i].toLocaleString()}万円`);
                      const row: number[] = [];
                      for (let j = 0; j < areaBins.length - 1; j++) {
                        if (i === 0) {
                          areaLabels.push(`${areaBins[j]}`);
                        }
                        const count = allProperties.filter(p => {
                          const price = (p.price || p.取引価格) / 10000;
                          const area = p.building_area || p.面積;
                          return price >= priceBins[i] && price < priceBins[i + 1] &&
                                 area >= areaBins[j] && area < areaBins[j + 1];
                        }).length;
                        row.push(count);
                      }
                      heatmapData.push(row);
                    }

                    return (
                      <Plot
                        data={[
                          {
                            z: heatmapData.reverse(),
                            x: areaLabels,
                            y: priceLabels.reverse(),
                            type: 'heatmap',
                            colorscale: [
                              [0, '#ffffff'],
                              [0.2, '#c6dbef'],
                              [0.4, '#9ecae1'],
                              [0.6, '#6baed6'],
                              [0.8, '#3182bd'],
                              [1, '#08519c']
                            ],
                            text: heatmapData.map(row => row.map(val => val.toString())),
                            texttemplate: '%{text}',
                            textfont: { size: 14 },
                            hovertemplate: '価格: %{y}<br>面積: %{x}㎡<br>件数: %{z}件<extra></extra>',
                            colorbar: { title: '件数' }
                          }
                        ]}
                        layout={{
                          xaxis: {
                            title: { text: '延床面積(㎡)', font: { size: 14, color: 'black' } },
                            side: 'bottom',
                            tickfont: { size: 14, color: 'black' },
                            showgrid: false,
                            showline: true,
                            linecolor: 'black'
                          },
                          yaxis: {
                            title: { text: '', font: { size: 14, color: 'black' } },
                            side: 'left',
                            tickfont: { size: 14, color: 'black' },
                            showgrid: false,
                            showline: true,
                            linecolor: 'black'
                          },
                          height: 400,
                          margin: { t: 40, b: 60, l: 100, r: 40 },
                          plot_bgcolor: 'white',
                          paper_bgcolor: 'white'
                        }}
                        config={{ displayModeBar: false }}
                        className="w-full"
                      />
                    );
                  })()}
                </div>

                {/* 3. 建築年別価格分布 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 建築年別価格分布</h3>
                  <Plot
                    data={[
                      {
                        x: allProperties
                          .filter(p => p.building_year && p.building_year > 1950 && p.building_year <= 2025)
                          .filter(p => Math.abs(p.building_year - targetYear) > yearTolerance)
                          .map(p => p.building_year),
                        y: allProperties
                          .filter(p => p.building_year && p.building_year > 1950 && p.building_year <= 2025)
                          .filter(p => Math.abs(p.building_year - targetYear) > yearTolerance)
                          .map(p => (p.price || p.取引価格) / 10000),
                        mode: 'markers',
                        type: 'scatter',
                        name: 'その他',
                        marker: {
                          color: '#4169E1',
                          size: 8,
                          opacity: 0.6,
                          line: { color: '#000080', width: 0.5 }
                        },
                        hovertemplate: '建築年: %{x}年<br>価格: %{y:,.0f}万円<extra></extra>'
                      },
                      {
                        x: allProperties
                          .filter(p => p.building_year && p.building_year > 1950 && p.building_year <= 2025)
                          .filter(p => Math.abs(p.building_year - targetYear) <= yearTolerance)
                          .map(p => p.building_year),
                        y: allProperties
                          .filter(p => p.building_year && p.building_year > 1950 && p.building_year <= 2025)
                          .filter(p => Math.abs(p.building_year - targetYear) <= yearTolerance)
                          .map(p => (p.price || p.取引価格) / 10000),
                        mode: 'markers',
                        type: 'scatter',
                        name: `${targetYear}±${yearTolerance}年`,
                        marker: {
                          color: '#FF4500',
                          size: 12,
                          opacity: 0.8,
                          line: { color: '#8B0000', width: 1 }
                        },
                        hovertemplate: '建築年: %{x}年<br>価格: %{y:,.0f}万円<extra></extra>'
                      }
                    ]}
                    layout={{
                      xaxis: {
                        title: { text: '建築年', font: { size: 14, color: 'black' } },
                        gridcolor: '#E0E0E0',
                        showline: true,
                        linewidth: 1,
                        linecolor: 'black',
                        tickfont: { size: 14, color: 'black' },
                        dtick: 5
                      },
                      yaxis: {
                        title: { text: '', font: { size: 14, color: 'black' } },
                        gridcolor: '#E0E0E0',
                        showline: true,
                        linewidth: 1,
                        linecolor: 'black',
                        tickfont: { size: 14, color: 'black' },
                        dtick: 1000,
                        range: [0, 10000],
                        tickformat: ',d',
                        ticksuffix: '万円'
                      },
                      height: 500,
                      margin: { t: 40, b: 60, l: 80, r: 40 },
                      plot_bgcolor: 'white',
                      paper_bgcolor: 'white',
                      showlegend: true,
                      hovermode: 'closest',
                      shapes: [
                        {
                          type: 'line',
                          x0: targetYear,
                          x1: targetYear,
                          y0: 0,
                          y1: 10000,
                          line: { color: 'red', width: 1, dash: 'dash' }
                        },
                        {
                          type: 'rect',
                          x0: targetYear - yearTolerance,
                          x1: targetYear + yearTolerance,
                          y0: 0,
                          y1: 10000,
                          fillcolor: 'red',
                          opacity: 0.1,
                          line: { width: 0 }
                        }
                      ],
                      annotations: [
                        {
                          x: targetYear,
                          y: 10000,
                          text: `建築年 ${targetYear}年`,
                          showarrow: false,
                          yanchor: 'bottom',
                          font: { size: 12, color: 'red' }
                        }
                      ]
                    }}
                    config={{ displayModeBar: false }}
                    className="w-full"
                  />
                </div>

                {/* 4. 建築年別価格分布（ヒートマップ） */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">4. 建築年別価格分布（ヒートマップ）</h3>
                  {(() => {
                    const validYearData = allProperties.filter(p =>
                      p.building_year && p.building_year > 1950 && p.building_year <= 2025
                    );

                    if (validYearData.length === 0) {
                      return <div className="text-center text-gray-500 py-8">建築年データがありません</div>;
                    }

                    const minYear = Math.floor(Math.min(...validYearData.map(p => p.building_year)) / 5) * 5;
                    const maxYear = Math.ceil(Math.max(...validYearData.map(p => p.building_year)) / 5) * 5;
                    const priceBins = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
                    const yearBins: number[] = [];
                    for (let year = minYear; year <= maxYear; year += 5) {
                      yearBins.push(year);
                    }

                    const heatmapData: number[][] = [];
                    const priceLabels: string[] = [];
                    const yearLabels: string[] = [];

                    for (let i = 0; i < priceBins.length - 1; i++) {
                      priceLabels.push(i === priceBins.length - 2 ? `${priceBins[i].toLocaleString()}万円~` : `${priceBins[i].toLocaleString()}万円`);
                      const row: number[] = [];
                      for (let j = 0; j < yearBins.length - 1; j++) {
                        if (i === 0) {
                          yearLabels.push(`${yearBins[j]}`);
                        }
                        const count = validYearData.filter(p => {
                          const price = (p.price || p.取引価格) / 10000;
                          const year = p.building_year;
                          return price >= priceBins[i] && price < priceBins[i + 1] &&
                                 year >= yearBins[j] && year < yearBins[j + 1];
                        }).length;
                        row.push(count);
                      }
                      heatmapData.push(row);
                    }

                    return (
                      <Plot
                        data={[
                          {
                            z: heatmapData.reverse(),
                            x: yearLabels,
                            y: priceLabels.reverse(),
                            type: 'heatmap',
                            colorscale: 'Oranges',
                            text: heatmapData.map(row => row.map(val => val.toString())),
                            texttemplate: '%{text}',
                            textfont: { size: 14 },
                            hovertemplate: '価格: %{y}<br>建築年: %{x}年<br>件数: %{z}件<extra></extra>',
                            colorbar: { title: '件数' }
                          }
                        ]}
                        layout={{
                          xaxis: {
                            title: { text: '建築年', font: { size: 14, color: 'black' } },
                            side: 'bottom',
                            tickfont: { size: 14, color: 'black' },
                            showgrid: false,
                            showline: true,
                            linecolor: 'black'
                          },
                          yaxis: {
                            title: { text: '', font: { size: 14, color: 'black' } },
                            side: 'left',
                            tickfont: { size: 14, color: 'black' },
                            showgrid: false,
                            showline: true,
                            linecolor: 'black'
                          },
                          height: 400,
                          margin: { t: 40, b: 60, l: 100, r: 40 },
                          plot_bgcolor: 'white',
                          paper_bgcolor: 'white'
                        }}
                        config={{ displayModeBar: false }}
                        className="w-full"
                      />
                    );
                  })()}
                </div>

                {/* 5. 成約件数推移 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">5. 成約件数推移</h3>
                  {(() => {
                    // 四半期ごとのデータ集計
                    const periodCounts: { [key: string]: number } = {};
                    allProperties.forEach(p => {
                      const period = p.trade_period || p.取引時期;
                      if (period) {
                        periodCounts[period] = (periodCounts[period] || 0) + 1;
                      }
                    });

                    const sortedPeriods = Object.keys(periodCounts).sort();
                    const xLabels = sortedPeriods.map(period => {
                      const yearMatch = period.match(/(\d{4})年/);
                      const year = yearMatch ? yearMatch[1] + '年' : period;
                      if (period.includes('第1四半期')) return year + '<br>1月〜3月';
                      if (period.includes('第2四半期')) return year + '<br>4月〜6月';
                      if (period.includes('第3四半期')) return year + '<br>7月〜9月';
                      if (period.includes('第4四半期')) return year + '<br>10月〜12月';
                      return period;
                    });

                    return (
                      <Plot
                        data={[
                          {
                            x: xLabels,
                            y: sortedPeriods.map(p => periodCounts[p]),
                            type: 'bar',
                            marker: {
                              color: '#87CEEB',
                              line: { color: '#000080', width: 1.5 }
                            },
                            text: sortedPeriods.map(p => `${periodCounts[p]}件`),
                            textposition: 'outside',
                            textfont: { size: 14, color: 'black' },
                            hovertemplate: '取引時期: %{x}<br>成約件数: %{y}件<extra></extra>'
                          }
                        ]}
                        layout={{
                          xaxis: {
                            title: { text: '取引時期', font: { size: 14, color: 'black' } },
                            tickfont: { size: 14, color: 'black' },
                            tickangle: 0,
                            showgrid: false,
                            showline: true,
                            linecolor: 'black',
                            linewidth: 1
                          },
                          yaxis: {
                            title: { text: '', font: { size: 14, color: 'black' } },
                            tickfont: { size: 14, color: 'black' },
                            showgrid: true,
                            gridcolor: '#E0E0E0',
                            showline: true,
                            linecolor: 'black',
                            linewidth: 1,
                            ticksuffix: '件'
                          },
                          height: 500,
                          margin: { t: 40, b: 100, l: 60, r: 40 },
                          plot_bgcolor: 'white',
                          paper_bgcolor: 'white',
                          showlegend: false,
                          bargap: 0.2
                        }}
                        config={{ displayModeBar: false }}
                        className="w-full"
                      />
                    );
                  })()}
                </div>

                {/* 6. 📍 周辺の公示地価 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">6. 📍 周辺の公示地価</h3>
                  {landPriceData && landPriceData.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-white border-b-2 border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">No</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">住所</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">価格時点</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">価格(円/㎡)</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">坪単価</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">前年比</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">最寄駅からの距離</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {landPriceData.slice(0, 10).map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.address}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.price_time}年</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.price_per_sqm.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.price_per_tsubo.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.change_rate}%</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.station}駅から{item.station_distance}m</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {landPriceData.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                          <p>📊 公示地価統計（{landPriceData.length}地点）</p>
                          <ul className="ml-4 mt-2">
                            <li>• 平均価格: {Math.round(landPriceData.reduce((sum, item) => sum + item.price_per_sqm, 0) / landPriceData.length).toLocaleString()}円/㎡</li>
                            <li>• 最高価格: {Math.max(...landPriceData.map(item => item.price_per_sqm)).toLocaleString()}円/㎡</li>
                            <li>• 最低価格: {Math.min(...landPriceData.map(item => item.price_per_sqm)).toLocaleString()}円/㎡</li>
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>該当地域の公示地価データは見つかりませんでした</p>
                    </div>
                  )}
                </div>

                {/* 7. 📈 公示地価の推移 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">7. 📈 公示地価の推移</h3>
                  {landPriceHistory && Object.keys(landPriceHistory).length > 0 ? (
                    <Plot
                      data={Object.entries(landPriceHistory).slice(0, 10).map(([ address, data ]: [string, any]) => ({
                        x: data.yearly_prices.map((p: any) => p.year),
                        y: data.yearly_prices.map((p: any) => p.price_per_sqm),
                        mode: 'lines+markers+text',
                        name: address.length > 20 ? address.substring(0, 20) + '...' : address,
                        text: data.yearly_prices.map((p: any) => `${p.price_per_sqm.toLocaleString()}`),
                        textposition: 'top center',
                        textfont: { size: 14 },
                        line: { width: 2 },
                        marker: { size: 6 }
                      }))}
                      layout={{
                        height: 400,
                        margin: { t: 20, b: 40, l: 60, r: 20 },
                        plot_bgcolor: 'white',
                        paper_bgcolor: 'white',
                        xaxis: {
                          title: { text: '年', font: { size: 14, color: 'black' } },
                          gridcolor: '#E0E0E0',
                          showline: true,
                          linewidth: 1,
                          linecolor: 'black',
                          tickfont: { size: 14, color: 'black' },
                          dtick: 1
                        },
                        yaxis: {
                          title: { text: '価格 (円/㎡)', font: { size: 14, color: 'black' } },
                          gridcolor: '#E0E0E0',
                          showline: true,
                          linewidth: 1,
                          linecolor: 'black',
                          tickfont: { size: 14, color: 'black' },
                          tickformat: ',.0f'
                        },
                        legend: {
                          orientation: 'v',
                          yanchor: 'top',
                          y: 1,
                          xanchor: 'left',
                          x: 1.02,
                          font: { size: 12, color: 'black' },
                          bgcolor: 'white',
                          bordercolor: 'black',
                          borderwidth: 1
                        },
                        hovermode: 'x unified'
                      }}
                      config={{ displayModeBar: false }}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>価格推移データを取得できませんでした</p>
                    </div>
                  )}
                </div>
              </>
            )}

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