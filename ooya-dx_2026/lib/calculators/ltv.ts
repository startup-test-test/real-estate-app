/**
 * LTV（Loan to Value：借入比率）計算ロジック
 *
 * LTV = 借入額 ÷ 不動産評価額 × 100
 *
 * 不動産投資におけるレバレッジの程度を示す指標
 *
 * 参考:
 * - 不動産証券化協会 用語集
 * - J-REITの財務基準
 */

export interface LTVInput {
  /** 物件価格（万円） */
  propertyPriceInMan: number
  /** 借入額（万円） */
  loanAmountInMan: number
  /** 購入諸経費（万円）- 任意 */
  purchaseCostsInMan?: number
}

export interface LTVResult {
  /** LTV（借入比率）% */
  ltv: number
  /** 総投資額に対するLTV % */
  ltvWithCosts: number | null
  /** 自己資金比率 % */
  equityRatio: number
  /** 自己資金額（万円） */
  equityAmount: number
  /** 総投資額（万円）= 物件価格 + 諸経費 */
  totalInvestment: number
  /** 入力パラメーター（確認用） */
  input: LTVInput
}

/**
 * LTV（借入比率）を計算
 */
export function calculateLTV(input: LTVInput): LTVResult {
  const {
    propertyPriceInMan,
    loanAmountInMan,
    purchaseCostsInMan = 0,
  } = input

  // LTV = 借入額 ÷ 物件価格 × 100
  const ltv = propertyPriceInMan > 0
    ? (loanAmountInMan / propertyPriceInMan) * 100
    : 0

  // 総投資額 = 物件価格 + 諸経費
  const totalInvestment = propertyPriceInMan + purchaseCostsInMan

  // 総投資額に対するLTV
  const ltvWithCosts = purchaseCostsInMan > 0 && totalInvestment > 0
    ? (loanAmountInMan / totalInvestment) * 100
    : null

  // 自己資金額 = 総投資額 - 借入額
  const equityAmount = totalInvestment - loanAmountInMan

  // 自己資金比率 = 100 - LTV（物件価格ベース）
  const equityRatio = 100 - ltv

  return {
    ltv: Math.round(ltv * 100) / 100,
    ltvWithCosts: ltvWithCosts !== null ? Math.round(ltvWithCosts * 100) / 100 : null,
    equityRatio: Math.round(equityRatio * 100) / 100,
    equityAmount: Math.round(equityAmount * 100) / 100,
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    input,
  }
}

/**
 * 借入額からLTVを逆算
 * @param propertyPrice 物件価格（万円）
 * @param targetLTV 目標LTV（%）
 */
export function calculateLoanFromLTV(
  propertyPrice: number,
  targetLTV: number
): number {
  return Math.round(propertyPrice * (targetLTV / 100))
}

/**
 * 自己資金からLTVを逆算
 * @param propertyPrice 物件価格（万円）
 * @param equityAmount 自己資金（万円）
 */
export function calculateLTVFromEquity(
  propertyPrice: number,
  equityAmount: number
): number {
  if (propertyPrice <= 0) return 0
  const loanAmount = propertyPrice - equityAmount
  return Math.round((loanAmount / propertyPrice) * 100 * 100) / 100
}
