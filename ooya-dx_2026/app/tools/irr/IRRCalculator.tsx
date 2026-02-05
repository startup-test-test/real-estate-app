'use client'

import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { calculateIRR } from '@/lib/calculators/irr'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産のIRR（内部収益率） 計算シミュレーション'

// 目次項目
const tocItems: TocItem[] = [
  { id: 'about', title: 'IRR（内部収益率）とは', level: 2 },
  { id: 'difference', title: '利回りとIRRの違い', level: 3 },
  { id: 'caution', title: '計算上の注意点', level: 2 },
]

/**
 * IRR（内部収益率）シミュレーター
 * ToolPageLayoutを使用した2カラムレイアウト
 */
export function IRRCalculator() {
  return (
    <ToolPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/irr"
      additionalContent={<IRRAdditionalContent />}
    >
      <IRRSimulator />
    </ToolPageLayout>
  )
}

/**
 * IRRシミュレーター本体
 */
function IRRSimulator() {
  // 入力状態
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0)
  const [purchaseCostsInMan, setPurchaseCostsInMan] = useState<number>(0)
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0)
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)
  const [annualExpenseRatePercent, setAnnualExpenseRatePercent] = useState<number>(20)
  const [annualLoanRepaymentInMan, setAnnualLoanRepaymentInMan] = useState<number>(0)
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(10)
  const [saleEstimateInMan, setSaleEstimateInMan] = useState<number>(0)
  const [loanBalanceAtSaleInMan, setLoanBalanceAtSaleInMan] = useState<number>(0)

  // 計算値
  const initialInvestmentInMan = propertyPriceInMan + purchaseCostsInMan - loanAmountInMan
  const annualExpenseInMan = annualRentInMan * (annualExpenseRatePercent / 100)
  const annualNOIInMan = annualRentInMan - annualExpenseInMan
  const annualCashFlowInMan = annualNOIInMan - annualLoanRepaymentInMan

  // 入力があるか判定
  const hasInput = initialInvestmentInMan > 0

  // 計算結果
  const result = useMemo(() => {
    if (initialInvestmentInMan <= 0 || holdingPeriodYears <= 0) {
      return null
    }
    return calculateIRR({
      initialInvestmentInMan,
      annualCashFlowInMan,
      holdingPeriodYears,
      saleEstimateInMan,
      loanBalanceAtSaleInMan,
      saleCostRate: 3,
    })
  }, [initialInvestmentInMan, annualCashFlowInMan, holdingPeriodYears, saleEstimateInMan, loanBalanceAtSaleInMan])

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-500 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          IRRを概算計算する
        </h2>
      </div>

      {/* 入力エリア */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 space-y-4">
        <NumberInput
          label="物件価格"
          value={propertyPriceInMan}
          onChange={setPropertyPriceInMan}
          unit="万円"
          placeholder="例：5000"
        />

        <NumberInput
          label="購入諸経費（物件価格の7%程度が目安）"
          value={purchaseCostsInMan}
          onChange={setPurchaseCostsInMan}
          unit="万円"
          placeholder="例：350"
        />

        <NumberInput
          label="借入額"
          value={loanAmountInMan}
          onChange={setLoanAmountInMan}
          unit="万円"
          placeholder="例：4000"
        />

        {/* 自己資金表示 */}
        {hasInput && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              自己資金：
              <span className="font-bold text-gray-900 ml-2">
                {initialInvestmentInMan.toLocaleString()}万円
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ※物件価格{propertyPriceInMan.toLocaleString()}万円 + 諸経費{purchaseCostsInMan.toLocaleString()}万円 - 借入{loanAmountInMan.toLocaleString()}万円
            </p>
          </div>
        )}

        <hr className="border-gray-200" />

        <NumberInput
          label="年間家賃収入（満室想定）"
          value={annualRentInMan}
          onChange={setAnnualRentInMan}
          unit="万円"
          placeholder="例：500"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年間経費率（管理費・修繕費・税金等）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={annualExpenseRatePercent}
              onChange={(e) => setAnnualExpenseRatePercent(parseFloat(e.target.value) || 0)}
              step="1"
              min="0"
              max="100"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：20"
            />
            <span className="text-gray-600 font-medium">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            経費額：約{annualExpenseInMan.toLocaleString()}万円/年、NOI：約{annualNOIInMan.toLocaleString()}万円/年
          </p>
        </div>

        <NumberInput
          label="年間ローン返済額（元利合計）"
          value={annualLoanRepaymentInMan}
          onChange={setAnnualLoanRepaymentInMan}
          unit="万円"
          placeholder="例：200"
        />

        {/* 年間キャッシュフロー表示 */}
        {annualRentInMan > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              年間キャッシュフロー：
              <span className={`font-bold ml-2 ${annualCashFlowInMan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {annualCashFlowInMan.toLocaleString()}万円
              </span>
            </p>
          </div>
        )}

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            保有期間
          </label>
          <select
            value={holdingPeriodYears}
            onChange={(e) => setHoldingPeriodYears(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {[3, 5, 7, 10, 15, 20, 25, 30].map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </div>

        <NumberInput
          label="売却想定価格"
          value={saleEstimateInMan}
          onChange={setSaleEstimateInMan}
          unit="万円"
          placeholder="例：4500"
        />

        <NumberInput
          label="売却時のローン残債"
          value={loanBalanceAtSaleInMan}
          onChange={setLoanBalanceAtSaleInMan}
          unit="万円"
          placeholder="例：2500"
        />
      </div>

      {/* 結果エリア */}
      {result && (
        <div className="bg-white rounded-lg p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm sm:text-base">
            <span className="text-gray-600">自己資金</span>
            <span className="text-right font-medium">{initialInvestmentInMan.toLocaleString()}万円</span>

            <span className="text-gray-600">年間キャッシュフロー</span>
            <span className={`text-right font-medium ${annualCashFlowInMan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {annualCashFlowInMan.toLocaleString()}万円
            </span>

            <span className="text-gray-600">保有期間</span>
            <span className="text-right font-medium">{holdingPeriodYears}年</span>

            <span className="text-gray-600">売却時手取り（税前概算）</span>
            <span className="text-right font-medium">
              約{Math.round(saleEstimateInMan * 0.97 - loanBalanceAtSaleInMan).toLocaleString()}万円
            </span>

            <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
              IRR（内部収益率）
            </span>
            <span className="text-right text-xl sm:text-2xl font-bold border-t-2 border-blue-300 pt-4 mt-2 text-blue-700">
              {result.irr !== null ? `${result.irr.toFixed(2)}%` : '計算不能'}
            </span>

            <span className="text-gray-600 border-t pt-3">資金倍率</span>
            <span className="text-right font-medium border-t pt-3">
              {result.multipleOnInvested.toFixed(2)}倍
            </span>

            <span className="text-gray-600">総収益（税前概算）</span>
            <span className={`text-right font-medium ${result.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result.totalReturn >= 0 ? '+' : ''}{Math.round(result.totalReturn).toLocaleString()}万円
            </span>

            <span className="text-gray-600">NPV（割引率8%）</span>
            <span className={`text-right font-medium ${result.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result.npv >= 0 ? '+' : ''}{Math.round(result.npv).toLocaleString()}万円
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">キャッシュフロー推移（概算）</p>
            <div className="text-xs sm:text-sm text-gray-700 font-mono space-y-1">
              <p>【0年目】初期費用 -{initialInvestmentInMan.toLocaleString()}万円</p>
              <p>【1〜{holdingPeriodYears - 1}年目】年間CF {annualCashFlowInMan.toLocaleString()}万円/年</p>
              <p>【{holdingPeriodYears}年目】年間CF + 売却手取り 約{Math.round(annualCashFlowInMan + saleEstimateInMan * 0.97 - loanBalanceAtSaleInMan).toLocaleString()}万円</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * IRRページ固有の追加コンテンツ
 */
function IRRAdditionalContent() {
  return (
    <>
      <TableOfContents items={tocItems} />

      <section className="mb-12">
        <SectionHeading id="about" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          IRR（Internal Rate of Return：内部収益率）は、収益性を測る指標の一つです。
          期間全体のキャッシュフローを考慮し、「複利で何%の運用に相当するか」を示します。
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          不動産では、購入時の初期資金から、保有期間中の家賃収入、そして売却時の収益までを
          総合的に評価できるため、判断の指標として活用される場合があります。
        </p>

        <SectionHeading id="difference" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          表面利回りや実質利回りは、主に「ある一時点」の収益性を示す指標です。
          一方、IRRは期間全体を通じた収益性を評価できる点が異なります。
        </p>

        <SectionHeading id="caution" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          IRRの計算にあたっては、以下の点にご注意ください。
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <ul className="text-xs sm:text-sm text-yellow-800 space-y-2">
            <li>・<strong>譲渡所得税は考慮していません</strong>：売却益に対する税金（短期約39%、長期約20%程度）は別途考慮が必要な場合があります</li>
            <li>・<strong>家賃下落・空室リスク</strong>：本計算は一定の年間キャッシュフローを前提としています</li>
            <li>・<strong>売却価格の不確実性</strong>：将来の売却価格は予測が難しく、結果に大きく影響します</li>
            <li>・<strong>減価償却・デッドクロス</strong>：税務上の損益と実際のキャッシュフローは異なる場合があります</li>
          </ul>
        </div>
      </section>
    </>
  )
}
