'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Home, Info } from 'lucide-react'
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
import {
  calculateMortgageLoan,
  RepaymentMethod,
} from '@/lib/calculators/mortgageLoan'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

interface GlossaryItem {
  slug: string
  title: string
}

interface MortgageLoanCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '住宅ローン 計算シミュレーション｜毎月返済額・総返済額'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '住宅ローンの返済方式とは', level: 2 },
  { id: 'equal-pi', title: '元利均等返済', level: 3 },
  { id: 'equal-p', title: '元金均等返済', level: 3 },
  { id: 'bonus', title: 'ボーナス返済について', level: 3 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function MortgageLoanCalculator({ relatedGlossary = [] }: MortgageLoanCalculatorProps) {
  // 入力状態
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0)
  const [downPaymentInMan, setDownPaymentInMan] = useState<number>(0)
  const [annualRate, setAnnualRate] = useState<number>(1.5)
  const [loanTermYears, setLoanTermYears] = useState<number>(35)
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('equalPrincipalAndInterest')
  const [annualBonusInMan, setAnnualBonusInMan] = useState<number>(0)

  // 借入額を自動計算
  const loanAmountInMan = Math.max(0, propertyPriceInMan - downPaymentInMan)

  // 円に変換
  const loanAmountInYen = loanAmountInMan * 10000
  const annualBonusInYen = annualBonusInMan * 10000

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
      annualBonusPayment: annualBonusInYen,
    })
  }, [loanAmountInYen, annualRate, loanTermYears, repaymentMethod, annualBonusInYen])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
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
              const toolInfo = getToolInfo('/tools/mortgage-loan')
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
            物件価格・頭金・金利・返済期間を入力するだけで、毎月の返済額や総返済額を概算計算します。
            ボーナス返済併用にも対応しています。
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
              {/* 物件価格 */}
              <NumberInput
                label="物件価格"
                value={propertyPriceInMan}
                onChange={setPropertyPriceInMan}
                unit="万円"
                placeholder="例：5000"
              />

              {/* 頭金 */}
              <NumberInput
                label="頭金"
                value={downPaymentInMan}
                onChange={setDownPaymentInMan}
                unit="万円"
                placeholder="例：500"
              />

              {/* 年間ボーナス返済額 */}
              <NumberInput
                label="ボーナス返済額（年間合計）"
                value={annualBonusInMan}
                onChange={setAnnualBonusInMan}
                unit="万円"
                placeholder="例：50"
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
                <select
                  value={repaymentMethod}
                  onChange={(e) => setRepaymentMethod(e.target.value as RepaymentMethod)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="equalPrincipalAndInterest">元利均等返済</option>
                  <option value="equalPrincipal">元金均等返済</option>
                </select>
              </div>

            </div>

            {/* 結果エリア */}
            {result && (
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">物件価格</span>
                  <span className="text-right font-medium">{propertyPriceInMan.toLocaleString()}万円</span>

                  <span className="text-gray-600">頭金</span>
                  <span className="text-right font-medium text-green-600">-{downPaymentInMan.toLocaleString()}万円</span>

                  <span className="text-gray-600 border-t pt-2">借入額</span>
                  <span className="text-right font-medium border-t pt-2">{loanAmountInMan.toLocaleString()}万円</span>

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
                    約{(result.monthlyPayment / 10000).toFixed(1)}万円
                  </span>

                  {annualBonusInMan > 0 && (
                    <>
                      <span className="text-gray-600">ボーナス返済（年間）</span>
                      <span className="text-right font-bold text-blue-600">
                        {annualBonusInMan.toLocaleString()}万円
                      </span>
                    </>
                  )}

                  <span className="text-gray-600 border-t pt-3">年間返済額</span>
                  <span className="text-right font-medium border-t pt-3">
                    約{(result.annualPayment / 10000).toFixed(1)}万円
                  </span>

                  <span className="text-gray-600">総返済額</span>
                  <span className="text-right font-medium">
                    約{Math.round(result.totalPayment / 10000).toLocaleString()}万円
                  </span>

                  <span className="text-gray-600">総利息</span>
                  <span className="text-right font-medium text-amber-600">
                    約{Math.round(result.totalInterest / 10000).toLocaleString()}万円
                  </span>
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算内訳</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>借入額 {loanAmountInMan.toLocaleString()}万円 + 利息 約{Math.round(result.totalInterest / 10000).toLocaleString()}万円 = 総返済額 約{Math.round(result.totalPayment / 10000).toLocaleString()}万円</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表（マトリクス）
          ================================================================= */}
          <section className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">住宅ローン返済額の早見表</h2>
            <p className="text-sm text-gray-600 mb-4">35年返済・元利均等・ボーナス返済なしの場合</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700">借入額＼金利</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">0.5%</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">1.0%</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">1.5%</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">2.0%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">1,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">2.6万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">2.8万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">3.1万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">3.3万円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">2,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">5.2万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">5.6万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">6.1万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">6.6万円</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">3,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">7.8万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">8.5万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">9.2万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">9.9万円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">4,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">10.4万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">11.3万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">12.2万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">13.3万円</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">5,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">13.0万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">14.1万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">15.3万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">16.6万円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">6,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">15.6万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">16.9万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">18.4万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">19.9万円</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">7,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">18.2万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">19.8万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">21.4万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">23.2万円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">8,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">20.8万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">22.6万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">24.5万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">26.5万円</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">9,000万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">23.4万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">25.4万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">27.6万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">29.8万円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">1億円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">26.0万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">28.2万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">30.6万円</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">33.1万円</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">※詳細は金融機関にご確認ください</p>
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

            <SectionHeading id="bonus" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              ボーナス返済を併用すると、毎月の返済額を抑えることができます。
              ボーナス月（年2回）に追加で返済を行う方式です。
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

          {/* =================================================================
              参考リンク
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">参考リンク</p>
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
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月18日"
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/mortgage-loan" />

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
