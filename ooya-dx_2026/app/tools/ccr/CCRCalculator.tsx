'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
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
import { ShareButtons } from '@/components/tools/ShareButtons'
import { calculateCCR, estimatePurchaseCosts } from '@/lib/calculators/ccr'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産のCCR（自己資金配当率） 計算シミュレーション'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'CCR（自己資金配当率）とは', level: 2 },
  { id: 'formula', title: 'CCRの計算式', level: 3 },
  { id: 'leverage', title: 'レバレッジ効果とCCR', level: 2 },
  { id: 'caution', title: '計算上の注意点', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

interface GlossaryItem {
  slug: string
  title: string
}

interface CCRCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// メインコンポーネント
// =================================================================
export function CCRCalculator({ relatedGlossary = [] }: CCRCalculatorProps) {
  // 入力状態
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0)       // 物件価格
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)             // 年間家賃収入
  const [vacancyRate, setVacancyRate] = useState<number>(5)                      // 空室率
  const [opexRate, setOpexRate] = useState<number>(20)                           // 経費率
  const [downPaymentInMan, setDownPaymentInMan] = useState<number>(0)            // 頭金
  const [purchaseCostsInMan, setPurchaseCostsInMan] = useState<number>(0)        // 購入諸経費
  const [loanTermYears, setLoanTermYears] = useState<number>(30)                 // 借入期間
  const [interestRate, setInterestRate] = useState<number>(2.0)                  // 金利

  // 計算値
  const equityInMan = downPaymentInMan + purchaseCostsInMan                       // 自己資金合計
  const loanAmountInMan = propertyPriceInMan - downPaymentInMan                   // 借入金額

  // 入力があるか判定
  const hasInput = propertyPriceInMan > 0 && equityInMan > 0

  // 計算結果
  const result = useMemo(() => {
    if (!hasInput) return null
    return calculateCCR({
      propertyPriceInMan,
      annualRentInMan,
      vacancyRate,
      opexRate,
      equityInMan,
      loanAmountInMan,
      loanTermYears,
      interestRate,
    })
  }, [hasInput, propertyPriceInMan, annualRentInMan, vacancyRate, opexRate, equityInMan, loanAmountInMan, loanTermYears, interestRate])

  // 購入諸経費を自動計算（ヘルパー）
  const handleEstimateCosts = () => {
    if (propertyPriceInMan > 0) {
      setPurchaseCostsInMan(estimatePurchaseCosts(propertyPriceInMan))
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

          {/* シェアボタン */}
          <div className="mb-4">
            <ShareButtons title={PAGE_TITLE} />
          </div>

          <p className="text-gray-600 mb-8">
            不動産のCCR（自己資金配当率）を概算計算します。
            賃貸経営において、自己資金に対して年間どれくらいのキャッシュフローが得られるかを把握できます。
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
                CCRを概算計算する
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

              {/* 年間家賃収入 */}
              <NumberInput
                label="年間家賃収入（満室想定）"
                value={annualRentInMan}
                onChange={setAnnualRentInMan}
                unit="万円"
                placeholder="例：500"
              />

              {/* 空室率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  想定空室率
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={vacancyRate}
                    onChange={(e) => setVacancyRate(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="100"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：5"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
              </div>

              {/* 経費率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  運営経費率（管理費・修繕費・税金等）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={opexRate}
                    onChange={(e) => setOpexRate(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="100"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：20"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  目安：一棟20〜25%、区分25〜35%程度
                </p>
              </div>

              <hr className="border-gray-200" />

              {/* 頭金 */}
              <NumberInput
                label="頭金（物件価格に対する自己資金）"
                value={downPaymentInMan}
                onChange={setDownPaymentInMan}
                unit="万円"
                placeholder="例：1000"
              />

              {/* 購入諸経費 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  購入諸経費
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={purchaseCostsInMan}
                    onChange={(e) => setPurchaseCostsInMan(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：350"
                  />
                  <span className="text-gray-600 font-medium">万円</span>
                </div>
                <button
                  type="button"
                  onClick={handleEstimateCosts}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  物件価格の7%で概算する
                </button>
              </div>

              {/* 自己資金・借入金額表示 */}
              {hasInput && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    自己資金合計：
                    <span className="font-bold text-gray-900 ml-2">
                      {equityInMan.toLocaleString()}万円
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      （頭金{downPaymentInMan.toLocaleString()}万円 + 諸経費{purchaseCostsInMan.toLocaleString()}万円）
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    借入金額：
                    <span className="font-bold text-gray-900 ml-2">
                      {loanAmountInMan.toLocaleString()}万円
                    </span>
                  </p>
                </div>
              )}

              <hr className="border-gray-200" />

              {/* 借入期間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  借入期間
                </label>
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {[10, 15, 20, 25, 30, 35].map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>

              {/* 金利 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  借入金利（年利）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    max="20"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：2.0"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
              </div>
            </div>

            {/* 結果エリア */}
            {result && result.ccr !== 0 && (
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">EGI（実効総収入）</span>
                  <span className="text-right font-medium">{result.egi.toLocaleString()}万円/年</span>

                  <span className="text-gray-600">OPEX（運営経費）</span>
                  <span className="text-right font-medium">-{result.opex.toLocaleString()}万円/年</span>

                  <span className="text-gray-600">NOI（営業純利益）</span>
                  <span className="text-right font-medium">{result.noi.toLocaleString()}万円/年</span>

                  <span className="text-gray-600">ADS（年間返済額）</span>
                  <span className="text-right font-medium">-{result.ads.toLocaleString()}万円/年</span>

                  <span className="text-gray-600">BTCF（税引前CF）</span>
                  <span className={`text-right font-medium ${result.annualBTCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.annualBTCF >= 0 ? '+' : ''}{result.annualBTCF.toLocaleString()}万円/年
                  </span>

                  {/* CCR（メイン結果） */}
                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                    CCR（自己資金配当率）
                  </span>
                  <span className="text-right text-2xl font-bold border-t-2 border-blue-300 pt-4 mt-2 text-blue-700">
                    {result.ccr.toFixed(2)}%
                  </span>

                  {/* 回収期間 */}
                  <span className="text-gray-600 border-t pt-3">自己資金回収期間</span>
                  <span className="text-right font-medium border-t pt-3">
                    {result.paybackPeriod !== null ? `約${result.paybackPeriod.toFixed(1)}年` : '-'}
                  </span>

                  {/* FCR・K% */}
                  <span className="text-gray-600">FCR（総収益率）</span>
                  <span className="text-right font-medium">{result.fcr.toFixed(2)}%</span>

                  <span className="text-gray-600">K%（ローン定数）</span>
                  <span className="text-right font-medium">{result.loanConstant.toFixed(2)}%</span>
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>CCR = BTCF / 自己資金 × 100</p>
                    <p>CCR = {result.annualBTCF.toLocaleString()} / {equityInMan.toLocaleString()} × 100 = {result.ccr.toFixed(2)}%</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">CCRの早見表</h2>
            <p className="text-sm text-gray-600 mb-4">自己資金1,000万円の場合の年間キャッシュフローとCCR</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700">年間BTCF</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">CCR</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">回収期間</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">30万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">3.0%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">約33年</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">80万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">8.0%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">約12.5年</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">120万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">12.0%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">約8.3年</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">150万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">15.0%</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">約6.7年</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※自己資金1,000万円の場合。税金・減価償却は考慮していません。
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
              CCR（Cash on Cash Return：自己資金配当率）は、効率性を測る指標の一つです。
              自己資金に対して年間どれくらいのキャッシュフローが得られるかを示し、
              判断の参考として活用される場合があります。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              利回りと異なり、CCRは借入を活用したレバレッジ効果を考慮できるため、
              実際に手元に残るキャッシュフローの効率を把握する際に用いられることがあります。
            </p>

            <SectionHeading id="formula" items={tocItems} />
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-800 mb-2">CCRの計算式</p>
              <div className="font-mono text-sm text-gray-700 space-y-1">
                <p><strong>CCR = BTCF / 自己資金 × 100</strong></p>
                <p className="text-xs text-gray-500 mt-2">BTCF = NOI - ADS（年間元利返済額）</p>
                <p className="text-xs text-gray-500">自己資金 = 頭金 + 購入諸経費</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              BTCF（Before Tax Cash Flow：税引前キャッシュフロー）は、
              NOI（営業純利益）から年間のローン返済額を差し引いた金額です。
            </p>

            <SectionHeading id="leverage" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              CCRはレバレッジ（借入）の効果を反映する指標です。
              FCR（総収益率）とK%（ローン定数）を比較することで、
              借入が資金効率に与える影響を判断できる場合があります。
            </p>
            <SectionHeading id="caution" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              CCRの計算にあたっては、以下の点にご注意ください。
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>・<strong>税金は考慮していません</strong>：実際の手取りは所得税・住民税控除後となります</li>
                <li>・<strong>空室・家賃下落リスク</strong>：本計算は入力した空室率で一定と仮定しています</li>
                <li>・<strong>大規模修繕費用</strong>：突発的な修繕は運営経費率に含まれていない場合があります</li>
                <li>・<strong>売却益は含まれません</strong>：CCRはインカムリターンのみを評価する指標です</li>
              </ul>
            </div>

            {relatedGlossary.length > 0 && (
              <>
                <SectionHeading id="glossary" items={tocItems} />
                <ul className="space-y-2">
                  {relatedGlossary.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/glossary/${item.slug}`}
                        className="text-gray-700 hover:text-gray-900 hover:underline text-sm"
                      >
                        <span className="text-gray-400 mr-1">›</span>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月21日"
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/ccr" />

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
