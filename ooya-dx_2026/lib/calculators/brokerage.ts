/**
 * 仲介手数料計算ロジック
 * 宅建業法に基づく速算式
 */

export interface BrokerageResult {
  commission: number      // 仲介手数料（税抜）
  tax: number            // 消費税
  total: number          // 合計（税込）
  rate: string           // 適用料率
}

/**
 * 仲介手数料を計算（速算式）
 * @param price 売買価格（円）
 * @returns 計算結果
 */
export function calculateBrokerageFee(price: number): BrokerageResult {
  let commission = 0
  let rate = ''

  if (price <= 0) {
    return { commission: 0, tax: 0, total: 0, rate: '-' }
  }

  if (price <= 2000000) {
    // 200万円以下: 5%
    commission = price * 0.05
    rate = '5%'
  } else if (price <= 4000000) {
    // 200万円超〜400万円以下: 4% + 2万円
    commission = price * 0.04 + 20000
    rate = '4% + 2万円'
  } else {
    // 400万円超: 3% + 6万円
    commission = price * 0.03 + 60000
    rate = '3% + 6万円'
  }

  const tax = commission * 0.1  // 消費税10%
  const total = commission + tax

  return {
    commission: Math.floor(commission),
    tax: Math.floor(tax),
    total: Math.floor(total),
    rate
  }
}

/**
 * 両手仲介（売主・買主両方から手数料）の場合の合計
 */
export function calculateDoubleSidedFee(price: number): {
  seller: BrokerageResult
  buyer: BrokerageResult
  grandTotal: number
} {
  const result = calculateBrokerageFee(price)
  return {
    seller: result,
    buyer: result,
    grandTotal: result.total * 2
  }
}
