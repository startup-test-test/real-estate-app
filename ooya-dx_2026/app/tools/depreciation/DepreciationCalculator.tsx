'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import {
  calculateDepreciation,
  BuildingStructure,
  STRUCTURE_LABELS,
  USEFUL_LIFE_BY_STRUCTURE,
  formatManYen,
} from '@/lib/calculators/depreciation'

// =================================================================
// 建物構造の選択肢
// =================================================================
const structureOptions: { value: BuildingStructure; label: string; usefulLife: number }[] = [
  { value: 'rc', label: '鉄筋コンクリート造（RC/SRC）', usefulLife: 47 },
  { value: 'steel_heavy', label: '重量鉄骨造（4mm超）', usefulLife: 34 },
  { value: 'steel_light_27', label: '軽量鉄骨造（3mm超4mm以下）', usefulLife: 27 },
  { value: 'steel_light_19', label: '軽量鉄骨造（3mm以下）', usefulLife: 19 },
  { value: 'wood', label: '木造', usefulLife: 22 },
  { value: 'wood_mortar', label: '木造モルタル', usefulLife: 20 },
]

// =================================================================
// 早見表データ（新築・建物価格3,000万円の場合）
// =================================================================
const quickReferenceData: QuickReferenceRow[] = [
  { label: '鉄筋コンクリート造（RC）', value: '約66万円/年', subValue: '耐用年数47年・償却率2.2%' },
  { label: '重量鉄骨造（4mm超）', value: '約90万円/年', subValue: '耐用年数34年・償却率3.0%' },
  { label: '軽量鉄骨造（3mm超4mm以下）', value: '約114万円/年', subValue: '耐用年数27年・償却率3.8%' },
  { label: '木造', value: '約138万円/年', subValue: '耐用年数22年・償却率4.6%' },
]

// 中古木造の早見表
const usedWoodQuickReference: QuickReferenceRow[] = [
  { label: '築10年', value: '約200万円/年', subValue: '耐用年数14年・償却率7.2%' },
  { label: '築15年', value: '約300万円/年', subValue: '耐用年数10年・償却率10.0%' },
  { label: '築20年', value: '約500万円/年', subValue: '耐用年数6年・償却率16.7%' },
  { label: '築22年以上', value: '約750万円/年', subValue: '耐用年数4年・償却率25.0%' },
]

// =================================================================
// コンポーネント
// =================================================================
export function DepreciationCalculator() {
  // 入力状態
  const [buildingCost, setBuildingCost] = useState<number>(0)
  const [structure, setStructure] = useState<BuildingStructure>('wood')
  const [buildingAge, setBuildingAge] = useState<number>(0)
  const [acquisitionMonth, setAcquisitionMonth] = useState<number>(1)

  // 計算結果（useMemoで自動計算）
  const result = useMemo(() => {
    if (buildingCost <= 0) {
      return null
    }
    return calculateDepreciation({
      buildingCost,
      structure,
      buildingAge,
      acquisitionMonth,
    })
  }, [buildingCost, structure, buildingAge, acquisitionMonth])

  // 入力があるかどうか
  const hasInput = buildingCost > 0

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
            <span className="text-gray-900">減価償却シミュレーター</span>
          </nav>

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            減価償却費を10秒で無料計算｜構造別早見表付き
          </h1>
          <p className="text-gray-600 mb-8">
            建物の取得価額と構造・築年数を入力するだけで、年間の減価償却費を瞬時に計算します。
            中古物件の簡便法にも対応。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-12 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                減価償却費を概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 建物取得価額 */}
              <NumberInput
                label="建物取得価額（土地を除く）"
                value={buildingCost}
                onChange={setBuildingCost}
                unit="円"
                placeholder="30,000,000"
              />
              {buildingCost > 0 ? (
                <p className="text-sm text-gray-500 -mt-2">
                  = {(buildingCost / 10000).toLocaleString('ja-JP')} 万円
                </p>
              ) : (
                <p className="text-xs text-gray-400 -mt-2">
                  例：3,000万円の建物 → 年間約66万円〜138万円（構造による）
                </p>
              )}

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
                <p className="text-xs text-gray-500 mt-1">
                  ※ 鉄骨造の場合、骨格材の肉厚により耐用年数が異なります
                </p>
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

              {/* 取得月 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  取得月（初年度の月割り計算用）
                </label>
                <select
                  value={acquisitionMonth}
                  onChange={(e) => setAcquisitionMonth(parseInt(e.target.value))}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}月
                    </option>
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
                  {STRUCTURE_LABELS[structure]}・耐用年数{result.appliedUsefulLife}年・定額法
                </p>
              </div>
            )}

            {/* 結果エリア */}
            <div className="space-y-3">
              <ResultCard
                label="年間減価償却費"
                value={result?.annualDepreciation ?? 0}
                unit="円"
                highlight={true}
                subText={
                  result?.annualDepreciation
                    ? `= ${formatManYen(result.annualDepreciation)}`
                    : undefined
                }
              />
              <ResultCard
                label="初年度減価償却費（月割り）"
                value={result?.firstYearDepreciation ?? 0}
                unit="円"
                subText={
                  result?.firstYearMonths && result.firstYearMonths < 12
                    ? `${result.firstYearMonths}ヶ月分`
                    : '12ヶ月分（通年）'
                }
              />
              <ResultCard
                label="適用耐用年数"
                value={result?.appliedUsefulLife ?? 0}
                unit="年"
                subText={
                  result?.usedSimplifiedMethod
                    ? `簡便法適用（法定${result.legalUsefulLife}年）`
                    : `法定耐用年数`
                }
              />
              <ResultCard
                label="償却率（定額法）"
                value={result ? result.depreciationRate * 100 : 0}
                unit="%"
              />
            </div>

            {/* 計算式表示 */}
            {hasInput && result && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">計算式</p>
                <div className="text-sm text-gray-700 font-mono space-y-1 bg-white p-3 rounded">
                  {result.usedSimplifiedMethod && buildingAge >= USEFUL_LIFE_BY_STRUCTURE[structure] && (
                    <p>【耐用年数】{USEFUL_LIFE_BY_STRUCTURE[structure]}年 × 0.2 = {result.appliedUsefulLife}年</p>
                  )}
                  {result.usedSimplifiedMethod && buildingAge < USEFUL_LIFE_BY_STRUCTURE[structure] && (
                    <p>【耐用年数】({USEFUL_LIFE_BY_STRUCTURE[structure]} - {buildingAge}) + ({buildingAge} × 0.2) = {result.appliedUsefulLife}年</p>
                  )}
                  <p>【年間償却費】{buildingCost.toLocaleString()}円 × {(result.depreciationRate * 100).toFixed(1)}% = {result.annualDepreciation.toLocaleString()}円</p>
                  {result.firstYearMonths < 12 && (
                    <p>【初年度】{result.annualDepreciation.toLocaleString()}円 × {result.firstYearMonths}/12 = {result.firstYearDepreciation.toLocaleString()}円</p>
                  )}
                </div>
              </div>
            )}

            {/* 注意事項 */}
            {result && result.notes.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-medium text-amber-800 mb-1">注意事項</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  {result.notes.slice(0, 3).map((note, index) => (
                    <li key={index}>・{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 早見表（新築・構造別） */}
          <section className="mb-12">
            <QuickReferenceTable
              title="減価償却費 早見表（新築・構造別）"
              description="建物価格3,000万円の場合の年間減価償却費の目安です。"
              headers={['建物構造', '年間減価償却費']}
              rows={quickReferenceData}
              note="※定額法・事業用の場合。住宅用と事業用で耐用年数が異なる場合があります。"
            />
          </section>

          {/* 早見表（中古木造） */}
          <section className="mb-12">
            <QuickReferenceTable
              title="中古木造の減価償却費 早見表"
              description="建物価格3,000万円・木造の場合の築年数別年間減価償却費の目安です。"
              headers={['築年数', '年間減価償却費']}
              rows={usedWoodQuickReference}
              note="※簡便法による耐用年数計算。築22年以上の木造は4年償却が可能とされています。"
            />
          </section>

          {/* 目次 */}
          <nav className="bg-gray-50 rounded-lg p-5 mb-10">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              目次
            </h2>
            <ol className="space-y-1 text-sm">
              <li>
                <a href="#about" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  減価償却とは
                </a>
              </li>
              <li className="ml-4">
                <a href="#calculation" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  計算方法（定額法）
                </a>
              </li>
              <li className="ml-4">
                <a href="#used-asset" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  中古資産の耐用年数（簡便法）
                </a>
              </li>
              <li className="ml-4">
                <a href="#example" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  具体的な計算例
                </a>
              </li>
            </ol>
          </nav>

          {/* 解説セクション */}
          <section className="mb-12">
            <h2 id="about" className="text-xl font-bold text-gray-900 mb-4">
              減価償却とは
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              減価償却とは、建物などの資産を取得した際に、その費用を一括ではなく耐用年数にわたって分割して経費計上する会計処理のことです。
              不動産投資においては、実際のキャッシュアウトを伴わずに経費を計上できるため、節税効果が期待できるとされています。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              土地は減価償却の対象外であるため、建物と土地を一括で購入した場合は、建物部分のみを償却対象とする必要があるとされています。
            </p>

            <h3 id="calculation" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              計算方法（定額法）
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              平成28年4月1日以降に取得した建物・建物附属設備・構築物は、定額法のみが適用されるとされています。
              定額法では、毎年同額の減価償却費を計上します。
            </p>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center">
                年間減価償却費 = 取得価額 × 定額法の償却率
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                ※初年度は取得月から12月までの月割り計算となるとされています
              </p>
            </div>

            <h3 id="used-asset" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              中古資産の耐用年数（簡便法）
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              中古資産を取得した場合、法定耐用年数ではなく「簡便法」で計算した短い耐用年数を適用できるとされています。
              特に築古の木造物件では4年という短期間での償却が可能となる場合があり、節税スキームとして活用されることがあるとされています。
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">簡便法による耐用年数の計算</p>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li><span className="font-medium">① 法定耐用年数を全て経過している場合：</span><br />
                  耐用年数 = 法定耐用年数 × 20%（端数切捨て、最短2年）</li>
                <li><span className="font-medium">② 一部経過している場合：</span><br />
                  耐用年数 = (法定耐用年数 - 経過年数) + 経過年数 × 20%</li>
              </ul>
            </div>

            <h3 id="example" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              具体的な計算例
            </h3>
            <p className="text-gray-700 mb-3 leading-relaxed">
              具体例を用いて計算してみましょう。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">例：築25年の木造アパート（建物価格3,000万円）を4月に取得</p>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>① 法定耐用年数（木造）：22年</li>
                <li>② 簡便法：22年 × 0.2 = 4.4年 → <span className="font-semibold">4年</span>（端数切捨て）</li>
                <li>③ 償却率（4年）：25.0%</li>
                <li>④ 年間償却費：3,000万円 × 25% = <span className="font-semibold">750万円</span></li>
                <li>⑤ 初年度（4月〜12月・9ヶ月）：750万円 × 9/12 = <span className="font-semibold">約562万円</span></li>
              </ul>
            </div>
          </section>

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
