'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { getToolInfo, formatToolDate } from '@/lib/navigation'
import {
  calculateReplacementCost,
  STRUCTURE_OPTIONS,
  USAGE_OPTIONS,
  UNIT_PRICE_TABLE,
  BuildingStructure,
  BuildingUsage,
  getStructureConfig,
  getUsageConfig,
} from '@/lib/calculators/replacement-cost'

// ページタイトル
const PAGE_TITLE = '建物の再調達価格 計算シミュレーション｜構造・用途別の積算評価'

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: '再調達価格（再調達原価）とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'unit-price', title: '構造・用途別の建築単価', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

interface GlossaryItem {
  slug: string
  title: string
}

interface Props {
  relatedGlossary?: GlossaryItem[]
}

// 早見表データ（構造別の法定耐用年数）
const usefulLifeTableData = [
  { label: '木造', value: '22年' },
  { label: '鉄骨造（S造）', value: '34年' },
  { label: '鉄筋コンクリート造（RC造）', value: '47年' },
  { label: '鉄骨鉄筋コンクリート造（SRC造）', value: '47年' },
]

export function ReplacementCostCalculator({ relatedGlossary = [] }: Props) {
  // 入力状態
  const [floorArea, setFloorArea] = useState<number>(0)
  const [buildingAge, setBuildingAge] = useState<number>(0)
  const [structure, setStructure] = useState<BuildingStructure>('rc')
  const [usage, setUsage] = useState<BuildingUsage>('residential')

  // 計算結果
  const result = useMemo(() => {
    return calculateReplacementCost(floorArea, buildingAge, structure, usage)
  }, [floorArea, buildingAge, structure, usage])

  // 入力があるかどうか
  const hasInput = floorArea > 0

  // 現在の構造・用途情報
  const currentStructure = getStructureConfig(structure)
  const currentUsage = getUsageConfig(usage)
  const currentUnitPrice = UNIT_PRICE_TABLE[structure][usage]

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
              const toolInfo = getToolInfo('/tools/replacement-cost')
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
            建物の延床面積・構造・用途・築年数を入力するだけで、再調達価格（新築時の建築費用）と
            現在の建物積算評価を計算します。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                再調達価格を計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">建物</span>
                建物情報を入力
              </h3>
              <div className="space-y-4">
                {/* 延床面積 */}
                <NumberInput
                  label="延床面積"
                  value={floorArea}
                  onChange={setFloorArea}
                  unit="㎡"
                  placeholder="例：500"
                />

                {/* 建物構造 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    建物構造
                  </label>
                  <select
                    value={structure}
                    onChange={(e) => setStructure(e.target.value as BuildingStructure)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {STRUCTURE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}（耐用年数{option.usefulLife}年）
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    ※「鉄骨造」は重量鉄骨（骨格材肉厚4mm超）の耐用年数34年で計算。軽量鉄骨は19年または27年。
                  </p>
                </div>

                {/* 建物用途 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    建物用途
                  </label>
                  <select
                    value={usage}
                    onChange={(e) => setUsage(e.target.value as BuildingUsage)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {USAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 築年数 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    築年数（新築の場合は0）
                  </label>
                  <div className="flex w-full">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={buildingAge}
                      onChange={(e) => setBuildingAge(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0"
                    />
                    <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                      年
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 適用条件の説明 */}
            {hasInput && result && (
              <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">適用単価：</span>
                  {currentStructure.label} × {currentUsage.label} = {currentUnitPrice.toLocaleString()}円/㎡
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  残存耐用年数：{result.remainingLife}年 / {result.usefulLife}年（残価率：{(result.residualRate * 100).toFixed(1)}%）
                </p>
              </div>
            )}

            {/* 結果エリア */}
            <div className="space-y-3">
              <ResultCard
                label="再調達価格（新築時の建築費用）"
                value={result ? Math.round(result.replacementCost / 10000).toLocaleString() : 0}
                unit="万円"
                highlight={true}
              />
              <ResultCard
                label="建物積算評価（現在の建物価値）"
                value={result ? Math.round(result.assessedValue / 10000).toLocaleString() : 0}
                unit="万円"
              />
            </div>

            {/* 計算式表示 */}
            {hasInput && result && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">計算式</p>
                <div className="text-sm text-gray-700 font-mono space-y-1 bg-white p-3 rounded">
                  <p>【再調達価格】</p>
                  <p className="pl-4">{currentUnitPrice.toLocaleString()}円/㎡ × {floorArea.toLocaleString()}㎡</p>
                  <p className="pl-4">= 約{Math.round(result.replacementCost / 10000).toLocaleString()}万円</p>
                  <p className="mt-2">【建物積算評価】</p>
                  <p className="pl-4">約{Math.round(result.replacementCost / 10000).toLocaleString()}万円 × {(result.residualRate * 100).toFixed(1)}%</p>
                  <p className="pl-4 font-semibold">= 約{Math.round(result.assessedValue / 10000).toLocaleString()}万円</p>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 早見表 */}
          <section className="mb-12">
            <QuickReferenceTable
              title="構造別の法定耐用年数"
              description="建物構造ごとの法定耐用年数の一覧です。"
              headers={['建物構造', '法定耐用年数']}
              rows={usefulLifeTableData}
              note="※ 耐用年数を超えた建物は積算評価上の建物価値がゼロになります。"
            />
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              再調達価格（再調達原価）とは、現時点でその建物を新築した場合にかかる建築費用のことです。
              不動産の積算評価において、建物の価値を算出する際の基準となります。
            </p>

            <SectionHeading id="calculation" items={tocItems} />
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">再調達価格の計算</p>
              <p className="font-mono text-gray-700">
                再調達価格 = 建築単価（円/㎡）× 延床面積（㎡）
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">建物積算評価の計算</p>
              <p className="font-mono text-gray-700 mb-2">
                建物積算評価 = 再調達価格 × 残存耐用年数 / 法定耐用年数
              </p>
              <p className="text-xs text-gray-500">
                ※ 残存耐用年数 = 法定耐用年数 − 築年数
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              建物の価値は築年数の経過とともに減少し、法定耐用年数を超えると積算評価上の価値はゼロになります。
            </p>
          </section>

          <section className="mb-12">
            <SectionHeading id="unit-price" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              建築単価は建物の構造と用途によって異なります。本シミュレーターでは、
              国土交通省「建築着工統計」の標準建築価額を参考に設定しています。
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">構造＼用途</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">住宅用</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">事務所用</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">店舗用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">木造</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">17.5万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">18.5万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">18.0万円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">鉄骨造</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">22.0万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">25.0万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">24.0万円</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">RC造</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">26.0万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">30.0万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">28.0万円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">SRC造</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">29.0万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">34.0万円</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">31.0万円</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ※ 単価は参考値です。実際の建築費用は立地・仕様・時期により異なります。
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
            lastUpdated="2026年1月23日"
            additionalItems={[
              '建築単価は標準的な価額であり、実際の建築費用は仕様・立地により異なります',
            ]}
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/replacement-cost" />

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
