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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            公示地価検索
          </h1>
          <p className="mt-2 text-gray-600">
            国土交通省の公示地価データを高速検索・分析
          </p>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 都道府県 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPrefecture}
                onChange={(e) => setSelectedPrefecture(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                市区町村 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedPrefecture || isCitiesLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                地区 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedCity || isDistrictsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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

          {/* 検索ボタン */}
          <button
            onClick={handleSearch}
            disabled={loading || !selectedPrefecture || !selectedCity || !selectedDistrict}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <Search className="h-5 w-5" />
            {loading ? '検索中...' : '公示地価を検索（過去4年分のデータ）'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
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
          </div>
        )}

        {/* 公示地価の推移グラフ */}
        {landPriceHistory && Object.keys(landPriceHistory).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              📈 公示地価の推移
            </h2>
            {renderTrendChart()}
            <p className="mt-4 text-sm text-gray-600">
              📊 <strong>データソース</strong>: 国土交通省公示地価・都道府県地価調査 /
              推移期間: 直近4年分 / 価格単位: 円/㎡ / 最大10地点まで表示
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandPrice;
