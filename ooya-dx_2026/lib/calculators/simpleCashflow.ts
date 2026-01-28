/**
 * 簡易キャッシュフロー計算ロジック
 *
 * 既存の計算モジュールを組み合わせて、最小限の入力で素早くキャッシュフローを概算計算する。
 */

import { calculateMortgageLoan } from './mortgageLoan'
import { calculateCF } from './cf'

// =================================================================
// 型定義
// =================================================================

/** 簡易キャッシュフロー計算の入力 */
export interface SimpleCashflowInput {
  /** 物件価格（万円） */
  propertyPriceInMan: number
  /** 年間家賃収入（万円） */
  annualRentInMan: number
  /** 自己資金（万円） */
  selfFundingInMan: number
  /** 借入金利（%） */
  interestRate: number
  /** 借入期間（年） */
  loanTermYears: number
  /** 空室率（%） - デフォルト 5% */
  vacancyRate?: number
  /** 経費率（%） - デフォルト 15% */
  expenseRate?: number
  /** 保有期間（年） - デフォルト 10年 */
  holdingPeriod?: number
}

/** 簡易キャッシュフロー計算結果 */
export interface SimpleCashflowResult {
  // メイン指標
  /** 表面利回り（%） */
  grossYield: number
  /** 実質利回り（%） */
  netYield: number
  /** 月間キャッシュフロー（万円） */
  monthlyCashflow: number
  /** 年間キャッシュフロー（万円） */
  annualCashflow: number

  // 内訳
  /** 借入額（万円） */
  loanAmount: number
  /** 有効総収入 EGI（万円） */
  egi: number
  /** 経費（万円） */
  expenses: number
  /** NOI 営業純収益（万円） */
  noi: number
  /** 年間返済額（万円） */
  annualDebtService: number

  // 年次推移データ（グラフ用）
  yearlyProjection: YearlyProjectionItem[]

  // 入力パラメーター
  input: {
    propertyPriceInMan: number
    annualRentInMan: number
    selfFundingInMan: number
    interestRate: number
    loanTermYears: number
    vacancyRate: number
    expenseRate: number
    holdingPeriod: number
  }
}

/** 年次推移データ */
export interface YearlyProjectionItem {
  /** 年数 */
  year: number
  /** 年間キャッシュフロー（万円） */
  annualCF: number
  /** 累計キャッシュフロー（万円） */
  cumulativeCF: number
  /** 借入残高（万円） */
  loanBalance: number
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 簡易キャッシュフローを計算
 */
export function calculateSimpleCashflow(input: SimpleCashflowInput): SimpleCashflowResult {
  const {
    propertyPriceInMan,
    annualRentInMan,
    selfFundingInMan,
    interestRate,
    loanTermYears,
    vacancyRate = 5,
    expenseRate = 15,
    holdingPeriod = 10,
  } = input

  // 1. 借入額の計算
  const loanAmount = Math.max(0, propertyPriceInMan - selfFundingInMan)

  // 2. 年間返済額の計算（借入がある場合のみ）
  let annualDebtService = 0
  if (loanAmount > 0 && loanTermYears > 0) {
    const mortgageResult = calculateMortgageLoan({
      loanAmount: loanAmount * 10000, // 円に変換
      annualRate: interestRate,
      loanTermYears,
      repaymentMethod: 'equalPrincipalAndInterest',
      annualBonusPayment: 0,
    })
    annualDebtService = Math.round(mortgageResult.annualPayment / 10000 * 100) / 100 // 万円に変換
  }

  // 3. キャッシュフローの計算
  const egi = annualRentInMan * (1 - vacancyRate / 100)
  const expenses = annualRentInMan * (expenseRate / 100)
  const noi = egi - expenses

  const cfResult = calculateCF({
    annualGPIInMan: annualRentInMan,
    vacancyRate,
    annualOpexInMan: expenses,
    annualADSInMan: annualDebtService,
  })

  // 4. 利回り計算
  const grossYield = propertyPriceInMan > 0
    ? Math.round((annualRentInMan / propertyPriceInMan) * 100 * 100) / 100
    : 0

  const netYield = propertyPriceInMan > 0
    ? Math.round((noi / propertyPriceInMan) * 100 * 100) / 100
    : 0

  // 5. 年次推移データの生成
  const yearlyProjection = generateYearlyProjection({
    loanAmount,
    interestRate,
    loanTermYears,
    annualCF: cfResult.btcf,
    holdingPeriod,
  })

  return {
    grossYield,
    netYield,
    monthlyCashflow: cfResult.monthlyBTCF,
    annualCashflow: cfResult.btcf,

    loanAmount,
    egi: Math.round(egi * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    noi: Math.round(noi * 100) / 100,
    annualDebtService,

    yearlyProjection,

    input: {
      propertyPriceInMan,
      annualRentInMan,
      selfFundingInMan,
      interestRate,
      loanTermYears,
      vacancyRate,
      expenseRate,
      holdingPeriod,
    },
  }
}

/**
 * 年次推移データを生成
 */
function generateYearlyProjection(params: {
  loanAmount: number
  interestRate: number
  loanTermYears: number
  annualCF: number
  holdingPeriod: number
}): YearlyProjectionItem[] {
  const { loanAmount, interestRate, loanTermYears, annualCF, holdingPeriod } = params
  const projection: YearlyProjectionItem[] = []

  // 月利
  const monthlyRate = interestRate / 100 / 12
  const totalPayments = loanTermYears * 12

  // 月間返済額（元利均等）
  let monthlyPayment = 0
  if (loanAmount > 0 && monthlyRate > 0 && totalPayments > 0) {
    const factor = Math.pow(1 + monthlyRate, totalPayments)
    monthlyPayment = (loanAmount * 10000) * (monthlyRate * factor) / (factor - 1)
  } else if (loanAmount > 0 && totalPayments > 0) {
    monthlyPayment = (loanAmount * 10000) / totalPayments
  }

  let currentBalance = loanAmount * 10000 // 円単位
  let cumulativeCF = 0

  for (let year = 1; year <= holdingPeriod; year++) {
    // 1年分の返済をシミュレート
    for (let month = 1; month <= 12; month++) {
      if (currentBalance > 0) {
        const interestPayment = currentBalance * monthlyRate
        const principalPayment = Math.min(monthlyPayment - interestPayment, currentBalance)
        currentBalance = Math.max(0, currentBalance - principalPayment)
      }
    }

    cumulativeCF += annualCF

    projection.push({
      year,
      annualCF: Math.round(annualCF * 100) / 100,
      cumulativeCF: Math.round(cumulativeCF * 100) / 100,
      loanBalance: Math.round(currentBalance / 10000 * 100) / 100, // 万円に変換
    })
  }

  return projection
}
