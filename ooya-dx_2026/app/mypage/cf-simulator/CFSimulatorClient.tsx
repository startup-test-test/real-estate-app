'use client';

import React, { useState } from 'react';
import { AlertCircle, Calculator, Download, BarChart3 } from 'lucide-react';
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

  // PDF保存機能
  const handleSaveToPDF = () => {
    const originalTitle = document.title;
    document.title = `${inputs.propertyName || '簡易CFシミュレーション'} - シミュレーション結果`;
    window.print();
    document.title = originalTitle;
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
    <div className="bg-gray-50 min-h-screen print:bg-white">
      <div className="p-4 sm:p-6 lg:p-8 print:p-4">
        <div className="max-w-6xl mx-auto print:max-w-full">
          {/* ヘッダー */}
          <div className="mb-6 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  <Calculator className="inline-block h-7 w-7 mr-2 text-blue-600" />
                  簡易CFシミュレーター
                </h1>
                <p className="text-gray-600 mt-1">
                  6項目の入力で、キャッシュフローを簡単にシミュレーションできます
                </p>
              </div>
              <div className="hidden lg:block">
                <BackButton />
              </div>
            </div>
          </div>

          {/* 入力フォーム */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 print:hidden">
            {/* 1行目: 物件名、購入価格、月額家賃 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物件名</label>
                <input
                  type="text"
                  value={inputs.propertyName}
                  onChange={(e) => handleInputChange('propertyName', e.target.value)}
                  placeholder="例：品川区マンション"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">購入価格 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">万円</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月額家賃 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">万円</span>
                </div>
              </div>
            </div>

            {/* 2行目: 借入額、金利、借入期間 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">借入額 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">万円</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">金利 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">借入期間 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.loanYears}
                    onChange={(e) => handleInputChange('loanYears', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">年</span>
                </div>
              </div>
            </div>

            {/* デフォルト値の説明 */}
            <div className="text-xs text-gray-500 text-center mb-3">
              ※ 諸費用7%、管理費5%、空室率5%、固定資産税1%、保有期間35年で自動計算
            </div>

            {/* シミュレーション実行ボタン */}
            <div className="flex justify-center">
              <button
                onClick={runSimulation}
                disabled={isSimulating || inputs.purchasePrice <= 0 || inputs.monthlyRent <= 0}
                className={`flex items-center justify-center px-10 py-5 rounded-lg font-semibold text-xl transition-all duration-200 min-h-[64px] ${
                  isSimulating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSimulating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    計算中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    シミュレーションを実行する
                  </div>
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
              {/* 結果ヘッダー */}
              <div className="bg-white rounded-lg border-2 border-blue-200 shadow-lg p-6 print:border print:shadow-none">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">📊 シミュレーション結果</h2>
                  </div>
                  <button
                    onClick={handleSaveToPDF}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 print:hidden"
                    title="PDFとして保存"
                  >
                    <Download size={18} />
                    <span>PDF保存</span>
                  </button>
                </div>

                {/* 収益指標 - ピル型バッジ */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 収益指標</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* 表面利回り */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                    (simulationResults.results['表面利回り（%）'] || 0) >= 8 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['表面利回り（%）'] || 0) >= 6 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['表面利回り（%）'] || 0) >= 4 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">表面利回り</span>
                    <span className="font-semibold">{simulationResults.results['表面利回り（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>

                  {/* 実質利回り */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                    (simulationResults.results['実質利回り（%）'] || 0) >= 6 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['実質利回り（%）'] || 0) >= 4.5 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['実質利回り（%）'] || 0) >= 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">実質利回り</span>
                    <span className="font-semibold">{simulationResults.results['実質利回り（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>

                  {/* 年間CF */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                    (simulationResults.results['年間キャッシュフロー（円）'] || 0) >= 0 ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">年間CF</span>
                    <span className="font-semibold">{formatNumber(Math.round((simulationResults.results['年間キャッシュフロー（円）'] || 0) / 10000))}万円</span>
                  </div>

                  {/* NOI */}
                  <div className="px-4 py-2 rounded-full text-sm font-medium inline-flex items-center bg-blue-100 text-blue-800">
                    <span className="font-normal mr-1">NOI</span>
                    <span className="font-semibold">{formatNumber(Math.round((simulationResults.results['NOI（円）'] || 0) / 10000))}万円</span>
                  </div>
                </div>

                {/* 2行目 */}
                <div className="flex flex-wrap gap-2">
                  {/* IRR */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                    (simulationResults.results['IRR（%）'] || 0) >= 15 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['IRR（%）'] || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['IRR（%）'] || 0) >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">IRR</span>
                    <span className="font-semibold">{simulationResults.results['IRR（%）'] !== null && simulationResults.results['IRR（%）'] !== undefined ? `${simulationResults.results['IRR（%）'].toFixed(2)}%` : 'N/A'}</span>
                  </div>

                  {/* CCR */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                    (simulationResults.results['CCR（初年度）（%）'] || 0) >= 10 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['CCR（初年度）（%）'] || 0) >= 6 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['CCR（初年度）（%）'] || 0) >= 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">CCR（初年度）</span>
                    <span className="font-semibold">{simulationResults.results['CCR（初年度）（%）']?.toFixed(2) || 'N/A'}%</span>
                  </div>

                  {/* DSCR */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                    (simulationResults.results['DSCR（返済余裕率）'] || 0) >= 1.5 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['DSCR（返済余裕率）'] || 0) >= 1.3 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['DSCR（返済余裕率）'] || 0) >= 1.1 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">DSCR</span>
                    <span className="font-semibold">{simulationResults.results['DSCR（返済余裕率）']?.toFixed(2) || '0.00'}</span>
                  </div>

                  {/* LTV */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center ${
                    (simulationResults.results['LTV（%）'] || 0) <= 70 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['LTV（%）'] || 0) <= 80 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['LTV（%）'] || 0) <= 90 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">LTV</span>
                    <span className="font-semibold">{simulationResults.results['LTV（%）']?.toFixed(1) || '0.0'}%</span>
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
                            <td className="px-3 py-2 text-center border-b">{row['年次'] || `${index + 1}年目`}</td>
                            <td className="px-3 py-2 text-right border-b">
                              {formatNumber(Math.round((row['実効収入'] || 0) / 10000))}万
                            </td>
                            <td className="px-3 py-2 text-right border-b">
                              {formatNumber(Math.round((row['経費'] || 0) / 10000))}万
                            </td>
                            <td className="px-3 py-2 text-right border-b">
                              {formatNumber(Math.round((row['ローン返済'] || 0) / 10000))}万
                            </td>
                            <td className={`px-3 py-2 text-right border-b font-medium ${(row['営業CF'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(row['営業CF'] || 0) >= 0 ? '+' : ''}{formatNumber(Math.round((row['営業CF'] || 0) / 10000))}万
                            </td>
                            <td className={`px-3 py-2 text-right border-b font-medium ${(row['累計CF'] || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                              {(row['累計CF'] || 0) >= 0 ? '+' : ''}{formatNumber(Math.round((row['累計CF'] || 0) / 10000))}万
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
