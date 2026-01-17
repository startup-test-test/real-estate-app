/**
 * 住宅ローン計算ロジック
 *
 * 参考：
 * - 元利均等返済: PMT関数と同等の計算
 * - 元金均等返済: 元金を均等割し、利息を都度計算
 * - ボーナス返済: 借入額を分割して別々に計算
 *
 * 注意：本計算は概算値であり、実際の金額は金融機関により異なります。
 *       正確な金額については金融機関にご確認ください。
 */

// =================================================================
// 型定義
// =================================================================

/** 返済方式 */
export type RepaymentMethod = 'equalPrincipalAndInterest' | 'equalPrincipal'

/** 住宅ローン計算の入力パラメータ */
export interface MortgageLoanInput {
  /** 借入額（円） */
  loanAmount: number
  /** 年利率（%表記、例: 1.5） */
  annualRate: number
  /** 返済期間（年） */
  loanTermYears: number
  /** 返済方式 */
  repaymentMethod: RepaymentMethod
  /** 年間ボーナス返済額（円） */
  annualBonusPayment: number
}

/** 住宅ローン計算結果 */
export interface MortgageLoanResult {
  /** 借入額 */
  loanAmount: number
  /** 年利率（%） */
  annualRate: number
  /** 返済期間（年） */
  loanTermYears: number
  /** 返済回数（月） */
  totalPayments: number
  /** 返済方式 */
  repaymentMethod: RepaymentMethod
  /** 返済方式名（表示用） */
  repaymentMethodLabel: string
  /** 毎月の返済額（通常月） */
  monthlyPayment: number
  /** 毎月の返済額（ボーナス月） */
  bonusMonthPayment: number
  /** ボーナス時加算額（1回あたり） */
  bonusAddition: number
  /** 年間返済額 */
  annualPayment: number
  /** 総返済額 */
  totalPayment: number
  /** 総利息 */
  totalInterest: number
  /** 注意事項 */
  notes: string[]
}

/** 返済スケジュール（1回分） */
export interface PaymentScheduleItem {
  /** 回数 */
  paymentNumber: number
  /** 返済額 */
  payment: number
  /** 元金分 */
  principal: number
  /** 利息分 */
  interest: number
  /** 残高 */
  balance: number
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 元利均等返済の毎月返済額を計算（PMT関数）
 * @param principal 元金
 * @param monthlyRate 月利（小数）
 * @param totalPayments 総返済回数
 */
function calculatePMT(
  principal: number,
  monthlyRate: number,
  totalPayments: number
): number {
  if (monthlyRate === 0) {
    return principal / totalPayments
  }
  const factor = Math.pow(1 + monthlyRate, totalPayments)
  return principal * (monthlyRate * factor) / (factor - 1)
}

/**
 * 元金均等返済の初回返済額を計算
 * @param principal 元金
 * @param monthlyRate 月利（小数）
 * @param totalPayments 総返済回数
 */
function calculateEqualPrincipalFirstPayment(
  principal: number,
  monthlyRate: number,
  totalPayments: number
): number {
  const principalPart = principal / totalPayments
  const interestPart = principal * monthlyRate
  return principalPart + interestPart
}

/**
 * 元金均等返済の平均返済額を計算
 * @param principal 元金
 * @param monthlyRate 月利（小数）
 * @param totalPayments 総返済回数
 */
function calculateEqualPrincipalAveragePayment(
  principal: number,
  monthlyRate: number,
  totalPayments: number
): number {
  const principalPart = principal / totalPayments
  // 平均残高 = 元金 × (1 + 総回数) / 2 / 総回数
  const averageBalance = principal * (totalPayments + 1) / 2 / totalPayments
  const averageInterest = averageBalance * monthlyRate
  return principalPart + averageInterest
}

/**
 * 元利均等返済の総利息を計算
 */
function calculateTotalInterestEqualPI(
  principal: number,
  monthlyRate: number,
  totalPayments: number
): number {
  const monthlyPayment = calculatePMT(principal, monthlyRate, totalPayments)
  return monthlyPayment * totalPayments - principal
}

/**
 * 元金均等返済の総利息を計算
 */
function calculateTotalInterestEqualP(
  principal: number,
  monthlyRate: number,
  totalPayments: number
): number {
  // 総利息 = 元金 × 月利 × (総回数 + 1) / 2
  return principal * monthlyRate * (totalPayments + 1) / 2
}

/**
 * 住宅ローンを計算
 */
export function calculateMortgageLoan(input: MortgageLoanInput): MortgageLoanResult {
  const {
    loanAmount,
    annualRate,
    loanTermYears,
    repaymentMethod,
    annualBonusPayment,
  } = input

  const notes: string[] = []

  // =================================================================
  // 1. 基本パラメータの計算
  // =================================================================
  const monthlyRate = annualRate / 100 / 12
  const totalPayments = loanTermYears * 12

  // =================================================================
  // 2. 毎月返済分の計算
  // =================================================================
  let monthlyPayment: number
  let totalInterest: number

  if (repaymentMethod === 'equalPrincipalAndInterest') {
    // 元利均等返済
    monthlyPayment = Math.floor(calculatePMT(loanAmount, monthlyRate, totalPayments))
    totalInterest = calculateTotalInterestEqualPI(loanAmount, monthlyRate, totalPayments)
  } else {
    // 元金均等返済（平均値を使用）
    monthlyPayment = Math.floor(
      calculateEqualPrincipalAveragePayment(loanAmount, monthlyRate, totalPayments)
    )
    totalInterest = calculateTotalInterestEqualP(loanAmount, monthlyRate, totalPayments)
  }

  // =================================================================
  // 3. ボーナス返済の計算（年間合計を年2回で分割）
  // =================================================================
  const bonusAddition = annualBonusPayment > 0 ? Math.floor(annualBonusPayment / 2) : 0
  const bonusMonthPayment = monthlyPayment + bonusAddition

  // =================================================================
  // 4. 集計
  // =================================================================
  const annualPayment = monthlyPayment * 12 + annualBonusPayment
  const totalPayment = loanAmount + Math.floor(totalInterest)

  return {
    loanAmount,
    annualRate,
    loanTermYears,
    totalPayments,
    repaymentMethod,
    repaymentMethodLabel: repaymentMethod === 'equalPrincipalAndInterest'
      ? '元利均等返済'
      : '元金均等返済',
    monthlyPayment,
    bonusMonthPayment,
    bonusAddition,
    annualPayment,
    totalPayment,
    totalInterest: Math.floor(totalInterest),
    notes,
  }
}

// =================================================================
// 早見表データ生成
// =================================================================

/** 早見表用データ（借入額3000万円、35年、元利均等） */
export const QUICK_REFERENCE_BY_RATE = [
  { rate: 0.5, monthlyPayment: 77875, totalPayment: 32707500, totalInterest: 2707500 },
  { rate: 1.0, monthlyPayment: 84685, totalPayment: 35567700, totalInterest: 5567700 },
  { rate: 1.5, monthlyPayment: 91855, totalPayment: 38579100, totalInterest: 8579100 },
  { rate: 2.0, monthlyPayment: 99378, totalPayment: 41738760, totalInterest: 11738760 },
  { rate: 2.5, monthlyPayment: 107248, totalPayment: 45044160, totalInterest: 15044160 },
  { rate: 3.0, monthlyPayment: 115455, totalPayment: 48491100, totalInterest: 18491100 },
]

/** 早見表用データ（金利1.5%、35年、元利均等） */
export const QUICK_REFERENCE_BY_AMOUNT = [
  { amount: 20000000, monthlyPayment: 61237, totalPayment: 25719540, totalInterest: 5719540 },
  { amount: 30000000, monthlyPayment: 91855, totalPayment: 38579100, totalInterest: 8579100 },
  { amount: 40000000, monthlyPayment: 122474, totalPayment: 51438960, totalInterest: 11438960 },
  { amount: 50000000, monthlyPayment: 153092, totalPayment: 64298640, totalInterest: 14298640 },
]

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 金額を万円単位でフォーマット
 */
export function formatManYen(amount: number): string {
  return `${(amount / 10000).toLocaleString('ja-JP')}万円`
}

/**
 * 金額を円単位でフォーマット
 */
export function formatYen(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}円`
}
