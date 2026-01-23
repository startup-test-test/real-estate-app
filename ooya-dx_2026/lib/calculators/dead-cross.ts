/**
 * デッドクロス発生時期予測計算ロジック
 *
 * デッドクロスとは：
 * 賃貸経営において、ローン返済額のうち元本返済部分が減価償却費を上回る時点。
 * これが発生すると、帳簿上は利益が出ているのにキャッシュフローがマイナスになりやすく、
 * 「黒字倒産」のリスクが高まるとされています。
 *
 * 計算ロジック：
 * - 減価償却費は定額法で毎年一定
 * - 元利均等返済の場合、元本返済額は年々増加
 * - 元本返済額 > 減価償却費 となる年がデッドクロス発生年
 *
 * 注意：本計算は概算値であり、実際の状況は個別の条件により異なります。
 *       正確な判断については専門家にご相談ください。
 */

import {
  BuildingStructure,
  USEFUL_LIFE_BY_STRUCTURE,
  STRUCTURE_LABELS,
  calculateUsedAssetUsefulLife,
} from './depreciation'

// =================================================================
// 型定義
// =================================================================

/** デッドクロス計算の入力パラメータ */
export interface DeadCrossInput {
  /** 建物取得価額（円） - 土地を除く減価償却の対象 */
  buildingCost: number
  /** 建物構造 */
  structure: BuildingStructure
  /** 築年数（年） - 新築の場合は0 */
  buildingAge: number
  /** 借入額（円） */
  loanAmount: number
  /** 金利（年利 %） */
  annualRate: number
  /** 返済期間（年） */
  loanTermYears: number
}

/** 年次推移データ */
export interface YearlyData {
  /** 経過年数 */
  year: number
  /** 元本返済額（その年の合計） */
  principalPayment: number
  /** 利息返済額（その年の合計） */
  interestPayment: number
  /** 減価償却費 */
  depreciation: number
  /** 元本返済額 - 減価償却費（正の値でデッドクロス状態） */
  difference: number
  /** デッドクロス状態かどうか */
  isDeadCross: boolean
  /** ローン残高（年末時点） */
  remainingBalance: number
  /** 累計減価償却額 */
  cumulativeDepreciation: number
}

/** デッドクロス計算結果 */
export interface DeadCrossResult {
  /** デッドクロス発生年（発生しない場合はnull） */
  deadCrossYear: number | null
  /** デッドクロス発生時の元本返済額 */
  deadCrossPrincipal: number | null
  /** デッドクロス発生時の減価償却費 */
  deadCrossDepreciation: number | null
  /** 年間減価償却費 */
  annualDepreciation: number
  /** 適用耐用年数 */
  appliedUsefulLife: number
  /** 法定耐用年数 */
  legalUsefulLife: number
  /** 簡便法適用 */
  usedSimplifiedMethod: boolean
  /** 償却率 */
  depreciationRate: number
  /** 毎月の返済額（元利均等） */
  monthlyPayment: number
  /** 1年目の元本返済額 */
  firstYearPrincipal: number
  /** 1年目の利息返済額 */
  firstYearInterest: number
  /** 総返済額 */
  totalPayment: number
  /** 総利息 */
  totalInterest: number
  /** 年次推移データ（最大35年分） */
  yearlyData: YearlyData[]
  /** 減価償却終了年 */
  depreciationEndYear: number
  /** 構造ラベル */
  structureLabel: string
}

// =================================================================
// 定額法償却率テーブル（depreciation.tsから複製、または共通化）
// =================================================================

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

/**
 * 定額法の償却率を取得
 */
function getDepreciationRate(usefulLife: number): number {
  if (STRAIGHT_LINE_RATES[usefulLife]) {
    return STRAIGHT_LINE_RATES[usefulLife]
  }
  return Math.round((1 / usefulLife) * 1000) / 1000
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 元利均等返済の月次返済額を計算
 */
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return principal / termMonths
  }
  const monthlyRate = annualRate / 100 / 12
  const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  return payment
}

/**
 * 年次のローン返済内訳を計算（元本・利息の分解）
 */
function calculateYearlyLoanPayments(
  loanAmount: number,
  annualRate: number,
  loanTermYears: number
): { principalPayments: number[]; interestPayments: number[]; remainingBalances: number[] } {
  const termMonths = loanTermYears * 12
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, termMonths)
  const monthlyRate = annualRate / 100 / 12

  const principalPayments: number[] = []
  const interestPayments: number[] = []
  const remainingBalances: number[] = []

  let remainingBalance = loanAmount
  let yearlyPrincipal = 0
  let yearlyInterest = 0

  for (let month = 1; month <= termMonths; month++) {
    // 利息計算
    const interestPayment = annualRate === 0 ? 0 : remainingBalance * monthlyRate
    // 元本計算
    const principalPayment = monthlyPayment - interestPayment

    yearlyInterest += interestPayment
    yearlyPrincipal += principalPayment
    remainingBalance -= principalPayment

    // 年末（12ヶ月ごと）にデータを保存
    if (month % 12 === 0) {
      principalPayments.push(Math.round(yearlyPrincipal))
      interestPayments.push(Math.round(yearlyInterest))
      remainingBalances.push(Math.max(0, Math.round(remainingBalance)))
      yearlyPrincipal = 0
      yearlyInterest = 0
    }
  }

  return { principalPayments, interestPayments, remainingBalances }
}

/**
 * デッドクロス発生時期を計算
 */
export function calculateDeadCross(input: DeadCrossInput): DeadCrossResult {
  const {
    buildingCost,
    structure,
    buildingAge,
    loanAmount,
    annualRate,
    loanTermYears,
  } = input

  // =================================================================
  // 1. 減価償却の計算
  // =================================================================
  const legalUsefulLife = USEFUL_LIFE_BY_STRUCTURE[structure]
  const usedSimplifiedMethod = buildingAge > 0
  const appliedUsefulLife = usedSimplifiedMethod
    ? calculateUsedAssetUsefulLife(legalUsefulLife, buildingAge)
    : legalUsefulLife
  const depreciationRate = getDepreciationRate(appliedUsefulLife)
  const annualDepreciation = Math.floor(buildingCost * depreciationRate)
  const structureLabel = STRUCTURE_LABELS[structure]

  // =================================================================
  // 2. ローン返済の計算
  // =================================================================
  const termMonths = loanTermYears * 12
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, termMonths)
  const { principalPayments, interestPayments, remainingBalances } =
    calculateYearlyLoanPayments(loanAmount, annualRate, loanTermYears)

  const totalPayment = monthlyPayment * termMonths
  const totalInterest = totalPayment - loanAmount

  // =================================================================
  // 3. 年次推移データの生成
  // =================================================================
  const maxYears = Math.min(loanTermYears, 35) // 最大35年表示
  const yearlyData: YearlyData[] = []
  let cumulativeDepreciation = 0
  let deadCrossYear: number | null = null
  let deadCrossPrincipal: number | null = null
  let deadCrossDepreciation: number | null = null

  for (let year = 1; year <= maxYears; year++) {
    const principalPayment = principalPayments[year - 1] || 0
    const interestPayment = interestPayments[year - 1] || 0
    const remainingBalance = remainingBalances[year - 1] || 0

    // 減価償却費（耐用年数を超えたら0）
    const yearDepreciation = year <= appliedUsefulLife ? annualDepreciation : 0
    cumulativeDepreciation += yearDepreciation

    const difference = principalPayment - yearDepreciation
    const isDeadCross = difference > 0

    // 初めてデッドクロスが発生した年を記録
    if (isDeadCross && deadCrossYear === null) {
      deadCrossYear = year
      deadCrossPrincipal = principalPayment
      deadCrossDepreciation = yearDepreciation
    }

    yearlyData.push({
      year,
      principalPayment,
      interestPayment,
      depreciation: yearDepreciation,
      difference,
      isDeadCross,
      remainingBalance,
      cumulativeDepreciation,
    })
  }

  return {
    deadCrossYear,
    deadCrossPrincipal,
    deadCrossDepreciation,
    annualDepreciation,
    appliedUsefulLife,
    legalUsefulLife,
    usedSimplifiedMethod,
    depreciationRate,
    monthlyPayment: Math.round(monthlyPayment),
    firstYearPrincipal: principalPayments[0] || 0,
    firstYearInterest: interestPayments[0] || 0,
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    yearlyData,
    depreciationEndYear: appliedUsefulLife,
    structureLabel,
  }
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

// re-export for component use
export type { BuildingStructure }
export { USEFUL_LIFE_BY_STRUCTURE, STRUCTURE_LABELS }
