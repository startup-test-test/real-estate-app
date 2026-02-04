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
import { calculateNPV } from '@/lib/calculators/npv'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '賃貸経営のNPV（正味現在価値） 計算シミュレーション'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'NPV（正味現在価値）とは', level: 2 },
  { id: 'formula', title: 'NPVの計算式', level: 3 },
  { id: 'irr-comparison', title: 'IRRとの違い', level: 3 },
  { id: 'discount-rate', title: '割引率の設定', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

interface GlossaryItem {
  slug: string
  title: string
}

interface NPVCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// メインコンポーネント
// =================================================================
export function NPVCalculator({ relatedGlossary = [] }: NPVCalculatorProps) {
  // 入力状態
  const [initialInvestmentInMan, setInitialInvestmentInMan] = useState<number>(0) // 初期投資額（万円）
  const [annualCashFlowInMan, setAnnualCashFlowInMan] = useState<number>(0) // 年間キャッシュフロー（万円）
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(10) // 保有期間（年）
  const [discountRate, setDiscountRate] = useState<number>(5) // 割引率（%）
  const [terminalValueInMan, setTerminalValueInMan] = useState<number>(0) // 売却時残存価値（万円）
  const [growthRate, setGrowthRate] = useState<number>(0) // キャッシュフロー成長率（%）

  // 入力があるか判定
  const hasInput = initialInvestmentInMan > 0

  // 計算結果
  const result = useMemo(() => {
    if (initialInvestmentInMan <= 0 || holdingPeriodYears <= 0) {
      return null
    }
    return calculateNPV({
      initialInvestmentInMan,
      annualCashFlowInMan,
      holdingPeriodYears,
      discountRate,
      terminalValueInMan,
      growthRate,
    })
  }, [initialInvestmentInMan, annualCashFlowInMan, holdingPeriodYears, discountRate, terminalValueInMan, growthRate])

  // 感度分析（割引率を変えた場合のNPV）
  const sensitivityAnalysis = useMemo(() => {
    if (!hasInput || holdingPeriodYears <= 0) return []

    const rates = [3, 4, 5, 6, 7, 8, 10, 12]
    return rates.map(rate => {
      const res = calculateNPV({
        initialInvestmentInMan,
        annualCashFlowInMan,
        holdingPeriodYears,
        discountRate: rate,
        terminalValueInMan,
        growthRate,
      })
      return {
        rate,
        npv: res.npv,
        pi: res.profitabilityIndex,
        isSelected: rate === discountRate,
      }
    })
  }, [initialInvestmentInMan, annualCashFlowInMan, holdingPeriodYears, discountRate, terminalValueInMan, growthRate, hasInput])

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
              const toolInfo = getToolInfo('/tools/npv')
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
            賃貸経営のNPV（正味現在価値）を概算計算します。
            将来のキャッシュフローを割引率で現在価値に換算し、投資判断の参考となる指標を算出します。
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
                NPVを概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 初期投資額 */}
              <NumberInput
                label="初期投資額（自己資金）"
                value={initialInvestmentInMan}
                onChange={setInitialInvestmentInMan}
                unit="万円"
                placeholder="例：1000"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※物件価格 + 購入諸経費 - 借入額 = 自己資金
              </p>

              {/* 年間キャッシュフロー */}
              <NumberInput
                label="年間キャッシュフロー（税引前）"
                value={annualCashFlowInMan}
                onChange={setAnnualCashFlowInMan}
                unit="万円"
                placeholder="例：100"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※年間家賃収入 - 経費 - ローン返済 = キャッシュフロー
              </p>

              {/* キャッシュフロー成長率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キャッシュフロー年間成長率（任意）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    min="-10"
                    max="10"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：0"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※賃料上昇を見込む場合は正の値、下落を見込む場合は負の値
                </p>
              </div>

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

              {/* 売却時残存価値 */}
              <NumberInput
                label="売却時の手取り額（税引前概算）"
                value={terminalValueInMan}
                onChange={setTerminalValueInMan}
                unit="万円"
                placeholder="例：800"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※売却価格 - 諸経費 - ローン残債
              </p>

              <hr className="border-gray-200" />

              {/* 割引率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  割引率（期待収益率）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    min="0"
                    max="30"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：5"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
              </div>

            </div>

            {/* 結果エリア */}
            {result && (
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">初期投資額</span>
                  <span className="text-right font-medium">{initialInvestmentInMan.toLocaleString()}万円</span>

                  <span className="text-gray-600">年間キャッシュフロー</span>
                  <span className={`text-right font-medium ${annualCashFlowInMan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {annualCashFlowInMan.toLocaleString()}万円
                  </span>

                  <span className="text-gray-600">保有期間</span>
                  <span className="text-right font-medium">{holdingPeriodYears}年</span>

                  <span className="text-gray-600">割引率</span>
                  <span className="text-right font-medium">{discountRate}%</span>

                  {/* NPV（メイン結果） */}
                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                    NPV（正味現在価値）
                  </span>
                  <span className={`text-right text-2xl font-bold border-t-2 border-blue-300 pt-4 mt-2 ${result.npv >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {result.npv >= 0 ? '+' : ''}{Math.round(result.npv).toLocaleString()}万円
                  </span>

                  <span className="text-gray-600 border-t pt-3">現在価値合計</span>
                  <span className="text-right font-medium border-t pt-3">
                    {Math.round(result.totalPresentValue).toLocaleString()}万円
                  </span>

                  <span className="text-gray-600">収益性指数（PI）</span>
                  <span className={`text-right font-medium ${result.profitabilityIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.profitabilityIndex.toFixed(2)}
                  </span>

                  {result.paybackPeriod && (
                    <>
                      <span className="text-gray-600">回収年数</span>
                      <span className="text-right font-medium">{result.paybackPeriod}年</span>
                    </>
                  )}
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>NPV = Σ（CFt ÷ (1+r)^t）- 初期投資額</p>
                    <p className="text-xs text-gray-500 mt-2">
                      ※CFt = {annualCashFlowInMan.toLocaleString()}万円{growthRate !== 0 ? `× (1+${growthRate}%)^(t-1)` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      ※r = {discountRate}%、期間 = {holdingPeriodYears}年
                    </p>
                    {terminalValueInMan > 0 && (
                      <p className="text-xs text-gray-500">
                        ※{holdingPeriodYears}年目に売却手取り{terminalValueInMan.toLocaleString()}万円を加算
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 感度分析テーブル */}
          {hasInput && sensitivityAnalysis.length > 0 && (
            <section className="mt-8 mb-12">
              <h2 className="text-lg font-bold text-gray-900 mb-4">割引率別NPV感度分析</h2>
              <p className="text-sm text-gray-600 mb-4">
                割引率を変えた場合のNPVの変化を確認できます。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">割引率</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">NPV</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">PI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivityAnalysis.map((row) => (
                      <tr
                        key={row.rate}
                        className={row.isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      >
                        <td className={`px-3 py-2 ${row.isSelected ? 'font-bold text-blue-700' : ''}`}>
                          {row.rate}%{row.isSelected && ' ← 選択中'}
                        </td>
                        <td className={`px-3 py-2 text-right ${row.npv >= 0 ? 'text-green-600' : 'text-red-600'} ${row.isSelected ? 'font-bold' : ''}`}>
                          {row.npv >= 0 ? '+' : ''}{Math.round(row.npv).toLocaleString()}万円
                        </td>
                        <td className={`px-3 py-2 text-right ${row.pi >= 1 ? 'text-green-600' : 'text-red-600'} ${row.isSelected ? 'font-bold' : ''}`}>
                          {row.pi.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ※PI（収益性指数）= 現在価値合計 ÷ 初期投資額。1以上で投資価値がある可能性を示します。
              </p>
            </section>
          )}

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* =================================================================
              解説セクション
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              NPV（Net Present Value：正味現在価値）は、将来得られるキャッシュフローの現在価値の合計から、
              初期投資額を差し引いた金額です。DCF（ディスカウントキャッシュフロー）法に基づく投資評価指標として
              広く使用されています。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              NPVがプラスの場合、設定した割引率（期待収益率）を上回る投資価値がある可能性を示します。
              マイナスの場合は、期待する収益率を下回る可能性があることを意味します。
            </p>

            <SectionHeading id="formula" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-sm">
                NPV = Σ（CFt ÷ (1+r)^t）- 初期投資額
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                CFt: t年目のキャッシュフロー、r: 割引率
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              将来のキャッシュフローは「時間価値」を考慮して現在価値に割り引かれます。
              これは、「今日の100万円」と「10年後の100万円」では価値が異なるという考え方に基づいています。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              ※最終年度には、毎年のキャッシュフローに加え、売却益（手取り額）も現在価値に割り引いて加算します。
            </p>

            <SectionHeading id="irr-comparison" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              NPVとIRRはどちらもDCF法に基づく指標ですが、性質が異なります。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>NPV</strong>：投資による「価値の増加額」を金額で表示。規模の違いを反映。</li>
                <li><strong>IRR</strong>：投資の「収益率」を%で表示。規模を考慮しない。</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              複数の投資案を比較する際は、NPVとIRRを併用して検討することで、
              より多角的な判断材料を得ることができます。
            </p>

            <SectionHeading id="discount-rate" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              割引率は「期待収益率」や「資本コスト」とも呼ばれ、NPVの計算結果に大きく影響します。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>リスクフリーレート</strong>：国債利回り等を基準とする場合があります</li>
                <li><strong>リスクプレミアム</strong>：物件の種類・エリア・築年数等に応じた上乗せ分</li>
                <li><strong>機会費用</strong>：他の投資機会と比較した場合の期待収益率</li>
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
          <RelatedTools currentPath="/tools/npv" />

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
