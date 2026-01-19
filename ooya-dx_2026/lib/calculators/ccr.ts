/**
 * CCR（自己資金配当率）計算ロジック
 * Cash on Cash Return - 投資効率を測る指標
 */

export interface CCRInput {
  propertyPriceInMan: number       // 物件価格（万円）
  annualRentInMan: number          // 年間想定賃料（万円）
  vacancyRate: number              // 想定空室率（%）
  opexRate: number                 // 運営経費率（%）
  equityInMan: number              // 自己資金（万円）- 頭金+諸経費
  loanAmountInMan: number          // 借入金額（万円）
  loanTermYears: number            // 借入期間（年）
  interestRate: number             // 金利（%）
}

export interface CCRResult {
  ccr: number                      // CCR（%）
  paybackPeriod: number | null     // 自己資金回収期間（年）
  annualBTCF: number               // 年間税引前キャッシュフロー（万円）
  noi: number                      // NOI（万円）
  egi: number                      // EGI（万円）
  opex: number                     // 運営経費（万円）
  ads: number                      // 年間元利返済額（万円）
  fcr: number                      // FCR - 総収益率（%）
  loanConstant: number             // ローン定数 K%
  leverageEffect: 'positive' | 'neutral' | 'negative' // レバレッジ効果
  leverageMessage: string          // レバレッジに関するメッセージ
}

/**
 * PMT関数 - 元利均等返済の年間返済額を計算
 * @param principal 借入元金
 * @param annualRate 年利（%）
 * @param years 返済年数
 * @returns 年間返済額
 */
function calculatePMT(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0
  if (annualRate <= 0) return principal / years

  const monthlyRate = annualRate / 100 / 12
  const months = years * 12
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)

  return monthlyPayment * 12
}

/**
 * CCRを計算
 * @param input 入力パラメータ
 * @returns 計算結果
 */
export function calculateCCR(input: CCRInput): CCRResult {
  const {
    propertyPriceInMan,
    annualRentInMan,
    vacancyRate,
    opexRate,
    equityInMan,
    loanAmountInMan,
    loanTermYears,
    interestRate,
  } = input

  // 入力チェック
  if (propertyPriceInMan <= 0 || annualRentInMan <= 0 || equityInMan <= 0) {
    return {
      ccr: 0,
      paybackPeriod: null,
      annualBTCF: 0,
      noi: 0,
      egi: 0,
      opex: 0,
      ads: 0,
      fcr: 0,
      loanConstant: 0,
      leverageEffect: 'neutral',
      leverageMessage: '',
    }
  }

  // EGI = 年間賃料 × (1 - 空室率)
  const egi = annualRentInMan * (1 - vacancyRate / 100)

  // OPEX = 年間賃料 × 経費率
  const opex = annualRentInMan * (opexRate / 100)

  // NOI = EGI - OPEX
  const noi = egi - opex

  // ADS = 年間元利返済額
  const ads = calculatePMT(loanAmountInMan, interestRate, loanTermYears)

  // BTCF = NOI - ADS
  const annualBTCF = noi - ads

  // CCR = BTCF / 自己資金 × 100
  const ccr = equityInMan > 0 ? (annualBTCF / equityInMan) * 100 : 0

  // 自己資金回収期間 = 100 / CCR
  const paybackPeriod = ccr > 0 ? 100 / ccr : null

  // FCR（総収益率）= NOI / 総投資額
  const totalInvestment = propertyPriceInMan
  const fcr = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0

  // ローン定数 K% = ADS / 借入額
  const loanConstant = loanAmountInMan > 0 ? (ads / loanAmountInMan) * 100 : 0

  // レバレッジ効果の判定
  let leverageEffect: 'positive' | 'neutral' | 'negative' = 'neutral'
  let leverageMessage = ''

  if (loanAmountInMan > 0) {
    if (fcr > loanConstant + 0.1) {
      leverageEffect = 'positive'
      leverageMessage = '正のレバレッジ：借入により投資効率が向上しています'
    } else if (fcr < loanConstant - 0.1) {
      leverageEffect = 'negative'
      leverageMessage = '逆レバレッジ：借入により投資効率が低下しています'
    } else {
      leverageEffect = 'neutral'
      leverageMessage = '中立：借入の有無によるリターン差は小さい状況です'
    }
  } else {
    leverageMessage = '全額自己資金のため、レバレッジ効果は発生しません'
  }

  return {
    ccr: Math.round(ccr * 100) / 100,
    paybackPeriod: paybackPeriod !== null ? Math.round(paybackPeriod * 10) / 10 : null,
    annualBTCF: Math.round(annualBTCF * 10) / 10,
    noi: Math.round(noi * 10) / 10,
    egi: Math.round(egi * 10) / 10,
    opex: Math.round(opex * 10) / 10,
    ads: Math.round(ads * 10) / 10,
    fcr: Math.round(fcr * 100) / 100,
    loanConstant: Math.round(loanConstant * 100) / 100,
    leverageEffect,
    leverageMessage,
  }
}

/**
 * CCRの目安を返す
 * @param ccr CCR（%）
 * @returns 目安評価
 */
export function getCCREvaluation(ccr: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'negative'
  message: string
  color: string
} {
  if (ccr >= 15) {
    return {
      level: 'excellent',
      message: '高収益（地方・築古物件の水準）',
      color: 'green',
    }
  } else if (ccr >= 8) {
    return {
      level: 'good',
      message: '良好（一棟アパートの目安）',
      color: 'blue',
    }
  } else if (ccr >= 3) {
    return {
      level: 'fair',
      message: '標準（都心区分マンションの水準）',
      color: 'amber',
    }
  } else if (ccr >= 0) {
    return {
      level: 'poor',
      message: 'キャッシュフローは出るが薄い',
      color: 'orange',
    }
  } else {
    return {
      level: 'negative',
      message: 'マイナス（持ち出し発生）',
      color: 'red',
    }
  }
}

/**
 * 購入諸経費を概算
 * @param propertyPriceInMan 物件価格（万円）
 * @param rate 諸経費率（%）デフォルト7%
 * @returns 購入諸経費（万円）
 */
export function estimatePurchaseCosts(
  propertyPriceInMan: number,
  rate: number = 7
): number {
  return Math.round(propertyPriceInMan * (rate / 100))
}
