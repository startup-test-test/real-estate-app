'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Percent } from 'lucide-react'
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
import { calculateLTV, calculateLoanFromLTV, calculateLTVFromEquity } from '@/lib/calculators/ltv'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '賃貸経営のLTV（借入比率） 計算シミュレーション'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'LTV（借入比率）とは', level: 2 },
  { id: 'formula', title: 'LTVの計算式', level: 3 },
  { id: 'reverse', title: '逆算ツール', level: 2 },
  { id: 'related-metrics', title: '関連指標との関係', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

interface GlossaryItem {
  slug: string
  title: string
}

interface LTVCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// メインコンポーネント
// =================================================================
export function LTVCalculator({ relatedGlossary = [] }: LTVCalculatorProps) {
  // 入力状態
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0) // 物件価格（万円）
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0) // 借入額（万円）
  const [purchaseCostsInMan, setPurchaseCostsInMan] = useState<number>(0) // 購入諸経費（万円）

  // 逆算ツール用状態
  const [reversePropertyPrice, setReversePropertyPrice] = useState<number>(0)
  const [targetLTV, setTargetLTV] = useState<number>(0)
  const [reverseEquityPropertyPrice, setReverseEquityPropertyPrice] = useState<number>(0)
  const [equityAmount, setEquityAmount] = useState<number>(0)

  // 入力があるか判定
  const hasInput = propertyPriceInMan > 0

  // 計算結果
  const result = useMemo(() => {
    if (propertyPriceInMan <= 0) {
      return null
    }
    return calculateLTV({
      propertyPriceInMan,
      loanAmountInMan,
      purchaseCostsInMan,
    })
  }, [propertyPriceInMan, loanAmountInMan, purchaseCostsInMan])

  // 逆算結果（目標LTVから借入額）
  const loanFromLTV = useMemo(() => {
    if (reversePropertyPrice <= 0 || targetLTV <= 0) return null
    return calculateLoanFromLTV(reversePropertyPrice, targetLTV)
  }, [reversePropertyPrice, targetLTV])

  // 逆算結果（自己資金からLTV）
  const ltvFromEquity = useMemo(() => {
    if (reverseEquityPropertyPrice <= 0) return null
    return calculateLTVFromEquity(reverseEquityPropertyPrice, equityAmount)
  }, [reverseEquityPropertyPrice, equityAmount])

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
            賃貸経営のLTV（Loan to Value：借入比率）を概算計算します。
            物件価格と借入額からLTVを算出し、自己資金比率も同時に確認できます。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Percent className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                LTVを概算計算する
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

              {/* 借入額 */}
              <NumberInput
                label="借入額"
                value={loanAmountInMan}
                onChange={setLoanAmountInMan}
                unit="万円"
                placeholder="例：4000"
              />

              {/* 購入諸経費（任意） */}
              <NumberInput
                label="購入諸経費（任意・物件価格の7%程度が目安）"
                value={purchaseCostsInMan}
                onChange={setPurchaseCostsInMan}
                unit="万円"
                placeholder="例：350"
              />
            </div>

            {/* 結果エリア */}
            {result && (
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">物件価格</span>
                  <span className="text-right font-medium">{propertyPriceInMan.toLocaleString()}万円</span>

                  <span className="text-gray-600">借入額</span>
                  <span className="text-right font-medium">{loanAmountInMan.toLocaleString()}万円</span>

                  {/* LTV（メイン結果） */}
                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                    LTV（借入比率）
                  </span>
                  <span className="text-right text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
                    {result.ltv.toFixed(2)}%
                  </span>

                  <span className="text-gray-600 border-t pt-3">自己資金比率</span>
                  <span className="text-right font-medium border-t pt-3">
                    {result.equityRatio.toFixed(2)}%
                  </span>

                  <span className="text-gray-600">自己資金額</span>
                  <span className="text-right font-medium">
                    {result.equityAmount.toLocaleString()}万円
                  </span>

                  {result.ltvWithCosts !== null && (
                    <>
                      <span className="text-gray-600 border-t pt-3">総投資額</span>
                      <span className="text-right font-medium border-t pt-3">
                        {result.totalInvestment.toLocaleString()}万円
                      </span>

                      <span className="text-gray-600">総投資額に対するLTV</span>
                      <span className="text-right font-medium">
                        {result.ltvWithCosts.toFixed(2)}%
                      </span>
                    </>
                  )}
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>LTV = 借入額 ÷ 物件価格 × 100</p>
                    <p className="text-xs text-gray-500 mt-2">
                      = {loanAmountInMan.toLocaleString()}万円 ÷ {propertyPriceInMan.toLocaleString()}万円 × 100
                    </p>
                    <p className="text-xs text-gray-500">
                      = {result.ltv.toFixed(2)}%
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
              LTV（Loan to Value：借入比率）は、物件価格に対する借入額の割合を示す指標です。
              賃貸経営におけるレバレッジの程度を把握するために使用されます。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              LTVが高いほど借入の割合が大きく、低いほど自己資金の割合が大きいことを意味します。
            </p>

            <SectionHeading id="formula" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-sm">
                LTV（%）= 借入額 ÷ 物件価格 × 100
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              自己資金比率は「100% - LTV」で算出されます。
              例えば、LTVが80%の場合、自己資金比率は20%となります。
            </p>

            <SectionHeading id="reverse" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              目標のLTVから必要な借入額を計算したり、自己資金からLTVを計算することもできます。
            </p>

            {/* 逆算ツール1: 目標LTVから借入額 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">目標LTVから借入額を計算</h4>
              <div className="space-y-3">
                <NumberInput
                  label="物件価格"
                  value={reversePropertyPrice}
                  onChange={setReversePropertyPrice}
                  unit="万円"
                  placeholder="例：5000"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目標LTV
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={targetLTV || ''}
                      onChange={(e) => setTargetLTV(parseFloat(e.target.value) || 0)}
                      step="1"
                      min="0"
                      max="100"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例：80"
                    />
                    <span className="text-gray-600 font-medium">%</span>
                  </div>
                </div>
                {loanFromLTV !== null && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600">必要な借入額：</p>
                    <p className="text-lg font-bold text-blue-700">
                      {loanFromLTV.toLocaleString()}万円
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 逆算ツール2: 自己資金からLTV */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">自己資金からLTVを計算</h4>
              <div className="space-y-3">
                <NumberInput
                  label="物件価格"
                  value={reverseEquityPropertyPrice}
                  onChange={setReverseEquityPropertyPrice}
                  unit="万円"
                  placeholder="例：5000"
                />
                <NumberInput
                  label="自己資金"
                  value={equityAmount}
                  onChange={setEquityAmount}
                  unit="万円"
                  placeholder="例：1000"
                />
                {ltvFromEquity !== null && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600">LTV：</p>
                    <p className="text-lg font-bold text-blue-700">
                      {ltvFromEquity.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      借入額：{(reverseEquityPropertyPrice - equityAmount).toLocaleString()}万円
                    </p>
                  </div>
                )}
              </div>
            </div>

            <SectionHeading id="related-metrics" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              LTVは他の投資指標と組み合わせて分析することで、より詳細な判断材料となります。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>CCR（自己資金配当率）</strong>：LTVが高いほど自己資金が少なくなり、CCRに影響します。</li>
                <li><strong>DSCR（債務返済カバー率）</strong>：借入額が増えると返済負担が増加し、DSCRに影響します。</li>
                <li><strong>ROI（投資利益率）</strong>：レバレッジ効果により、LTVがROIに影響を与える場合があります。</li>
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
          <RelatedTools currentPath="/tools/ltv" />

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
