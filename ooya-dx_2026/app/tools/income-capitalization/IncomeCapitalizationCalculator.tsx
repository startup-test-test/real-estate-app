'use client'

import React, { useState, useMemo } from 'react'
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
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { calculateIncomeCapitalization } from '@/lib/calculators/income-capitalization'

// =================================================================
// 早見表データ
// =================================================================
// キャップレート別の収益価格早見表（年間賃料1,000万円の場合、空室率5%、運営費率20%）
const quickReferenceData: QuickReferenceRow3Col[] = [
  { label: 'キャップレート 4.0%', value1: 'NOI 760万円', value2: '約1億9,000万円' },
  { label: 'キャップレート 5.0%', value1: 'NOI 760万円', value2: '約1億5,200万円' },
  { label: 'キャップレート 6.0%', value1: 'NOI 760万円', value2: '約1億2,667万円' },
  { label: 'キャップレート 7.0%', value1: 'NOI 760万円', value2: '約1億857万円' },
  { label: 'キャップレート 8.0%', value1: 'NOI 760万円', value2: '約9,500万円' },
]

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '収益還元法（直接還元法） 計算シミュレーション'

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: '収益還元法とは', level: 2 },
  { id: 'formula', title: '計算式（直接還元法）', level: 3 },
  { id: 'noi', title: 'NOI（純営業収益）の計算', level: 3 },
  { id: 'cap-rate', title: 'キャップレートの目安', level: 3 },
  { id: 'example', title: '具体的な計算例', level: 3 },
]

// =================================================================
// コンポーネント
// =================================================================
export function IncomeCapitalizationCalculator() {
  // 入力状態（万円単位）
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)
  const [vacancyRate, setVacancyRate] = useState<number>(5)
  const [operatingExpenseRate, setOperatingExpenseRate] = useState<number>(20)
  const [capRate, setCapRate] = useState<number>(5.0)

  // 円に変換
  const annualRentInYen = annualRentInMan * 10000

  // 計算結果（useMemoで自動計算）
  const result = useMemo(() => {
    if (annualRentInMan <= 0 || capRate <= 0) {
      return null
    }
    return calculateIncomeCapitalization({
      annualRentIncome: annualRentInYen,
      vacancyRate,
      operatingExpenseRate,
      capRate,
    })
  }, [annualRentInYen, vacancyRate, operatingExpenseRate, capRate, annualRentInMan])

  // 入力があるかどうか
  const hasInput = annualRentInMan > 0 && capRate > 0

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
            収益還元法（直接還元法）による不動産の収益価格を計算します。
            年間賃料収入とキャップレート（還元利回り）を入力するだけで、
            投資用不動産の理論価格を算出できます。
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
                収益価格を概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 年間賃料収入 */}
              <NumberInput
                label="年間賃料収入（満室想定）"
                value={annualRentInMan}
                onChange={setAnnualRentInMan}
                unit="万円"
                placeholder="例：1000"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※ 駐車場・共益費等を含む満室時の年間総収入
              </p>

              {/* 空室率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  空室率
                </label>
                <div className="flex w-full">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    value={vacancyRate}
                    onChange={(e) => setVacancyRate(Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)))}
                    className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="5"
                  />
                  <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※ 目安：都心3%〜5%、郊外5%〜8%、地方8%〜10%
                </p>
              </div>

              {/* 運営費率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  運営費率（OPEX率）
                </label>
                <select
                  value={operatingExpenseRate}
                  onChange={(e) => setOperatingExpenseRate(parseFloat(e.target.value))}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value={15}>15%（新築・良好な管理状態）</option>
                  <option value={20}>20%（標準・一般的な賃貸物件）</option>
                  <option value={25}>25%（築古・EV有り・積極管理）</option>
                  <option value={30}>30%（大規模修繕期・高空室率）</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ※ 管理費・修繕費・税金等の年間経費率
                </p>
              </div>

              {/* キャップレート */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  キャップレート（還元利回り）
                </label>
                <div className="flex w-full">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    step={0.1}
                    value={capRate}
                    onChange={(e) => setCapRate(Math.max(1, Math.min(15, parseFloat(e.target.value) || 5)))}
                    className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="5.0"
                  />
                  <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※ 目安：都心RC 4%前後、郊外木造 6%〜8%
                </p>
              </div>
            </div>

            {/* 適用条件の説明 */}
            {hasInput && result && (
              <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">計算条件：</span>
                  空室率{vacancyRate}%・運営費率{operatingExpenseRate}%・キャップレート{capRate}%
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  直接還元法（P = NOI / R）により収益価格を算出
                </p>
              </div>
            )}

            {/* 結果エリア */}
            <div className="space-y-3">
              <ResultCard
                label="収益価格（概算）"
                value={result ? Number((result.propertyValue / 10000).toFixed(1)).toLocaleString() : 0}
                unit="万円"
                highlight={true}
              />
              <ResultCard
                label="NOI（純営業収益）"
                value={result ? Number((result.netOperatingIncome / 10000).toFixed(1)).toLocaleString() : 0}
                unit="万円/年"
              />
              <ResultCard
                label="EGI（実効総収入）"
                value={result ? Number((result.effectiveGrossIncome / 10000).toFixed(1)).toLocaleString() : 0}
                unit="万円/年"
                subText={
                  result
                    ? `空室損失 ${(result.vacancyLoss / 10000).toFixed(1)}万円を控除`
                    : undefined
                }
              />
              <ResultCard
                label="運営費用（OPEX）"
                value={result ? Number((result.operatingExpenses / 10000).toFixed(1)).toLocaleString() : 0}
                unit="万円/年"
                subText={
                  result
                    ? `EGIの${operatingExpenseRate}%`
                    : undefined
                }
              />
            </div>

            {/* 計算式表示 */}
            {hasInput && result && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">計算式</p>
                <div className="text-sm text-gray-700 font-mono space-y-1 bg-white p-3 rounded">
                  <p>【GPI（満室想定収入）】{annualRentInMan.toLocaleString()}万円</p>
                  <p>【空室損失】{annualRentInMan.toLocaleString()}万円 × {vacancyRate}% = {Number((result.vacancyLoss / 10000).toFixed(1)).toLocaleString()}万円</p>
                  <p>【EGI（実効総収入）】{annualRentInMan.toLocaleString()}万円 - {Number((result.vacancyLoss / 10000).toFixed(1)).toLocaleString()}万円 = {Number((result.effectiveGrossIncome / 10000).toFixed(1)).toLocaleString()}万円</p>
                  <p>【運営費用】{Number((result.effectiveGrossIncome / 10000).toFixed(1)).toLocaleString()}万円 × {operatingExpenseRate}% = {Number((result.operatingExpenses / 10000).toFixed(1)).toLocaleString()}万円</p>
                  <p>【NOI】{Number((result.effectiveGrossIncome / 10000).toFixed(1)).toLocaleString()}万円 - {Number((result.operatingExpenses / 10000).toFixed(1)).toLocaleString()}万円 = {Number((result.netOperatingIncome / 10000).toFixed(1)).toLocaleString()}万円</p>
                  <p className="font-semibold pt-2 border-t border-gray-200">【収益価格】{Number((result.netOperatingIncome / 10000).toFixed(1)).toLocaleString()}万円 ÷ {capRate}% = {Number((result.propertyValue / 10000).toFixed(1)).toLocaleString()}万円</p>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 早見表 */}
          <section className="mb-12">
            <QuickReferenceTable3Col
              title="収益価格の早見表"
              description="年間賃料収入1,000万円、空室率5%、運営費率20%の場合の収益価格目安です。"
              headers={[
                'キャップレート',
                { title: 'NOI' },
                { title: '収益価格' },
              ]}
              rows={quickReferenceData}
              note="※NOI = 1,000万円 × (1 - 5%) × (1 - 20%) = 760万円。収益価格 = NOI ÷ キャップレート。実際の評価額は物件の個別要因により異なります。"
            />
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              収益還元法とは、対象不動産が将来生み出すと期待される純収益の現在価値の総和を求めることで、不動産の価格を算出する手法です。
              不動産鑑定評価基準において、投資用不動産の評価に原則として適用されます。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              収益還元法には「直接還元法」と「DCF法」の2種類がありますが、
              本シミュレーターでは計算が簡易で市場データと比較しやすい「直接還元法」を採用しています。
            </p>

            <SectionHeading id="formula" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              直接還元法の基本式は以下の通りです。
            </p>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-lg">
                収益価格 = NOI ÷ キャップレート
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                P = NOI / R
              </p>
            </div>

            <ul className="text-gray-700 space-y-2 mb-4 ml-4">
              <li><span className="font-medium">NOI（Net Operating Income）：</span>純営業収益。年間の実収入から運営費用を差し引いた金額</li>
              <li><span className="font-medium">キャップレート（Cap Rate）：</span>還元利回り。期待する投資利回りまたは市場で観察される利回り</li>
            </ul>

            <SectionHeading id="noi" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              NOI（純営業収益）は以下の流れで計算されます。
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <div>
                <p className="font-semibold text-gray-800">1. GPI（総潜在収入）</p>
                <p className="text-sm text-gray-600 ml-4">= 満室時の年間賃料収入（駐車場・共益費含む）</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">2. EGI（実効総収入）</p>
                <p className="text-sm text-gray-600 ml-4">= GPI - 空室損失 - 滞納損失</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">3. NOI（純営業収益）</p>
                <p className="text-sm text-gray-600 ml-4">= EGI - 運営費用（OPEX）</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              運営費用（OPEX）には、管理費（PM/BM）、修繕費、固定資産税・都市計画税、保険料、
              テナント募集費用などが含まれます。
            </p>

            <SectionHeading id="cap-rate" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              キャップレート（還元利回り）は、収益価格を決定づける最も重要な変数です。
              一般的に以下の要因で変動します。
            </p>

            <ul className="text-gray-700 space-y-2 mb-4 ml-4">
              <li><span className="font-medium">立地：</span>都心部ほど低く（価格が高く）、地方ほど高くなる傾向</li>
              <li><span className="font-medium">築年数：</span>新築ほど低く、築古ほど高くなる傾向</li>
              <li><span className="font-medium">構造：</span>RC造は木造より低くなる傾向</li>
              <li><span className="font-medium">金利動向：</span>金利上昇時はキャップレートも上昇する傾向</li>
            </ul>

            <SectionHeading id="example" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              具体例を用いて計算してみましょう。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">例：年間賃料1,200万円、空室率5%、運営費率20%、キャップレート5%の場合</p>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>1. GPI（満室想定収入）：1,200万円</li>
                <li>2. 空室損失：1,200万円 × 5% = 60万円</li>
                <li>3. EGI（実効総収入）：1,200万円 - 60万円 = 1,140万円</li>
                <li>4. 運営費用：1,140万円 × 20% = 228万円</li>
                <li>5. NOI：1,140万円 - 228万円 = <span className="font-semibold">912万円</span></li>
                <li>6. 収益価格：912万円 ÷ 5% = <span className="font-semibold">1億8,240万円</span></li>
              </ul>
            </div>
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月20日"
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/income-capitalization" />

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
