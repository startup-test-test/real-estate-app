/**
 * IRR（内部収益率）計算ロジック
 * 不動産投資における収益性評価のための計算
 */

export interface IRRInput {
  /** 初期投資額（自己資金）万円 */
  initialInvestmentInMan: number
  /** 年間ネットキャッシュフロー万円 */
  annualCashFlowInMan: number
  /** 保有期間（年） */
  holdingPeriodYears: number
  /** 売却価格想定万円 */
  saleEstimateInMan: number
  /** ローン残債万円（売却時に返済） */
  loanBalanceAtSaleInMan: number
  /** 売却諸経費率（%）デフォルト3% */
  saleCostRate?: number
}

export interface IRRResult {
  /** IRR（%） */
  irr: number | null
  /** NPV（万円）割引率を想定利回りとした場合 */
  npv: number
  /** キャッシュフロー配列（年ごと） */
  cashFlows: number[]
  /** 総投資収益（万円） */
  totalReturn: number
  /** 投資倍率 */
  multipleOnInvested: number
  /** 年平均利回り（単純） */
  simpleAverageYield: number
}

/**
 * ニュートン法によるIRR計算
 * @param cashFlows キャッシュフロー配列（0番目が初期投資、以降が年間CF）
 * @param guess 初期推定値（デフォルト0.1=10%）
 * @param maxIterations 最大反復回数
 * @param tolerance 許容誤差
 * @returns IRR（%）またはnull（収束しない場合）
 */
function calculateIRRNewton(
  cashFlows: number[],
  guess: number = 0.1,
  maxIterations: number = 100,
  tolerance: number = 1e-7
): number | null {
  let rate = guess

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0
    let derivativeNpv = 0

    for (let t = 0; t < cashFlows.length; t++) {
      const cf = cashFlows[t]
      const denominator = Math.pow(1 + rate, t)
      npv += cf / denominator
      if (t > 0) {
        derivativeNpv -= (t * cf) / Math.pow(1 + rate, t + 1)
      }
    }

    // 導関数がゼロに近い場合は別の初期値を試す
    if (Math.abs(derivativeNpv) < 1e-10) {
      rate = rate + 0.1
      continue
    }

    const newRate = rate - npv / derivativeNpv

    // 収束判定
    if (Math.abs(newRate - rate) < tolerance) {
      // 妥当な範囲かチェック（-100%～1000%）
      if (newRate >= -1 && newRate <= 10) {
        return newRate * 100
      }
      return null
    }

    rate = newRate
  }

  return null
}

/**
 * NPV（正味現在価値）計算
 * @param cashFlows キャッシュフロー配列
 * @param discountRate 割引率（%）
 * @returns NPV
 */
function calculateNPV(cashFlows: number[], discountRate: number): number {
  const rate = discountRate / 100
  let npv = 0
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + rate, t)
  }
  return npv
}

/**
 * IRRを計算する
 */
export function calculateIRR(input: IRRInput): IRRResult {
  const {
    initialInvestmentInMan,
    annualCashFlowInMan,
    holdingPeriodYears,
    saleEstimateInMan,
    loanBalanceAtSaleInMan,
    saleCostRate = 3,
  } = input

  // 売却諸経費
  const saleCostInMan = saleEstimateInMan * (saleCostRate / 100)

  // 売却時ネットキャッシュ（売却価格 - 諸経費 - ローン残債）
  const saleProceedsInMan = saleEstimateInMan - saleCostInMan - loanBalanceAtSaleInMan

  // キャッシュフロー配列を構築
  // 0年目: 初期投資（マイナス）
  // 1年目〜N-1年目: 年間CF
  // N年目: 年間CF + 売却キャッシュ
  const cashFlows: number[] = []

  // 初期投資（マイナス）
  cashFlows.push(-initialInvestmentInMan)

  // 中間年度のキャッシュフロー
  for (let year = 1; year < holdingPeriodYears; year++) {
    cashFlows.push(annualCashFlowInMan)
  }

  // 最終年度（年間CF + 売却キャッシュ）
  if (holdingPeriodYears > 0) {
    cashFlows.push(annualCashFlowInMan + saleProceedsInMan)
  }

  // IRR計算
  const irr = calculateIRRNewton(cashFlows)

  // 総リターン計算
  const totalCashIn = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0)
  const totalReturn = totalCashIn - initialInvestmentInMan

  // 投資倍率
  const multipleOnInvested = initialInvestmentInMan > 0
    ? totalCashIn / initialInvestmentInMan
    : 0

  // 単純平均利回り
  const simpleAverageYield = initialInvestmentInMan > 0 && holdingPeriodYears > 0
    ? (totalReturn / initialInvestmentInMan / holdingPeriodYears) * 100
    : 0

  // NPV（割引率8%として計算）
  const npv = calculateNPV(cashFlows, 8)

  return {
    irr,
    npv,
    cashFlows,
    totalReturn,
    multipleOnInvested,
    simpleAverageYield,
  }
}

/**
 * IRRの評価（投資家属性別の目安）
 */
export function evaluateIRR(irr: number | null): {
  level: 'excellent' | 'good' | 'moderate' | 'low' | 'negative' | 'unknown'
  label: string
  description: string
} {
  if (irr === null) {
    return {
      level: 'unknown',
      label: '計算不能',
      description: 'キャッシュフローが計算に適していない可能性があります',
    }
  }

  if (irr < 0) {
    return {
      level: 'negative',
      label: 'マイナス',
      description: '投資元本を回収できない見込みです',
    }
  }

  if (irr >= 15) {
    return {
      level: 'excellent',
      label: '非常に高い',
      description: 'バリューアッド・開発型投資の目標水準',
    }
  }

  if (irr >= 10) {
    return {
      level: 'good',
      label: '良好',
      description: '個人投資家の一般的な目標水準',
    }
  }

  if (irr >= 6) {
    return {
      level: 'moderate',
      label: '標準的',
      description: 'J-REIT・機関投資家の目標水準程度',
    }
  }

  return {
    level: 'low',
    label: 'やや低い',
    description: '安定重視の投資でも慎重な検討が必要な水準',
  }
}
