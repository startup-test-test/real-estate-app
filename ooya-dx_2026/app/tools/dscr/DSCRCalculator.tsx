'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable3Col, QuickReferenceRow3Col } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { calculateDSCR } from '@/lib/calculators/dscr'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

// ページタイトル
const PAGE_TITLE = '不動産のDSCR（債務返済カバー率） 計算シミュレーション'

// 早見表データ（NOI 500万円、金利2%、期間25年の場合）
const quickReferenceData: QuickReferenceRow3Col[] = [
  { label: '借入5,000万円', value1: 'DSCR 1.97', value2: 'ADS 約254万円' },
  { label: '借入6,000万円', value1: 'DSCR 1.64', value2: 'ADS 約305万円' },
  { label: '借入7,000万円', value1: 'DSCR 1.40', value2: 'ADS 約356万円' },
  { label: '借入8,000万円', value1: 'DSCR 1.23', value2: 'ADS 約407万円' },
  { label: '借入9,000万円', value1: 'DSCR 1.09', value2: 'ADS 約458万円' },
  { label: '借入1億円', value1: 'DSCR 0.98', value2: 'ADS 約509万円' },
]

// 目次
const tocItems: TocItem[] = [
  { id: 'about', title: 'DSCRとは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

// 関連用語の型定義
interface GlossaryItem {
  slug: string
  title: string
}

interface Props {
  relatedGlossary: GlossaryItem[]
}

export function DSCRCalculator({ relatedGlossary }: Props) {
  // 入力状態（万円単位）
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)
  const [vacancyRate, setVacancyRate] = useState<number>(5)
  const [expenseRate, setExpenseRate] = useState<number>(20)
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0)
  const [interestRate, setInterestRate] = useState<number>(2.0)
  const [loanTermYears, setLoanTermYears] = useState<number>(25)

  // 計算結果
  const result = useMemo(() => {
    if (annualRentInMan <= 0 || loanAmountInMan <= 0) {
      return null
    }
    return calculateDSCR({
      annualRentInMan,
      vacancyRate,
      expenseRate,
      loanAmountInMan,
      interestRate,
      loanTermYears,
    })
  }, [annualRentInMan, vacancyRate, expenseRate, loanAmountInMan, interestRate, loanTermYears])

  const hasInput = annualRentInMan > 0 && loanAmountInMan > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
      <div className="h-[52px] sm:h-[72px] md:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-4 sm:px-5 py-4 sm:py-8 md:py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
            {(() => {
              const toolInfo = getToolInfo('/tools/dscr')
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
            年間賃料収入と借入条件を入力するだけで、DSCR（債務返済カバー率）を瞬時に計算します。
            借入返済の余力を把握できます。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                DSCRを概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 収入条件 */}
              <p className="text-sm font-medium text-gray-700 border-b pb-2">収入条件</p>

              <NumberInput
                label="年間想定賃料収入（満室時）"
                value={annualRentInMan}
                onChange={setAnnualRentInMan}
                unit="万円"
                placeholder="例：600"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    想定空室率
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={1}
                      value={vacancyRate}
                      onChange={(e) => setVacancyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    運営経費率
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={1}
                      value={expenseRate}
                      onChange={(e) => setExpenseRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* 融資条件 */}
              <p className="text-sm font-medium text-gray-700 border-b pb-2 mt-6">融資条件</p>

              <NumberInput
                label="借入金額"
                value={loanAmountInMan}
                onChange={setLoanAmountInMan}
                unit="万円"
                placeholder="例：8000"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    借入金利（実行金利）
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    借入期間
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={loanTermYears}
                      onChange={(e) => setLoanTermYears(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                      年
                    </span>
                  </div>
                </div>
              </div>

              </div>

            {/* 結果エリア */}
            <div className="space-y-3">
              <ResultCard
                label="DSCR（債務返済カバー率）"
                value={result?.dscr ?? 0}
                unit="倍"
                highlight={true}
              />

              <ResultCard
                label="NOI（純営業収益）"
                value={(result?.noi ?? 0) * 10000}
                unit="円"
                subText={result ? `= 約${result.noi.toLocaleString()}万円/年` : undefined}
              />
              <ResultCard
                label="年間元利返済額（ADS）"
                value={(result?.ads ?? 0) * 10000}
                unit="円"
                subText={result ? `= 約${result.ads.toLocaleString()}万円/年` : undefined}
              />
              <ResultCard
                label="年間キャッシュフロー（税引前）"
                value={(result?.annualCashFlow ?? 0) * 10000}
                unit="円"
                subText={result ? `= 約${result.annualCashFlow.toLocaleString()}万円/年` : undefined}
              />

              </div>

            {/* 計算式表示 */}
            {hasInput && result && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">計算式</p>
                <div className="text-sm text-gray-700 font-mono space-y-1 bg-white p-3 rounded">
                  <p>【NOI】{annualRentInMan.toLocaleString()}万円 × (1 - {vacancyRate}%) - {annualRentInMan.toLocaleString()}万円 × {expenseRate}% = 約{result.noi.toLocaleString()}万円</p>
                  <p>【ADS】借入{loanAmountInMan.toLocaleString()}万円 × 金利{interestRate}% × {loanTermYears}年返済 = 約{result.ads.toLocaleString()}万円/年</p>
                  <p>【DSCR】{result.noi.toLocaleString()}万円 ÷ {result.ads.toLocaleString()}万円 = {result.dscr.toFixed(2)}倍</p>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 早見表 */}
          <section className="mb-12">
            <QuickReferenceTable3Col
              title="DSCR早見表"
              description="NOI 500万円、金利2%、借入期間25年の場合の借入金額別DSCRです。"
              headers={['借入金額', { title: 'DSCR' }, { title: 'ADS（年間返済額）' }]}
              rows={quickReferenceData}
              note="※元利均等返済の場合。"
            />
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              DSCR（Debt Service Coverage Ratio：債務返済カバー率）は、不動産が生み出す純営業収益（NOI）が、年間の借入返済額（ADS）の何倍あるかを示す指標です。
              借入返済の余力を把握するために使用される場合があります。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              DSCRが1.0を超えていれば、物件の収益で返済を賄える状態を意味します。
              数値が高いほど返済余力があるとされています。
            </p>

            <SectionHeading id="calculation" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center">
                DSCR = NOI（純営業収益） ÷ ADS（年間元利返済額）
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              NOI（Net Operating Income）は、年間の賃料収入から空室損失と運営経費を差し引いた純営業収益です。
              ADS（Annual Debt Service）は、借入金の年間元利返済額です。
            </p>

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
          <RelatedTools currentPath="/tools/dscr" />

          {/* CTA */}
          <div className="mt-16">
            <SimulatorCTA />
          </div>

          {/* 会社概要 */}
          <div className="mt-16">
            <CompanyProfileCompact />
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  )
}
