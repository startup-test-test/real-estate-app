'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import {
  calculateSaleProceeds,
  formatManYen,
} from '@/lib/calculators/saleProceeds'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

interface GlossaryItem {
  slug: string
  title: string
}

interface SaleProceedsCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産の売却時手取り 計算シミュレーション｜税引き後キャッシュを算出'

// =================================================================
// 早見表データ（収益物件売却・3,000万円控除なし・長期譲渡・取得費不明）
// =================================================================
const quickReferenceData: QuickReferenceRow[] = [
  { label: '3,000万円', value: '約2,240万円', subValue: '約75%' },
  { label: '4,000万円', value: '約2,970万円', subValue: '約74%' },
  { label: '5,000万円', value: '約3,700万円', subValue: '約74%' },
  { label: '6,000万円', value: '約4,430万円', subValue: '約74%' },
  { label: '8,000万円', value: '約5,890万円', subValue: '約74%' },
  { label: '1億円', value: '約7,350万円', subValue: '約74%' },
]

// =================================================================
// 目次データ
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '売却時手取りとは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'expenses', title: '売却時にかかる費用', level: 2 },
  { id: 'tax', title: '譲渡所得税について', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function SaleProceedsCalculator({ relatedGlossary = [] }: SaleProceedsCalculatorProps) {
  // 入力状態（万円単位）
  const [salePriceInMan, setSalePriceInMan] = useState<number>(0)
  const [acquisitionCostInMan, setAcquisitionCostInMan] = useState<number>(0)
  const [loanBalanceInMan, setLoanBalanceInMan] = useState<number>(0)
  const [otherExpensesInMan, setOtherExpensesInMan] = useState<number>(30) // デフォルト30万円
  const [ownershipYears, setOwnershipYears] = useState<number>(6)
  const [isResidential, setIsResidential] = useState<boolean>(false)

  // 円に変換
  const salePriceInYen = salePriceInMan * 10000
  const acquisitionCostInYen = acquisitionCostInMan * 10000
  const loanBalanceInYen = loanBalanceInMan * 10000
  const otherExpensesInYen = otherExpensesInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    return calculateSaleProceeds({
      salePrice: salePriceInYen,
      acquisitionCost: acquisitionCostInYen,
      loanBalance: loanBalanceInYen,
      ownershipYears,
      isResidential,
      otherExpenses: otherExpensesInYen,
    })
  }, [salePriceInYen, acquisitionCostInYen, loanBalanceInYen, ownershipYears, isResidential, otherExpensesInYen])

  // 所有期間のラベル
  const ownershipLabel = useMemo(() => {
    if (result.taxDetail.ownershipPeriod === 'over10years') return '10年超（軽減税率）'
    if (result.taxDetail.ownershipPeriod === 'long') return '長期（5年超）'
    return '短期（5年以下）'
  }, [result.taxDetail.ownershipPeriod])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
            {(() => {
              const toolInfo = getToolInfo('/tools/sale-proceeds')
              return toolInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(toolInfo.lastUpdated)}
                </time>
              ) : null
            })()}
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
            不動産売却時の最終的な手取り額（税引き後キャッシュ）を自動計算。
            仲介手数料、譲渡所得税、ローン残高を考慮した実際の手取り額がわかります。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                売却時の手取り額を計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 売却価格 */}
              <NumberInput
                label="売却価格"
                value={salePriceInMan}
                onChange={setSalePriceInMan}
                unit="万円"
                placeholder="例：5000"
              />

              {/* 取得費 */}
              <NumberInput
                label="取得費（購入価格＋諸費用）"
                value={acquisitionCostInMan}
                onChange={setAcquisitionCostInMan}
                unit="万円"
                placeholder="不明な場合は0"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※不明または0の場合、売却価格の5%（概算法）を自動適用
              </p>
              <p className="text-xs text-gray-500 -mt-1">
                ※建物の取得費は、購入価格から経過年数分の「減価償却費」を差し引いた金額を入力してください
              </p>

              {/* ローン残高 */}
              <NumberInput
                label="ローン残高"
                value={loanBalanceInMan}
                onChange={setLoanBalanceInMan}
                unit="万円"
                placeholder="完済済みの場合は0"
              />

              {/* その他費用 */}
              <NumberInput
                label="その他の譲渡費用（印紙税、測量費など）"
                value={otherExpensesInMan}
                onChange={setOtherExpensesInMan}
                unit="万円"
                placeholder="例：30"
              />

              {/* 所有期間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所有期間
                </label>
                <select
                  value={ownershipYears}
                  onChange={(e) => setOwnershipYears(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value={5}>5年以下（短期）</option>
                  <option value={6}>5年超〜10年以下（長期）</option>
                  <option value={11}>10年超（軽減税率対象）</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ※税法上の所有期間は、譲渡年の1月1日時点で判定されるとされています
                </p>
              </div>

              {/* 居住用チェック */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isResidential"
                  checked={isResidential}
                  onChange={(e) => setIsResidential(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isResidential" className="text-sm text-gray-700">
                  居住用財産（マイホーム）として3,000万円控除を適用
                </label>
              </div>
            </div>

            {/* 結果エリア */}
            <div className="bg-white rounded-lg p-4">
              <div className="grid grid-cols-2 gap-y-3 text-base">
                <span className="text-gray-600">売却価格</span>
                <span className="text-right text-lg font-medium">
                  {formatManYen(result.salePrice)}
                </span>

                <span className="text-gray-600">仲介手数料（税込）</span>
                <span className="text-right text-lg font-medium text-red-600">
                  -{formatManYen(result.brokerageFee)}
                </span>

                <span className="text-gray-600">その他の譲渡費用</span>
                <span className="text-right text-lg font-medium text-red-600">
                  -{formatManYen(result.otherExpenses)}
                </span>

                <span className="text-gray-600 border-t pt-3">税引前手取り</span>
                <span className="text-right text-lg font-medium border-t pt-3">
                  {formatManYen(result.preTaxProceeds)}
                </span>

                <span className="text-gray-600">所有期間</span>
                <span className="text-right text-sm text-gray-600">{ownershipLabel}</span>

                <span className="text-gray-600">譲渡所得税</span>
                <span className="text-right text-lg font-medium text-red-600">
                  -{formatManYen(result.capitalGainsTax)}
                </span>

                {result.taxDetail.specialDeduction > 0 && (
                  <>
                    <span className="text-xs text-gray-500 col-span-2">
                      （3,000万円特別控除 適用済み）
                    </span>
                  </>
                )}

                <span className="text-gray-600 border-t pt-3">税引後手取り</span>
                <span className="text-right text-lg font-medium border-t pt-3">
                  {formatManYen(result.afterTaxProceeds)}
                </span>

                {result.loanBalance > 0 && (
                  <>
                    <span className="text-gray-600">ローン残高返済</span>
                    <span className="text-right text-lg font-medium text-red-600">
                      -{formatManYen(result.loanBalance)}
                    </span>
                  </>
                )}

                {/* メイン結果 */}
                <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                  最終手取り額
                </span>
                <span className={`text-right text-2xl font-bold border-t-2 border-blue-300 pt-4 mt-2 ${result.netProceeds >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {result.netProceeds >= 0 ? '' : '-'}約{formatManYen(Math.abs(result.netProceeds))}
                </span>

                {result.salePrice > 0 && (
                  <>
                    <span className="text-sm text-gray-500">売却価格に対する手取り率</span>
                    <span className="text-right text-sm text-gray-500">
                      約{result.netProceedsRate.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>

              {/* 計算式表示 */}
              {salePriceInMan > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>
                      【税引前】{formatManYen(result.salePrice)} - {formatManYen(result.totalTransferExpenses)} = {formatManYen(result.preTaxProceeds)}
                    </p>
                    <p>
                      【税引後】{formatManYen(result.preTaxProceeds)} - {formatManYen(result.capitalGainsTax)} = {formatManYen(result.afterTaxProceeds)}
                    </p>
                    {result.loanBalance > 0 && (
                      <p>
                        【最終】{formatManYen(result.afterTaxProceeds)} - {formatManYen(result.loanBalance)} = {formatManYen(result.netProceeds)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="売却時手取り早見表（収益物件・長期譲渡）"
              description="取得費不明（概算法5%）、3,000万円控除なし、ローン残高0円、その他費用30万円の場合の目安です。"
              headers={['売却価格', '最終手取り（手取り率）']}
              rows={quickReferenceData}
              note="※マイホーム売却の場合は3,000万円控除により税額が大幅に軽減される可能性があります。取得費が判明している場合も手取り額が増える可能性があります"
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
              売却時手取りとは、不動産を売却した際に最終的に手元に残る現金のことです。
              売却価格から仲介手数料、譲渡所得税、ローン残高などを差し引いた金額が
              実際の手取り額となります。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              売却価格がそのまま手元に残るわけではないため、
              事前に手取り額を把握しておくことが重要とされています。
            </p>

            <SectionHeading id="calculation" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-sm">
                手取り額 = 売却価格 - 譲渡費用 - 譲渡所得税 - ローン残高
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              売却価格から各種費用・税金を順番に差し引いていくことで、
              最終的な手取り額を算出することができます。
            </p>
          </section>

          {/* =================================================================
              売却時の費用
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="expenses" items={tocItems} />

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">仲介手数料</h3>
                <p className="text-sm text-gray-700 mb-2">
                  不動産会社に支払う売却の仲介手数料です。
                  売買価格に応じて上限が定められています。
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>・400万円超の場合：売買価格 × 3% + 6万円 + 消費税</li>
                  <li>・200万円超〜400万円以下：売買価格 × 4% + 2万円 + 消費税</li>
                  <li>・200万円以下：売買価格 × 5% + 消費税</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">その他の譲渡費用</h3>
                <p className="text-sm text-gray-700 mb-2">
                  売却に直接関係する費用として、以下のようなものが含まれる場合があります。
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>・印紙税（売買契約書に貼付）</li>
                  <li>・測量費用</li>
                  <li>・建物解体費用（更地渡しの場合）</li>
                  <li>・立退料（賃貸物件の場合）</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">ローン関連費用</h3>
                <p className="text-sm text-gray-700 mb-2">
                  住宅ローンが残っている場合、売却代金から残債を返済します。
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>・ローン残高の一括返済</li>
                  <li>・繰上返済手数料（金融機関による）</li>
                  <li>・抵当権抹消費用（司法書士報酬含む）</li>
                </ul>
              </div>
            </div>
          </section>

          {/* =================================================================
              譲渡所得税について
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="tax" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産売却で利益（譲渡所得）が出た場合、譲渡所得税がかかる場合があります。
              所有期間によって税率が異なり、居住用財産の場合は特例が適用される可能性があります。
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">所有期間</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">税率（合計）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">5年以下（短期）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">39.63%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">5年超（長期）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">20.315%</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-3 py-2">10年超（軽減・6,000万以下）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-700">14.21%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                ※居住用財産の場合、3,000万円特別控除の適用で税額が大幅に軽減される可能性があります
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-2">関連シミュレーター</p>
              <p className="text-sm text-gray-700 mb-2">
                譲渡所得税の詳細な計算は、専用シミュレーターをご利用ください。
              </p>
              <Link
                href="/tools/capital-gains-tax"
                className="text-sm text-blue-700 hover:underline"
              >
                → 譲渡所得税シミュレーター
              </Link>
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

          {/* =================================================================
              参考リンク
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">参考リンク</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3202.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.3202 譲渡所得の計算のしかた（国税庁）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3302.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.3302 マイホームを売ったときの特例（国税庁）
                </a>
              </li>
            </ul>
          </div>

          {/* 免責事項 */}
          <ToolDisclaimer />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/sale-proceeds" />

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
