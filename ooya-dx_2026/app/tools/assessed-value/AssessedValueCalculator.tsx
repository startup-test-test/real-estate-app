'use client'

import React, { useState, useMemo } from 'react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable3Col, QuickReferenceRow3Col } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'

// =================================================================
// 型定義
// =================================================================
type BuildingStructure = 'rc' | 'src' | 'steel_heavy' | 'steel_light' | 'wood'

interface StructureConfig {
  value: BuildingStructure
  label: string
  usefulLife: number
  unitPriceConservative: number // 保守的評価（銀行基準）円/㎡
  unitPriceMarket: number // 実勢評価（2025年）円/㎡
}

// =================================================================
// 定数
// =================================================================
const STRUCTURE_OPTIONS: StructureConfig[] = [
  { value: 'rc', label: '鉄筋コンクリート造（RC）', usefulLife: 47, unitPriceConservative: 190000, unitPriceMarket: 250000 },
  { value: 'src', label: '鉄骨鉄筋コンクリート造（SRC）', usefulLife: 47, unitPriceConservative: 210000, unitPriceMarket: 270000 },
  { value: 'steel_heavy', label: '重量鉄骨造（4mm超）', usefulLife: 34, unitPriceConservative: 170000, unitPriceMarket: 210000 },
  { value: 'steel_light', label: '軽量鉄骨造（4mm以下）', usefulLife: 27, unitPriceConservative: 140000, unitPriceMarket: 170000 },
  { value: 'wood', label: '木造', usefulLife: 22, unitPriceConservative: 140000, unitPriceMarket: 180000 },
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
  { id: 'bank-usage', title: '銀行融資における活用', level: 3 },
]

// 早見表データ
const quickReferenceData: QuickReferenceRow3Col[] = [
  { label: 'RC造（新築）', value1: '19万円/㎡', value2: '25万円/㎡' },
  { label: 'RC造（築20年）', value1: '10.9万円/㎡', value2: '14.4万円/㎡' },
  { label: '重量鉄骨造（新築）', value1: '17万円/㎡', value2: '21万円/㎡' },
  { label: '重量鉄骨造（築17年）', value1: '8.5万円/㎡', value2: '10.5万円/㎡' },
  { label: '木造（新築）', value1: '14万円/㎡', value2: '18万円/㎡' },
  { label: '木造（築11年）', value1: '7万円/㎡', value2: '9万円/㎡' },
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
  collateralValue70: number // 担保評価額（70%掛目）
  collateralValue80: number // 担保評価額（80%掛目）
}

function calculateAssessedValue(
  rosenkaPerSqm: number, // 路線価（千円/㎡）
  landAreaSqm: number, // 土地面積（㎡）
  structure: BuildingStructure,
  buildingAreaSqm: number, // 延床面積（㎡）
  buildingAge: number, // 築年数
  useMarketPrice: boolean // 実勢評価を使用
): CalculationResult | null {
  if (landAreaSqm <= 0 && buildingAreaSqm <= 0) {
    return null
  }

  const config = STRUCTURE_MAP[structure]
  const unitPrice = useMarketPrice ? config.unitPriceMarket : config.unitPriceConservative

  // 土地評価額 = 路線価（千円/㎡）× 1000 × 土地面積（㎡）
  const landValue = rosenkaPerSqm * 1000 * landAreaSqm

  // 残存耐用年数
  const remainingUsefulLife = Math.max(0, config.usefulLife - buildingAge)

  // 経年減価率
  const depreciationRate = config.usefulLife > 0 ? remainingUsefulLife / config.usefulLife : 0

  // 建物評価額 = 再調達原価 × 延床面積 × (残存耐用年数 / 法定耐用年数)
  const buildingValue = unitPrice * buildingAreaSqm * depreciationRate

  // 積算評価額
  const totalValue = landValue + buildingValue

  // 担保評価額（掛目）
  const collateralValue70 = totalValue * 0.7
  const collateralValue80 = totalValue * 0.8

  return {
    landValue,
    buildingValue,
    totalValue,
    remainingUsefulLife,
    depreciationRate,
    collateralValue70,
    collateralValue80,
  }
}

// =================================================================
// コンポーネント
// =================================================================
export function AssessedValueCalculator() {
  // 土地入力
  const [rosenkaPerSqm, setRosenkaPerSqm] = useState<number>(0) // 路線価（千円/㎡）
  const [landAreaSqm, setLandAreaSqm] = useState<number>(0) // 土地面積（㎡）

  // 建物入力
  const [structure, setStructure] = useState<BuildingStructure>('rc')
  const [buildingAreaSqm, setBuildingAreaSqm] = useState<number>(0) // 延床面積（㎡）
  const [buildingAge, setBuildingAge] = useState<number>(0) // 築年数

  // 評価モード
  const [useMarketPrice, setUseMarketPrice] = useState<boolean>(false)

  // 計算結果
  const result = useMemo(() => {
    return calculateAssessedValue(
      rosenkaPerSqm,
      landAreaSqm,
      structure,
      buildingAreaSqm,
      buildingAge,
      useMarketPrice
    )
  }, [rosenkaPerSqm, landAreaSqm, structure, buildingAreaSqm, buildingAge, useMarketPrice])

  // 入力があるかどうか
  const hasInput = landAreaSqm > 0 || buildingAreaSqm > 0

  // 構造情報の取得
  const currentStructure = STRUCTURE_MAP[structure]

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
            路線価・建物構造・築年数を入力するだけで、土地・建物の積算価格を計算します。
            銀行融資における担保評価の目安を把握できます。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                積算評価を概算計算する
              </h2>
            </div>

            {/* 評価モード選択 */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価モード
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceMode"
                    checked={!useMarketPrice}
                    onChange={() => setUseMarketPrice(false)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">銀行評価（保守的）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceMode"
                    checked={useMarketPrice}
                    onChange={() => setUseMarketPrice(true)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">実勢評価（2025年）</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ※ 銀行評価は融資審査で使われる保守的な単価、実勢評価は建設コスト高騰を反映した単価です
              </p>
            </div>

            {/* 土地入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4">
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
                      className="flex-1 min-w-0 border-2 border-gray-300 rounded-l-lg px-3 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="例：300"
                    />
                    <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-600 flex items-center">
                      千円/㎡
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ※ 路線価図に「300C」と記載されている場合は「300」と入力してください
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
            <div className="bg-white rounded-lg p-4 mb-4">
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
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  {currentStructure.label} - {useMarketPrice ? '実勢' : '銀行'}評価 {(useMarketPrice ? currentStructure.unitPriceMarket : currentStructure.unitPriceConservative).toLocaleString()}円/㎡
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
                value={result?.totalValue ?? 0}
                unit="円"
                highlight={true}
                subText={
                  result?.totalValue
                    ? `= 約${Math.round(result.totalValue / 10000).toLocaleString()}万円`
                    : undefined
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <ResultCard
                  label="土地評価額"
                  value={result?.landValue ?? 0}
                  unit="円"
                  subText={
                    result?.landValue
                      ? `約${Math.round(result.landValue / 10000).toLocaleString()}万円`
                      : undefined
                  }
                />
                <ResultCard
                  label="建物評価額"
                  value={result?.buildingValue ?? 0}
                  unit="円"
                  subText={
                    result?.buildingValue
                      ? `約${Math.round(result.buildingValue / 10000).toLocaleString()}万円`
                      : undefined
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ResultCard
                  label="担保評価額（70%）"
                  value={result?.collateralValue70 ?? 0}
                  unit="円"
                  subText="都市銀行の目安"
                />
                <ResultCard
                  label="担保評価額（80%）"
                  value={result?.collateralValue80 ?? 0}
                  unit="円"
                  subText="地方銀行の目安"
                />
              </div>
            </div>

            {/* 計算式表示 */}
            {hasInput && result && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">計算式</p>
                <div className="text-sm text-gray-700 font-mono space-y-1 bg-white p-3 rounded">
                  {landAreaSqm > 0 && (
                    <p>【土地】{rosenkaPerSqm.toLocaleString()}千円/㎡ × {landAreaSqm.toLocaleString()}㎡ = 約{Math.round(result.landValue / 10000).toLocaleString()}万円</p>
                  )}
                  {buildingAreaSqm > 0 && (
                    <>
                      <p>【建物】{((useMarketPrice ? currentStructure.unitPriceMarket : currentStructure.unitPriceConservative) / 10000).toFixed(1)}万円/㎡ × {buildingAreaSqm.toLocaleString()}㎡ × {(result.depreciationRate * 100).toFixed(1)}%</p>
                      <p className="pl-8">= 約{Math.round(result.buildingValue / 10000).toLocaleString()}万円</p>
                    </>
                  )}
                  <p className="font-semibold">【合計】約{Math.round(result.landValue / 10000).toLocaleString()}万円 + 約{Math.round(result.buildingValue / 10000).toLocaleString()}万円 = 約{Math.round(result.totalValue / 10000).toLocaleString()}万円</p>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 早見表 */}
          <section className="mb-12">
            <QuickReferenceTable3Col
              title="建物評価単価の早見表"
              description="構造・築年数別の建物評価単価（㎡あたり）の目安です。"
              headers={[
                '区分',
                { title: '銀行評価' },
                { title: '実勢評価' },
              ]}
              rows={quickReferenceData}
              note="※ 建物評価額は「単価 × 延床面積 × 残存耐用年数比率」で計算されます。2025年の建設コスト高騰を反映した実勢評価は銀行評価より高めの数値となる場合があります。"
            />
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              積算評価（原価法）とは、不動産を「土地」と「建物」に分けて、それぞれの価値を積み上げて評価する方法です。
              銀行融資の担保評価においては、この積算評価が広く採用されているとされています。
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center">
                積算評価額 = 土地評価額 + 建物評価額
              </p>
            </div>

            <SectionHeading id="land-valuation" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              土地の評価には主に「路線価方式」が用いられます。路線価は国税庁が毎年7月に公表する、道路に面した土地1㎡あたりの価格（千円単位）です。
              公示地価の約80%を目安に設定されているとされています。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">土地評価額の計算</p>
              <p className="font-mono text-gray-700">
                土地評価額 = 路線価（千円/㎡）× 土地面積（㎡）
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ※ 角地や二方路などの加算補正、不整形地の減価補正は本シミュレーターでは考慮していません
              </p>
            </div>

            <SectionHeading id="building-valuation" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              建物の評価は「再調達原価」に「経年減価」を考慮して算出します。
              再調達原価とは、現時点でその建物を新築した場合にかかる費用のことです。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">建物評価額の計算</p>
              <p className="font-mono text-gray-700">
                建物評価額 = 再調達原価（円/㎡）× 延床面積（㎡）× 残存耐用年数 / 法定耐用年数
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              法定耐用年数を超えた建物（例：築25年の木造）は、積算評価上の建物価値はゼロとなる場合がありますが、
              土地の価値が残るため、土地値物件として融資を受けられるケースもあるとされています。
            </p>

            <SectionHeading id="bank-usage" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              銀行融資においては、積算評価額に「掛け目」を入れて担保評価額を算出します。
              都市銀行では70%程度、地方銀行では80%程度の掛け目が一般的とされています。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">担保評価額の目安</p>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li><span className="font-medium">都市銀行：</span>積算評価額 × 70%</li>
                <li><span className="font-medium">地方銀行：</span>積算評価額 × 80%</li>
                <li><span className="font-medium">信用金庫等：</span>地域の実勢価格を考慮する場合がある</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              なお、収益性の高い物件であっても積算評価が低い場合、融資額が伸び悩むことがあるとされています。
              逆に、土地値比率の高い物件では、建物の法定耐用年数を超えた融資が承認されるケースもあるとされています。
            </p>
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月20日"
            additionalItems={[
              '路線価は毎年7月に更新されます。最新の路線価は国税庁サイトでご確認ください',
              '再調達原価は建設市況により変動する場合があります',
            ]}
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/assessed-value" />

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
