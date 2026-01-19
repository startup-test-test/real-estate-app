/**
 * DCF法（Discounted Cash Flow法）計算ロジック
 *
 * 不動産鑑定評価基準に基づく割引キャッシュフロー法による収益価格算定
 *
 * 公式:
 * P = Σ(NCF_t / (1 + r)^t) + TV_n / (1 + r)^n
 *
 * P: 収益価格（DCF評価額）
 * NCF_t: t期目の純収益
 * r: 割引率
 * n: 保有期間
 * TV_n: 復帰価格（売却予想価格）
 *
 * 参考:
 * - 国土交通省「不動産鑑定評価基準」
 * - 国土交通省「証券化対象不動産の鑑定評価基準」
 */

export interface DCFInput {
  /** 初年度NOI（純営業収益）単位: 円 */
  initialNOI: number
  /** 割引率（%） */
  discountRate: number
  /** 最終還元利回り（Terminal Cap Rate）（%） */
  terminalCapRate: number
  /** 保有期間（年） */
  holdingPeriod: number
  /** 収益成長率（%）- デフォルト0% */
  growthRate?: number
  /** 売却費用率（%）- デフォルト4%（仲介手数料3%+諸費用1%程度） */
  saleCostRate?: number
}

export interface YearlyDetail {
  /** 年度 */
  year: number
  /** その年のNOI（円） */
  noi: number
  /** 割引係数 1/(1+r)^n */
  discountFactor: number
  /** 現在価値（円） */
  presentValue: number
}

export interface DCFResult {
  /** DCF評価額（円） */
  dcfValue: number
  /** 各年度の純収益の現在価値合計（円） */
  totalNoiPV: number
  /** 復帰価格（売却予想価格・売却費用控除前）（円） */
  terminalValueGross: number
  /** 復帰価格（売却費用控除後）（円） */
  terminalValueNet: number
  /** 復帰価格の現在価値（円） */
  terminalValuePV: number
  /** 各年度の詳細 */
  yearlyDetails: YearlyDetail[]
  /** インプライドNOI利回り（DCF評価額に対する初年度NOIの利回り）（%） */
  impliedNoiYield: number
  /** 入力パラメーター（確認用） */
  input: {
    initialNOI: number
    discountRate: number
    terminalCapRate: number
    holdingPeriod: number
    growthRate: number
    saleCostRate: number
  }
}

/**
 * DCF法による不動産評価額を計算
 */
export function calculateDCF(input: DCFInput): DCFResult {
  const {
    initialNOI,
    discountRate,
    terminalCapRate,
    holdingPeriod,
    growthRate = 0,
    saleCostRate = 4,
  } = input

  // %を小数に変換
  const r = discountRate / 100
  const g = growthRate / 100
  const tcr = terminalCapRate / 100
  const sc = saleCostRate / 100

  // 各年度の計算
  const yearlyDetails: YearlyDetail[] = []
  let totalNoiPV = 0

  for (let t = 1; t <= holdingPeriod; t++) {
    // t年目のNOI = 初年度NOI × (1 + g)^(t-1)
    const noi = initialNOI * Math.pow(1 + g, t - 1)
    // 割引係数 = 1 / (1 + r)^t
    const discountFactor = 1 / Math.pow(1 + r, t)
    // 現在価値 = NOI × 割引係数
    const presentValue = noi * discountFactor

    yearlyDetails.push({
      year: t,
      noi: Math.round(noi),
      discountFactor: discountFactor,
      presentValue: Math.round(presentValue),
    })

    totalNoiPV += presentValue
  }

  // 復帰価格の計算
  // n+1年目の予測NOI = 初年度NOI × (1 + g)^n
  const noiAtSale = initialNOI * Math.pow(1 + g, holdingPeriod)
  // 復帰価格（売却費用控除前）= n+1年目NOI / 最終還元利回り
  const terminalValueGross = noiAtSale / tcr
  // 復帰価格（売却費用控除後）= 復帰価格 × (1 - 売却費用率)
  const terminalValueNet = terminalValueGross * (1 - sc)
  // 復帰価格の現在価値 = 復帰価格（控除後） / (1 + r)^n
  const terminalValuePV = terminalValueNet / Math.pow(1 + r, holdingPeriod)

  // DCF評価額 = 各年度NOI現在価値の合計 + 復帰価格の現在価値
  const dcfValue = totalNoiPV + terminalValuePV

  // インプライドNOI利回り = 初年度NOI / DCF評価額 × 100
  const impliedNoiYield = (initialNOI / dcfValue) * 100

  return {
    dcfValue: Math.round(dcfValue),
    totalNoiPV: Math.round(totalNoiPV),
    terminalValueGross: Math.round(terminalValueGross),
    terminalValueNet: Math.round(terminalValueNet),
    terminalValuePV: Math.round(terminalValuePV),
    yearlyDetails,
    impliedNoiYield: Math.round(impliedNoiYield * 100) / 100,
    input: {
      initialNOI,
      discountRate,
      terminalCapRate,
      holdingPeriod,
      growthRate: growthRate,
      saleCostRate: saleCostRate,
    },
  }
}

/**
 * 割引率の目安を取得
 * 日本不動産研究所「不動産投資家調査」等を参考にした目安
 */
export function getDiscountRateReference(): Array<{
  category: string
  location: string
  rate: string
}> {
  return [
    { category: 'Aクラスオフィス', location: '東京・丸の内等', rate: '3.0〜3.5%' },
    { category: '賃貸マンション', location: '東京・城南', rate: '3.5〜4.0%' },
    { category: '賃貸マンション', location: '大阪・京都', rate: '4.0〜4.5%' },
    { category: '物流施設', location: '首都圏', rate: '3.5〜4.0%' },
    { category: '地方・築古物件', location: '地方都市', rate: '5.0〜8.0%' },
  ]
}

/**
 * 最終還元利回り（Terminal Cap Rate）の設定指針
 * 一般的に、割引率に対して0.1〜0.5%程度上乗せすることが多い
 */
export function getTerminalCapRateGuideline(discountRate: number): {
  min: number
  max: number
  typical: number
} {
  return {
    min: discountRate + 0.1,
    max: discountRate + 0.5,
    typical: discountRate + 0.3,
  }
}
