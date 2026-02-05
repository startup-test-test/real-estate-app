'use client'

import React, { useState, useMemo } from 'react'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable } from '@/components/tools/QuickReferenceTable'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'

// =================================================================
// 型定義
// =================================================================
type BuildingStructure = 'rc' | 'src' | 'steel_heavy' | 'steel_light' | 'wood'

interface StructureConfig {
  value: BuildingStructure
  label: string
  usefulLife: number
  unitPrice: number // 再調達原価（円/㎡）
}

// =================================================================
// 定数
// =================================================================
const STRUCTURE_OPTIONS: StructureConfig[] = [
  { value: 'rc', label: '鉄筋コンクリート造（RC）', usefulLife: 47, unitPrice: 190000 },
  { value: 'src', label: '鉄骨鉄筋コンクリート造（SRC）', usefulLife: 47, unitPrice: 210000 },
  { value: 'steel_heavy', label: '重量鉄骨造（4mm超）', usefulLife: 34, unitPrice: 170000 },
  { value: 'steel_light', label: '軽量鉄骨造（4mm以下）', usefulLife: 27, unitPrice: 140000 },
  { value: 'wood', label: '木造', usefulLife: 22, unitPrice: 140000 },
]

const STRUCTURE_MAP = Object.fromEntries(
  STRUCTURE_OPTIONS.map((s) => [s.value, s])
) as Record<BuildingStructure, StructureConfig>

// ページタイトル
const PAGE_TITLE = '不動産の積算評価 計算シミュレーション｜土地・建物の担保価値を算出'

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: '積算評価（原価法）とは', level: 2 },
  { id: 'land-valuation', title: '土地の評価方法', level: 3 },
  { id: 'building-valuation', title: '建物の評価方法', level: 3 },
]

// 早見表データ（構造別の法定耐用年数）
const quickReferenceData = [
  { label: '鉄筋コンクリート造（RC）', value: '47年' },
  { label: '鉄骨鉄筋コンクリート造（SRC）', value: '47年' },
  { label: '重量鉄骨造（4mm超）', value: '34年' },
  { label: '軽量鉄骨造（4mm以下）', value: '27年' },
  { label: '木造', value: '22年' },
]

// =================================================================
// 計算ロジック
// =================================================================
interface CalculationResult {
  landValue: number // 土地評価額（円）
  buildingValue: number // 建物評価額（円）
  totalValue: number // 積算評価額（円）
  remainingUsefulLife: number // 残存耐用年数
  depreciationRate: number // 経年減価率（0〜1）
}

function calculateAssessedValue(
  rosenkaPerSqm: number, // 路線価（千円/㎡）
  landAreaSqm: number, // 土地面積（㎡）
  structure: BuildingStructure,
  buildingAreaSqm: number, // 延床面積（㎡）
  buildingAge: number // 築年数
): CalculationResult | null {
  if (landAreaSqm <= 0 && buildingAreaSqm <= 0) {
    return null
  }

  const config = STRUCTURE_MAP[structure]
  const unitPrice = config.unitPrice

  // 土地評価額 = 路線価（千円/㎡）× 1000 × 土地面積（㎡）
  const landValue = rosenkaPerSqm * 1000 * landAreaSqm

  // 残存耐用年数
  const remainingUsefulLife = Math.max(0, config.usefulLife - buildingAge)

  // 経年減価率
  const depreciationRate = config.usefulLife > 0 ? remainingUsefulLife / config.usefulLife : 0

  // 建物評価額 = 再調達原価 × 延床面積 × (残存耐用年数 / 法定耐用年数)
  const buildingValue = Math.round(unitPrice * buildingAreaSqm * depreciationRate)

  // 積算評価額
  const totalValue = Math.round(landValue + buildingValue)

  return {
    landValue,
    buildingValue,
    totalValue,
    remainingUsefulLife,
    depreciationRate,
  }
}

// =================================================================
// シミュレーター部分
// =================================================================
function AssessedValueSimulator() {
  // 土地入力
  const [rosenkaPerSqm, setRosenkaPerSqm] = useState<number>(0) // 路線価（千円/㎡）
  const [landAreaSqm, setLandAreaSqm] = useState<number>(0) // 土地面積（㎡）

  // 建物入力
  const [structure, setStructure] = useState<BuildingStructure>('rc')
  const [buildingAreaSqm, setBuildingAreaSqm] = useState<number>(0) // 延床面積（㎡）
  const [buildingAge, setBuildingAge] = useState<number>(0) // 築年数

  // 計算結果
  const result = useMemo(() => {
    return calculateAssessedValue(
      rosenkaPerSqm,
      landAreaSqm,
      structure,
      buildingAreaSqm,
      buildingAge
    )
  }, [rosenkaPerSqm, landAreaSqm, structure, buildingAreaSqm, buildingAge])

  // 入力があるかどうか
  const hasInput = landAreaSqm > 0 || buildingAreaSqm > 0

  // 構造情報の取得
  const currentStructure = STRUCTURE_MAP[structure]

  return (
    <>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
        路線価・建物構造・築年数を入力するだけで、土地・建物の積算価格を計算します。
        銀行融資における担保評価の目安を把握できます。
      </p>

      {/* シミュレーター本体 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            積算評価を概算計算する
          </h2>
        </div>

        {/* 土地入力エリア */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">土地</span>
            土地情報
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                路線価
              </label>
              <div className="flex w-full">
                <input
                  type="number"
                  min={0}
                  value={rosenkaPerSqm || ''}
                  onChange={(e) => setRosenkaPerSqm(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="例：300"
                />
                <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 sm:px-4 py-3 text-gray-600 flex items-center text-sm sm:text-base">
                  千円/㎡
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <a
                  href="https://www.rosenka.nta.go.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  国税庁 路線価図
                </a>
                から路線価を調べてください
              </p>
            </div>

            <NumberInput
              label="土地面積"
              value={landAreaSqm}
              onChange={setLandAreaSqm}
              unit="㎡"
              placeholder="例：200"
            />
          </div>
        </div>

        {/* 建物入力エリア */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">建物</span>
            建物情報
          </h3>
          <div className="space-y-4">
            {/* 建物構造 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                建物構造
              </label>
              <select
                value={structure}
                onChange={(e) => setStructure(e.target.value as BuildingStructure)}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {STRUCTURE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}（耐用年数{option.usefulLife}年）
                  </option>
                ))}
              </select>
            </div>

            <NumberInput
              label="延床面積"
              value={buildingAreaSqm}
              onChange={setBuildingAreaSqm}
              unit="㎡"
              placeholder="例：500"
            />

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
                  className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0"
                />
                <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 sm:px-4 py-3 text-gray-600 flex items-center text-sm sm:text-base">
                  年
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 適用条件の説明 */}
        {hasInput && result && (
          <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              <span className="font-medium">適用単価：</span>
              {currentStructure.label} {currentStructure.unitPrice.toLocaleString()}円/㎡
            </p>
            <p className="text-xs text-blue-600 mt-1">
              残存耐用年数：{result.remainingUsefulLife}年 / {currentStructure.usefulLife}年（経年減価率：{(result.depreciationRate * 100).toFixed(1)}%）
            </p>
          </div>
        )}

        {/* 結果エリア */}
        <div className="space-y-3">
          <ResultCard
            label="積算評価額（合計）"
            value={result ? Number((result.totalValue / 10000).toFixed(1)).toLocaleString() : 0}
            unit="万円"
            highlight={true}
          />
          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              label="土地評価額"
              value={result ? Number((result.landValue / 10000).toFixed(1)).toLocaleString() : 0}
              unit="万円"
            />
            <ResultCard
              label="建物評価額"
              value={result ? Number((result.buildingValue / 10000).toFixed(1)).toLocaleString() : 0}
              unit="万円"
            />
          </div>
        </div>

        {/* 計算式表示 */}
        {hasInput && result && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">計算式</p>
            <div className="text-xs sm:text-sm text-gray-700 font-mono space-y-1 bg-white p-3 rounded">
              {landAreaSqm > 0 && (
                <p>【土地】{rosenkaPerSqm.toLocaleString()}千円/㎡ × {landAreaSqm.toLocaleString()}㎡ = 約{Math.round(result.landValue / 10000).toLocaleString()}万円</p>
              )}
              {buildingAreaSqm > 0 && (
                <>
                  <p>【建物】{(currentStructure.unitPrice / 10000).toFixed(1)}万円/㎡ × {buildingAreaSqm.toLocaleString()}㎡ × {(result.depreciationRate * 100).toFixed(1)}%</p>
                  <p className="pl-8">= 約{Math.round(result.buildingValue / 10000).toLocaleString()}万円</p>
                </>
              )}
              <p className="font-semibold">【合計】約{Math.round(result.landValue / 10000).toLocaleString()}万円 + 約{Math.round(result.buildingValue / 10000).toLocaleString()}万円 = 約{Math.round(result.totalValue / 10000).toLocaleString()}万円</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// =================================================================
// 追加コンテンツ部分
// =================================================================
function AssessedValueAdditionalContent() {
  return (
    <>
      {/* 早見表 */}
      <section className="mt-10 mb-12">
        <QuickReferenceTable
          title="構造別の法定耐用年数"
          description="建物構造ごとの法定耐用年数の一覧です。"
          headers={['建物構造', '法定耐用年数']}
          rows={quickReferenceData}
          note="※ 残存耐用年数 = 法定耐用年数 − 築年数。耐用年数を超えた建物は積算評価上の建物価値がゼロになります。"
        />
      </section>

      {/* 目次 */}
      <TableOfContents items={tocItems} />

      {/* 解説セクション */}
      <section className="mb-12">
        <SectionHeading id="about" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          積算評価（原価法）とは、不動産を「土地」と「建物」に分けて、それぞれの価値を積み上げて評価する方法です。
          銀行融資の担保評価においては、この積算評価が広く採用されています。
        </p>
        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-4">
          <p className="font-mono text-gray-800 text-center text-sm sm:text-base">
            積算評価額 = 土地評価額 + 建物評価額
          </p>
        </div>

        <SectionHeading id="land-valuation" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          土地の評価には主に「路線価方式」が用いられます。路線価は国税庁が毎年7月に公表する、道路に面した土地1㎡あたりの価格（千円単位）です。
          公示地価の約80%を目安に設定されています。
        </p>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">土地評価額の計算</p>
          <p className="font-mono text-gray-700 text-sm sm:text-base">
            土地評価額 = 路線価（千円/㎡）× 土地面積（㎡）
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ※ 角地や二方路などの加算補正、不整形地の減価補正は本シミュレーターでは考慮していません
          </p>
        </div>

        <SectionHeading id="building-valuation" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          建物の評価は「再調達原価」に「経年減価」を考慮して算出します。
          再調達原価とは、現時点でその建物を新築した場合にかかる費用のことです。
        </p>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">建物評価額の計算</p>
          <p className="font-mono text-gray-700 text-xs sm:text-sm">
            建物評価額 = 再調達原価（円/㎡）× 延床面積（㎡）× 残存耐用年数 / 法定耐用年数
          </p>
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          法定耐用年数を超えた建物（例：築25年の木造）は、積算評価上の建物価値はゼロとなります。
        </p>
      </section>
    </>
  )
}

// =================================================================
// メインコンポーネント
// =================================================================
export function AssessedValueCalculator() {
  return (
    <ToolPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/assessed-value"
      additionalContent={<AssessedValueAdditionalContent />}
    >
      <AssessedValueSimulator />
    </ToolPageLayout>
  )
}
