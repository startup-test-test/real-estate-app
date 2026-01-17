'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import {
  calculateCapitalGainsTax,
  QUICK_REFERENCE_TABLE,
  formatManYen,
} from '@/lib/calculators/capitalGainsTax'

// =================================================================
// 早見表データ
// =================================================================
const quickReferenceData: QuickReferenceRow[] = QUICK_REFERENCE_TABLE.map(row => ({
  label: formatManYen(row.salePrice),
  value: `約${formatManYen(row.taxAmount)}`,
  subValue: '長期・3,000万円控除適用',
}))

// =================================================================
// 目次データ
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '譲渡所得税とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'tax-rate', title: '税率表（参考）', level: 3 },
  { id: 'special', title: '主な特例・控除制度', level: 2 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function CapitalGainsTaxCalculator() {
  // 入力状態（万円単位）
  const [salePriceInMan, setSalePriceInMan] = useState<number>(0)
  const [acquisitionCostInMan, setAcquisitionCostInMan] = useState<number>(0)
  const [transferExpensesInMan, setTransferExpensesInMan] = useState<number>(0)
  const [ownershipYears, setOwnershipYears] = useState<number>(6)
  const [isResidential, setIsResidential] = useState<boolean>(true)

  // 円に変換
  const salePriceInYen = salePriceInMan * 10000
  const acquisitionCostInYen = acquisitionCostInMan * 10000
  const transferExpensesInYen = transferExpensesInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    return calculateCapitalGainsTax({
      salePrice: salePriceInYen,
      acquisitionCost: acquisitionCostInYen,
      transferExpenses: transferExpensesInYen,
      ownershipYears,
      isResidential,
    })
  }, [salePriceInYen, acquisitionCostInYen, transferExpensesInYen, ownershipYears, isResidential])

  // 所有期間のラベル
  const ownershipLabel = useMemo(() => {
    if (result.ownershipPeriod === 'over10years') return '10年超（軽減税率）'
    if (result.ownershipPeriod === 'long') return '長期（5年超）'
    return '短期（5年以下）'
  }, [result.ownershipPeriod])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage="譲渡所得税シミュレーター" />

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            不動産の譲渡所得税を10秒で無料計算｜3000万円控除対応
          </h1>
          <p className="text-gray-600 mb-8">
            不動産売却時の譲渡所得税（所得税・住民税）を自動計算。
            3,000万円特別控除、10年超所有の軽減税率にも対応しています。
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
                譲渡所得税の目安を計算する
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

              {/* 譲渡費用 */}
              <NumberInput
                label="譲渡費用（仲介手数料など）"
                value={transferExpensesInMan}
                onChange={setTransferExpensesInMan}
                unit="万円"
                placeholder="例：150"
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
                  <option value={3}>3年（短期）</option>
                  <option value={5}>5年（短期）</option>
                  <option value={6}>6年（長期）</option>
                  <option value={10}>10年（長期）</option>
                  <option value={11}>11年以上（軽減税率対象）</option>
                  <option value={15}>15年以上</option>
                  <option value={20}>20年以上</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ※税法上の所有期間は、一般的に譲渡年の1月1日時点で判定されるとされています
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
                  {(result.salePrice / 10000).toLocaleString('ja-JP')}万円
                </span>

                <span className="text-gray-600">取得費{result.usedEstimatedCost && '（概算5%）'}</span>
                <span className="text-right text-lg font-medium text-red-600">
                  -{(result.acquisitionCost / 10000).toLocaleString('ja-JP')}万円
                </span>

                <span className="text-gray-600">譲渡費用</span>
                <span className="text-right text-lg font-medium text-red-600">
                  -{(result.transferExpenses / 10000).toLocaleString('ja-JP')}万円
                </span>

                <span className="text-gray-600 border-t pt-3">譲渡所得</span>
                <span className="text-right text-lg font-medium border-t pt-3">
                  {(result.capitalGain / 10000).toLocaleString('ja-JP')}万円
                </span>

                {result.specialDeduction > 0 && (
                  <>
                    <span className="text-gray-600">特別控除（3,000万円）</span>
                    <span className="text-right text-lg font-medium text-red-600">
                      -{(result.specialDeduction / 10000).toLocaleString('ja-JP')}万円
                    </span>
                  </>
                )}

                <span className="text-gray-600 border-t pt-3">課税譲渡所得</span>
                <span className="text-right text-lg font-medium border-t pt-3">
                  {(result.taxableIncome / 10000).toLocaleString('ja-JP')}万円
                </span>

                <span className="text-gray-600">所有期間・税率</span>
                <span className="text-right text-sm text-gray-600">{ownershipLabel}</span>

                {/* メイン結果 */}
                <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                  譲渡所得税（税額目安）
                </span>
                <span className="text-right text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
                  {(result.totalTax / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円
                </span>

                {result.totalTax > 0 && (
                  <>
                    <span className="text-sm text-gray-500">所得税</span>
                    <span className="text-right text-sm text-gray-500">
                      {(result.incomeTax / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円
                    </span>
                    <span className="text-sm text-gray-500">復興特別所得税</span>
                    <span className="text-right text-sm text-gray-500">
                      {(result.reconstructionTax / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 2 })}万円
                    </span>
                    <span className="text-sm text-gray-500">住民税</span>
                    <span className="text-right text-sm text-gray-500">
                      {(result.residentTax / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円
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
                      【譲渡所得】{(result.salePrice / 10000).toLocaleString()}万円 - ({(result.acquisitionCost / 10000).toLocaleString()}万円 + {(result.transferExpenses / 10000).toLocaleString()}万円) = {(result.capitalGain / 10000).toLocaleString()}万円
                    </p>
                    {result.specialDeduction > 0 && (
                      <p>
                        【特別控除後】{(result.capitalGain / 10000).toLocaleString()}万円 - {(result.specialDeduction / 10000).toLocaleString()}万円 = {(result.taxableIncome / 10000).toLocaleString()}万円
                      </p>
                    )}
                    {result.totalTax > 0 && (
                      <p>
                        【税額】{(result.taxableIncome / 10000).toLocaleString()}万円 × {result.appliedRateLabel} = {(result.totalTax / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

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

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="譲渡所得税早見表（3,000万円控除適用・長期譲渡）"
              description="居住用財産を5年超保有し、3,000万円特別控除を適用した場合の概算税額です。取得費は売却価格の5%（概算法）、譲渡費用は0として計算。"
              headers={['売却価格', '譲渡所得税（概算）']}
              rows={quickReferenceData}
              note="※取得費が判明している場合は税額が変わります"
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
              譲渡所得税とは、土地や建物などの不動産を売却して得た利益（譲渡所得）に対して
              課される税金とされています。一般的に、所得税、復興特別所得税、住民税の3つで構成されます。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産の譲渡所得は、給与所得などとは分離して課税される
              <strong>「分離課税」</strong>方式が採用されているとされており、
              所有期間によって税率が異なる場合があります。
            </p>

            <SectionHeading id="calculation" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-sm">
                譲渡所得 = 売却価格 −（取得費 + 譲渡費用）
              </p>
              <p className="font-mono text-gray-800 text-center text-sm mt-2">
                課税譲渡所得 = 譲渡所得 − 特別控除
              </p>
              <p className="font-mono text-gray-800 text-center text-sm mt-2">
                税額 = 課税譲渡所得 × 税率
              </p>
            </div>

            <SectionHeading id="tax-rate" items={tocItems} />
            <p className="text-sm text-gray-600 mb-3">
              以下は一般的な税率の目安です。個別の状況により異なる場合があります。
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">所有期間</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">所得税</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">復興税</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">住民税</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">合計</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">5年以下（短期）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">30%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">0.63%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">9%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">39.63%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">5年超（長期）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">15%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">0.315%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">5%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">20.315%</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-3 py-2">10年超（軽減・6,000万以下）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">10%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">0.21%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">4%</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-700">14.21%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                ※10年超軽減税率は居住用財産で3,000万円控除と併用できるとされています。課税譲渡所得6,000万円超の部分は約20.315%程度とされています。
              </p>
            </div>
          </section>

          {/* =================================================================
              特例・控除制度
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="special" items={tocItems} />

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">居住用財産の3,000万円特別控除</h3>
                <p className="text-sm text-gray-700 mb-2">
                  マイホームを売却した場合、一定の要件を満たすと譲渡所得から最大3,000万円を控除できる場合があります。
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>・現在住んでいる、または住まなくなってから3年以内に売却した場合など</li>
                  <li>・配偶者や親族への売却は対象外となる場合があります</li>
                  <li>・前年・前々年に同特例を受けていないことが要件となる場合があります</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">10年超所有の軽減税率</h3>
                <p className="text-sm text-gray-700 mb-2">
                  所有期間10年超の居住用財産は、一定の要件を満たすと軽減税率が適用される場合があります。
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>・6,000万円以下の部分：14.21%程度</li>
                  <li>・6,000万円超の部分：20.315%程度</li>
                  <li>・3,000万円特別控除と併用できる場合があります</li>
                </ul>
              </div>
            </div>
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
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/joto/3305.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.3305 マイホームを売ったときの軽減税率の特例（国税庁）
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
