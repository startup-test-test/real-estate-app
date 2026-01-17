/**
 * 贈与税計算ロジック（不動産特化）
 *
 * 参考法令：
 * - 相続税法第21条～第21条の7（暦年課税）
 * - 租税特別措置法第70条の2（住宅取得等資金の非課税）
 * - 相続税法第21条の6（配偶者控除）
 *
 * 注意：本計算は概算値であり、実際の税額は個別の状況により異なります。
 *       正確な税額については税理士等の専門家にご相談ください。
 */

// =================================================================
// 型定義
// =================================================================

/** 贈与税の課税方式 */
export type TaxationMode = 'calendar' | 'settlement'

/** 贈与者と受贈者の関係 */
export type DonorRelation =
  | 'lineal_ascendant_adult'   // 直系尊属から成人の子・孫へ（特例税率）
  | 'spouse_20years'           // 婚姻20年以上の配偶者
  | 'other'                    // その他（一般税率）

/** 住宅の省エネ区分 */
export type HousingType =
  | 'energy_saving'            // 省エネ等住宅（1,000万円）
  | 'standard'                 // 一般住宅（500万円）
  | 'none'                     // 住宅取得資金贈与ではない

/** 贈与税計算の入力パラメータ */
export interface GiftTaxInput {
  /** 贈与金額（円） */
  giftAmount: number
  /** 贈与者との関係 */
  donorRelation: DonorRelation
  /** 住宅取得等資金の非課税特例を適用するか */
  applyHousingExemption: boolean
  /** 住宅の種類（省エネ等住宅かどうか） */
  housingType: HousingType
  /** 配偶者控除（おしどり贈与）を適用するか */
  applySpouseDeduction: boolean
  /** 受贈者の合計所得金額（住宅取得資金贈与の要件判定用） */
  recipientIncome?: number
}

/** 贈与税計算結果 */
export interface GiftTaxResult {
  /** 贈与金額 */
  giftAmount: number
  /** 住宅取得等資金の非課税額 */
  housingExemptionAmount: number
  /** 配偶者控除額 */
  spouseDeductionAmount: number
  /** 基礎控除額 */
  basicDeductionAmount: number
  /** 課税価格（控除後） */
  taxableAmount: number
  /** 適用税率 */
  appliedRate: string
  /** 速算控除額 */
  quickDeduction: number
  /** 贈与税額（概算） */
  taxAmount: number
  /** 適用された控除・特例の説明 */
  appliedDeductions: string[]
  /** 注意事項 */
  notes: string[]
}

// =================================================================
// 税率テーブル（令和6年時点）
// =================================================================

/** 特例税率（直系尊属から成人の子・孫への贈与） */
const SPECIAL_TAX_TABLE = [
  { threshold: 2000000, rate: 0.10, deduction: 0 },
  { threshold: 4000000, rate: 0.15, deduction: 100000 },
  { threshold: 6000000, rate: 0.20, deduction: 300000 },
  { threshold: 10000000, rate: 0.30, deduction: 900000 },
  { threshold: 15000000, rate: 0.40, deduction: 1900000 },
  { threshold: 30000000, rate: 0.45, deduction: 2650000 },
  { threshold: 45000000, rate: 0.50, deduction: 4150000 },
  { threshold: Infinity, rate: 0.55, deduction: 6400000 },
]

/** 一般税率（上記以外の贈与） */
const GENERAL_TAX_TABLE = [
  { threshold: 2000000, rate: 0.10, deduction: 0 },
  { threshold: 3000000, rate: 0.15, deduction: 100000 },
  { threshold: 4000000, rate: 0.20, deduction: 250000 },
  { threshold: 6000000, rate: 0.30, deduction: 650000 },
  { threshold: 10000000, rate: 0.40, deduction: 1250000 },
  { threshold: 15000000, rate: 0.45, deduction: 1750000 },
  { threshold: 30000000, rate: 0.50, deduction: 2500000 },
  { threshold: Infinity, rate: 0.55, deduction: 4000000 },
]

/** 基礎控除額 */
const BASIC_DEDUCTION = 1100000 // 110万円

/** 配偶者控除額（おしどり贈与） */
const SPOUSE_DEDUCTION = 20000000 // 2,000万円

/** 住宅取得等資金の非課税限度額（2026年12月31日まで） */
const HOUSING_EXEMPTION = {
  energy_saving: 10000000,  // 省エネ等住宅：1,000万円
  standard: 5000000,        // 一般住宅：500万円
  none: 0,
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 暦年課税方式での贈与税を計算
 *
 * @param input 計算入力パラメータ
 * @returns 計算結果（概算）
 */
export function calculateGiftTax(input: GiftTaxInput): GiftTaxResult {
  const {
    giftAmount,
    donorRelation,
    applyHousingExemption,
    housingType,
    applySpouseDeduction,
  } = input

  // 初期値
  let remainingAmount = giftAmount
  let housingExemptionAmount = 0
  let spouseDeductionAmount = 0
  const appliedDeductions: string[] = []
  const notes: string[] = []

  // =================================================================
  // 1. 住宅取得等資金の非課税特例
  // =================================================================
  if (applyHousingExemption && housingType !== 'none') {
    const maxExemption = HOUSING_EXEMPTION[housingType]
    housingExemptionAmount = Math.min(remainingAmount, maxExemption)
    remainingAmount -= housingExemptionAmount

    if (housingType === 'energy_saving') {
      appliedDeductions.push(`住宅取得等資金の非課税特例（省エネ等住宅）：${formatYen(housingExemptionAmount)}`)
    } else {
      appliedDeductions.push(`住宅取得等資金の非課税特例（一般住宅）：${formatYen(housingExemptionAmount)}`)
    }

    notes.push('住宅取得等資金の非課税特例を適用するには、贈与を受けた年の翌年3月15日までに申告が必要です')
    notes.push('受贈者の年齢・所得・住宅の床面積等の要件を満たす必要があります')
  }

  // =================================================================
  // 2. 配偶者控除（おしどり贈与）
  // =================================================================
  if (applySpouseDeduction && donorRelation === 'spouse_20years') {
    spouseDeductionAmount = Math.min(remainingAmount, SPOUSE_DEDUCTION)
    remainingAmount -= spouseDeductionAmount
    appliedDeductions.push(`配偶者控除（おしどり贈与）：${formatYen(spouseDeductionAmount)}`)
    notes.push('配偶者控除は、婚姻期間20年以上の配偶者からの居住用不動産または購入資金の贈与に適用されます')
    notes.push('同一配偶者からは一生に一度のみ適用可能です')
  }

  // =================================================================
  // 3. 基礎控除
  // =================================================================
  const basicDeductionAmount = Math.min(remainingAmount, BASIC_DEDUCTION)
  remainingAmount -= basicDeductionAmount
  appliedDeductions.push(`基礎控除：${formatYen(basicDeductionAmount)}`)

  // =================================================================
  // 4. 課税価格の算出
  // =================================================================
  const taxableAmount = Math.max(0, remainingAmount)

  // =================================================================
  // 5. 税額計算
  // =================================================================
  let taxAmount = 0
  let appliedRate = '-'
  let quickDeduction = 0

  if (taxableAmount > 0) {
    // 税率テーブルの選択
    const isSpecialRate = donorRelation === 'lineal_ascendant_adult'
    const taxTable = isSpecialRate ? SPECIAL_TAX_TABLE : GENERAL_TAX_TABLE

    // 該当する税率帯を検索
    const bracket = taxTable.find(b => taxableAmount <= b.threshold) || taxTable[taxTable.length - 1]

    appliedRate = `${(bracket.rate * 100).toFixed(0)}%`
    quickDeduction = bracket.deduction

    // 税額 = 課税価格 × 税率 - 速算控除額
    taxAmount = Math.floor(taxableAmount * bracket.rate - bracket.deduction)
    taxAmount = Math.max(0, taxAmount)

    if (isSpecialRate) {
      notes.push('直系尊属から成人の子・孫への贈与のため、特例税率が適用されます')
    } else {
      notes.push('一般税率が適用されます')
    }
  }

  // =================================================================
  // 6. 申告に関する注意事項
  // =================================================================
  if (taxAmount === 0 && (housingExemptionAmount > 0 || spouseDeductionAmount > 0)) {
    notes.push('税額が0円でも、特例・控除を適用する場合は申告が必要です')
  }

  if (giftAmount > BASIC_DEDUCTION && taxAmount === 0) {
    notes.push('贈与額が110万円を超えているため、申告書の提出が必要な可能性があります')
  }

  return {
    giftAmount,
    housingExemptionAmount,
    spouseDeductionAmount,
    basicDeductionAmount,
    taxableAmount,
    appliedRate,
    quickDeduction,
    taxAmount,
    appliedDeductions,
    notes,
  }
}

// =================================================================
// 早見表用データ生成
// =================================================================

/** 暦年課税の早見表データ（特例税率） */
export const SPECIAL_RATE_TABLE = [
  { giftAmount: 1000000, taxAmount: 0 },
  { giftAmount: 2000000, taxAmount: 90000 },
  { giftAmount: 3000000, taxAmount: 190000 },
  { giftAmount: 4000000, taxAmount: 335000 },
  { giftAmount: 5000000, taxAmount: 485000 },
  { giftAmount: 6000000, taxAmount: 680000 },
  { giftAmount: 7000000, taxAmount: 880000 },
  { giftAmount: 8000000, taxAmount: 1170000 },
  { giftAmount: 10000000, taxAmount: 1770000 },
  { giftAmount: 15000000, taxAmount: 3660000 },
  { giftAmount: 20000000, taxAmount: 5855000 },
  { giftAmount: 30000000, taxAmount: 10355000 },
]

/** 暦年課税の早見表データ（一般税率） */
export const GENERAL_RATE_TABLE = [
  { giftAmount: 1000000, taxAmount: 0 },
  { giftAmount: 2000000, taxAmount: 90000 },
  { giftAmount: 3000000, taxAmount: 190000 },
  { giftAmount: 4000000, taxAmount: 335000 },
  { giftAmount: 5000000, taxAmount: 530000 },
  { giftAmount: 6000000, taxAmount: 820000 },
  { giftAmount: 7000000, taxAmount: 1120000 },
  { giftAmount: 8000000, taxAmount: 1510000 },
  { giftAmount: 10000000, taxAmount: 2310000 },
  { giftAmount: 15000000, taxAmount: 4505000 },
  { giftAmount: 20000000, taxAmount: 6955000 },
  { giftAmount: 30000000, taxAmount: 12305000 },
]

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 金額を日本語形式でフォーマット
 */
function formatYen(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toLocaleString('ja-JP')}億円`
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toLocaleString('ja-JP')}万円`
  }
  return `${amount.toLocaleString('ja-JP')}円`
}

/**
 * 金額を万円単位でフォーマット
 */
export function formatManYen(amount: number): string {
  return `${(amount / 10000).toLocaleString('ja-JP')}万円`
}
