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
import {
  calculateDSCR,
  getDSCRBenchmarks,
} from '@/lib/calculators/dscr'

// ページタイトル
const PAGE_TITLE = 'DSCR（債務返済カバー率） 計算シミュレーション｜融資審査の目安がわかる'

// 早見表データ（NOI 500万円、金利2%、期間25年の場合）
const quickReferenceData: QuickReferenceRow3Col[] = [
  { label: '借入5,000万円', value1: 'DSCR 1.85', value2: '返済可能性：高' },
  { label: '借入6,000万円', value1: 'DSCR 1.54', value2: '返済可能性：高' },
  { label: '借入7,000万円', value1: 'DSCR 1.32', value2: '返済可能性：中' },
  { label: '借入8,000万円', value1: 'DSCR 1.16', value2: '返済可能性：低' },
  { label: '借入9,000万円', value1: 'DSCR 1.03', value2: '返済可能性：要注意' },
  { label: '借入1億円', value1: 'DSCR 0.93', value2: '返済可能性：困難' },
]

// 金融機関別基準
const bankBenchmarkData: QuickReferenceRow3Col[] = [
  { label: '都市銀行（メガバンク）', value1: '1.3以上', value2: '物件単体の収益力で評価' },
  { label: '地方銀行', value1: '1.2以上', value2: '積算評価も重視' },
  { label: '信用金庫・信用組合', value1: '1.1以上', value2: '審査は柔軟、期間は短め' },
  { label: 'ノンバンク', value1: '1.0以上', value2: '金利は高いが基準は緩め' },
]

// 目次
const tocItems: TocItem[] = [
  { id: 'about', title: 'DSCRとは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'benchmark', title: '金融機関別の目安', level: 3 },
  { id: 'stress-test', title: 'ストレステストの重要性', level: 3 },
]

// 評価レベルに応じた色を取得
function getEvaluationColor(level: string): string {
  switch (level) {
    case 'excellent':
      return 'text-green-600'
    case 'good':
      return 'text-blue-600'
    case 'caution':
      return 'text-yellow-600'
    case 'danger':
      return 'text-orange-600'
    case 'critical':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

function getEvaluationBgColor(level: string): string {
  switch (level) {
    case 'excellent':
      return 'bg-green-50 border-green-200'
    case 'good':
      return 'bg-blue-50 border-blue-200'
    case 'caution':
      return 'bg-yellow-50 border-yellow-200'
    case 'danger':
      return 'bg-orange-50 border-orange-200'
    case 'critical':
      return 'bg-red-50 border-red-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

export function DSCRCalculator() {
  // 入力状態（万円単位）
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)
  const [vacancyRate, setVacancyRate] = useState<number>(5)
  const [expenseRate, setExpenseRate] = useState<number>(20)
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0)
  const [interestRate, setInterestRate] = useState<number>(2.0)
  const [loanTermYears, setLoanTermYears] = useState<number>(25)
  const [stressInterestRate, setStressInterestRate] = useState<number>(3.5)
  const [stressVacancyRate, setStressVacancyRate] = useState<number>(15)
  const [showStressTest, setShowStressTest] = useState<boolean>(false)

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
      stressInterestRate: showStressTest ? stressInterestRate : undefined,
      stressVacancyRate: showStressTest ? stressVacancyRate : undefined,
    })
  }, [annualRentInMan, vacancyRate, expenseRate, loanAmountInMan, interestRate, loanTermYears, stressInterestRate, stressVacancyRate, showStressTest])

  const hasInput = annualRentInMan > 0 && loanAmountInMan > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
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
            年間賃料収入と借入条件を入力するだけで、DSCR（債務返済カバー率）を瞬時に計算します。
            金融機関の融資審査における目安がわかります。
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

              {/* ストレステスト */}
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStressTest}
                    onChange={(e) => setShowStressTest(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    銀行審査モード（ストレステスト）
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  金融機関が実際に使用する厳しい条件でシミュレーションします
                </p>
              </div>

              {showStressTest && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-amber-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
                      審査金利
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={stressInterestRate}
                        onChange={(e) => setStressInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="flex-1 min-w-0 border-2 border-amber-300 rounded-l-lg px-3 py-2 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                      <span className="flex-shrink-0 bg-amber-100 border border-l-0 border-amber-300 rounded-r-lg px-3 py-2 text-amber-700 flex items-center text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">
                      審査用空室率
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        step={1}
                        value={stressVacancyRate}
                        onChange={(e) => setStressVacancyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="flex-1 min-w-0 border-2 border-amber-300 rounded-l-lg px-3 py-2 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                      <span className="flex-shrink-0 bg-amber-100 border border-l-0 border-amber-300 rounded-r-lg px-3 py-2 text-amber-700 flex items-center text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 結果エリア */}
            <div className="space-y-3">
              <ResultCard
                label="DSCR（債務返済カバー率）"
                value={result?.dscr ?? 0}
                unit="倍"
                highlight={true}
                subText={result?.evaluation.label}
              />

              {/* 評価表示 */}
              {hasInput && result && (
                <div className={`p-3 border rounded-lg ${getEvaluationBgColor(result.evaluation.level)}`}>
                  <p className={`text-sm font-medium ${getEvaluationColor(result.evaluation.level)}`}>
                    {result.evaluation.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.evaluation.description}
                  </p>
                </div>
              )}

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

              {/* ストレステスト結果 */}
              {showStressTest && hasInput && result && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-3">
                    銀行審査モード（ストレステスト）結果
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-700">審査用DSCR</span>
                      <span className={`font-bold ${getEvaluationColor(result.bankEvaluation.level)}`}>
                        {result.stressTest.dscr.toFixed(2)}倍
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-700">審査用NOI</span>
                      <span className="font-medium text-gray-700">
                        約{result.stressTest.noi.toLocaleString()}万円/年
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-700">審査用ADS</span>
                      <span className="font-medium text-gray-700">
                        約{result.stressTest.ads.toLocaleString()}万円/年
                      </span>
                    </div>
                    <div className={`mt-2 p-2 rounded ${getEvaluationBgColor(result.bankEvaluation.level)}`}>
                      <p className={`text-sm font-medium ${getEvaluationColor(result.bankEvaluation.level)}`}>
                        融資審査見込み：{result.bankEvaluation.label}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {result.bankEvaluation.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 借入可能上限額 */}
              {hasInput && result && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">参考：DSCR 1.2基準での借入可能上限額</p>
                  <p className="text-lg font-bold text-gray-800">
                    約{result.maxLoanAmount.toLocaleString()}万円
                  </p>
                </div>
              )}
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
              description="NOI 500万円、金利2%、借入期間25年の場合の借入金額別DSCRの目安です。"
              headers={['借入金額', { title: 'DSCR' }, { title: '返済可能性' }]}
              rows={quickReferenceData}
              note="※元利均等返済の場合。実際の融資可否は金融機関の審査によります。"
            />
          </section>

          {/* 金融機関別基準 */}
          <section className="mb-12">
            <QuickReferenceTable3Col
              title="金融機関別DSCR基準（目安）"
              description="金融機関タイプ別の一般的なDSCR基準とされています。"
              headers={['金融機関タイプ', { title: 'DSCR基準' }, { title: '特徴' }]}
              rows={bankBenchmarkData}
              note="※一般的な目安であり、実際の審査基準は各金融機関により異なります。"
            />
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              DSCR（Debt Service Coverage Ratio：債務返済カバー率）は、不動産が生み出す純営業収益（NOI）が、年間の借入返済額（ADS）の何倍あるかを示す指標です。
              金融機関が不動産投資向け融資の審査において、返済能力を判断する際に重視する指標とされています。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              DSCRが1.0を超えていれば、物件の収益で返済を賄える状態を意味し、数値が高いほど返済余力があるとされています。
              一般的に1.2以上が融資審査の合格ラインとされることが多いとされています。
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

            <SectionHeading id="benchmark" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              金融機関によってDSCRの審査基準は異なるとされています。
              一般的に、都市銀行（メガバンク）は1.3以上、地方銀行は1.2以上、信用金庫は1.1以上が目安とされています。
              ただし、担保評価や借り手の属性によって柔軟に判断される場合もあるとされています。
            </p>

            <SectionHeading id="stress-test" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              金融機関は融資審査において、実際の金利よりも高い「審査金利」（3.5%〜4.0%程度）や、
              厳しめの空室率（15%〜20%程度）を適用してDSCRを計算することがあるとされています。
              これは将来の金利上昇リスクや収益悪化に備えたストレステストとされています。
            </p>
            <p className="text-gray-700 leading-relaxed">
              本シミュレーターの「銀行審査モード」では、このストレステストを再現できます。
              実行金利でのDSCRが良好でも、審査金利でのDSCRが基準を下回る場合、融資が難しくなる可能性があるとされています。
            </p>
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月20日"
            additionalItems={[
              '金融機関の融資審査基準は各金融機関により異なります',
              'DSCRは融資審査における一つの指標であり、融資可否を保証するものではありません',
            ]}
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
