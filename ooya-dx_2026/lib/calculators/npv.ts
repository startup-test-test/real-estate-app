/**
 * NPV（正味現在価値）計算ロジック
 *
 * NPV = Σ(CFt / (1 + r)^t) - 初期投資額
 *
 * NPV > 0: 投資として有利な可能性がある
 * NPV = 0: 要求利回りと同等
 * NPV < 0: 投資として不利な可能性がある
 *
 * 参考:
 * - ファイナンス理論における標準的な投資評価指標
 * - 不動産投資における収益性分析に広く使用
 */

export interface NPVInput {
  /** 初期投資額（万円） */
  initialInvestmentInMan: number
  /** 年間キャッシュフロー（万円）- 毎年同額の場合 */
  annualCashFlowInMan: number
  /** 保有期間（年） */
  holdingPeriodYears: number
  /** 割引率（%）- 期待利回り・資本コスト */
  discountRate: number
  /** 売却時の残存価値（万円）- 最終年度に加算 */
  terminalValueInMan?: number
  /** キャッシュフローの年間成長率（%）- デフォルト0% */
  growthRate?: number
}

export interface YearlyNPVDetail {
  /** 年度 */
  year: number
  /** その年のキャッシュフロー（万円） */
  cashFlow: number
  /** 割引係数 1/(1+r)^n */
  discountFactor: number
  /** 現在価値（万円） */
  presentValue: number
  /** 累計現在価値（万円） */
  cumulativePV: number
}

export interface NPVResult {
  /** NPV（万円） */
  npv: number
  /** キャッシュフローの現在価値合計（万円） */
  totalPresentValue: number
  /** 初期投資額（万円） */
  initialInvestment: number
  /** 投資回収年数（回収できない場合はnull） */
  paybackPeriod: number | null
  /** 収益性指数（PI = 現在価値合計 / 初期投資額） */
  profitabilityIndex: number
  /** 各年度の詳細 */
  yearlyDetails: YearlyNPVDetail[]
  /** 投資判定 */
  evaluation: {
    level: 'positive' | 'neutral' | 'negative'
    label: string
    description: string
  }
  /** 入力パラメーター（確認用） */
  input: {
    initialInvestmentInMan: number
    annualCashFlowInMan: number
    holdingPeriodYears: number
    discountRate: number
    terminalValueInMan: number
    growthRate: number
  }
}

/**
 * NPV（正味現在価値）を計算
 */
export function calculateNPV(input: NPVInput): NPVResult {
  const {
    initialInvestmentInMan,
    annualCashFlowInMan,
    holdingPeriodYears,
    discountRate,
    terminalValueInMan = 0,
    growthRate = 0,
  } = input

  // %を小数に変換
  const r = discountRate / 100
  const g = growthRate / 100

  // 各年度の計算
  const yearlyDetails: YearlyNPVDetail[] = []
  let totalPresentValue = 0
  let cumulativePV = 0
  let paybackPeriod: number | null = null

  for (let t = 1; t <= holdingPeriodYears; t++) {
    // t年目のキャッシュフロー = 初年度CF × (1 + g)^(t-1)
    let cashFlow = annualCashFlowInMan * Math.pow(1 + g, t - 1)

    // 最終年度に残存価値を加算
    if (t === holdingPeriodYears) {
      cashFlow += terminalValueInMan
    }

    // 割引係数 = 1 / (1 + r)^t
    const discountFactor = 1 / Math.pow(1 + r, t)
    // 現在価値 = CF × 割引係数
    const presentValue = cashFlow * discountFactor

    cumulativePV += presentValue

    yearlyDetails.push({
      year: t,
      cashFlow: Math.round(cashFlow * 100) / 100,
      discountFactor: Math.round(discountFactor * 10000) / 10000,
      presentValue: Math.round(presentValue * 100) / 100,
      cumulativePV: Math.round(cumulativePV * 100) / 100,
    })

    totalPresentValue += presentValue

    // 投資回収年数（累計PVが初期投資を超えた最初の年）
    if (paybackPeriod === null && cumulativePV >= initialInvestmentInMan) {
      paybackPeriod = t
    }
  }

  // NPV = 現在価値合計 - 初期投資額
  const npv = totalPresentValue - initialInvestmentInMan

  // 収益性指数（Profitability Index）
  const profitabilityIndex = initialInvestmentInMan > 0
    ? totalPresentValue / initialInvestmentInMan
    : 0

  // 投資判定
  let evaluation: NPVResult['evaluation']
  if (npv > 0) {
    evaluation = {
      level: 'positive',
      label: 'プラス',
      description: '割引率で割り引いても投資価値がある可能性があります',
    }
  } else if (npv === 0) {
    evaluation = {
      level: 'neutral',
      label: 'ゼロ',
      description: '割引率と同等の収益率が期待できる可能性があります',
    }
  } else {
    evaluation = {
      level: 'negative',
      label: 'マイナス',
      description: '割引率を下回る収益率となる可能性があります',
    }
  }

  return {
    npv: Math.round(npv * 100) / 100,
    totalPresentValue: Math.round(totalPresentValue * 100) / 100,
    initialInvestment: initialInvestmentInMan,
    paybackPeriod,
    profitabilityIndex: Math.round(profitabilityIndex * 1000) / 1000,
    yearlyDetails,
    evaluation,
    input: {
      initialInvestmentInMan,
      annualCashFlowInMan,
      holdingPeriodYears,
      discountRate,
      terminalValueInMan,
      growthRate,
    },
  }
}

/**
 * 割引率の目安
 */
export function getDiscountRateGuide(): Array<{
  category: string
  rate: string
  description: string
}> {
  return [
    { category: '低リスク投資', rate: '3〜5%', description: '安定したキャッシュフローが見込める物件' },
    { category: '中リスク投資', rate: '6〜8%', description: '一般的な収益不動産' },
    { category: '高リスク投資', rate: '10〜15%', description: 'バリューアッド・開発案件' },
  ]
}

/**
 * NPVの早見表データを生成
 * @param initialInvestment 初期投資額（万円）
 * @param holdingPeriod 保有期間（年）
 * @param discountRate 割引率（%）
 */
export function generateNPVTable(
  initialInvestment: number,
  holdingPeriod: number = 10,
  discountRate: number = 5
): Array<{
  annualCF: number
  npv: number
  pi: number
}> {
  const cfRates = [0.05, 0.08, 0.10, 0.12, 0.15] // 初期投資に対するCF率

  return cfRates.map(rate => {
    const annualCF = Math.round(initialInvestment * rate)
    const result = calculateNPV({
      initialInvestmentInMan: initialInvestment,
      annualCashFlowInMan: annualCF,
      holdingPeriodYears: holdingPeriod,
      discountRate: discountRate,
    })
    return {
      annualCF,
      npv: result.npv,
      pi: result.profitabilityIndex,
    }
  })
}
