'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Home, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import {
  calculateMortgageLoan,
  RepaymentMethod,
  QUICK_REFERENCE_BY_RATE,
  QUICK_REFERENCE_BY_AMOUNT,
  formatManYen,
} from '@/lib/calculators/mortgageLoan'

// =================================================================
// 早見表データ
// =================================================================
const quickRefByRate: QuickReferenceRow[] = QUICK_REFERENCE_BY_RATE.map(row => ({
  label: `${row.rate}%`,
  value: `${Math.floor(row.monthlyPayment / 10000).toLocaleString()}万円`,
  subValue: `総額${formatManYen(row.totalPayment)}`,
}))

const quickRefByAmount: QuickReferenceRow[] = QUICK_REFERENCE_BY_AMOUNT.map(row => ({
  label: formatManYen(row.amount),
  value: `${(row.monthlyPayment / 10000).toFixed(1)}万円`,
  subValue: `利息${formatManYen(row.totalInterest)}`,
}))

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '住宅ローンの返済方式とは', level: 2 },
  { id: 'equal-pi', title: '元利均等返済', level: 3 },
  { id: 'equal-p', title: '元金均等返済', level: 3 },
  { id: 'ratio', title: '返済負担率の目安', level: 3 },
  { id: 'bonus', title: 'ボーナス返済について', level: 3 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function MortgageLoanCalculator() {
  // 入力状態
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(3000)
  const [annualRate, setAnnualRate] = useState<number>(1.5)
  const [loanTermYears, setLoanTermYears] = useState<number>(35)
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('equalPrincipalAndInterest')
  const [bonusRatio, setBonusRatio] = useState<number>(0)
  const [annualIncomeInMan, setAnnualIncomeInMan] = useState<number>(0)

  // 円に変換
  const loanAmountInYen = loanAmountInMan * 10000
  const annualIncomeInYen = annualIncomeInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    if (loanAmountInMan <= 0 || annualRate < 0 || loanTermYears <= 0) {
      return null
    }
    return calculateMortgageLoan({
      loanAmount: loanAmountInYen,
      annualRate,
      loanTermYears,
      repaymentMethod,
      bonusRatio,
      annualIncome: annualIncomeInYen > 0 ? annualIncomeInYen : undefined,
    })
  }, [loanAmountInYen, annualRate, loanTermYears, repaymentMethod, bonusRatio, annualIncomeInYen])

  // 返済負担率の色
  const getRatioColor = (evaluation: string | null) => {
    switch (evaluation) {
      case 'safe': return 'text-green-600'
      case 'caution': return 'text-amber-600'
      case 'danger': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRatioBg = (evaluation: string | null) => {
    switch (evaluation) {
      case 'safe': return 'bg-green-50 border-green-200'
      case 'caution': return 'bg-amber-50 border-amber-200'
      case 'danger': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
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
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              ホーム
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <Link href="/tools" className="hover:text-primary-600">
              計算ツール
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <span className="text-gray-900">住宅ローンシミュレーター</span>
          </nav>

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            住宅ローン返済額シミュレーター｜毎月の返済額を10秒で計算
          </h1>
          <p className="text-gray-600 mb-8">
            借入額・金利・返済期間を入力するだけで、毎月の返済額や総返済額を概算計算します。
            ボーナス返済併用や返済負担率の確認にも対応。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                住宅ローンを概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 借入額 */}
              <NumberInput
                label="借入額"
                value={loanAmountInMan}
                onChange={setLoanAmountInMan}
                unit="万円"
                placeholder="例：3000"
              />

              {/* 金利 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  金利（年利）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    max="10"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：1.5"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
              </div>

              {/* 返済期間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返済期間
                </label>
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {[10, 15, 20, 25, 30, 35, 40].map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>

              {/* 返済方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返済方式
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="repaymentMethod"
                      value="equalPrincipalAndInterest"
                      checked={repaymentMethod === 'equalPrincipalAndInterest'}
                      onChange={() => setRepaymentMethod('equalPrincipalAndInterest')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">元利均等返済</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="repaymentMethod"
                      value="equalPrincipal"
                      checked={repaymentMethod === 'equalPrincipal'}
                      onChange={() => setRepaymentMethod('equalPrincipal')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">元金均等返済</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※一般的には元利均等返済が主流です
                </p>
              </div>

              {/* ボーナス返済 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ボーナス返済割合
                </label>
                <select
                  value={bonusRatio}
                  onChange={(e) => setBonusRatio(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value={0}>なし</option>
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                  <option value={30}>30%</option>
                  <option value={40}>40%</option>
                  <option value={50}>50%（上限）</option>
                </select>
              </div>

              {/* 年収（任意） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年収（任意：返済負担率の計算用）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={annualIncomeInMan || ''}
                    onChange={(e) => setAnnualIncomeInMan(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：500"
                  />
                  <span className="text-gray-600 font-medium">万円</span>
                </div>
              </div>
            </div>

            {/* 結果エリア */}
            {result && (
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">借入額</span>
                  <span className="text-right font-medium">{loanAmountInMan.toLocaleString()}万円</span>

                  <span className="text-gray-600">金利</span>
                  <span className="text-right font-medium">{annualRate}%</span>

                  <span className="text-gray-600">返済期間</span>
                  <span className="text-right font-medium">{loanTermYears}年（{result.totalPayments}回）</span>

                  <span className="text-gray-600">返済方式</span>
                  <span className="text-right font-medium text-sm">{result.repaymentMethodLabel}</span>

                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                    毎月の返済額
                  </span>
                  <span className="text-right text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
                    {(result.monthlyPayment / 10000).toFixed(1)}万円
                  </span>
                  <span className="text-gray-500 text-sm"></span>
                  <span className="text-right text-sm text-gray-500">
                    = {result.monthlyPayment.toLocaleString()}円
                  </span>

                  {bonusRatio > 0 && (
                    <>
                      <span className="text-gray-600">ボーナス月の返済額</span>
                      <span className="text-right font-bold text-blue-600">
                        {(result.bonusMonthPayment / 10000).toFixed(1)}万円
                      </span>
                      <span className="text-gray-500 text-xs">（通常月＋ボーナス加算）</span>
                      <span className="text-right text-xs text-gray-500">
                        加算額: {(result.bonusAddition / 10000).toFixed(1)}万円/回
                      </span>
                    </>
                  )}

                  <span className="text-gray-600 border-t pt-3">年間返済額</span>
                  <span className="text-right font-medium border-t pt-3">
                    {(result.annualPayment / 10000).toFixed(1)}万円
                  </span>

                  <span className="text-gray-600">総返済額</span>
                  <span className="text-right font-medium">
                    {(result.totalPayment / 10000).toLocaleString()}万円
                  </span>

                  <span className="text-gray-600">総利息</span>
                  <span className="text-right font-medium text-amber-600">
                    {(result.totalInterest / 10000).toLocaleString()}万円
                  </span>
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>【毎月返済額】元利均等: P × r(1+r)^n / ((1+r)^n - 1)</p>
                    <p>【総返済額】{loanAmountInMan.toLocaleString()}万円 + {(result.totalInterest / 10000).toLocaleString()}万円（利息） = {(result.totalPayment / 10000).toLocaleString()}万円</p>
                  </div>
                </div>

                {/* 返済負担率 */}
                {result.repaymentRatio !== null && (
                  <div className={`mt-4 p-3 rounded-lg border ${getRatioBg(result.repaymentRatioEvaluation)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.repaymentRatioEvaluation === 'safe' && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {result.repaymentRatioEvaluation === 'caution' && (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        {result.repaymentRatioEvaluation === 'danger' && (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-700">返済負担率</span>
                      </div>
                      <span className={`text-xl font-bold ${getRatioColor(result.repaymentRatioEvaluation)}`}>
                        {result.repaymentRatio}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {result.repaymentRatioEvaluation === 'safe' && '安全圏内です（25%以下）'}
                      {result.repaymentRatioEvaluation === 'caution' && '注意が必要です（25〜35%）'}
                      {result.repaymentRatioEvaluation === 'danger' && '審査に影響する可能性があります（35%超）'}
                    </p>
                  </div>
                )}

                {/* 注意事項 */}
                {result.notes.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-1">ご確認ください</p>
                        <ul className="text-xs text-amber-700 space-y-1">
                          {result.notes.map((note, index) => (
                            <li key={index}>・{note}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表（金利別）
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="金利別 毎月返済額早見表"
              description="借入額3,000万円・35年返済・元利均等の場合"
              headers={['金利', '毎月返済額']}
              rows={quickRefByRate}
              note="※概算値です。詳細は金融機関にご確認ください"
            />
          </section>

          {/* =================================================================
              早見表（借入額別）
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="借入額別 毎月返済額早見表"
              description="金利1.5%・35年返済・元利均等の場合"
              headers={['借入額', '毎月返済額']}
              rows={quickRefByAmount}
              note="※概算値です。詳細は金融機関にご確認ください"
            />
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
              住宅ローンには主に2つの返済方式があるとされています。
              どちらを選択するかによって、毎月の返済額や総返済額が変わってきます。
            </p>

            <SectionHeading id="equal-pi" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              毎月の返済額（元金＋利息）が一定になる返済方式です。
              返済計画が立てやすいため、多くの方に選ばれているとされています。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">元利均等返済の特徴</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>・毎月の返済額が一定で計画が立てやすい</li>
                    <li>・返済初期は利息の割合が大きい</li>
                    <li>・元金均等に比べて総返済額がやや多くなる傾向</li>
                  </ul>
                </div>
              </div>
            </div>

            <SectionHeading id="equal-p" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              毎月の元金返済額が一定で、利息は残高に応じて計算される返済方式です。
              返済が進むにつれて毎月の返済額が減少していく特徴があります。
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">元金均等返済の特徴</p>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>・総返済額が元利均等より少なくなる傾向</li>
                    <li>・返済初期の負担が大きい</li>
                    <li>・返済が進むと毎月の返済額が減少する</li>
                  </ul>
                </div>
              </div>
            </div>

            <SectionHeading id="ratio" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              返済負担率とは、年収に対する年間返済額の割合です。
              多くの金融機関では、審査基準として30〜35%を上限としている場合が多いとされています。
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">25%以下：安全圏</p>
                  <p className="text-sm text-green-700">余裕を持った返済が可能とされています</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">25〜35%：注意</p>
                  <p className="text-sm text-amber-700">生活費との兼ね合いを確認することが推奨されています</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">35%超：審査に影響の可能性</p>
                  <p className="text-sm text-red-700">借入額の見直しを検討することが推奨されています</p>
                </div>
              </div>
            </div>

            <SectionHeading id="bonus" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              ボーナス返済を併用すると、毎月の返済額を抑えることができますが、
              総返済額（利息）はやや増加する傾向があるとされています。
              また、転職や景気変動によるボーナス減額リスクも考慮が必要です。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">ボーナス返済の注意点</p>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    <li>・総利息がやや増加する傾向があるとされています</li>
                    <li>・ボーナス減額時のリスクを考慮することが推奨されています</li>
                    <li>・多くの場合、借入額の50%以下が上限とされています</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              参考リンク
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">参考リンク</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                <a href="https://www.flat35.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → フラット35（住宅金融支援機構）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1213.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → 住宅ローン控除について（国税庁）
                </a>
              </li>
            </ul>
          </div>

          {/* 免責事項 */}
          <ToolDisclaimer />

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4 text-center">
              物件の収益性をシミュレーションしてみませんか？
            </p>
            <div className="text-center">
              <Link
                href="/simulator"
                className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                収益シミュレーターを試す
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  )
}
