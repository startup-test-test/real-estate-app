'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Calculator, Download, BarChart3, Save, ArrowLeft } from 'lucide-react';
import CashFlowChart from '@/components/simulator/CashFlowChart';
import { SimulationResultData, CashFlowData } from '@/types/simulation';
import { API_ENDPOINTS } from '@/lib/config/api';
import { transformFormDataToApiData } from '@/lib/utils/dataTransform';
import { useCFSimulations } from '@/hooks/useCFSimulations';
import Link from 'next/link';
import LegalDisclaimer from '@/components/simulator/LegalDisclaimer';

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

const CFSimulatorNewClient: React.FC = () => {
  const router = useRouter();
  const { saveSimulation } = useCFSimulations();

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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 入力値変更ハンドラ
  const handleInputChange = (field: keyof SimpleInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // 数値フォーマット（カンマ区切り）
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ja-JP');
  };

  // 通貨フォーマット（万円単位、シンボルなし）
  const formatCurrencyNoSymbol = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0';
    return Math.round(value / 10000).toLocaleString('ja-JP');
  };

  // PDF保存機能
  const handleSaveToPDF = () => {
    const originalTitle = document.title;
    document.title = `${inputs.propertyName || 'CFシミュレーション'} - シミュレーション結果`;
    window.print();
    document.title = originalTitle;
  };

  // シミュレーション実行（自動保存）
  const runSimulation = async () => {
    setIsSimulating(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // デフォルト値を設定してフォームデータを構築
      const otherCosts = Math.round(inputs.purchasePrice * 0.07);
      const managementFee = Math.round(inputs.monthlyRent * 10000 * 0.05);
      const propertyTax = Math.round(inputs.purchasePrice * 100);

      const formData = {
        propertyName: inputs.propertyName || "CFシミュレーション物件",
        location: "簡易シミュレーション",
        yearBuilt: 2020,
        propertyType: "木造",
        landArea: 100,
        buildingArea: 100,
        roadPrice: 200000,
        marketValue: Math.round(inputs.purchasePrice * 0.9),
        purchasePrice: inputs.purchasePrice,
        otherCosts: otherCosts,
        renovationCost: 0,
        monthlyRent: inputs.monthlyRent,
        managementFee: managementFee,
        fixedCost: 0,
        propertyTax: propertyTax,
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

      // 自動保存
      const simulationResultData = result.results;
      const saveResult = await saveSimulation({
        name: inputs.propertyName || 'CFシミュレーション物件',
        inputData: {
          propertyName: inputs.propertyName || 'CFシミュレーション物件',
          purchasePrice: inputs.purchasePrice,
          monthlyRent: inputs.monthlyRent,
          loanAmount: inputs.loanAmount,
          interestRate: inputs.interestRate,
          loanYears: inputs.loanYears,
        },
        status: '検討中',
        results: {
          surfaceYield: simulationResultData['表面利回り（%）'] || 0,
          netYield: simulationResultData['実質利回り（%）'] || 0,
          annualCashFlow: Math.round((simulationResultData['年間キャッシュフロー（円）'] || 0) / 10000),
          noi: Math.round((simulationResultData['NOI（円）'] || 0) / 10000),
          irr: simulationResultData['IRR（%）'] || 0,
          ccr: simulationResultData['CCR（初年度）（%）'] || 0,
          dscr: simulationResultData['DSCR（返済余裕率）'] || 0,
          ltv: simulationResultData['LTV（%）'] || 0,
        },
        cashFlowTable: result.cash_flow_table as Record<string, unknown>[],
      });

      if (saveResult) {
        setSaveSuccess(true);
        // 保存成功後、詳細ページに遷移
        setTimeout(() => {
          router.push(`/mypage/cf-simulator/${saveResult.id}`);
        }, 1500);
      } else {
        // 保存に失敗した場合でもシミュレーション結果は表示
        console.error('保存に失敗しました。ログインしているか確認してください。');
        setError('シミュレーション結果の保存に失敗しました。ログインしているか確認してください。');
      }

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
                  新規CFシミュレーション
                </h1>
                <p className="text-gray-600 mt-1">
                  6項目の入力で、キャッシュフローを簡単にシミュレーションできます
                </p>
              </div>
              <div className="hidden lg:block">
                <Link
                  href="/mypage/cf-simulator"
                  className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  一覧に戻る
                </Link>
              </div>
            </div>
          </div>

          {/* 入力フォーム */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 print:hidden">
            {/* 1行目: 物件名、購入価格、月額家賃 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物件名</label>
                <input
                  type="text"
                  value={inputs.propertyName}
                  onChange={(e) => handleInputChange('propertyName', e.target.value)}
                  placeholder="例：品川区マンション"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">購入価格 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">万円</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月額家賃 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">万円</span>
                </div>
              </div>
            </div>

            {/* 2行目: 借入額、金利、借入期間 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">借入額 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">万円</span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">借入期間 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.loanYears}
                    onChange={(e) => handleInputChange('loanYears', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">年</span>
                </div>
              </div>
            </div>

            {/* デフォルト値の説明 */}
            <div className="text-sm text-gray-600 text-center mb-4">
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

          {/* 保存成功メッセージ */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <Save className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-800">自動保存しました。詳細ページに移動します...</p>
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
                    <h2 className="text-2xl font-bold text-gray-900">シミュレーション結果</h2>
                  </div>
                  <div className="flex items-center space-x-2 print:hidden">
                    <button
                      onClick={handleSaveToPDF}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      title="PDFとして保存"
                    >
                      <Download size={18} />
                      <span>PDF保存</span>
                    </button>
                  </div>
                </div>

                {/* 収益指標 - ピル型バッジ（ホバーで説明表示） */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3">収益指標</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* 表面利回り */}
                  <div className="group relative">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                      (simulationResults.results['表面利回り（%）'] || 0) >= 8 ? 'bg-green-100 text-green-800' :
                      (simulationResults.results['表面利回り（%）'] || 0) >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      (simulationResults.results['表面利回り（%）'] || 0) >= 4 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-normal mr-1">表面利回り</span>
                      <span className="font-semibold">{simulationResults.results['表面利回り（%）']?.toFixed(2) || '0.00'}%</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">表面利回り</div>
                      <div className="mb-2">年間家賃収入を購入価格で割った基本的な利回りです。</div>
                      <div className="text-gray-300 text-xs">計算式：年間家賃収入 ÷ 購入価格 × 100</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* 実質利回り */}
                  <div className="group relative">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                      (simulationResults.results['実質利回り（%）'] || 0) >= 6 ? 'bg-green-100 text-green-800' :
                      (simulationResults.results['実質利回り（%）'] || 0) >= 4.5 ? 'bg-yellow-100 text-yellow-800' :
                      (simulationResults.results['実質利回り（%）'] || 0) >= 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-normal mr-1">実質利回り</span>
                      <span className="font-semibold">{simulationResults.results['実質利回り（%）']?.toFixed(2) || '0.00'}%</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">実質利回り</div>
                      <div className="mb-2">経費を差し引いた実際の収益率です。</div>
                      <div className="text-gray-300 text-xs">計算式：(年間家賃収入 − 経費) ÷ 購入価格 × 100</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* 年間CF */}
                  <div className="group relative">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                      (simulationResults.results['年間キャッシュフロー（円）'] || 0) >= 0 ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-normal mr-1">年間CF</span>
                      <span className="font-semibold">{formatNumber(Math.round((simulationResults.results['年間キャッシュフロー（円）'] || 0) / 10000))}万円</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">年間キャッシュフロー</div>
                      <div className="mb-2">ローン返済後に手元に残る年間の現金収入です。</div>
                      <div className="text-gray-300 text-xs">計算式：年間家賃収入 − 経費 − ローン返済額</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* NOI */}
                  <div className="group relative">
                    <div className="px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help bg-blue-100 text-blue-800">
                      <span className="font-normal mr-1">NOI</span>
                      <span className="font-semibold">{formatNumber(Math.round((simulationResults.results['NOI（円）'] || 0) / 10000))}万円</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">NOI（営業純利益）</div>
                      <div className="mb-2">ローン返済前の純利益です。物件の収益力を示します。</div>
                      <div className="text-gray-300 text-xs">計算式：年間家賃収入 − 経費</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2行目 */}
                <div className="flex flex-wrap gap-2">
                  {/* IRR */}
                  <div className="group relative">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                      (simulationResults.results['IRR（%）'] || 0) >= 15 ? 'bg-green-100 text-green-800' :
                      (simulationResults.results['IRR（%）'] || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                      (simulationResults.results['IRR（%）'] || 0) >= 5 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-normal mr-1">IRR</span>
                      <span className="font-semibold">{simulationResults.results['IRR（%）'] !== null && simulationResults.results['IRR（%）'] !== undefined ? `${simulationResults.results['IRR（%）'].toFixed(2)}%` : 'N/A'}</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">IRR（内部収益率）</div>
                      <div className="mb-2">投資期間全体の年平均収益率です。高いほど投資効率が良いことを示します。</div>
                      <div className="text-gray-300 text-xs">目安：10%以上が優良</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* CCR */}
                  <div className="group relative">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                      (simulationResults.results['CCR（初年度）（%）'] || 0) >= 10 ? 'bg-green-100 text-green-800' :
                      (simulationResults.results['CCR（初年度）（%）'] || 0) >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      (simulationResults.results['CCR（初年度）（%）'] || 0) >= 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-normal mr-1">CCR（初年度）</span>
                      <span className="font-semibold">{simulationResults.results['CCR（初年度）（%）']?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">CCR（自己資金回収率）</div>
                      <div className="mb-2">自己資金に対する年間リターンの割合です。</div>
                      <div className="text-gray-300 text-xs">計算式：年間CF ÷ 自己資金 × 100</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* DSCR */}
                  <div className="group relative">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                      (simulationResults.results['DSCR（返済余裕率）'] || 0) >= 1.5 ? 'bg-green-100 text-green-800' :
                      (simulationResults.results['DSCR（返済余裕率）'] || 0) >= 1.3 ? 'bg-yellow-100 text-yellow-800' :
                      (simulationResults.results['DSCR（返済余裕率）'] || 0) >= 1.1 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-normal mr-1">DSCR</span>
                      <span className="font-semibold">{simulationResults.results['DSCR（返済余裕率）']?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">DSCR（返済余裕率）</div>
                      <div className="mb-2">ローン返済に対する余裕度を示します。1.0以上で返済可能。</div>
                      <div className="text-gray-300 text-xs">計算式：NOI ÷ 年間ローン返済額</div>
                      <div className="text-gray-400 text-xs mt-1">目安：1.3以上で安全</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* LTV */}
                  <div className="group relative">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                      (simulationResults.results['LTV（%）'] || 0) <= 70 ? 'bg-green-100 text-green-800' :
                      (simulationResults.results['LTV（%）'] || 0) <= 80 ? 'bg-yellow-100 text-yellow-800' :
                      (simulationResults.results['LTV（%）'] || 0) <= 90 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="font-normal mr-1">LTV</span>
                      <span className="font-semibold">{simulationResults.results['LTV（%）']?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                      <div className="font-semibold mb-1">LTV（借入比率）</div>
                      <div className="mb-2">物件価格に対する借入額の割合です。低いほど安全性が高い。</div>
                      <div className="text-gray-300 text-xs">計算式：借入額 ÷ 購入価格 × 100</div>
                      <div className="text-gray-400 text-xs mt-1">目安：80%以下が理想</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* キャッシュフローチャート */}
                {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      年次キャッシュフロー推移
                    </h3>
                    <CashFlowChart data={simulationResults.cash_flow_table} />
                  </div>
                )}
              </div>

              {/* 詳細キャッシュフロー分析 */}
              {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">詳細キャッシュフロー分析</h3>
                  </div>

                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="relative overflow-x-auto overflow-y-auto max-h-[600px] md:max-h-[700px] print:overflow-visible print:max-h-none">
                      <table className="min-w-full bg-white print:min-w-0 print:w-full print:table-fixed">
                        <thead className="bg-blue-900 sticky top-0 z-30 shadow-lg">
                          <tr>
                            <th className="px-2 py-2 text-center text-sm font-medium text-white border-b border-blue-900">年次</th>
                            <th className="px-2 py-2 text-center text-sm font-medium text-white border-b border-blue-900">不動産<br/>収入</th>
                            <th className="px-2 py-2 text-center text-sm font-medium text-white border-b border-blue-900">経費</th>
                            <th className="px-2 py-2 text-center text-sm font-medium text-white border-b border-blue-900">ローン<br/>返済</th>
                            <th className="px-2 py-2 text-center text-sm font-medium text-white border-b border-blue-900">年間<br/>CF</th>
                            <th className="px-2 py-2 text-center text-sm font-medium text-white border-b border-blue-900">累計<br/>CF</th>
                            <th className="px-2 py-2 text-center text-sm font-medium text-white border-b border-blue-900">借入<br/>残高</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simulationResults.cash_flow_table.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-2 py-2 text-sm text-gray-900 border-b text-center">{row['年次']}</td>
                              <td className={`px-2 py-2 text-sm border-b text-center ${(row['実効収入'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatCurrencyNoSymbol(row['実効収入'])}
                              </td>
                              <td className={`px-2 py-2 text-sm border-b text-center ${(row['経費'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatCurrencyNoSymbol(row['経費'])}
                              </td>
                              <td className={`px-2 py-2 text-sm border-b text-center ${(row['ローン返済'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatCurrencyNoSymbol(row['ローン返済'])}
                              </td>
                              <td className={`px-2 py-2 text-sm border-b text-center ${(row['営業CF'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatCurrencyNoSymbol(row['営業CF'] || 0)}
                              </td>
                              <td className={`px-2 py-2 text-sm border-b text-center ${(row['累計CF'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatCurrencyNoSymbol(row['累計CF'])}
                              </td>
                              <td className={`px-2 py-2 text-sm border-b text-center ${(row['借入残高'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {Math.round(row['借入残高'] || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 計算ロジック説明・注意事項 */}
              <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  計算ロジック・注意事項
                </h3>

                {/* 計算ロジック説明 */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 主要指標の計算方法</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">・表面利回り</span>：年間家賃収入 ÷ 購入価格 × 100
                    </div>
                    <div>
                      <span className="font-medium">・実質利回り</span>：（年間家賃収入 − 経費）÷ 購入価格 × 100
                    </div>
                    <div>
                      <span className="font-medium">・年間CF</span>：年間家賃収入 − 経費 − ローン返済額
                    </div>
                    <div>
                      <span className="font-medium">・NOI</span>：年間家賃収入 − 経費（ローン返済前利益）
                    </div>
                    <div>
                      <span className="font-medium">・CCR（自己資金回収率）</span>：年間CF ÷ 自己資金 × 100
                    </div>
                    <div>
                      <span className="font-medium">・DSCR（返済余裕率）</span>：NOI ÷ 年間ローン返済額
                    </div>
                    <div>
                      <span className="font-medium">・IRR（内部収益率）</span>：運用期間全体の収益率
                    </div>
                    <div>
                      <span className="font-medium">・LTV</span>：借入額 ÷ 購入価格 × 100
                    </div>
                  </div>
                </div>

                {/* 自動計算値の説明 */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📐 自動設定される値</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">・諸費用</span>：購入価格 × 7%
                    </div>
                    <div>
                      <span className="font-medium">・管理費</span>：年間家賃収入 × 5%
                    </div>
                    <div>
                      <span className="font-medium">・空室率</span>：5%
                    </div>
                    <div>
                      <span className="font-medium">・固定資産税</span>：購入価格 × 1%
                    </div>
                    <div>
                      <span className="font-medium">・保有期間</span>：35年
                    </div>
                    <div>
                      <span className="font-medium">・家賃下落率</span>：年1%
                    </div>
                  </div>
                </div>

                {/* 注意事項 */}
                <div className="border-t border-gray-300 pt-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">⚠️ 重要な注意事項</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>※ 本シミュレーションは簡易計算です。より詳細な分析には「収益シミュレーション」をご利用ください。</p>
                    <p>※ 投資判断は必ず複数の専門家（不動産業者、税理士、FP等）にご相談の上、自己責任で行ってください。</p>
                    <p>※ 税制改正、金利変動、空室リスク等により実際の収益は変動する可能性があります。</p>
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <LegalDisclaimer variant="subtle" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CFSimulatorNewClient;
