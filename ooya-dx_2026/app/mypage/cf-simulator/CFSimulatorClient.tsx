'use client';

import React, { useState } from 'react';
import { AlertCircle, Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import CashFlowChart from '@/components/simulator/CashFlowChart';
import { SimulationResultData, CashFlowData } from '@/types/simulation';
import { API_ENDPOINTS } from '@/lib/config/api';
import { transformFormDataToApiData } from '@/lib/utils/dataTransform';
import BackButton from '@/components/simulator/BackButton';

interface SimulationResult {
  results: SimulationResultData;
  cash_flow_table?: CashFlowData[];
}

interface SimpleInputs {
  propertyName: string;
  purchasePrice: number;      // 購入価格（万円）
  monthlyRent: number;        // 月額家賃（万円）
  loanAmount: number;         // 借入額（万円）
  interestRate: number;       // 金利（%）
  loanYears: number;          // 借入期間（年）
}

const CFSimulatorClient: React.FC = () => {
  const [inputs, setInputs] = useState<SimpleInputs>({
    propertyName: '',
    purchasePrice: 5000,
    monthlyRent: 30,
    loanAmount: 4500,
    interestRate: 1.5,
    loanYears: 35,
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 入力値変更ハンドラ
  const handleInputChange = (field: keyof SimpleInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // 数値フォーマット（カンマ区切り）
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ja-JP');
  };

  // シミュレーション実行
  const runSimulation = async () => {
    setIsSimulating(true);
    setError(null);

    try {
      // デフォルト値を設定してフォームデータを構築
      const otherCosts = Math.round(inputs.purchasePrice * 0.07); // 諸費用7%
      const managementFee = Math.round(inputs.monthlyRent * 10000 * 0.05); // 管理費5%（円単位）
      const propertyTax = Math.round(inputs.purchasePrice * 100); // 固定資産税（円単位、購入価格の1%）

      // transformFormDataToApiDataが期待する形式でデータを構築
      const formData = {
        propertyName: inputs.propertyName || "CFシミュレーション物件",
        location: "簡易シミュレーション",
        yearBuilt: 2020,  // 築年（年号）
        propertyType: "木造",
        landArea: 100,
        buildingArea: 100,  // 必須フィールド
        roadPrice: 200000,
        marketValue: Math.round(inputs.purchasePrice * 0.9),
        purchasePrice: inputs.purchasePrice,
        otherCosts: otherCosts,
        renovationCost: 0,
        monthlyRent: inputs.monthlyRent,  // 万円単位
        managementFee: managementFee,  // 円単位
        fixedCost: 0,
        propertyTax: propertyTax,  // 円単位
        vacancyRate: 5,
        rentDecline: 1,
        loanAmount: inputs.loanAmount,
        interestRate: inputs.interestRate,
        loanYears: inputs.loanYears,
        loanType: "元利均等",
        holdingYears: 35,
        exitCapRate: 6,
        priceDeclineRate: 1,
        ownershipType: "個人",
        effectiveTaxRate: 20,
        majorRepairCycle: 10,
        majorRepairCost: Math.round(inputs.purchasePrice * 0.03),
        buildingPriceForDepreciation: Math.round(inputs.purchasePrice * 0.5),
        depreciationYears: 22,
      };

      // 共通の変換関数でAPIデータを生成（snake_case形式）
      const apiData = transformFormDataToApiData(formData);

      const response = await fetch(API_ENDPOINTS.SIMULATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error:', errorData);
        const errorMessage = errorData?.details?.join(', ') || errorData?.error || 'シミュレーションに失敗しました';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSimulationResults(result);

    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              <Calculator className="inline-block h-7 w-7 mr-2 text-blue-600" />
              簡易CFシミュレーター
            </h1>
            <p className="text-gray-600 mt-1">
              6項目の入力で、キャッシュフローを簡単にシミュレーションできます
            </p>
          </div>

          {/* 入力フォーム */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">STEP 1</span>
              物件情報を入力
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 物件名 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物件名
                </label>
                <input
                  type="text"
                  value={inputs.propertyName}
                  onChange={(e) => handleInputChange('propertyName', e.target.value)}
                  placeholder="例：品川区マンション"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 購入価格 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  購入価格 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">万円</span>
                </div>
              </div>

              {/* 月額家賃 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月額家賃 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">万円</span>
                </div>
              </div>

              {/* 借入額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  借入額 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">万円</span>
                </div>
              </div>

              {/* 金利 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金利 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

              {/* 借入期間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  借入期間 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.loanYears}
                    onChange={(e) => handleInputChange('loanYears', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">年</span>
                </div>
              </div>
            </div>

            {/* デフォルト値の説明 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-medium mb-1">以下はデフォルト値で自動計算されます：</p>
              <p>諸費用（7%）、管理費（5%）、空室率（5%）、固定資産税（1%）、保有期間（10年）</p>
            </div>

            {/* シミュレーション実行ボタン */}
            <div className="mt-6">
              <button
                onClick={runSimulation}
                disabled={isSimulating || inputs.purchasePrice <= 0 || inputs.monthlyRent <= 0}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center ${
                  isSimulating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSimulating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    計算中...
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5 mr-2" />
                    シミュレーション実行
                  </>
                )}
              </button>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* シミュレーション結果 */}
          {simulationResults && (
            <div className="space-y-6">
              {/* 収益指標 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  収益指標
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* 表面利回り */}
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">表面利回り</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {simulationResults.results['表面利回り（%）']?.toFixed(2) || '0.00'}%
                    </p>
                  </div>

                  {/* 実質利回り */}
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">実質利回り</p>
                    <p className="text-2xl font-bold text-green-700">
                      {simulationResults.results['実質利回り（%）']?.toFixed(2) || '0.00'}%
                    </p>
                  </div>

                  {/* 年間キャッシュフロー */}
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">年間CF</p>
                    <p className={`text-2xl font-bold ${(simulationResults.results['年間キャッシュフロー（円）'] || 0) >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                      {formatNumber(Math.round((simulationResults.results['年間キャッシュフロー（円）'] || 0) / 10000))}万円
                    </p>
                  </div>

                  {/* DSCR */}
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">DSCR</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {simulationResults.results['DSCR（返済余裕率）']?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* 追加指標 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">IRR</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {simulationResults.results['IRR（%）']?.toFixed(2) || 'N/A'}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">CCR（初年度）</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {simulationResults.results['CCR（初年度）（%）']?.toFixed(2) || 'N/A'}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">NOI</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {formatNumber(Math.round((simulationResults.results['NOI（円）'] || 0) / 10000))}万円
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">LTV</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {simulationResults.results['LTV（%）']?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                </div>
              </div>

              {/* キャッシュフローチャート */}
              {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    年次キャッシュフロー推移
                  </h2>
                  <CashFlowChart data={simulationResults.cash_flow_table} />
                </div>
              )}

              {/* 詳細キャッシュフローテーブル */}
              {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    📋 詳細キャッシュフロー分析
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">年</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700 border-b">家賃収入</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700 border-b">経費</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700 border-b">返済額</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700 border-b">税引前CF</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700 border-b">累計CF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResults.cash_flow_table.map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 text-center border-b">{row['年数'] || index + 1}年目</td>
                            <td className="px-3 py-2 text-right border-b">
                              {formatNumber(Math.round((row['賃料収入（税込）'] || 0) / 10000))}万
                            </td>
                            <td className="px-3 py-2 text-right border-b">
                              {formatNumber(Math.round((row['総経費'] || 0) / 10000))}万
                            </td>
                            <td className="px-3 py-2 text-right border-b">
                              {formatNumber(Math.round((row['ローン返済額'] || 0) / 10000))}万
                            </td>
                            <td className={`px-3 py-2 text-right border-b font-medium ${(row['税引前キャッシュフロー'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(row['税引前キャッシュフロー'] || 0) >= 0 ? '+' : ''}{formatNumber(Math.round((row['税引前キャッシュフロー'] || 0) / 10000))}万
                            </td>
                            <td className={`px-3 py-2 text-right border-b font-medium ${(row['累計キャッシュフロー'] || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {(row['累計キャッシュフロー'] || 0) >= 0 ? '+' : ''}{formatNumber(Math.round((row['累計キャッシュフロー'] || 0) / 10000))}万
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 注意事項 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <p className="font-medium mb-1">ご注意</p>
                <p>本シミュレーションは参考値です。実際の投資判断には専門家にご相談ください。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CFSimulatorClient;
