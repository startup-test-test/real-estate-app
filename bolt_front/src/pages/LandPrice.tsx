/**
 * 公示地価検索ページ
 * 公示地価データのみを高速表示
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Building, Search, Loader } from 'lucide-react';
import Plot from 'react-plotly.js';
import { propertyApi } from '../services/propertyApi';
import UsageStatusBar from '../components/UsageStatusBar';
import UpgradeModal from '../components/UpgradeModal';
import Breadcrumb from '../components/Breadcrumb';

interface Prefecture {
  code: string;
  name: string;
}

interface City {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface LandPriceData {
  region: string;
  address: string;
  full_address: string;
  price_per_sqm: number;
  price_per_tsubo: number;
  change_rate: string;
  price_time: string;
  station: string;
  station_distance: string;
  use_district: string;
  building_coverage: string;
  floor_area_ratio: string;
  latitude: string;
  longitude: string;
}

export const LandPrice: React.FC = () => {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [landPriceData, setLandPriceData] = useState<LandPriceData[]>([]);
  const [landPriceHistory, setLandPriceHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 都道府県リスト取得
  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const response = await propertyApi.getPrefectures();
        if (response.data) {
          setPrefectures(response.data);
        }
      } catch (err) {
        console.error('都道府県リスト取得エラー:', err);
      }
    };
    fetchPrefectures();
  }, []);

  // 市区町村リスト取得
  useEffect(() => {
    if (selectedPrefecture) {
      const fetchCities = async () => {
        setIsCitiesLoading(true);
        try {
          const response = await propertyApi.getCities(selectedPrefecture);
          if (response.data) {
            setCities(response.data);
          }
        } catch (err) {
          console.error('市区町村リスト取得エラー:', err);
        } finally {
          setIsCitiesLoading(false);
        }
      };
      fetchCities();
      setSelectedCity('');
      setSelectedDistrict('');
    }
  }, [selectedPrefecture]);

  // 地区リスト取得
  useEffect(() => {
    if (selectedPrefecture && selectedCity) {
      const fetchDistricts = async () => {
        setIsDistrictsLoading(true);
        try {
          const response = await propertyApi.getDistricts(selectedPrefecture, selectedCity);
          if (response.data) {
            setDistricts(response.data);
          }
        } catch (err) {
          console.error('地区リスト取得エラー:', err);
        } finally {
          setIsDistrictsLoading(false);
        }
      };
      fetchDistricts();
      setSelectedDistrict('');
    }
  }, [selectedPrefecture, selectedCity]);

  // 公示地価検索
  const handleSearch = async () => {
    if (!selectedPrefecture) {
      setError('都道府県を選択してください');
      return;
    }
    if (!selectedCity) {
      setError('市区町村を選択してください');
      return;
    }
    if (!selectedDistrict) {
      setError('地区を選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 都道府県名と市区町村名を取得
      const selectedPrefName = prefectures.find(p => p.code === selectedPrefecture)?.name || selectedPrefecture;
      const selectedCityName = cities.find(c => c.code === selectedCity)?.name || selectedCity;

      // 公示地価の推移データを取得（過去4年分）
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map(String);

      const historyPromises = years.map(year =>
        propertyApi.getLandPrices({
          prefecture: selectedPrefName,
          city: selectedCityName,
          district: selectedDistrict,
          year
        })
      );

      const historyResults = await Promise.all(historyPromises);

      // 最新年のデータを公示地価データとして表示
      const latestYearData = historyResults[historyResults.length - 1];

      if (latestYearData.data && latestYearData.data.length > 0) {
        setLandPriceData(latestYearData.data);

        // 住所ごとにグループ化（AI市場分析と同じ形式）
        const historyByAddress: any = {};
        historyResults.forEach((result, index) => {
          const year = years[index];
          if (result.data) {
            result.data.forEach((item: LandPriceData) => {
              if (!historyByAddress[item.address]) {
                historyByAddress[item.address] = {
                  address: item.address,
                  full_address: item.full_address,
                  station: item.station,
                  yearly_prices: []
                };
              }
              historyByAddress[item.address].yearly_prices.push({
                year: parseInt(year),
                price_per_sqm: item.price_per_sqm,
                price_per_tsubo: item.price_per_tsubo
              });
            });
          }
        });

        setLandPriceHistory(historyByAddress);
      } else {
        setLandPriceData([]);
        setLandPriceHistory(null);
        setError('該当地域の公示地価データは見つかりませんでした');
      }
    } catch (err: any) {
      console.error('公示地価データの取得エラー:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 推移グラフの生成（AI市場分析と同じスタイル）
  const renderTrendChart = () => {
    if (!landPriceHistory) return null;

    return (
      <Plot
        data={Object.entries(landPriceHistory).slice(0, 10).map(([address, data]: [string, any]) => ({
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
          height: 500,
          margin: { t: 40, b: 60, l: 100, r: 40 },
          showlegend: true,
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
          hovermode: 'x unified',
          hoverlabel: {
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            bordercolor: '#fff',
            font: { size: 14, color: 'white' }
          }
        }}
        config={{ displayModeBar: false }}
        className="w-full"
      />
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* 使用状況バー */}
      <UsageStatusBar onUpgradeClick={() => setShowUpgradeModal(true)} />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Gray out overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

            {/* Loading content */}
            <div className="relative bg-white rounded-xl p-8 shadow-2xl max-w-md mx-4">
              <div className="flex flex-col items-center space-y-4">
                <Loader className="h-12 w-12 text-blue-600 animate-spin" />
                <div className="text-center w-full">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    公示地価を検索中
                  </h3>
                  <p className="text-gray-600">
                    過去4年分のデータを取得しています...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    しばらくお待ちください
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ヘッダー */}
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">公示地価検索</h1>
            <p className="text-gray-600 mt-1">
              国土交通省の公示地価データを高速検索・分析
            </p>
          </div>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <MapPin className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">検索条件を設定</h2>
          </div>
          <div className="space-y-6">
            {/* エリア選択 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">エリア選択</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 都道府県 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    都道府県 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPrefecture}
                    onChange={(e) => setSelectedPrefecture(e.target.value)}
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

                {/* 市区町村 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    市区町村 <span className="text-red-500">*</span>
                  </label>
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
                </div>

                {/* 地区 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    地区 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity || isDistrictsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {isDistrictsLoading ? '読み込み中...' : '選択してください'}
                    </option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 検索実行ボタン */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`flex items-center justify-center px-10 py-5 rounded-lg font-semibold text-xl transition-all duration-200 min-h-[64px] ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  検索中...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  公示地価を検索する
                </>
              )}
            </button>
          </div>
        </div>

        {/* 公示地価テーブル */}
        {landPriceData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: '0px' }}>
              📍 周辺の公示地価
              <span className="text-sm text-gray-500 ml-2">
                （地点数: {landPriceData.length}件）
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      所在地
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      価格/㎡
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      価格/坪
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      変動率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最寄駅
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用途地域
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {landPriceData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.price_per_sqm.toLocaleString()}円
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.price_per_tsubo.toLocaleString()}円
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.change_rate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.station || '-'}
                        {item.station_distance && ` (${item.station_distance}m)`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.use_district || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              過去データに基づく統計で将来の結果を保証しません。出典：国土交通省 不動産情報ライブラリ。
              <div className="mt-2 text-xs text-gray-600">
                <p>📊 <strong>分析手法の詳細</strong> / データソース: 国土交通省公示地価・都道府県地価調査 / 地点種別: 住宅地・商業地・工業地等 / 更新頻度: 年1回（公示地価3月、地価調査9月） / 表示範囲: 選択地域内の主要地点</p>
              </div>
            </div>
          </div>
        )}

        {/* 公示地価の推移グラフ */}
        {landPriceHistory && Object.keys(landPriceHistory).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: '0px' }}>
              📈 公示地価の推移
              <span className="text-sm text-gray-500 ml-2">
                （地点数: {Object.keys(landPriceHistory).length}件）
              </span>
            </h3>
            {renderTrendChart()}
            <div className="text-xs text-gray-500 mt-2">
              過去データに基づく統計で将来の結果を保証しません。出典：国土交通省 不動産情報ライブラリ。
              <div className="mt-2 text-xs text-gray-600">
                <p>📊 <strong>分析手法の詳細</strong> / データソース: 国土交通省公示地価・都道府県地価調査 / 推移期間: 直近4年分の年次データ / 価格単位: 円/㎡（平米単価） / グラフ表示: 最大10地点まで</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default LandPrice;
