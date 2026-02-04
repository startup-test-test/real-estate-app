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
import { calculateROI } from '@/lib/calculators/roi'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '賃貸経営のROI（投資利益率） 計算シミュレーション'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'ROI（投資利益率）とは', level: 2 },
  { id: 'formula', title: 'ROIの計算式', level: 3 },
  { id: 'related-metrics', title: '関連指標との違い', level: 3 },
  { id: 'usage', title: 'ROIの活用方法', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

interface GlossaryItem {
  slug: string
  title: string
}

interface ROICalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// メインコンポーネント
// =================================================================
export function ROICalculator({ relatedGlossary = [] }: ROICalculatorProps) {
  // 入力状態
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0) // 物件価格（万円）
  const [purchaseCostsInMan, setPurchaseCostsInMan] = useState<number>(0) // 購入諸経費（万円）
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0) // 年間家賃収入（万円）
  const [expenseRatePercent, setExpenseRatePercent] = useState<number>(20) // 経費率（%）
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0) // 借入額（万円）
  const [annualLoanPaymentInMan, setAnnualLoanPaymentInMan] = useState<number>(0) // 年間ローン返済額（万円）

  // 計算用の値
  const annualExpensesInMan = annualRentInMan * (expenseRatePercent / 100)
  const totalInvestment = propertyPriceInMan + purchaseCostsInMan
  const equityInvestment = totalInvestment - loanAmountInMan

  // 入力があるか判定
  const hasInput = propertyPriceInMan > 0

  // 計算結果
  const result = useMemo(() => {
    if (propertyPriceInMan <= 0) {
      return null
    }
    return calculateROI({
      propertyPriceInMan,
      purchaseCostsInMan,
      annualRentInMan,
      annualExpensesInMan,
      loanAmountInMan,
      annualLoanPaymentInMan,
    })
  }, [propertyPriceInMan, purchaseCostsInMan, annualRentInMan, annualExpensesInMan, loanAmountInMan, annualLoanPaymentInMan])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[52px] sm:h-[64px] md:h-[80px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-4 sm:px-5 py-4 sm:py-6 md:py-8">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
            {(() => {
              const toolInfo = getToolInfo('/tools/roi')
              return toolInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(toolInfo.lastUpdated)}
                </time>
              ) : null
            })()}
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>

          {/* シェアボタン */}
          <div className="mb-4">
            <ShareButtons title={PAGE_TITLE} />
          </div>

          <p className="text-gray-600 mb-8">
            賃貸経営のROI（投資利益率）を概算計算します。
            キャッシュフローROI、CCR（自己資金配当率）、FCR（実質利回り）を同時に算出します。
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
                ROIを概算計算する
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

              {/* 総投資額表示 */}
              {hasInput && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    総投資額：
                    <span className="font-bold text-gray-900 ml-2">
                      {totalInvestment.toLocaleString()}万円
                    </span>
                  </p>
                </div>
              )}

              <hr className="border-gray-200" />

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
                    自己資金：
                    <span className="font-bold text-gray-900 ml-2">
                      {equityInvestment.toLocaleString()}万円
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ※総投資額{totalInvestment.toLocaleString()}万円 - 借入{loanAmountInMan.toLocaleString()}万円
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
                    value={expenseRatePercent}
                    onChange={(e) => setExpenseRatePercent(parseFloat(e.target.value) || 0)}
                    step="1"
                    min="0"
                    max="100"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：20"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  経費額：約{annualExpensesInMan.toLocaleString()}万円/年
                </p>
              </div>

              {/* 年間ローン返済額 */}
              <NumberInput
                label="年間ローン返済額（元利合計）"
                value={annualLoanPaymentInMan}
                onChange={setAnnualLoanPaymentInMan}
                unit="万円"
                placeholder="例：200"
              />
            </div>

            {/* 結果エリア */}
            {result && (
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">総投資額</span>
                  <span className="text-right font-medium">{result.totalInvestment.toLocaleString()}万円</span>

                  <span className="text-gray-600">自己資金</span>
                  <span className="text-right font-medium">{result.equityInvestment.toLocaleString()}万円</span>

                  <span className="text-gray-600">NOI（営業純収益）</span>
                  <span className="text-right font-medium">{result.noi.toLocaleString()}万円/年</span>

                  <span className="text-gray-600">年間キャッシュフロー</span>
                  <span className={`text-right font-medium ${result.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.annualCashFlow.toLocaleString()}万円/年
                  </span>

                  {/* CF-ROI（メイン結果） */}
                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                    CF-ROI（キャッシュフローROI）
                  </span>
                  <span className={`text-right text-2xl font-bold border-t-2 border-blue-300 pt-4 mt-2 ${result.cfRoi >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {result.cfRoi.toFixed(2)}%
                  </span>

                  <span className="text-gray-600 border-t pt-3">FCR（実質利回り）</span>
                  <span className="text-right font-medium border-t pt-3">
                    {result.fcr.toFixed(2)}%
                  </span>

                  {result.ccr !== null && (
                    <>
                      <span className="text-gray-600">CCR（自己資金配当率）</span>
                      <span className={`text-right font-medium ${result.ccr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.ccr.toFixed(2)}%
                      </span>
                    </>
                  )}

                  {result.paybackYears !== null && (
                    <>
                      <span className="text-gray-600">自己資金回収年数</span>
                      <span className="text-right font-medium">
                        約{result.paybackYears.toFixed(1)}年
                      </span>
                    </>
                  )}
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>CF-ROI = 年間キャッシュフロー ÷ 総投資額 × 100</p>
                    <p className="text-xs text-gray-500 mt-2">
                      = {result.annualCashFlow.toLocaleString()}万円 ÷ {result.totalInvestment.toLocaleString()}万円 × 100
                    </p>
                    <p className="text-xs text-gray-500">
                      = {result.cfRoi.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* =================================================================
              解説セクション
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              ROI（Return On Investment：投資利益率）は、投資した金額に対してどれだけの利益が得られたかを示す指標です。
              賃貸経営においては、物件への投資額に対するキャッシュフローの割合として計算されます。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              ROIを確認することで、投資効率を把握し、複数の投資案件を比較検討する際の参考とすることができます。
            </p>

            <SectionHeading id="formula" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-sm">
                CF-ROI（%）= 年間キャッシュフロー ÷ 総投資額 × 100
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                総投資額 = 物件価格 + 購入諸経費
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              年間キャッシュフローは、家賃収入から運営経費とローン返済を差し引いた金額です。
              経費には管理費、修繕費、固定資産税、都市計画税、保険料などが含まれます。
            </p>

            <SectionHeading id="related-metrics" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              賃貸経営の収益性を測る指標には、ROI以外にもいくつかの指標があります。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>FCR（実質利回り）</strong>：NOI（営業純収益）÷ 総投資額。ローン返済を含まない物件の収益力を示します。</li>
                <li><strong>CCR（自己資金配当率）</strong>：キャッシュフロー ÷ 自己資金。自己資金に対するリターンを示します。</li>
                <li><strong>IRR（内部収益率）</strong>：時間価値を考慮した収益率。売却までの全期間を評価します。</li>
              </ul>
            </div>

            <SectionHeading id="usage" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              ROIは以下のような場面で活用されます。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>投資効率の確認</strong>：投下した資金に対するリターンを数値化できます</li>
                <li><strong>複数案件の比較</strong>：異なる物件の投資効率を同じ基準で比較できます</li>
                <li><strong>融資条件の検討</strong>：借入額や金利を変えた場合のROIの変化を確認できます</li>
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
            lastUpdated="2026年1月22日"
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/roi" />

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
