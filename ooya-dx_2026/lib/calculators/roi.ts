/**
 * ROI（投資利益率）計算ロジック
 *
 * 不動産投資におけるROIの計算
 * - CF-ROI（キャッシュフローROI）：税引前キャッシュフロー ÷ 総投資額
 * - トータルROI：（キャッシュフロー + 元金返済分）÷ 総投資額
 *
 * 参考:
 * - 不動産投資における投資効率評価の標準的指標
 */

export interface ROIInput {
  /** 物件価格（万円） */
  propertyPriceInMan: number
  /** 購入諸経費（万円） */
  purchaseCostsInMan: number
  /** 年間家賃収入（万円） */
  annualRentInMan: number
  /** 年間運営経費（万円）- 管理費・修繕費・税金等 */
  annualExpensesInMan: number
  /** 借入額（万円） */
  loanAmountInMan: number
  /** 年間ローン返済額（万円）- 元利合計 */
  annualLoanPaymentInMan: number
  /** 年間元金返済額（万円）- 任意 */
  annualPrincipalPaymentInMan?: number
}

export interface ROIResult {
  /** 総投資額（万円）= 物件価格 + 購入諸経費 */
  totalInvestment: number
  /** 自己資金（万円）= 総投資額 - 借入額 */
  equityInvestment: number
  /** NOI（営業純収益）（万円）= 年間家賃 - 運営経費 */
  noi: number
  /** 年間キャッシュフロー（万円）= NOI - ローン返済 */
  annualCashFlow: number
  /** CF-ROI（%）= キャッシュフロー ÷ 総投資額 */
  cfRoi: number
  /** FCR（実質利回り）（%）= NOI ÷ 総投資額 */
  fcr: number
  /** CCR（自己資金配当率）（%）= キャッシュフロー ÷ 自己資金 */
  ccr: number | null
  /** 自己資金回収年数（年）= 自己資金 ÷ キャッシュフロー */
  paybackYears: number | null
  /** トータルROI（%）= （キャッシュフロー + 元金返済）÷ 総投資額 */
  totalRoi: number | null
  /** 入力パラメーター（確認用） */
  input: ROIInput
}

/**
 * ROI（投資利益率）を計算
 */
export function calculateROI(input: ROIInput): ROIResult {
  const {
    propertyPriceInMan,
    purchaseCostsInMan,
    annualRentInMan,
    annualExpensesInMan,
    loanAmountInMan,
    annualLoanPaymentInMan,
    annualPrincipalPaymentInMan,
  } = input

  // 総投資額 = 物件価格 + 購入諸経費
  const totalInvestment = propertyPriceInMan + purchaseCostsInMan

  // 自己資金 = 総投資額 - 借入額
  const equityInvestment = totalInvestment - loanAmountInMan

  // NOI（営業純収益）= 年間家賃 - 運営経費
  const noi = annualRentInMan - annualExpensesInMan

  // 年間キャッシュフロー = NOI - ローン返済
  const annualCashFlow = noi - annualLoanPaymentInMan

  // CF-ROI = キャッシュフロー ÷ 総投資額 × 100
  const cfRoi = totalInvestment > 0
    ? (annualCashFlow / totalInvestment) * 100
    : 0

  // FCR（実質利回り）= NOI ÷ 総投資額 × 100
  const fcr = totalInvestment > 0
    ? (noi / totalInvestment) * 100
    : 0

  // CCR = キャッシュフロー ÷ 自己資金 × 100
  const ccr = equityInvestment > 0
    ? (annualCashFlow / equityInvestment) * 100
    : null

  // 自己資金回収年数 = 自己資金 ÷ キャッシュフロー
  const paybackYears = annualCashFlow > 0 && equityInvestment > 0
    ? equityInvestment / annualCashFlow
    : null

  // トータルROI = （キャッシュフロー + 元金返済）÷ 総投資額 × 100
  const totalRoi = annualPrincipalPaymentInMan !== undefined && totalInvestment > 0
    ? ((annualCashFlow + annualPrincipalPaymentInMan) / totalInvestment) * 100
    : null

  return {
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    equityInvestment: Math.round(equityInvestment * 100) / 100,
    noi: Math.round(noi * 100) / 100,
    annualCashFlow: Math.round(annualCashFlow * 100) / 100,
    cfRoi: Math.round(cfRoi * 100) / 100,
    fcr: Math.round(fcr * 100) / 100,
    ccr: ccr !== null ? Math.round(ccr * 100) / 100 : null,
    paybackYears: paybackYears !== null ? Math.round(paybackYears * 10) / 10 : null,
    totalRoi: totalRoi !== null ? Math.round(totalRoi * 100) / 100 : null,
    input,
  }
}
