/**
 * 減価償却計算ロジック（不動産投資向け）
 *
 * 参考法令：
 * - 所得税法第49条（減価償却資産の償却費の計算及びその償却費の必要経費算入）
 * - 法人税法第31条（減価償却資産の償却費の計算及びその償却費の損金算入）
 * - 減価償却資産の耐用年数等に関する省令
 *
 * 注意：本計算は概算値であり、実際の税額は個別の状況により異なります。
 *       正確な金額については税理士等の専門家にご相談ください。
 */

// =================================================================
// 型定義
// =================================================================

/** 建物構造 */
export type BuildingStructure =
  | 'rc'             // 鉄筋コンクリート造（RC/SRC）
  | 'steel_heavy'    // 重量鉄骨造（4mm超）
  | 'steel_light_27' // 軽量鉄骨造（3mm超4mm以下）
  | 'steel_light_19' // 軽量鉄骨造（3mm以下）
  | 'wood'           // 木造
  | 'wood_mortar'    // 木造モルタル

/** 建物用途 */
export type BuildingUsage = 'residential' | 'office' | 'store' | 'warehouse' | 'factory'

/** 減価償却計算の入力パラメータ */
export interface DepreciationInput {
  /** 建物取得価額（円）- 土地を除く */
  buildingCost: number
  /** 建物構造 */
  structure: BuildingStructure
  /** 築年数（年） - 新築の場合は0 */
  buildingAge: number
  /** 取得月（1-12）- 初年度の月割り計算用 */
  acquisitionMonth: number
}

/** 減価償却計算結果 */
export interface DepreciationResult {
  /** 建物取得価額 */
  buildingCost: number
  /** 法定耐用年数 */
  legalUsefulLife: number
  /** 適用耐用年数（中古の場合は簡便法で計算） */
  appliedUsefulLife: number
  /** 中古物件の簡便法を適用したか */
  usedSimplifiedMethod: boolean
  /** 償却率（定額法） */
  depreciationRate: number
  /** 年間償却費（初年度は月割り） */
  annualDepreciation: number
  /** 初年度償却費（月割り後） */
  firstYearDepreciation: number
  /** 取得月 */
  acquisitionMonth: number
  /** 月割り月数（初年度） */
  firstYearMonths: number
  /** 減価償却完了年（おおよそ） */
  depreciationEndYear: number
  /** 適用税率（表示用） */
  appliedRateLabel: string
  /** 注意事項 */
  notes: string[]
}

// =================================================================
// 定数：法定耐用年数と償却率
// =================================================================

/** 建物構造別の法定耐用年数（住宅用） */
export const USEFUL_LIFE_BY_STRUCTURE: Record<BuildingStructure, number> = {
  rc: 47,              // RC/SRC造
  steel_heavy: 34,     // 重量鉄骨造（4mm超）
  steel_light_27: 27,  // 軽量鉄骨造（3mm超4mm以下）
  steel_light_19: 19,  // 軽量鉄骨造（3mm以下）
  wood: 22,            // 木造
  wood_mortar: 20,     // 木造モルタル
}

/** 建物構造の日本語表示名 */
export const STRUCTURE_LABELS: Record<BuildingStructure, string> = {
  rc: '鉄筋コンクリート造（RC/SRC）',
  steel_heavy: '重量鉄骨造（4mm超）',
  steel_light_27: '軽量鉄骨造（3mm超4mm以下）',
  steel_light_19: '軽量鉄骨造（3mm以下）',
  wood: '木造',
  wood_mortar: '木造モルタル',
}

/** 定額法償却率テーブル（主要な耐用年数のみ抜粋） */
const STRAIGHT_LINE_RATES: Record<number, number> = {
  2: 0.500,
  3: 0.334,
  4: 0.250,
  5: 0.200,
  6: 0.167,
  7: 0.143,
  8: 0.125,
  9: 0.112,
  10: 0.100,
  11: 0.091,
  12: 0.084,
  13: 0.077,
  14: 0.072,
  15: 0.067,
  16: 0.063,
  17: 0.059,
  18: 0.056,
  19: 0.053,
  20: 0.050,
  21: 0.048,
  22: 0.046,
  23: 0.044,
  24: 0.042,
  25: 0.040,
  26: 0.039,
  27: 0.038,
  28: 0.036,
  29: 0.035,
  30: 0.034,
  31: 0.033,
  32: 0.032,
  33: 0.031,
  34: 0.030,
  35: 0.029,
  36: 0.028,
  37: 0.028,
  38: 0.027,
  39: 0.026,
  40: 0.025,
  41: 0.025,
  42: 0.024,
  43: 0.024,
  44: 0.023,
  45: 0.023,
  46: 0.022,
  47: 0.022,
  48: 0.021,
  49: 0.021,
  50: 0.020,
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 定額法の償却率を取得
 * テーブルにない場合は 1/耐用年数 で計算
 */
function getDepreciationRate(usefulLife: number): number {
  if (STRAIGHT_LINE_RATES[usefulLife]) {
    return STRAIGHT_LINE_RATES[usefulLife]
  }
  // テーブルにない場合は概算（小数点以下3桁で四捨五入）
  return Math.round((1 / usefulLife) * 1000) / 1000
}

/**
 * 中古資産の耐用年数を計算（簡便法）
 *
 * ケースA：法定耐用年数をすべて経過している場合
 *   耐用年数 = 法定耐用年数 × 0.2（端数切捨て、最短2年）
 *
 * ケースB：法定耐用年数の一部を経過している場合
 *   耐用年数 = (法定耐用年数 - 経過年数) + 経過年数 × 0.2（端数切捨て、最短2年）
 */
export function calculateUsedAssetUsefulLife(
  legalUsefulLife: number,
  buildingAge: number
): number {
  if (buildingAge <= 0) {
    // 新築の場合
    return legalUsefulLife
  }

  let usefulLife: number

  if (buildingAge >= legalUsefulLife) {
    // ケースA：法定耐用年数を全て経過
    usefulLife = legalUsefulLife * 0.2
  } else {
    // ケースB：一部経過
    usefulLife = (legalUsefulLife - buildingAge) + (buildingAge * 0.2)
  }

  // 端数切捨て、最短2年
  return Math.max(2, Math.floor(usefulLife))
}

/**
 * 減価償却費を計算
 */
export function calculateDepreciation(input: DepreciationInput): DepreciationResult {
  const {
    buildingCost,
    structure,
    buildingAge,
    acquisitionMonth,
  } = input

  const notes: string[] = []

  // =================================================================
  // 1. 法定耐用年数の取得
  // =================================================================
  const legalUsefulLife = USEFUL_LIFE_BY_STRUCTURE[structure]

  // =================================================================
  // 2. 適用耐用年数の計算（新築 or 中古簡便法）
  // =================================================================
  let appliedUsefulLife: number
  let usedSimplifiedMethod = false

  if (buildingAge > 0) {
    appliedUsefulLife = calculateUsedAssetUsefulLife(legalUsefulLife, buildingAge)
    usedSimplifiedMethod = true

    if (buildingAge >= legalUsefulLife) {
      notes.push(`法定耐用年数（${legalUsefulLife}年）を超過しているため、簡便法により耐用年数${appliedUsefulLife}年を適用しています`)
    } else {
      notes.push(`築${buildingAge}年の中古物件のため、簡便法により耐用年数${appliedUsefulLife}年を適用しています`)
    }
  } else {
    appliedUsefulLife = legalUsefulLife
  }

  // =================================================================
  // 3. 償却率の取得
  // =================================================================
  const depreciationRate = getDepreciationRate(appliedUsefulLife)

  // =================================================================
  // 4. 年間償却費の計算（定額法）
  // =================================================================
  const annualDepreciation = Math.floor(buildingCost * depreciationRate)

  // =================================================================
  // 5. 初年度償却費の計算（月割り）
  // =================================================================
  // 取得月から12月までの月数（取得月を含む）
  const firstYearMonths = 12 - acquisitionMonth + 1
  const firstYearDepreciation = Math.floor(annualDepreciation * (firstYearMonths / 12))

  // =================================================================
  // 6. 償却完了年の計算
  // =================================================================
  const depreciationEndYear = appliedUsefulLife

  // =================================================================
  // 7. 表示用の償却率ラベル
  // =================================================================
  const appliedRateLabel = `${(depreciationRate * 100).toFixed(1)}%`

  // =================================================================
  // 8. 追加の注意事項
  // =================================================================
  notes.push('平成28年4月1日以降に取得した建物・建物附属設備・構築物は定額法のみ適用されます')

  if (acquisitionMonth !== 1) {
    notes.push(`取得月が${acquisitionMonth}月のため、初年度は${firstYearMonths}ヶ月分の月割り計算となっています`)
  }

  // 備忘価額の説明
  notes.push('最終年度は取得価額から減価償却累計額を引いた残高が1円（備忘価額）になるまで償却します')

  return {
    buildingCost,
    legalUsefulLife,
    appliedUsefulLife,
    usedSimplifiedMethod,
    depreciationRate,
    annualDepreciation,
    firstYearDepreciation,
    acquisitionMonth,
    firstYearMonths,
    depreciationEndYear,
    appliedRateLabel,
    notes,
  }
}

// =================================================================
// 早見表用データ生成
// =================================================================

/** 早見表：主要構造の年間償却費 */
export interface QuickReferenceItem {
  structure: BuildingStructure
  structureLabel: string
  usefulLife: number
  rate: number
  annualDepreciation: number
}

/**
 * 早見表データを生成（特定の建物価格に対する各構造の償却費）
 */
export function generateQuickReference(buildingCost: number): QuickReferenceItem[] {
  const structures: BuildingStructure[] = ['rc', 'steel_heavy', 'steel_light_27', 'wood']

  return structures.map(structure => {
    const usefulLife = USEFUL_LIFE_BY_STRUCTURE[structure]
    const rate = getDepreciationRate(usefulLife)
    const annualDepreciation = Math.floor(buildingCost * rate)

    return {
      structure,
      structureLabel: STRUCTURE_LABELS[structure],
      usefulLife,
      rate,
      annualDepreciation,
    }
  })
}

/**
 * 早見表データ：中古木造の耐用年数別
 */
export interface UsedWoodQuickReference {
  buildingAge: number
  appliedUsefulLife: number
  rate: number
  annualDepreciation: number
}

/**
 * 中古木造の築年数別償却費早見表を生成
 */
export function generateUsedWoodQuickReference(buildingCost: number): UsedWoodQuickReference[] {
  const ages = [5, 10, 15, 20, 22, 25, 30]
  const legalUsefulLife = USEFUL_LIFE_BY_STRUCTURE['wood'] // 22年

  return ages.map(age => {
    const appliedUsefulLife = calculateUsedAssetUsefulLife(legalUsefulLife, age)
    const rate = getDepreciationRate(appliedUsefulLife)
    const annualDepreciation = Math.floor(buildingCost * rate)

    return {
      buildingAge: age,
      appliedUsefulLife,
      rate,
      annualDepreciation,
    }
  })
}

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 金額を万円単位でフォーマット
 */
export function formatManYen(amount: number): string {
  if (amount >= 100000000) {
    return `約${(amount / 100000000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}億円`
  }
  if (amount >= 10000) {
    return `約${Math.round(amount / 10000).toLocaleString('ja-JP')}万円`
  }
  return `${amount.toLocaleString('ja-JP')}円`
}

/**
 * 節税効果を概算（参考値）
 */
export function estimateTaxSavings(
  annualDepreciation: number,
  taxRate: number = 0.30
): number {
  return Math.floor(annualDepreciation * taxRate)
}
