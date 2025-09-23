import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Search,
  Building,
  Home,
  Loader,
  AlertCircle,
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
  const [targetArea, setTargetArea] = useState<number>(100); // 希望面積（延床面積/土地面積）（必須）
  const [targetYear, setTargetYear] = useState<number>(2015); // 建築年（必須）

  // 固定値（streamlit_app.pyと同じ）
  const areaTolerance = 10; // ±10㎡
  const yearTolerance = 5; // ±5年

  // 物件タイプの判定（土地の場合のみ特別処理）
  const isLand = selectedPropertyType === '01';

  // ヘルパー関数：面積を取得（土地対応版）
  const getArea = (item: any): number => {
    // 土地の場合は土地面積を取得
    if (isLand) {
      return item['土地面積（㎡）'] || item.land_area || item['土地面積'] || 0;
    }
    // 戸建・マンションは従来通り延床面積を取得
    return item['延べ床面積（㎡）'] || item.building_area || item.面積 || item.延床面積 || item.area || 0;
  };

  // ヘルパー関数：建築年を取得
  const getBuildYear = (item: any): number => {
    return parseInt(item['建築年'] || item.build_year || item.建築年 || item.building_year || '0');
  };

  // API関連の状態
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);  // ローディング進捗率
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);  // 市区町村ローディング
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);  // 地区ローディング
  const [marketData, setMarketData] = useState<any>(null);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [landPriceData, setLandPriceData] = useState<any[]>([]);
  const [landPriceHistory, setLandPriceHistory] = useState<any>(null);
  const [prefectures, setPrefectures] = useState<Array<{code: string, name: string}>>([]);
  const [cities, setCities] = useState<Array<{code: string, name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{code: string, name: string}>>([]);
  const [error, setError] = useState<string | null>(null);


  // ML分析結果の状態
  const [mlAnalysisResult, setMlAnalysisResult] = useState<any>(null);
  const [isMLAnalyzing, setIsMLAnalyzing] = useState(false);
  const [filteredDataCount, setFilteredDataCount] = useState(0);  // フィルタ後のデータ件数
  const [mlDataCount, setMlDataCount] = useState(0);  // ML分析用データ件数（地域フィルタのみ）

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
        setIsCitiesLoading(true);  // ローディング開始
        // setCities([]);  // API呼び出し前にクリアしない（表示が消える問題を防ぐ）
        try {
          const response = await propertyApi.getCities(selectedPrefecture);
          if (response.status === 'success' && response.data) {
            setCities(response.data);
            setSelectedCity(''); // 都道府県が変わったらリセット
            setSelectedDistrict(''); // 地区もリセット
          }
        } catch (err) {
          console.error('市区町村リスト取得エラー:', err);
        } finally {
          setIsCitiesLoading(false);  // ローディング終了
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
        setIsDistrictsLoading(true);  // ローディング開始
        // setDistricts([]);  // API呼び出し前にクリアしない（表示が消える問題を防ぐ）
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
        } finally {
          setIsDistrictsLoading(false);  // ローディング終了
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

  // 平均値を計算するヘルパー関数
  const calculateAverage = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  };

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
    setLoadingProgress(0);
    setError(null);

    // プログレスバーの更新を開始
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          return prev;  // 90%で一旦停止
        }
        return prev + Math.random() * 10;  // ランダムに進行
      });
    }, 500);

    try {
      // 2024年を最新年として設定（2025年のデータはまだ存在しない）
      const currentYear = Math.min(new Date().getFullYear(), 2024);
      const fromYear = currentYear - 3;  // Streamlitと同じ：3年前から
      const toYear = currentYear;  // 現在年まで
      const promises = [];

      // Streamlitと同じロジック：from_year から to_year まで（4年分）
      for (let year = fromYear; year <= toYear; year++) {
        // 全四半期のデータを取得
        for (let quarter = 1; quarter <= 4; quarter++) {
          const params: any = {
            prefecture: selectedPrefecture,  // 都道府県コードを送る
            city: selectedCity,  // 市区町村コードを送る
            district: selectedDistrict || undefined,  // 地区名はそのまま送る
            property_type: selectedPropertyType === '07' ? 'マンション' :
                         selectedPropertyType === '02' ? '戸建' : '土地',
            year: year,
            quarter: quarter
          };

          // まずフィルタなしでデータを取得（後で適応的にフィルタリング）
          // APIフィルタは地域によってデータが0件になる可能性があるため
          console.log(`Requesting Year ${year} Q${quarter} with params:`, params);
          promises.push(propertyApi.searchProperties(params));
        }
      }

      const responses = await Promise.all(promises);
      console.log('API Responses:', responses); // デバッグ用

      // レスポンスの詳細を確認
      responses.forEach((resp, idx) => {
        const yearIdx = Math.floor(idx / 4);
        const year = fromYear + yearIdx;
        const quarter = (idx % 4) + 1;
        console.log(`Response ${year} Q${quarter}:`, {
          status: resp.status,
          dataCount: resp.data?.length || 0,
          message: resp.message || null,
          sampleData: resp.data?.[0] || null
        });
      });

      let allData: any[] = [];

      // まず全データを収集
      for (let year = fromYear; year <= toYear; year++) {
        const yearIdx = year - fromYear;
        for (let q = 0; q < 4; q++) {
          const response = responses[yearIdx * 4 + q];
          console.log(`Year ${year} Q${q + 1} response:`, response); // デバッグ用
          if (response.status === 'success' && response.data) {
            // 各データに年情報を付加
            const dataWithYear = response.data.map((item: any) => ({
              ...item,
              dataYear: year
            }));
            allData.push(...dataWithYear);
          }
        }
      }

      // Streamlit風の適応的フィルタリング
      let filteredData = [...allData];

      console.log(`🔍 フィルタリング開始: 全データ ${allData.length}件`);

      // 1. 面積フィルタ（100±10㎡）
      if (targetArea > 0 && allData.length > 0) {
        const areaFiltered = allData.filter(item => {
          const area = getArea(item);
          return area >= targetArea - areaTolerance && area <= targetArea + areaTolerance;
        });
        const areaLabel = isLand ? '土地面積' : '延床面積';
        console.log(`📐 ${areaLabel}フィルタ (${targetArea}±${areaTolerance}㎡): ${areaFiltered.length}件`);

        // 2. 築年数フィルタ（土地の場合はスキップ）
        if (!isLand && targetYear > 0) {
          const fullFiltered = areaFiltered.filter(item => {
            const buildYear = getBuildYear(item);
            return buildYear >= targetYear - yearTolerance && buildYear <= targetYear + yearTolerance;
          });
          console.log(`🏗️ 築年数フィルタ (${targetYear}±${yearTolerance}年): ${fullFiltered.length}件`);

          // 完全フィルタで十分なデータがあるか確認
          if (fullFiltered.length >= 10) {
            filteredData = fullFiltered;
            console.log(`✅ 完全フィルタ採用: ${filteredData.length}件`);
          } else if (areaFiltered.length >= 10) {
            filteredData = areaFiltered;
            console.log(`⚠️ 面積のみフィルタ採用: ${filteredData.length}件`);
          } else {
            filteredData = allData;
            console.log(`⚠️ フィルタなしで表示: ${filteredData.length}件`);
          }
        } else {
          // 土地の場合または築年数なしの場合
          // 土地の場合はフィルタ結果をそのまま使用（件数が少なくても）
          filteredData = areaFiltered;
          if (isLand) {
            console.log(`🏞️ 土地のため築年数フィルタなし: ${filteredData.length}件`);
          }
        }
      }

      console.log('==== 📊 天沼町 データ分析結果 ====');
      console.log('🏠 天沼町の全物件データ:', allData.length, '件');
      console.log('🎯 フィルタ後データ:', filteredData.length, '件');
      console.log('📋 検索条件:');
      console.log('  - 物件種別:', selectedPropertyType === '02' ? '戸建て' : selectedPropertyType === '07' ? 'マンション' : '土地');
      const areaLabel = isLand ? '土地面積' : '延床面積';
      console.log(`  - ${areaLabel}:`, `${targetArea}±${areaTolerance}㎡ (${targetArea-areaTolerance}〜${targetArea+areaTolerance}㎡)`);
      if (!isLand) {
        console.log('  - 建築年:', `${targetYear}±${yearTolerance}年 (${targetYear-yearTolerance}〜${targetYear+yearTolerance}年)`);
      }
      console.log('  - 取得期間: 2021年〜2024年 (4年分)');

      // データの詳細分析
      if (allData.length > 0) {
        const sampleData = allData[0];
        console.log('データサンプル:', sampleData);
        console.log('利用可能フィールド:', Object.keys(sampleData));

        // 面積フィールドの確認（API仕様書の日本語フィールド名を含む）
        const areaFields = ['延べ床面積（㎡）', 'building_area', '面積', '延床面積', 'area'];
        areaFields.forEach(field => {
          const hasField = allData.filter(item => item[field] && item[field] > 0).length;
          console.log(`${field}フィールド有効データ:`, hasField);
        });

        // 建築年フィールドの確認（API仕様書の日本語フィールド名を含む）
        const yearFields = ['建築年', 'build_year', 'building_year'];
        yearFields.forEach(field => {
          const hasField = allData.filter(item => item[field] && parseInt(item[field]) > 1950).length;
          console.log(`${field}フィールド有効データ:`, hasField);
        });

        // 価格フィールドの確認
        const priceFields = ['取引価格（万円）', 'price', '取引価格'];
        priceFields.forEach(field => {
          const hasField = allData.filter(item => item[field] && item[field] > 0).length;
          console.log(`${field}フィールド有効データ:`, hasField);
        });

        // 面積・築年分布の詳細分析
        console.log('==== 📈 天沼町の詳細分析 ====');
        const areas = allData.map(item => getArea(item)).filter(a => a > 0);
        const years = allData.map(item => getBuildYear(item)).filter(y => y > 1950);

        if (areas.length > 0) {
          console.log(`📐 面積分布: 最小${Math.min(...areas)}㎡ 〜 最大${Math.max(...areas)}㎡`);
          console.log(`📐 面積平均: ${(areas.reduce((a,b) => a+b, 0) / areas.length).toFixed(1)}㎡`);
          console.log(`📐 条件(90-110㎡)該当: ${areas.filter(a => a >= 90 && a <= 110).length}件`);
        }

        if (years.length > 0) {
          console.log(`🏗️ 築年分布: ${Math.min(...years)}年 〜 ${Math.max(...years)}年`);
          console.log(`🏗️ 条件(2010-2020年)該当: ${years.filter(y => y >= 2010 && y <= 2020).length}件`);
        }

        console.log('==== 🔍 Streamlit比較情報 ====');
        console.log('React版結果:', filteredData.length, '件');
        console.log('Streamlit期待値: 68件');
        console.log('差異:', Math.abs(filteredData.length - 68), '件');
      }

      // 表示用データ（グラフ用は全データ、統計用はフィルタ後データ）
      setAllProperties(allData);  // グラフ表示には全データを使用
      setFilteredDataCount(filteredData.length);  // フィルタ後のデータ件数を保存

      // フィルタ後のデータで年ごとの統計を再計算
      const yearlyResults: any[] = [];
      for (let year = fromYear; year <= toYear; year++) {
        const yearData = filteredData.filter(item => item.dataYear === year);

        if (yearData.length > 0) {
          const prices = yearData.map(item => {
            // 取引価格（万円）フィールドがある場合はそのまま使用、ない場合は円から万円に変換
            const price = item['取引価格（万円）'];
            if (price !== undefined && price !== null) {
              return price; // 既に万円単位
            }
            return (item.price || item.取引価格 || 0) / 10000; // 円を万円に変換
          });
          const areas = yearData.map(item => item['延べ床面積（㎡）'] || item.building_area || item.面積 || 0);

          const totalPrice = prices.reduce((sum, price) => sum + price, 0);
          const avgPrice = totalPrice / prices.length;
          const totalArea = areas.reduce((sum, area) => sum + area, 0);
          const avgPricePerSqm = totalArea > 0 ? totalPrice / totalArea : 0;

          yearlyResults.push({
            year: year,
            averagePrice: Math.round(avgPrice),  // 既に万円単位なのでそのまま
            totalTransactions: yearData.length,
            averagePricePerSqm: Math.round(avgPricePerSqm),
            q25: Math.round(getPercentile(prices, 0.25)),  // 既に万円単位なのでそのまま
            q50: Math.round(getPercentile(prices, 0.50)),  // 既に万円単位なのでそのまま
            q75: Math.round(getPercentile(prices, 0.75))   // 既に万円単位なのでそのまま
          });
        }
      }

      console.log('年次集計結果数:', yearlyResults.length);

      // 類似物件分析用の統計（フィルタ済みデータ）
      let similarStats = null;
      if (filteredData.length > 0) {
        const filteredPrices = filteredData.map(item => {
          const price = item['取引価格（万円）'];
          if (price !== undefined && price !== null) {
            return price;
          }
          return (item.price || item.取引価格 || 0) / 10000;
        });
        similarStats = {
          q25: Math.round(getPercentile(filteredPrices, 0.25)),
          q50: Math.round(getPercentile(filteredPrices, 0.50)),
          q75: Math.round(getPercentile(filteredPrices, 0.75)),
          avgPrice: filteredPrices.reduce((sum, price) => sum + price, 0) / filteredPrices.length,
          count: filteredData.length,
          data: filteredData
        };
      }

      // マーケット全体分析用の統計（全データ）
      let marketStats = null;
      if (allData.length > 0) {
        const allPrices = allData.map(item => {
          const price = item['取引価格（万円）'];
          if (price !== undefined && price !== null) {
            return price;
          }
          return (item.price || item.取引価格 || 0) / 10000;
        });
        marketStats = {
          q25: Math.round(getPercentile(allPrices, 0.25)),
          q50: Math.round(getPercentile(allPrices, 0.50)),
          q75: Math.round(getPercentile(allPrices, 0.75)),
          avgPrice: allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length,
          count: allData.length,
          data: allData
        };
      }

      if (similarStats && marketStats) {

        // マーケット全体の価格トレンドを線形回帰で計算（全データベース）
        let marketPriceChange = 0;
        let marketTrendSlope = 0;
        let marketPValue = 1.0;

        // 全データから年次集計を再計算
        const marketYearlyResults: any[] = [];
        for (let year = fromYear; year <= toYear; year++) {
          const yearData = allData.filter(item => item.dataYear === year);
          if (yearData.length > 0) {
            const prices = yearData.map(item => {
              const price = item['取引価格（万円）'];
              if (price !== undefined && price !== null) {
                return price;
              }
              return (item.price || item.取引価格 || 0) / 10000;
            });
            marketYearlyResults.push({
              year: year,
              averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
              count: yearData.length
            });
          }
        }

        if (marketYearlyResults.length >= 2) {
          // 年ごとの平均価格から線形回帰を計算
          const sortedMarketResults = [...marketYearlyResults].sort((a, b) => a.year - b.year);
          const years = sortedMarketResults.map(y => y.year);
          const prices = sortedMarketResults.map(y => y.averagePrice);

          // 簡易的な線形回帰
          const n = years.length;
          const sumX = years.reduce((a, b) => a + b, 0);
          const sumY = prices.reduce((a, b) => a + b, 0);
          const sumXY = years.reduce((a, b, i) => a + b * prices[i], 0);
          const sumX2 = years.reduce((a, b) => a + b * b, 0);

          marketTrendSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

          // 年次成長率を計算 - 前年比較方式（より直感的）
          // 直近2年のデータがあれば前年比を計算
          if (sortedMarketResults.length >= 2) {
            const currentYearData = sortedMarketResults[sortedMarketResults.length - 1];
            const prevYearData = sortedMarketResults[sortedMarketResults.length - 2];

            if (prevYearData.averagePrice > 0) {
              // 前年比の変化率
              const yearOverYearChange = ((currentYearData.averagePrice - prevYearData.averagePrice) / prevYearData.averagePrice) * 100;
              marketPriceChange = yearOverYearChange;

              console.log('価格トレンド（前年比）:', {
                prevYear: prevYearData.year,
                prevYearPrice: prevYearData.averagePrice.toFixed(0) + '万円',
                currentYear: currentYearData.year,
                currentYearPrice: currentYearData.averagePrice.toFixed(0) + '万円',
                yearOverYearChange: yearOverYearChange.toFixed(1) + '%'
              });
            }
          }

          // 代替案：全期間の単純平均成長率
          // if (sortedMarketResults.length >= 2) {
          //   const totalGrowth = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
          //   const yearSpan = years[years.length - 1] - years[0];
          //   marketPriceChange = totalGrowth / yearSpan;  // 単純平均
          // }

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
          marketPValue = tStat >= 2.0 ? 0.01 : 0.5;

          // avgPriceを計算
          const avgPrice = sumY / n;

          // デバッグ用出力（詳細版）
          console.log('マーケット価格トレンド分析:', {
            years,
            prices,
            rawPriceChange: marketPriceChange,
            trendSlope: marketTrendSlope,
            avgPrice: avgPrice,
            r,
            r2,
            tStat,
            pValue: marketPValue,
            isSignificant: marketPValue < 0.05,
            finalPriceChange: marketPValue >= 0.05 ? 0 : marketPriceChange,
            yearlyResults: sortedMarketResults
          });
        }

        // 統計的有意性に基づいて価格変動を調整（Streamlitと同じロジック）
        if (marketPValue >= 0.05) {
          // 統計的に有意でない場合は0%とする
          marketPriceChange = 0;
        }

        // クラスタリング分析の準備（類似物件用とマーケット全体用）
        const similarClusters = performSimpleClustering(filteredData);
        const marketClusters = performSimpleClustering(allData);

        const newMarketData = {
          prefecture: selectedPrefecture,
          city: selectedCity,
          district: selectedDistrict || '全体',

          // 類似物件分析（フィルタ済み）
          similar: {
            averagePrice: Math.round(similarStats.avgPrice),
            q25: similarStats.q25,
            q50: similarStats.q50,
            q75: similarStats.q75,
            count: similarStats.count,
            clusters: similarClusters
          },

          // マーケット全体分析（全データ）
          market: {
            averagePrice: Math.round(marketStats.avgPrice),
            priceChange: marketPriceChange,
            q25: marketStats.q25,
            q50: marketStats.q50,
            q75: marketStats.q75,
            count: marketStats.count,
            clusters: marketClusters,
            yearlyData: marketYearlyResults
          },

          // 互換性のため残す（後で削除予定）
          averagePrice: Math.round(similarStats.avgPrice),
          priceChange: marketPriceChange,
          totalTransactions: filteredData.length,
          averagePricePerSqm: 0,
          yearlyData: yearlyResults,
          clusters: similarClusters,
          q25: similarStats.q25,
          q50: similarStats.q50,
          q75: similarStats.q75,
          similarPropertiesCount: filteredData.length
        };
        setMarketData(newMarketData);

        // 統計分析を実行（フロントエンドで計算）
        // filteredDataの価格を万円単位に統一
        const filteredPricesInMan = filteredData.map(d => {
          // 既に万円単位の場合はそのまま、円単位の場合は変換
          const price = d['取引価格（万円）'] || (d.price ? d.price / 10000 : 0) || (d.取引価格 ? d.取引価格 / 10000 : 0);
          return price;
        });

        // 価格範囲内の物件数を計算
        const priceRangeCount = filteredPricesInMan.filter(price => price >= similarStats.q25 && price <= similarStats.q75).length;
        const priceRange = {
          min: similarStats.q25,
          max: similarStats.q75,
          count: priceRangeCount,
          percentage: filteredData.length > 0 ? Math.round((priceRangeCount / filteredData.length) * 100) : 0
        };

        // 面積と築年数の影響を計算（価格も万円単位に統一）
        const getPriceInMan = (d: any) => {
          return d['取引価格（万円）'] || (d.price ? d.price / 10000 : 0) || (d.取引価格 ? d.取引価格 / 10000 : 0);
        };

        const area100 = filteredData.filter(d => {
          const area = d.area || d.延床面積 || d['延床面積（㎡）'] || 0;
          return area >= 95 && area <= 105;
        });
        const area120 = filteredData.filter(d => {
          const area = d.area || d.延床面積 || d['延床面積（㎡）'] || 0;
          return area >= 115 && area <= 125;
        });
        const areaImpact = area120.length > 0 && area100.length > 0 ?
          Math.round((calculateAverage(area120.map(getPriceInMan)) - calculateAverage(area100.map(getPriceInMan))) / 10) * 10 : 0;

        const year5 = filteredData.filter(d => {
          const builtYear = d.built_year || d.建築年 || d['建築年'] || 0;
          return builtYear > 0 && currentYear - builtYear <= 5;
        });
        const year10 = filteredData.filter(d => {
          const builtYear = d.built_year || d.建築年 || d['建築年'] || 0;
          return builtYear > 0 && currentYear - builtYear >= 8 && currentYear - builtYear <= 12;
        });
        const yearImpact = year5.length > 0 && year10.length > 0 ?
          Math.round((calculateAverage(year5.map(getPriceInMan)) - calculateAverage(year10.map(getPriceInMan))) / 10) * 10 : 0;

        // キーポイントの生成（データがある場合のみ）
        const keyPoints = [];

        // 価格分布のポイント
        if (priceRange.count > 0) {
          keyPoints.push(`価格帯の中心は${priceRange.min}〜${priceRange.max}万円（全体の${priceRange.percentage}%）`);
        } else if (filteredData.length > 0) {
          const avgPrice = Math.round(calculateAverage(filteredPricesInMan));
          keyPoints.push(`平均価格は約${avgPrice}万円`);
        }

        // 面積による影響
        if (areaImpact !== 0 && area100.length > 0 && area120.length > 0) {
          keyPoints.push(`面積20㎡の差で約${Math.abs(areaImpact)}万円${areaImpact > 0 ? '上昇' : '下落'}`);
        } else if (filteredData.length > 10) {
          keyPoints.push(`面積による価格差は限定的`);
        }

        // 築年数による影響
        if (yearImpact !== 0 && year5.length > 0 && year10.length > 0) {
          keyPoints.push(`築5年と築10年で約${Math.abs(yearImpact)}万円${yearImpact < 0 ? '下落' : 'の差'}`);
        } else if (filteredData.length > 10) {
          keyPoints.push(`築年数による価格差は限定的`);
        }

        // キーポイントが不足している場合の追加情報
        if (keyPoints.length === 0) {
          keyPoints.push(`分析対象物件数: ${filteredData.length}件`);
          if (similarStats) {
            keyPoints.push(`中央値: ${similarStats.q50}万円`);
          }
        }

        // ML分析の実行（地域データが5件以上ある場合）
        // AI市場分析には地域フィルタのみ適用（面積・築年数フィルタはスキップ）
        const mlAnalysisData = allData;  // 地域・物件種別のみでフィルタされたデータ
        setMlDataCount(mlAnalysisData.length);  // ML分析用データ件数を保存

        if (mlAnalysisData.length >= 5 && !isMLAnalyzing) {
          setIsMLAnalyzing(true);
          try {
            console.log('ML分析開始:');
            console.log(`  - ML分析用データ: ${mlAnalysisData.length}件（地域フィルタのみ）`);
            console.log(`  - 表示用データ: ${filteredData.length}件（面積・築年数フィルタ適用）`);
            console.log('送信データサンプル:', mlAnalysisData.slice(0, 2));
            console.log('送信データ全体構造:', JSON.stringify(mlAnalysisData.slice(0, 1), null, 2));

            // 地域全体のML分析
            const mlResponse = await propertyApi.simpleMLAnalysis(mlAnalysisData);
            console.log('ML分析レスポンス:', mlResponse);

            // フィルタ条件でのML分析（Viteプロキシ問題解決済み）
            let filteredMLResult = null;
            // フィルタデータが全データと異なる場合のみ分析
            const isFilteredDifferent = filteredData.length !== mlAnalysisData.length;

            if (isFilteredDifferent && filteredData.length >= 5) {
              try {
                console.log('フィルタ条件ML分析開始:', filteredData.length, '件');
                const filteredMLResponse = await propertyApi.simpleMLAnalysis(filteredData);
                if (filteredMLResponse.status === 'success' && filteredMLResponse.data) {
                  filteredMLResult = filteredMLResponse.data;
                  console.log('フィルタ条件ML分析結果:', filteredMLResult);
                }
              } catch (err) {
                console.error('フィルタ条件ML分析エラー:', err);
              }
            } else if (!isFilteredDifferent) {
              console.log('フィルタ条件ML分析スキップ: 全データと同じ');
            } else {
              console.log('フィルタ条件ML分析スキップ: データ件数', filteredData.length, '件（5件未満）');
            }

            if (mlResponse.status === 'success' && mlResponse.data) {
              // 両方の結果を保存
              setMlAnalysisResult({
                ...mlResponse.data,
                filtered: filteredMLResult  // フィルタ条件の結果を追加
              });
              console.log('ML分析結果セット完了');
              console.log('ML分析結果の内容:', mlResponse.data);
              console.log('フィルタ条件ML分析結果:', filteredMLResult);
              console.log('データ構造確認 - clustering:', mlResponse.data.clustering);
              console.log('データ構造確認 - regression:', mlResponse.data.regression);
              console.log('データ構造確認 - anomaly_detection:', mlResponse.data.anomaly_detection);
              console.log('filteredDataCount:', filteredData.length);
            } else {
              console.error('ML分析エラー: レスポンスステータス異常', mlResponse);
            }
          } catch (error: any) {
            console.error('ML分析エラー詳細:', error);
            console.error('エラーメッセージ:', error.message);
            console.error('エラースタック:', error.stack);
            // エラー時にもレスポンスがあるか確認
            if (error.response) {
              console.error('エラーレスポンス:', error.response);
            }
            // エラー時にエラーメッセージを設定
            setMlAnalysisResult({
              error: true,
              message: 'ML分析でエラーが発生しました。しばらくしてから再度お試しください。'
            });
          } finally {
            setIsMLAnalyzing(false);
          }
        } else {
          // データが5件未満の場合
          console.log(`ML分析スキップ: データ件数が${mlAnalysisData.length}件で5件未満`);
        }

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
        // データが少ない場合は、フィルタなしのデータで表示
        if (allData.length > 0) {
          console.log('フィルタ条件が厳しすぎるため、全データで表示します');

          const allPrices = allData.map(item => {
            // 取引価格（万円）フィールドがある場合はそのまま使用、ない場合は円から万円に変換
            const price = item['取引価格（万円）'];
            if (price !== undefined && price !== null) {
              return price; // 既に万円単位
            }
            return (item.price || item.取引価格 || 0) / 10000; // 円を万円に変換
          });
          const q25 = Math.round(getPercentile(allPrices, 0.25));
          const q50 = Math.round(getPercentile(allPrices, 0.50));
          const q75 = Math.round(getPercentile(allPrices, 0.75));
          const avgPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

          setMarketData({
            prefecture: selectedPrefecture,
            city: selectedCity,
            district: selectedDistrict || '全体',
            averagePrice: Math.round(avgPrice),
            priceChange: 0,
            totalTransactions: allData.length,
            averagePricePerSqm: 0,
            yearlyData: [],
            clusters: performSimpleClustering(allData),
            q25: q25,
            q50: q50,
            q75: q75,
            similarPropertiesCount: allData.length
          });
        } else {
          setError('該当するデータが見つかりませんでした。条件を変更して再度お試しください。');
        }
      }
    } catch (err) {
      console.error('分析エラー:', err);
      setError('分析中にエラーが発生しました');
    } finally {
      // プログレスを100%にしてから終了
      clearInterval(progressInterval);
      setLoadingProgress(100);

      // 少し待ってからローディングを終了
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  // パーセンタイル計算
  const getPercentile = (arr: number[], percentile: number) => {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile);
    return sorted[index] || 0;
  };

  // 取引時期を月表示に変換
  const formatTradePeriod = (property: any): string => {
    // dataYearとdataQuarterがある場合
    if (property.dataYear && property.dataQuarter) {
      const year = property.dataYear;
      const quarter = property.dataQuarter;
      const monthRanges: { [key: number]: string } = {
        1: '1〜3月',
        2: '4〜6月',
        3: '7〜9月',
        4: '10〜12月'
      };
      return `${year}年${monthRanges[quarter] || ''}`;
    }

    // 取引時期が文字列で入っている場合
    const tradePeriod = property.trade_period || property.取引時期 || '';

    // 「2024年第1四半期」のパターンを変換
    const quarterMatch = tradePeriod.match(/(\d{4})年第(\d)四半期/);
    if (quarterMatch) {
      const year = quarterMatch[1];
      const quarter = parseInt(quarterMatch[2]);
      const monthRanges: { [key: number]: string } = {
        1: '1〜3月',
        2: '4〜6月',
        3: '7〜9月',
        4: '10〜12月'
      };
      return `${year}年${monthRanges[quarter] || ''}`;
    }

    // その他の形式はそのまま返す
    return tradePeriod;
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

  // 分析タイトルを生成する関数
  const generateAnalysisTitle = (isFiltered: boolean = false) => {
    // 都道府県名、市区町村名、町名を取得
    const prefName = prefectures.find(p => p.code === selectedPrefecture)?.name || '';
    const cityName = cities.find(c => c.code === selectedCity)?.name || '';
    const districtName = districts.find(d => d.code === selectedDistrict)?.name || selectedDistrict || '';

    // 物件種別を取得
    const propertyTypeName = selectedPropertyType === '01' ? '土地' :
                            selectedPropertyType === '02' ? '戸建' :
                            selectedPropertyType === '07' ? 'マンション' : '物件';

    // フィルタ条件付きの場合
    if (isFiltered) {
      const areaLabel = isLand ? '土地面積' : '延床面積';
      // 基本のタイトル
      let title = `${prefName}${cityName}${districtName}の${propertyTypeName}価格分布 | ${areaLabel}${targetArea}±${areaTolerance}㎡`;

      // 土地以外の場合は築年数も追加
      if (!isLand) {
        title += ` | 築年数${targetYear}±${yearTolerance}年`;
      }
      return title;
    } else {
      // 地域全体の分析
      return `${prefName}${cityName}${districtName}${propertyTypeName}全体の分析`;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Gray out overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          {/* Loading content */}
          <div className="relative bg-white rounded-xl p-8 shadow-2xl max-w-md mx-4">
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-12 w-12 text-blue-600 animate-spin" />
              <div className="text-center w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI市場分析を実行中
                </h3>
                <p className="text-gray-600">
                  1分〜3分ぐらいかかる場合もあります
                </p>

                {/* プログレスバー */}
                <div className="w-full mt-4 mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full relative overflow-hidden transition-all duration-500 ease-out"
                      style={{
                        width: `${loadingProgress}%`
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        style={{
                          animation: 'shimmer 1.5s ease-in-out infinite'
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round(loadingProgress)}%
                  </p>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  しばらくお待ちください...
                </p>
              </div>
            </div>

            {/* CSS アニメーション */}
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        </div>
      )}

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
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={!selectedPrefecture || isCitiesLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {isCitiesLoading ? '読み込み中...' : '選択してください'}
                      </option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.code}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {isCitiesLoading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Loader className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 地区名（任意） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地区名 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedCity || districts.length === 0 || isDistrictsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {isDistrictsLoading ? '読み込み中...' : districts.length === 0 && selectedCity ? '地区なし' : '選択してください'}
                      </option>
                      {districts.map((district) => (
                        <option key={district.name} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {isDistrictsLoading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Loader className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
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

                {/* 希望面積（延床面積/土地面積） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="inline h-4 w-4 mr-1" />
                    {isLand ? '希望土地面積' : '希望延床面積'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={targetArea}
                    onChange={(e) => setTargetArea(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="0">選択してください</option>
                    <option value="50">50㎡</option>
                    <option value="60">60㎡</option>
                    <option value="70">70㎡</option>
                    <option value="80">80㎡</option>
                    <option value="90">90㎡</option>
                    <option value="100">100㎡</option>
                    <option value="110">110㎡</option>
                    <option value="120">120㎡</option>
                    <option value="130">130㎡</option>
                    <option value="140">140㎡</option>
                    <option value="150">150㎡</option>
                    <option value="160">160㎡</option>
                    <option value="170">170㎡</option>
                    <option value="180">180㎡</option>
                    <option value="190">190㎡</option>
                    <option value="200">200㎡</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">±{areaTolerance}㎡の範囲で検索</p>
                </div>

                {/* 建築年（土地の場合は非表示） */}
                {!isLand && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      建築年 <span className="text-red-500">*</span>
                    </label>
                    <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="0">選択してください</option>
                    {Array.from({length: new Date().getFullYear() - 1980 + 1}, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">±{yearTolerance}年の範囲で検索</p>
                  </div>
                )}
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
                  AI市場分析を実行中
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

            {/* ML分析結果の表示 */}
            {console.log('ML分析表示判定: mlDataCount=', mlDataCount, 'mlAnalysisResult=', mlAnalysisResult)}
            {mlDataCount < 5 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI機械学習による市場分析</h2>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    機械学習分析を実行するには、最低5件以上のデータが必要です。
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    現在のデータ件数: {filteredDataCount}件
                  </p>
                  <p className="text-sm text-gray-600">
                    検索条件（エリア、面積、築年数の範囲）を広げてデータ件数を増やしてください。
                  </p>
                </div>
              </div>
            ) : mlAnalysisResult ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  🤖 AI機械学習による市場分析
                </h2>

                {/* クラスタリング分析 */}
                {mlAnalysisResult.clustering && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      📊 価格グループ分析
                    </h3>

                    {/* 地域全体の分析タイトル */}
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                      {generateAnalysisTitle(false)}
                      {mlDataCount > mlAnalysisResult.clustering.clusters.reduce((sum: number, cluster: any) => sum + cluster.size, 0) && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          （価格が大きく外れた物件{mlDataCount - mlAnalysisResult.clustering.clusters.reduce((sum: number, cluster: any) => sum + cluster.size, 0)}件をIQR法により除外）
                        </span>
                      )}
                    </h2>

                    {/* 地域全体の分析 */}
                    <div className="flex gap-4 mb-4">
                      {/* サンプル数ボックス */}
                      <div className="bg-blue-50 rounded-lg p-4 flex-shrink-0">
                        <div className="text-sm text-blue-700 font-medium">分析サンプル数</div>
                        <div className="text-3xl font-bold text-blue-900 mt-1">
                          {mlAnalysisResult.clustering.clusters.reduce((sum: number, cluster: any) => sum + cluster.size, 0)}
                          <span className="text-lg font-normal">件</span>
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                        </div>
                      </div>

                      {/* クラスタグリッド */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        {mlAnalysisResult.clustering.clusters.map((cluster: any) => (
                          <div key={cluster.cluster_id} className="bg-gray-50 rounded-lg p-4">
                            <div className="font-semibold text-gray-800">{cluster.name}</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">
                              {cluster.avg_price.toLocaleString()}万円
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                              <p>物件数: {cluster.size}件 ({cluster.percentage}%) / {cluster.characteristics}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* フィルタ条件での分析 */}
                    {mlAnalysisResult.filtered && mlAnalysisResult.filtered.clustering && (
                      <>
                        {/* フィルタ条件付きの分析タイトル */}
                        <h2 className="text-lg font-semibold text-gray-700 mb-2 pt-4 border-t border-gray-200 mt-4">
                          {generateAnalysisTitle(true)}
                        </h2>

                        <div className="flex gap-4">
                          {/* サンプル数ボックス */}
                          <div className="bg-green-50 rounded-lg p-4 flex-shrink-0">
                            <div className="text-sm text-green-700 font-medium">フィルタ条件</div>
                            <div className="text-3xl font-bold text-green-900 mt-1">
                              {filteredDataCount}
                              <span className="text-lg font-normal">件</span>
                            </div>
                          </div>

                          {/* フィルタ条件のクラスタグリッド */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                          {mlAnalysisResult.filtered.clustering.clusters.map((cluster: any) => (
                            <div key={cluster.cluster_id} className="bg-gray-50 rounded-lg p-4">
                              <div className="font-semibold text-gray-800">{cluster.name}</div>
                              <div className="text-2xl font-bold text-gray-900 mt-1">
                                {cluster.avg_price.toLocaleString()}万円
                              </div>
                              <div className="text-sm text-gray-600 mt-2">
                                <p>物件数: {cluster.size}件 ({cluster.percentage}%) / {cluster.characteristics}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  </div>
                )}

                {/* 価格傾向分析 */}
                {mlAnalysisResult.regression && (
                  <div className="mb-6">
                    {/* 価格傾向分析 */}
                    {mlAnalysisResult.regression && !mlAnalysisResult.regression.error && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">📈 {isLand ? '土地面積' : '面積・築年数'}による価格影響</h3>
                        {mlDataCount < 20 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-yellow-800">
                              ⚠️ 分析対象が{mlDataCount}件と少ないため、傾向は参考程度としてご覧ください
                            </p>
                          </div>
                        )}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {mlAnalysisResult.regression.coefficients.area && (
                              <div>
                                <p className="text-2xl font-bold text-gray-900">
                                  {mlAnalysisResult.regression.coefficients.area > 0 ? '+' : ''}
                                  {mlAnalysisResult.regression.coefficients.area.toFixed(1)}万円/㎡
                                  <span className="text-sm text-gray-900 font-normal ml-2">
                                    {isLand
                                      ? `(100㎡と150㎡では約${Math.abs(mlAnalysisResult.regression.coefficients.area * 50).toFixed(0)}万円の差)`
                                      : `(80㎡と100㎡では約${Math.abs(mlAnalysisResult.regression.coefficients.area * 20).toFixed(0)}万円の差)`
                                    }
                                  </span>
                                </p>
                              </div>
                            )}
                            {!isLand && mlAnalysisResult.regression.coefficients.age && (
                              <div>
                                <p className="text-2xl font-bold text-gray-900">
                                  {mlAnalysisResult.regression.coefficients.age > 0 ? '+' : ''}
                                  {mlAnalysisResult.regression.coefficients.age.toFixed(1)}万円/年
                                  <span className="text-sm text-gray-900 font-normal ml-2">
                                    (築5年と築15年では約{Math.abs(mlAnalysisResult.regression.coefficients.age * 10).toFixed(0)}万円の差)
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 border-t pt-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-base font-medium text-gray-700">AI機械学習の予測精度:</span>
                              {mlAnalysisResult.regression.r_squared < 0.3 ? (
                                <span className="text-base text-orange-600 font-bold">
                                  参考程度（データのばらつきが大きい）
                                </span>
                              ) : mlAnalysisResult.regression.r_squared < 0.7 ? (
                                <span className="text-base text-yellow-600 font-bold">
                                  中程度（ある程度の傾向あり）
                                </span>
                              ) : (
                                <span className="text-base text-green-600 font-bold">
                                  高い（明確な傾向あり）
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-700 mt-2 leading-relaxed">
                              <span className="font-medium">R²={(mlAnalysisResult.regression.r_squared * 100).toFixed(1)}%</span> — 価格の約{(mlAnalysisResult.regression.r_squared * 100).toFixed(0)}%が{isLand ? '土地面積' : '面積・築年数'}と関連、残りは立地等の他要因
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 border-t pt-3 mt-4">
                  <p>※機械学習アルゴリズム（K-means、線形回帰）による分析結果</p>
                  <p>※統計的な外れ値（極端に高額・低額な物件）は自動的に除外して分析しています</p>
                  <p>※予測モデルは参考値であり、実際の取引価格を保証するものではありません</p>
                </div>
              </div>
            ) : null}

            {/* ML分析中の表示 */}
            {isMLAnalyzing && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">機械学習分析を実行中...</span>
                </div>
              </div>
            )}

            {/* AI類似物件分析セクション - 一時的に非表示 */}
            {false && (
              <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📊 AI類似物件分析
              <span className="text-sm font-normal text-gray-600 ml-2">
                （あなたの条件に合う物件）
              </span>
            </h2>

            {/* 類似物件の価格分布 */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-700 mb-4">
                🎯 **{(() => {
                  const prefName = prefectures.find(p => p.code === selectedPrefecture)?.name || selectedPrefecture;
                  const cityName = cities.find(c => c.code === selectedCity)?.name || '';
                  const districtName = selectedDistrict || '';
                  return `${prefName}${cityName}${districtName}`;
                })()}の{selectedPropertyType === '01' ? '土地' : selectedPropertyType === '02' ? '戸建て' : 'マンション'}価格分布 | {isLand ? `土地面積${targetArea}±${areaTolerance}㎡` : `延床面積${targetArea}±${areaTolerance}㎡・築年数${targetYear}±${yearTolerance}年`}**
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">取引件数</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.similarPropertiesCount || 0}件
                  </p>
                  <p className="text-xs text-gray-500 mt-1">指定条件に該当する物件数</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">下位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}万円以下
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    類似物件の25%がこの価格以下<br/>
                    {marketData.similarPropertiesCount ? `${marketData.similarPropertiesCount}件中${Math.round(marketData.similarPropertiesCount * 0.25)}件` : ''}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">中央値レンジ</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q25?.toLocaleString() || 0}〜{marketData.q75?.toLocaleString() || 0}万円
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    類似物件の50%がこの範囲内<br/>
                    {marketData.similarPropertiesCount ? `${marketData.similarPropertiesCount}件中${Math.round(marketData.similarPropertiesCount * 0.5)}件` : ''}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">上位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.q75?.toLocaleString() || 0}万円以上
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    類似物件の25%がこの価格以上<br/>
                    {marketData.similarPropertiesCount ? `${marketData.similarPropertiesCount}件中${Math.round(marketData.similarPropertiesCount * 0.25)}件` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* マーケット分析セクション - 地域全体の分析 */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📊 **{(() => {
                const prefName = prefectures.find(p => p.code === selectedPrefecture)?.name || selectedPrefecture;
                const cityName = cities.find(c => c.code === selectedCity)?.name || '';
                const districtName = selectedDistrict || '';
                const propertyType = selectedPropertyType === '02' ? '戸建' : 'マンション';
                return `${prefName}${cityName}${districtName}の${propertyType}全体の分析`;
              })()}**
            </h3>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 取引件数 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">取引件数</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.market.count}件
                  </p>
                  <p className="text-xs text-gray-500 mt-1">地域全体の物件数</p>
                </div>

                {/* 下位25% */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">下位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.market.q25?.toLocaleString() || 0}万円以下
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    地域全体の25%がこの価格以下<br/>
                    {marketData.market.count ? `${marketData.market.count}件中${Math.round(marketData.market.count * 0.25)}件` : ''}
                  </p>
                </div>

                {/* 中央値レンジ */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">中央値レンジ</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.market.q25?.toLocaleString() || 0}〜{marketData.market.q75?.toLocaleString() || 0}万円
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    地域全体の50%がこの範囲内<br/>
                    {marketData.market.count ? `${marketData.market.count}件中${Math.round(marketData.market.count * 0.5)}件` : ''}<br/>
                    中央値: {marketData.market.q50?.toLocaleString() || 0}万円
                  </p>
                </div>

                {/* 上位25% */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">上位25%</div>
                  <p className="text-2xl font-bold text-gray-900">
                    {marketData.market.q75?.toLocaleString() || 0}万円以上
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    地域全体の25%がこの価格以上<br/>
                    {marketData.market.count ? `${marketData.market.count}件中${Math.round(marketData.market.count * 0.25)}件` : ''}
                  </p>
                </div>
              </div>
            </div>



              </>
            )}

            {/* 類似物件の詳細表 */}
            {false && marketData && marketData.similarPropertiesCount > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 類似物件の取引事例</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">No.</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">所在地</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">取引時期</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">取引価格</th>
                        {!isLand && <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">建築年</th>}
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">{isLand ? '土地面積(㎡)' : '土地面積(㎡)'}</th>
                        {!isLand && <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">延床面積(㎡)</th>}
                        {!isLand && <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">間取り</th>}
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">前面道路</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allProperties
                        .filter(item => {
                          // フィルタ条件に合致する物件のみ表示
                          const area = getArea(item);
                          const areaMatch = area >= targetArea - areaTolerance && area <= targetArea + areaTolerance;

                          // 土地の場合は面積のみでフィルタ
                          if (isLand) {
                            return areaMatch;
                          }

                          // 建物の場合は面積と築年数でフィルタ
                          const buildYear = getBuildYear(item);
                          const yearMatch = buildYear >= targetYear - yearTolerance && buildYear <= targetYear + yearTolerance;
                          return areaMatch && yearMatch;
                        })
                        .sort((a, b) => {
                          // 取引時期で降順ソート（最新順）
                          // dataYearとdataQuarterがある場合はそれを使用
                          if (a.dataYear && b.dataYear) {
                            if (a.dataYear !== b.dataYear) {
                              return b.dataYear - a.dataYear;
                            }
                            return (b.dataQuarter || 0) - (a.dataQuarter || 0);
                          }
                          // 取引時期の文字列で比較
                          const periodA = a.trade_period || a.取引時期 || '';
                          const periodB = b.trade_period || b.取引時期 || '';
                          return periodB.localeCompare(periodA);
                        })
                        .slice(0, 10)
                        .map((property, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{property.location || property.所在地 || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatTradePeriod(property)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {(() => {
                                const price = property['取引価格（万円）'];
                                if (price !== undefined && price !== null) {
                                  return price.toLocaleString(); // 既に万円単位
                                }
                                return ((property.price || property.取引価格 || 0) / 10000).toLocaleString(); // 円を万円に変換
                              })()}万円
                            </td>
                            {!isLand && <td className="px-4 py-3 text-sm text-gray-900">{getBuildYear(property)}年</td>}
                            <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(isLand ? getArea(property) : (property.land_area || property.土地面積 || 0))}</td>
                            {!isLand && <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(property['延べ床面積（㎡）'] || property.building_area || property.面積 || 0)}</td>}
                            {!isLand && <td className="px-4 py-3 text-sm text-gray-900">{property.floor_plan || property.間取り || '-'}</td>}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">1. {isLand ? '土地面積' : '延べ床'}と価格</h3>
                  <Plot
                    data={[
                      {
                        x: allProperties
                          .filter(p => getArea(p) > 0)
                          .filter(p => Math.abs(getArea(p) - targetArea) > areaTolerance)
                          .map(p => getArea(p)),
                        y: allProperties
                          .filter(p => getArea(p) > 0)
                          .filter(p => Math.abs(getArea(p) - targetArea) > areaTolerance)
                          .map(p => {
                            const price = p['取引価格（万円）'];
                            return price !== undefined && price !== null ? price : (p.price || p.取引価格 || 0) / 10000;
                          }),
                        mode: 'markers',
                        type: 'scatter',
                        name: 'その他',
                        marker: {
                          color: '#4169E1',
                          size: 8,
                          opacity: 0.6,
                          line: { color: '#000080', width: 0.5 }
                        },
                        customdata: allProperties
                          .filter(p => getArea(p) > 0)
                          .filter(p => Math.abs(getArea(p) - targetArea) > areaTolerance)
                          .map(p => [
                            formatTradePeriod(p),
                            Math.floor(p.land_area || p.土地面積 || 0),
                            p.floor_plan || p.間取り || '-',
                            `${p.road_type || p.前面道路 || ''} ${p.breadth || p.道路幅員 || ''}m`.trim()
                          ]),
                        hovertemplate: isLand ?
                          '取引時期: %{customdata[0]}<br>土地面積: %{x}㎡<br>間取り: %{customdata[2]}<br>前面道路: %{customdata[3]}<br>価格: %{y:,.0f}万円<extra></extra>' :
                          '取引時期: %{customdata[0]}<br>土地面積: %{customdata[1]}㎡<br>延べ床面積: %{x}㎡<br>間取り: %{customdata[2]}<br>前面道路: %{customdata[3]}<br>価格: %{y:,.0f}万円<extra></extra>'
                      },
                      {
                        x: allProperties
                          .filter(p => getArea(p) > 0)
                          .filter(p => Math.abs(getArea(p) - targetArea) <= areaTolerance)
                          .map(p => getArea(p)),
                        y: allProperties
                          .filter(p => getArea(p) > 0)
                          .filter(p => Math.abs(getArea(p) - targetArea) <= areaTolerance)
                          .map(p => {
                            const price = p['取引価格（万円）'];
                            return price !== undefined && price !== null ? price : (p.price || p.取引価格 || 0) / 10000;
                          }),
                        mode: 'markers',
                        type: 'scatter',
                        name: `${targetArea}±${areaTolerance}㎡`,
                        marker: {
                          color: '#FF4500',
                          size: 12,
                          opacity: 0.8,
                          line: { color: '#8B0000', width: 1 }
                        },
                        customdata: allProperties
                          .filter(p => getArea(p) > 0)
                          .filter(p => Math.abs(getArea(p) - targetArea) > areaTolerance)
                          .map(p => [
                            formatTradePeriod(p),
                            Math.floor(p.land_area || p.土地面積 || 0),
                            p.floor_plan || p.間取り || '-',
                            `${p.road_type || p.前面道路 || ''} ${p.breadth || p.道路幅員 || ''}m`.trim()
                          ]),
                        hovertemplate: isLand ?
                          '取引時期: %{customdata[0]}<br>土地面積: %{x}㎡<br>間取り: %{customdata[2]}<br>前面道路: %{customdata[3]}<br>価格: %{y:,.0f}万円<extra></extra>' :
                          '取引時期: %{customdata[0]}<br>土地面積: %{customdata[1]}㎡<br>延べ床面積: %{x}㎡<br>間取り: %{customdata[2]}<br>前面道路: %{customdata[3]}<br>価格: %{y:,.0f}万円<extra></extra>'
                      }
                    ]}
                    layout={{
                      xaxis: {
                        title: { text: isLand ? '土地面積（㎡）' : '延床面積（㎡）', font: { size: 14, color: 'black' } },
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
                  <div className="text-xs text-gray-500 mt-2">
                    ※統計的な外れ値（極端に高額・低額な物件）は自動的に除外して分析しています
                  </div>
                </div>

                {/* 2. 延床面積別価格分布ヒートマップ */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">2. {isLand ? '土地面積' : '延床面積'}別価格分布</h3>
                  {(() => {
                    // 価格帯と面積帯を定義（価格帯を低い順に）
                    const priceBins = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
                    const areaBins = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

                    // データをビンに分類してカウント
                    const heatmapData: number[][] = [];
                    const priceLabels: string[] = [];
                    const areaLabels: string[] = [];

                    for (let i = 0; i < priceBins.length - 1; i++) {
                      if (i === priceBins.length - 2) {
                        priceLabels.push(`${priceBins[i].toLocaleString()}万円~`);
                      } else {
                        priceLabels.push(`${priceBins[i].toLocaleString()}万円`);
                      }

                      const row: number[] = [];
                      for (let j = 0; j < areaBins.length - 1; j++) {
                        if (i === 0) {
                          areaLabels.push(`${areaBins[j]}`);
                        }
                        const count = allProperties.filter(p => {
                          const price = p['取引価格（万円）'] !== undefined && p['取引価格（万円）'] !== null
                            ? p['取引価格（万円）']
                            : (p.price || p.取引価格 || 0) / 10000;
                          const area = getArea(p);
                          return price >= priceBins[i] && price < priceBins[i + 1] &&
                                 area >= areaBins[j] && area < areaBins[j + 1];
                        }).length;
                        row.push(count);
                      }
                      heatmapData.push(row);
                    }

                    // データとラベルを逆順にして、下が0、上が高い価格になるようにする
                    heatmapData.reverse();
                    priceLabels.reverse();

                    return (
                      <Plot
                        data={[
                          {
                            z: heatmapData,
                            x: areaLabels,
                            y: priceLabels,
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
                            title: { text: isLand ? '土地面積(㎡)' : '延床面積(㎡)', font: { size: 14, color: 'black' } },
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
                            linecolor: 'black',
                            autorange: 'reversed'  // Y軸を反転して下が0、上が高い値になるようにする
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
                  <div className="text-xs text-gray-500 mt-2">
                    ※統計的な外れ値（極端に高額・低額な物件）は自動的に除外して分析しています
                  </div>
                </div>

                {/* 3. 建築年別価格分布（土地の場合は非表示） */}
                {!isLand && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 建築年別価格分布</h3>
                  <Plot
                    data={[
                      {
                        x: allProperties
                          .filter(p => getBuildYear(p) > 1950 && getBuildYear(p) <= 2025)
                          .filter(p => Math.abs(getBuildYear(p) - targetYear) > yearTolerance)
                          .map(p => getBuildYear(p)),
                        y: allProperties
                          .filter(p => getBuildYear(p) > 1950 && getBuildYear(p) <= 2025)
                          .filter(p => Math.abs(getBuildYear(p) - targetYear) > yearTolerance)
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
                          .filter(p => getBuildYear(p) > 1950 && getBuildYear(p) <= 2025)
                          .filter(p => Math.abs(getBuildYear(p) - targetYear) <= yearTolerance)
                          .map(p => getBuildYear(p)),
                        y: allProperties
                          .filter(p => getBuildYear(p) > 1950 && getBuildYear(p) <= 2025)
                          .filter(p => Math.abs(getBuildYear(p) - targetYear) <= yearTolerance)
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
                  <div className="text-xs text-gray-500 mt-2">
                    ※統計的な外れ値（極端に高額・低額な物件）は自動的に除外して分析しています
                  </div>
                  </div>
                )}

                {/* 4. 建築年別価格分布（ヒートマップ）（土地の場合は非表示） */}
                {!isLand && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">4. 建築年別価格分布（ヒートマップ）</h3>
                  {(() => {
                    const validYearData = allProperties.filter(p => {
                      const year = getBuildYear(p);
                      return year > 1950 && year <= 2025;
                    });

                    if (validYearData.length === 0) {
                      return <div className="text-center text-gray-500 py-8">建築年データがありません</div>;
                    }

                    const minYear = Math.floor(Math.min(...validYearData.map(p => getBuildYear(p))) / 5) * 5;
                    const maxYear = Math.ceil(Math.max(...validYearData.map(p => getBuildYear(p))) / 5) * 5;
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
                          const year = getBuildYear(p);
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
                            colorscale: [
                              [0, '#ffffff'],
                              [0.2, '#ffe4cc'],
                              [0.4, '#ffcc99'],
                              [0.6, '#ffb366'],
                              [0.8, '#ff9933'],
                              [1, '#ff6600']
                            ],
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
                  <div className="text-xs text-gray-500 mt-2">
                    ※統計的な外れ値（極端に高額・低額な物件）は自動的に除外して分析しています
                  </div>
                  </div>
                )}

                {/* 成約件数推移 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{isLand ? '3' : '5'}. 成約件数推移</h3>
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
                      if (period.includes('第1四半期')) return year + '<br><span style="font-size:12px">1月〜3月</span>';
                      if (period.includes('第2四半期')) return year + '<br><span style="font-size:12px">4月〜6月</span>';
                      if (period.includes('第3四半期')) return year + '<br><span style="font-size:12px">7月〜9月</span>';
                      if (period.includes('第4四半期')) return year + '<br><span style="font-size:12px">10月〜12月</span>';
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
                              color: '#87CEEB'
                            },
                            text: sortedPeriods.map(p => `${periodCounts[p]}件`),
                            textposition: 'outside',
                            textfont: { size: 14, color: 'black' },
                            hovertemplate: '取引時期: %{x}<br>成約件数: %{y}件<extra></extra>'
                          }
                        ]}
                        layout={{
                          xaxis: {
                            title: { text: '取引時期（年月）', font: { size: 14, color: 'black' }, standoff: 30 },
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
                            ticksuffix: '件',
                            dtick: 1,  // 1件刻みで表示（整数のみ）
                            tickformat: 'd'  // 整数フォーマット
                          },
                          height: 500,
                          margin: { t: 40, b: 70, l: 60, r: 40 },
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
                  <div className="text-xs text-gray-500 mt-2">
                    ※統計的な外れ値（極端に高額・低額な物件）は自動的に除外して分析しています
                  </div>
                </div>

                {/* 6. 📍 周辺の公示地価 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{isLand ? '4' : '6'}. 📍 周辺の公示地価</h3>
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
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>該当地域の公示地価データは見つかりませんでした</p>
                    </div>
                  )}
                </div>

                {/* 7. 📈 公示地価の推移 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{isLand ? '5' : '7'}. 📈 公示地価の推移</h3>
                  {landPriceHistory && Object.keys(landPriceHistory).length > 0 ? (
                    <Plot
                      data={Object.entries(landPriceHistory).slice(0, 10).map(([ address, data ]: [string, any]) => ({
                        x: data.yearly_prices.map((p: any) => `${p.year}年`),
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
                        margin: { t: 20, b: 40, l: 100, r: 20 },
                        plot_bgcolor: 'white',
                        paper_bgcolor: 'white',
                        xaxis: {
                          title: { text: '価格時点（年）', font: { size: 14, color: 'black' } },
                          gridcolor: '#E0E0E0',
                          showline: true,
                          linewidth: 1,
                          linecolor: 'black',
                          tickfont: { size: 14, color: 'black' },
                          dtick: 1
                        },
                        yaxis: {
                          title: { text: '', font: { size: 14, color: 'black' } },
                          gridcolor: '#E0E0E0',
                          showline: true,
                          linewidth: 1,
                          linecolor: 'black',
                          tickfont: { size: 14, color: 'black' },
                          tickformat: ',.0f',
                          ticksuffix: '円'
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