'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import {
  calculateDeadCross,
  BuildingStructure,
  USEFUL_LIFE_BY_STRUCTURE,
  STRUCTURE_LABELS,
  formatManYen,
} from '@/lib/calculators/dead-cross'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

interface GlossaryItem {
  slug: string
  title: string
}

interface DeadCrossCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産のデッドクロス発生時期 予測シミュレーション'

// 建物構造の選択肢
const structureOptions: { value: BuildingStructure; label: string; usefulLife: number }[] = [
  { value: 'rc', label: '鉄筋コンクリート造（RC/SRC）', usefulLife: 47 },
  { value: 'steel_heavy', label: '重量鉄骨造（4mm超）', usefulLife: 34 },
  { value: 'steel_light_27', label: '軽量鉄骨造（3mm超4mm以下）', usefulLife: 27 },
  { value: 'steel_light_19', label: '軽量鉄骨造（3mm以下）', usefulLife: 19 },
  { value: 'wood', label: '木造', usefulLife: 22 },
  { value: 'wood_mortar', label: '木造モルタル', usefulLife: 20 },
]

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: 'デッドクロスとは', level: 2 },
  { id: 'mechanism', title: 'デッドクロスが発生する仕組み', level: 3 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

export function DeadCrossCalculator({ relatedGlossary = [] }: DeadCrossCalculatorProps) {
  // 入力状態（万円単位）
  const [buildingCostInMan, setBuildingCostInMan] = useState<number>(0)
  const [structure, setStructure] = useState<BuildingStructure>('wood')
  const [buildingAge, setBuildingAge] = useState<number>(0)
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0)
  const [annualRate, setAnnualRate] = useState<number>(2.0)
  const [loanTermYears, setLoanTermYears] = useState<number>(30)

  // 円に変換
  const buildingCostInYen = buildingCostInMan * 10000
  const loanAmountInYen = loanAmountInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    if (buildingCostInMan <= 0 || loanAmountInMan <= 0) {
      return null
    }
    return calculateDeadCross({
      buildingCost: buildingCostInYen,
      structure,
      buildingAge,
      loanAmount: loanAmountInYen,
      annualRate,
      loanTermYears,
    })
  }, [buildingCostInYen, structure, buildingAge, loanAmountInYen, annualRate, loanTermYears])

  // 入力があるかどうか
  const hasInput = buildingCostInMan > 0 && loanAmountInMan > 0

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
              const toolInfo = getToolInfo('/tools/dead-cross')
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
            建物の減価償却費とローン元本返済額の推移から、デッドクロスが発生する時期を予測します。
            黒字倒産リスクの事前把握にご活用ください。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                デッドクロス発生時期を予測する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 建物取得価額 */}
              <NumberInput
                label="建物取得価額（土地を除く）"
                value={buildingCostInMan}
                onChange={setBuildingCostInMan}
                unit="万円"
                placeholder="例：3000"
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
                  {structureOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}（耐用年数{option.usefulLife}年）
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

              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">ローン条件</p>
              </div>

              {/* 借入額 */}
              <NumberInput
                label="借入額"
                value={loanAmountInMan}
                onChange={setLoanAmountInMan}
                unit="万円"
                placeholder="例：5000"
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
                    placeholder="例：2.0"
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
                  {[10, 15, 20, 25, 30, 35].map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 適用条件の説明 */}
            {hasInput && result && (
              <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">適用条件：</span>
                  {result.usedSimplifiedMethod
                    ? `中古物件（築${buildingAge}年）- 簡便法適用`
                    : '新築物件'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {result.structureLabel}・耐用年数{result.appliedUsefulLife}年・元利均等返済
                </p>
              </div>
            )}

            {/* 結果エリア */}
            {result && (
              <div className="space-y-3">
                {/* デッドクロス発生年 */}
                {result.deadCrossYear !== null ? (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-amber-800">デッドクロス発生予測</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-700 mb-1">
                      {result.deadCrossYear}年目
                    </p>
                    <p className="text-sm text-amber-700">
                      元本返済額 約{Math.round((result.deadCrossPrincipal || 0) / 10000).toLocaleString()}万円 ＞
                      減価償却費 約{Math.round((result.deadCrossDepreciation || 0) / 10000).toLocaleString()}万円
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-800">デッドクロスは発生しません</span>
                    </div>
                    <p className="text-sm text-green-700">
                      減価償却期間（{result.appliedUsefulLife}年）内に元本返済額が減価償却費を上回ることはありません。
                    </p>
                  </div>
                )}

                <ResultCard
                  label="年間減価償却費"
                  value={result.annualDepreciation}
                  unit="円"
                  subText={`= ${formatManYen(result.annualDepreciation)}/年（${result.appliedUsefulLife}年間）`}
                />
                <ResultCard
                  label="1年目の元本返済額"
                  value={result.firstYearPrincipal}
                  unit="円"
                  subText={`= ${formatManYen(result.firstYearPrincipal)}`}
                />
                <ResultCard
                  label="毎月返済額（元利均等）"
                  value={result.monthlyPayment}
                  unit="円"
                  subText={`= ${formatManYen(result.monthlyPayment)}`}
                />
              </div>
            )}

            {/* 年次推移テーブル */}
            {result && result.yearlyData.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">元本返済額と減価償却費の推移</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-2 text-left">年</th>
                        <th className="border border-gray-300 px-2 py-2 text-right">元本返済</th>
                        <th className="border border-gray-300 px-2 py-2 text-right">減価償却</th>
                        <th className="border border-gray-300 px-2 py-2 text-right">差額</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyData.slice(0, Math.min(15, result.yearlyData.length)).map((data) => (
                        <tr
                          key={data.year}
                          className={data.isDeadCross ? 'bg-amber-50' : 'bg-white'}
                        >
                          <td className="border border-gray-300 px-2 py-2">{data.year}年目</td>
                          <td className="border border-gray-300 px-2 py-2 text-right font-mono">
                            {Math.round(data.principalPayment / 10000).toLocaleString()}万
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-right font-mono">
                            {Math.round(data.depreciation / 10000).toLocaleString()}万
                          </td>
                          <td className={`border border-gray-300 px-2 py-2 text-right font-mono ${
                            data.difference > 0 ? 'text-red-600 font-bold' : 'text-green-600'
                          }`}>
                            {data.difference > 0 ? '+' : ''}{Math.round(data.difference / 10000).toLocaleString()}万
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            {data.isDeadCross ? (
                              <span className="text-amber-600 font-bold">DC</span>
                            ) : (
                              <span className="text-green-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ※DC = デッドクロス状態（元本返済額 ＞ 減価償却費）
                </p>
              </div>
            )}

            {/* 計算式表示 */}
            {hasInput && result && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">計算式</p>
                <div className="text-sm text-gray-700 font-mono space-y-1 bg-white p-3 rounded">
                  <p>【減価償却費】{buildingCostInMan.toLocaleString()}万円 × {(result.depreciationRate * 100).toFixed(1)}% = 約{Math.round(result.annualDepreciation / 10000).toLocaleString()}万円/年</p>
                  <p>【毎月返済額】借入{loanAmountInMan.toLocaleString()}万円 × 金利{annualRate}% × {loanTermYears}年返済 = 約{(result.monthlyPayment / 10000).toFixed(1)}万円/月</p>
                  {result.deadCrossYear !== null && (
                    <p>【デッドクロス】{result.deadCrossYear}年目に元本返済額が減価償却費を上回る</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              デッドクロスとは、賃貸経営においてローン返済額のうち元本返済部分が減価償却費を上回る時点のことです。
              この状態になると、帳簿上は利益が出ているにもかかわらず、実際のキャッシュフローが厳しくなる可能性があるとされています。
            </p>

            <SectionHeading id="mechanism" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              デッドクロスが発生する仕組みは以下の通りです。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>・<span className="font-medium">減価償却費</span>：建物の価値減少を経費として計上でき、実際のキャッシュアウトなしに帳簿上の利益を圧縮</li>
                <li>・<span className="font-medium">元本返済</span>：ローン返済のうち、経費として計上できないキャッシュアウト</li>
                <li>・元利均等返済では、返済が進むにつれて元本の割合が増加</li>
                <li>・減価償却費は定額法で毎年一定（耐用年数終了後は0に）</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              元本返済額が減価償却費を上回ると、「経費にならないキャッシュアウト」が「経費になる非現金支出」を超えることになります。
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

          {/* 参考リンク */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">参考リンク</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2100.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → 減価償却とは（国税庁）
                </a>
              </li>
            </ul>
          </div>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月23日"
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/dead-cross" />

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
