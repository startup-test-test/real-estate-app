'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calculator, BarChart3, ArrowRight, ChevronRight } from 'lucide-react';
import { useCFSimulations, CFSimulationData } from '@/hooks/useCFSimulations';
import { useSimulations } from '@/hooks/useSimulations';
import { sampleCFSimulation } from '@/data/sampleCFSimulation';
import { sampleProperty } from '@/data/sampleProperty';

const DashboardClient: React.FC = () => {
  const router = useRouter();
  const { getSimulations: getCFSimulations } = useCFSimulations();
  const { getSimulations: getRevenueSimulations } = useSimulations();

  const [cfSimulations, setCFSimulations] = useState<CFSimulationData[]>([]);
  const [revenueSimulations, setRevenueSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cfData, revenueData] = await Promise.all([
          getCFSimulations(),
          getRevenueSimulations(),
        ]);
        setCFSimulations(cfData || []);
        setRevenueSimulations(revenueData || []);
      } catch (error) {
        console.error('データの読み込みに失敗しました', error);
      }
      setLoading(false);
    };
    loadData();
  }, [getCFSimulations, getRevenueSimulations]);

  // CFシミュレーション: サンプル含めて最新2件
  const hasCFSampleInDB = cfSimulations.some(sim =>
    sim.inputData?.propertyName?.startsWith('【サンプル】')
  );
  const displayCFSimulations = !hasCFSampleInDB
    ? [sampleCFSimulation, ...cfSimulations].slice(0, 2)
    : cfSimulations.slice(0, 2);

  // 収益シミュレーション: サンプル含めて最新2件
  const hasRevenueSampleInDB = revenueSimulations.some(sim =>
    sim.simulation_data?.propertyName?.startsWith('【サンプル】')
  );
  const displayRevenueSimulations = !hasRevenueSampleInDB
    ? [sampleProperty, ...revenueSimulations].slice(0, 2)
    : revenueSimulations.slice(0, 2);

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '/');
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-1 md:pt-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            マイページ
          </h1>
          <p className="text-gray-600">
            賃貸経営の収益性を分析するためのツールです。目的に合わせてお選びください。
          </p>
        </div>

        {/* Simulator Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CF Simulation Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-4">
                CFシミュレーション
              </h2>
            </div>

            <p className="text-gray-900 mb-4 min-h-[60px]">
              物件の収支をサクッと計算。4項目を入力するだけで、毎年いくら手元に残るかの目安がわかります。
            </p>

            <div className="mb-4">
              <p className="text-base font-medium text-gray-900 mb-2">こんな方におすすめ</p>
              <ul className="text-base text-gray-700 space-y-1">
                <li>・気になる物件をサクッと比較したい</li>
                <li>・難しい計算は苦手だけど収支を知りたい</li>
                <li>・まずは簡単に試してみたい</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                諸費用・管理費・空室率などは自動計算されるので入力カンタン
              </p>
            </div>

            <Link
              href="/mypage/cf-simulator/new"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              CFシミュレーションを作成する
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {/* Revenue Simulation Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-4">
                収益シミュレーション
              </h2>
            </div>

            <p className="text-gray-900 mb-4 min-h-[60px]">
              より詳しく収支を計算したい方に。経費や税金も含めた、詳細な収支シミュレーションができます。
            </p>

            <div className="mb-4">
              <p className="text-base font-medium text-gray-900 mb-2">こんな方におすすめ</p>
              <ul className="text-base text-gray-700 space-y-1">
                <li>・購入前に細かくシミュレーションしたい</li>
                <li>・税金を含めた手取り額を知りたい</li>
                <li>・売却時の利益も計算したい</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                CFシミュレーションで良さそうな物件を、さらに詳しく分析
              </p>
            </div>

            <Link
              href="/mypage/revenue-simulator?new=true"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              収益シミュレーションを作成する
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Recent Simulations */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* CF Simulation Recent List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">CFシミュレーション一覧</h3>
              </div>
              <Link
                href="/mypage/cf-simulator"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                もっと見る
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">読み込み中...</div>
            ) : displayCFSimulations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                シミュレーションがまだありません
              </div>
            ) : (
              <div className="space-y-3">
                {displayCFSimulations.map((sim) => {
                  const propertyName = sim.inputData?.propertyName || sim.name || '無題';
                  const purchasePrice = sim.inputData?.purchasePrice || 0;
                  const annualCashFlow = sim.results?.annualCashFlow || 0;
                  return (
                    <div
                      key={sim.id}
                      className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-gray-900 truncate mb-1">{propertyName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{purchasePrice.toLocaleString()}万円</span>
                          <span className={annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                            年間CF {annualCashFlow >= 0 ? '+' : ''}{Math.round(annualCashFlow)}万円
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/mypage/cf-simulator/${sim.id}`)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                      >
                        結果を見る
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Revenue Simulation Recent List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">収益シミュレーション一覧</h3>
              </div>
              <Link
                href="/mypage/revenue-simulator"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                もっと見る
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">読み込み中...</div>
            ) : displayRevenueSimulations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                シミュレーションがまだありません
              </div>
            ) : (
              <div className="space-y-3">
                {displayRevenueSimulations.map((sim) => {
                  const propertyName = sim.simulation_data?.propertyName || sim.property_name || '無題';
                  const purchasePrice = sim.simulation_data?.purchasePrice || 0;
                  const annualCashFlow = sim.results?.annualCashFlow || 0;
                  return (
                    <div
                      key={sim.id}
                      className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-gray-900 truncate mb-1">{propertyName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{purchasePrice.toLocaleString()}万円</span>
                          <span className={annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                            年間CF {annualCashFlow >= 0 ? '+' : ''}{Math.round(annualCashFlow / 10000)}万円
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/mypage/revenue-simulator?view=${sim.id}`)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                      >
                        結果を見る
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
