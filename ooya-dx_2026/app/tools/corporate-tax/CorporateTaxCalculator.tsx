'use client'

import React, { useState, useMemo } from 'react'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { ContentPageLayout } from '@/components/tools/ContentPageLayout'
import { calculateCorporateTaxTotal } from '@/lib/calculators/corporate-tax'

// 早見表データ
const quickReferenceData: QuickReferenceRow[] = [
  { label: '100万円', value: '約29万円', subValue: '実効税率 約29%' },
  { label: '200万円', value: '約52万円', subValue: '実効税率 約26%' },
  { label: '300万円', value: '約74万円', subValue: '実効税率 約25%' },
  { label: '400万円', value: '約97万円', subValue: '実効税率 約24%' },
  { label: '500万円', value: '約121万円', subValue: '実効税率 約24%' },
  { label: '600万円', value: '約146万円', subValue: '実効税率 約24%' },
  { label: '700万円', value: '約171万円', subValue: '実効税率 約24%' },
  { label: '800万円', value: '約196万円', subValue: '実効税率 約24%' },
  { label: '900万円', value: '約233万円', subValue: '実効税率 約26%' },
  { label: '1,000万円', value: '約270万円', subValue: '実効税率 約27%' },
]

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産法人の法人税等 計算シミュレーション｜早見表付き'

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: '不動産法人にかかる税金とは', level: 2 },
  { id: 'structure', title: '法人税等の構成', level: 3 },
  { id: 'effective-rate', title: '実効税率について', level: 3 },
  { id: 'costs', title: '法人の維持コスト', level: 3 },
]

// シミュレーター本体
function CorporateTaxSimulator() {
  // 万円単位で入力
  const [incomeInMan, setIncomeInMan] = useState<number>(0)

  // 円に変換
  const incomeInYen = incomeInMan * 10000

  // 計算結果（標準税率で一律計算）
  const result = useMemo(() => {
    return calculateCorporateTaxTotal(incomeInYen)
  }, [incomeInYen])

  // 入力があるかどうか
  const hasInput = incomeInMan > 0

  return (
    <>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
        課税所得を入力するだけで、法人税・住民税・事業税等の概算額と実効税率を瞬時に計算します。
      </p>

      {/* シミュレーター本体 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            法人税等を概算計算する
          </h2>
        </div>

        {/* 入力エリア */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4">
          <NumberInput
            label="年間課税所得を入力"
            value={incomeInMan}
            onChange={setIncomeInMan}
            unit="万円"
            placeholder="例：1000"
          />
          {hasInput ? (
            <p className="text-sm text-gray-500 mt-1">
              = {incomeInMan.toLocaleString('ja-JP')}万円（{incomeInYen.toLocaleString('ja-JP')}円）
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-2">
              例：1000 → 1,000万円 → 法人税等 約273万円
            </p>
          )}
        </div>

        {/* 適用税率の説明 */}
        {hasInput && (
          <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">適用税率：</span>
              法人税 {result.breakdown.corporateTaxRate}、
              住民税割 {result.breakdown.residentTaxRate}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {incomeInYen <= 8000000
                ? '800万円以下のため軽減税率（15%）を適用'
                : '800万円超のため、800万円まで15%・超過分23.2%を適用'}
            </p>
          </div>
        )}

        {/* 結果エリア（詳細表示） */}
        <div className="bg-white rounded-lg p-3 sm:p-4">
          <div className="space-y-2">
            {/* 法人税 */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">法人税（国税）</span>
              <span className="font-medium text-sm sm:text-base">
                {hasInput ? `${Math.round(result.corporateTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
              </span>
            </div>

            {/* 地方法人税 */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">地方法人税（10.3%）</span>
              <span className="font-medium text-sm sm:text-base">
                {hasInput ? `${Math.round(result.localCorporateTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
              </span>
            </div>

            {/* 法人住民税（法人税割） */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">法人住民税（法人税割）</span>
              <span className="font-medium text-sm sm:text-base">
                {hasInput ? `${Math.round(result.residentTaxPortion / 10000).toLocaleString('ja-JP')}万円` : '-'}
              </span>
            </div>

            {/* 法人住民税（均等割） */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">法人住民税（均等割）</span>
              <span className="font-medium text-sm sm:text-base">{(result.equalLevy / 10000).toLocaleString('ja-JP')}万円</span>
            </div>

            {/* 法人事業税 */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">法人事業税</span>
              <span className="font-medium text-sm sm:text-base">
                {hasInput ? `${Math.round(result.businessTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
              </span>
            </div>

            {/* 特別法人事業税 */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">特別法人事業税（37%）</span>
              <span className="font-medium text-sm sm:text-base">
                {hasInput ? `${Math.round(result.specialBusinessTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
              </span>
            </div>

            {/* 合計 */}
            <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-blue-300">
              <span className="text-gray-700 font-medium text-sm sm:text-base">法人税等 合計</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-700">
                {hasInput ? `約${Math.round(result.totalTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
              </span>
            </div>

            {/* 実効税率 */}
            {hasInput && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600 text-sm">実効税率</span>
                <span className="text-base sm:text-lg font-semibold text-blue-600">
                  約{result.effectiveRate.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* 計算式表示 */}
          {hasInput && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">計算式</p>
              <div className="text-xs sm:text-sm text-gray-700 font-mono space-y-1">
                <p>【法人税】{incomeInMan <= 800 ? `${incomeInMan.toLocaleString()}万円 × 15%` : `800万円 × 15% + ${(incomeInMan - 800).toLocaleString()}万円 × 23.2%`} = {Math.round(result.corporateTax / 10000).toLocaleString()}万円</p>
                <p>【地方法人税】{Math.round(result.corporateTax / 10000).toLocaleString()}万円 × 10.3% = {Math.round(result.localCorporateTax / 10000).toLocaleString()}万円</p>
                <p>【住民税】法人税割 + 均等割7万円 = {Math.round((result.residentTaxPortion + result.equalLevy) / 10000).toLocaleString()}万円</p>
                <p>【事業税等】事業税 + 特別法人事業税 = {Math.round((result.businessTax + result.specialBusinessTax) / 10000).toLocaleString()}万円</p>
                <p>【合計】{Math.round(result.corporateTax / 10000).toLocaleString()} + {Math.round(result.localCorporateTax / 10000).toLocaleString()} + {Math.round((result.residentTaxPortion + result.equalLevy) / 10000).toLocaleString()} + {Math.round((result.businessTax + result.specialBusinessTax) / 10000).toLocaleString()} = 約{Math.round(result.totalTax / 10000).toLocaleString()}万円</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 早見表 */}
      <section className="mt-8 sm:mt-12 mb-8 sm:mb-12">
        <QuickReferenceTable
          title="法人税等 早見表"
          description="課税所得に対する法人税等の目安です（中小法人・東京都の場合）。"
          headers={['課税所得', '法人税等（概算）']}
          rows={quickReferenceData}
          note="※所得が低い場合、均等割（年間約7万円の固定税額）の影響で実効税率が高く表示されます。"
        />
      </section>
    </>
  )
}

// 追加コンテンツ
function CorporateTaxAdditionalContent() {
  return (
    <>
      {/* 目次 */}
      <TableOfContents items={tocItems} />

      {/* 解説セクション */}
      <section className="mb-8 sm:mb-12">
        <SectionHeading id="about" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          不動産賃貸業を法人で行う場合、法人が負担する主な税金は「法人税等」と総称されます。これは複数の税金で構成されており、国税と地方税が含まれます。
        </p>

        <SectionHeading id="structure" items={tocItems} />
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <ul className="text-gray-700 space-y-2 text-sm">
            <li><span className="font-medium">法人税（国税）</span>：課税所得に対して課税。800万円以下15%、超過分23.2%</li>
            <li><span className="font-medium">地方法人税（国税）</span>：法人税額の10.3%</li>
            <li><span className="font-medium">法人住民税（地方税）</span>：法人税割（法人税額の7%〜10.4%）+ 均等割（年間約7万円）</li>
            <li><span className="font-medium">法人事業税（地方税）</span>：課税所得に対して3.5%〜7%の3段階税率</li>
            <li><span className="font-medium">特別法人事業税（国税）</span>：法人事業税額の37%</li>
          </ul>
        </div>

        <SectionHeading id="effective-rate" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          実効税率とは、事業税が翌年度に損金算入されることを考慮した実質的な税負担率です。中小法人の場合、目安は以下の通りです。
        </p>
        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-4">
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>課税所得800万円以下：約21%〜25%</li>
            <li>課税所得800万円超：約33%〜35%</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            ※地域や個別の条件により異なります
          </p>
        </div>

        <SectionHeading id="costs" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          法人を設立・維持するには、税金以外にもコストがかかります。
        </p>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <ul className="text-gray-700 space-y-2 text-sm">
            <li><span className="font-medium">法人住民税均等割</span>：年間約7万円（赤字でも発生）</li>
            <li><span className="font-medium">税理士報酬</span>：年間15万円〜60万円程度</li>
            <li><span className="font-medium">社会保険料</span>：役員報酬の約30%（法人・個人折半）</li>
          </ul>
        </div>
      </section>
    </>
  )
}

export function CorporateTaxCalculator() {
  return (
    <ContentPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/corporate-tax"
      additionalContent={<CorporateTaxAdditionalContent />}
    >
      <CorporateTaxSimulator />
    </ContentPageLayout>
  )
}
