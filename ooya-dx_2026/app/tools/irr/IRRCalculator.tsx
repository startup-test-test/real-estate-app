'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Info } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { calculateIRR, evaluateIRR } from '@/lib/calculators/irr'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産投資のIRR（内部収益率） 計算シミュレーション｜早見表付き'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'IRR（内部収益率）とは', level: 2 },
  { id: 'difference', title: '利回りとIRRの違い', level: 3 },
  { id: 'standard', title: 'IRRの目安', level: 3 },
  { id: 'caution', title: '計算上の注意点', level: 2 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function IRRCalculator() {
  // 入力状態
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0) // 物件価格
  const [purchaseCostsInMan, setPurchaseCostsInMan] = useState<number>(0) // 購入諸経費
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0) // 借入額
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0) // 年間家賃収入
  const [annualExpenseRatePercent, setAnnualExpenseRatePercent] = useState<number>(20) // 経費率
  const [annualLoanRepaymentInMan, setAnnualLoanRepaymentInMan] = useState<number>(0) // 年間ローン返済
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(10) // 保有期間
  const [saleEstimateInMan, setSaleEstimateInMan] = useState<number>(0) // 売却想定価格
  const [loanBalanceAtSaleInMan, setLoanBalanceAtSaleInMan] = useState<number>(0) // 売却時ローン残債

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

  // IRR評価
  const irrEvaluation = result ? evaluateIRR(result.irr) : null

  // IRRに応じた色
  const getIRRColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'moderate': return 'text-yellow-600'
      case 'low': return 'text-orange-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>
          <p className="text-gray-600 mb-8">
            不動産投資のIRR（内部収益率）を概算計算します。
            物件購入から売却までの収益性を、時間価値を考慮して評価できます。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                IRRを概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 物件価格 */}
              <NumberInput
                label="物件価格"
                value={propertyPriceInMan}
                onChange={setPropertyPriceInMan}
                unit="万円"
                placeholder="例：5000"
              />

              {/* 購入諸経費 */}
              <NumberInput
                label="購入諸経費（物件価格の7%程度が目安）"
                value={purchaseCostsInMan}
                onChange={setPurchaseCostsInMan}
                unit="万円"
                placeholder="例：350"
              />

              {/* 借入額 */}
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
                    自己資金（初期投資額）：
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

              {/* 年間家賃収入 */}
              <NumberInput
                label="年間家賃収入（満室想定）"
                value={annualRentInMan}
                onChange={setAnnualRentInMan}
                unit="万円"
                placeholder="例：500"
              />

              {/* 経費率 */}
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

              {/* 年間ローン返済額 */}
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

              {/* 保有期間 */}
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

              {/* 売却想定価格 */}
              <NumberInput
                label="売却想定価格"
                value={saleEstimateInMan}
                onChange={setSaleEstimateInMan}
                unit="万円"
                placeholder="例：4500"
              />

              {/* 売却時ローン残債 */}
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
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">自己資金（初期投資）</span>
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

                  {/* IRR（メイン結果） */}
                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                    IRR（内部収益率）
                  </span>
                  <span className={`text-right text-2xl font-bold border-t-2 border-blue-300 pt-4 mt-2 ${irrEvaluation ? getIRRColor(irrEvaluation.level) : ''}`}>
                    {result.irr !== null ? `${result.irr.toFixed(2)}%` : '計算不能'}
                  </span>

                  {/* 評価 */}
                  {irrEvaluation && result.irr !== null && (
                    <>
                      <span className="text-gray-600">評価</span>
                      <span className={`text-right font-medium ${getIRRColor(irrEvaluation.level)}`}>
                        {irrEvaluation.label}
                      </span>
                    </>
                  )}

                  <span className="text-gray-600 border-t pt-3">投資倍率</span>
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

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">キャッシュフロー推移（概算）</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>【0年目】初期投資 -{initialInvestmentInMan.toLocaleString()}万円</p>
                    <p>【1〜{holdingPeriodYears - 1}年目】年間CF {annualCashFlowInMan.toLocaleString()}万円/年</p>
                    <p>【{holdingPeriodYears}年目】年間CF + 売却手取り 約{Math.round(annualCashFlowInMan + saleEstimateInMan * 0.97 - loanBalanceAtSaleInMan).toLocaleString()}万円</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表
          ================================================================= */}
          <section className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">IRRの早見表</h2>
            <p className="text-sm text-gray-600 mb-4">自己資金1,000万円・保有10年・売却価格=購入価格の場合</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700">年間CF＼保有期間</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">5年</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">10年</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">15年</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">50万円/年</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">約2.4%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">約3.7%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">約4.2%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">100万円/年</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">約6.4%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">約7.7%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">約8.3%</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">150万円/年</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-green-600 font-medium">約11.2%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-green-600 font-medium">約11.8%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-green-600 font-medium">約12.3%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">200万円/年</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-green-600 font-medium">約16.5%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-green-600 font-medium">約15.9%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-green-600 font-medium">約16.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※売却諸経費3%、売却時ローン残債なしで概算。譲渡所得税は考慮していません。
            </p>
          </section>

          {/* =================================================================
              目次
          ================================================================= */}
          <TableOfContents items={tocItems} />

          {/* =================================================================
              解説セクション
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              IRR（Internal Rate of Return：内部収益率）は、投資の収益性を測る指標の一つとされています。
              投資期間全体のキャッシュフローを考慮し、「複利で何%の運用に相当するか」を示す指標とされています。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産投資では、購入時の初期投資から、保有期間中の家賃収入、そして売却時の収益までを
              総合的に評価できるため、投資判断の指標として活用される場合があります。
            </p>

            <SectionHeading id="difference" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              表面利回りや実質利回りは、主に「ある一時点」の収益性を示す指標とされています。
              一方、IRRは投資期間全体を通じた収益性を評価できる点が異なるとされています。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">IRRの特徴</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>・お金の「時間的価値」を考慮している</li>
                    <li>・売却益（キャピタルゲイン）も含めて評価</li>
                    <li>・異なる投資案件の比較が可能</li>
                  </ul>
                </div>
              </div>
            </div>

            <SectionHeading id="standard" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              IRRの目安は投資家の属性や投資戦略によって異なるとされています。
              参考として以下のような数値が挙げられることがありますが、リスクや市場環境、物件特性によっても大きく変動します。
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">投資家属性・戦略</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">目標IRRの目安</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">J-REIT・機関投資家（安定型）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">6%〜8%程度</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">個人投資家（インカム重視）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">8%〜12%程度</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">バリューアッド・再生型</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">12%〜18%程度</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ※上記は参考値であり、実際の目標IRRは物件・市場状況により異なります。個別の投資判断は専門家にご相談ください。
            </p>

            <SectionHeading id="caution" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              IRRの計算にあたっては、以下の点にご注意ください。
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>・<strong>譲渡所得税は考慮していません</strong>：売却益に対する税金（短期約39%、長期約20%程度とされる）は別途考慮が必要な場合があります</li>
                <li>・<strong>家賃下落・空室リスク</strong>：本計算は一定の年間キャッシュフローを前提としています</li>
                <li>・<strong>売却価格の不確実性</strong>：将来の売却価格は予測が難しく、結果に大きく影響します</li>
                <li>・<strong>減価償却・デッドクロス</strong>：税務上の損益と実際のキャッシュフローは異なる場合があります</li>
              </ul>
            </div>
          </section>

          {/* =================================================================
              参考リンク
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">参考リンク</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                <a href="https://www.ares.or.jp/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → 一般社団法人 不動産証券化協会（ARES）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/jouto.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → 譲渡所得について（国税庁）
                </a>
              </li>
            </ul>
          </div>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月20日"
            additionalItems={[
              '本計算は譲渡所得税を考慮していない概算値です',
              '将来の家賃収入・売却価格は保証されるものではありません',
            ]}
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/irr" />

          {/* CTA */}
          <div className="mt-16">
            <SimulatorCTA />
          </div>

          {/* 会社概要・運営者 */}
          <div className="mt-16">
            <CompanyProfileCompact />
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  )
}
