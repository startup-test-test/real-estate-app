/**
 * 利回り計算ロジック
 * 表面利回り（グロス利回り）・実質利回り（ネット利回り）
 */

export interface YieldRateInput {
  propertyPriceInMan: number       // 物件価格（万円）
  annualRentInMan: number          // 年間想定賃料（万円）
  annualExpensesInMan?: number     // 年間経費（万円）- 実質利回り計算用
  purchaseCostsInMan?: number      // 購入諸経費（万円）- 実質利回り計算用
}

export interface YieldRateResult {
  grossYield: number               // 表面利回り（%）
  netYield: number | null          // 実質利回り（%）- 経費入力がある場合のみ
  yieldDifference: number | null   // 表面と実質の差（%）
  annualNOI: number | null         // 年間NOI（万円）
  totalInvestment: number          // 総投資額（万円）
}

/**
 * 利回りを計算
 * @param input 入力パラメータ
 * @returns 計算結果
 */
export function calculateYieldRate(input: YieldRateInput): YieldRateResult {
  const {
    propertyPriceInMan,
    annualRentInMan,
    annualExpensesInMan = 0,
    purchaseCostsInMan = 0,
  } = input

  // 入力チェック
  if (propertyPriceInMan <= 0 || annualRentInMan <= 0) {
    return {
      grossYield: 0,
      netYield: null,
      yieldDifference: null,
      annualNOI: null,
      totalInvestment: 0,
    }
  }

  // 表面利回り = 年間想定賃料 / 物件価格 × 100
  const grossYield = (annualRentInMan / propertyPriceInMan) * 100

  // 総投資額 = 物件価格 + 購入諸経費
  const totalInvestment = propertyPriceInMan + purchaseCostsInMan

  // 実質利回り計算（経費が入力されている場合）
  let netYield: number | null = null
  let yieldDifference: number | null = null
  let annualNOI: number | null = null

  // 経費または諸経費が入力されている場合は実質利回りを計算
  if (annualExpensesInMan > 0 || purchaseCostsInMan > 0) {
    // 年間NOI = 年間賃料 - 年間経費
    annualNOI = annualRentInMan - annualExpensesInMan

    // 実質利回り = NOI / 総投資額 × 100
    netYield = (annualNOI / totalInvestment) * 100

    // 利回り差
    yieldDifference = grossYield - netYield
  }

  return {
    grossYield: Math.round(grossYield * 100) / 100,         // 小数点2桁
    netYield: netYield !== null ? Math.round(netYield * 100) / 100 : null,
    yieldDifference: yieldDifference !== null ? Math.round(yieldDifference * 100) / 100 : null,
    annualNOI,
    totalInvestment,
  }
}

/**
 * 経費率から年間経費を推計
 * @param annualRentInMan 年間賃料（万円）
 * @param expenseRate 経費率（%）デフォルト20%
 * @returns 推計年間経費（万円）
 */
export function estimateAnnualExpenses(
  annualRentInMan: number,
  expenseRate: number = 20
): number {
  return Math.round(annualRentInMan * (expenseRate / 100) * 10) / 10
}

/**
 * 購入諸経費を推計（物件価格の7%を目安）
 * @param propertyPriceInMan 物件価格（万円）
 * @param rate 諸経費率（%）デフォルト7%
 * @returns 推計購入諸経費（万円）
 */
export function estimatePurchaseCosts(
  propertyPriceInMan: number,
  rate: number = 7
): number {
  return Math.round(propertyPriceInMan * (rate / 100))
}

/**
 * 利回りから物件価格を逆算
 * @param annualRentInMan 年間賃料（万円）
 * @param targetYield 目標利回り（%）
 * @returns 物件価格（万円）
 */
export function calculatePriceFromYield(
  annualRentInMan: number,
  targetYield: number
): number {
  if (targetYield <= 0) return 0
  return Math.round(annualRentInMan / (targetYield / 100))
}
