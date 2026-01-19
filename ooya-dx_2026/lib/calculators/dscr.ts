/**
 * DSCR（債務返済カバー率）計算ロジック
 *
 * DSCR = NOI / ADS
 *
 * NOI: 純営業収益（Net Operating Income）
 * ADS: 年間元利返済額（Annual Debt Service）
 *
 * DSCR基準（目安）:
 * - 1.0未満: キャッシュフロー赤字（融資不可）
 * - 1.0〜1.2: 危険水域
 * - 1.2〜1.3: 一般的な合格ライン（地銀・信金）
 * - 1.3以上: 優良（都市銀行基準）
 *
 * 参考:
 * - 不動産証券化協会（ARES）
 * - 金融機関の融資審査基準
 */

export interface DSCRInput {
  /** 年間想定賃料収入（満室）万円 - GPI */
  annualRentInMan: number
  /** 想定空室率（%）- ユーザー入力 */
  vacancyRate: number
  /** 運営経費率（%）- GPIに対する割合 */
  expenseRate: number
  /** 借入金額（万円） */
  loanAmountInMan: number
  /** 借入金利（%）- 実行金利 */
  interestRate: number
  /** 借入期間（年） */
  loanTermYears: number
  /** 審査金利（%）- ストレステスト用、省略時は実行金利を使用 */
  stressInterestRate?: number
  /** 審査用空室率（%）- ストレステスト用、省略時は想定空室率を使用 */
  stressVacancyRate?: number
}

export interface DSCRResult {
  /** NOI（純営業収益）万円 */
  noi: number
  /** ADS（年間元利返済額）万円 */
  ads: number
  /** DSCR（実行金利ベース） */
  dscr: number
  /** 年間キャッシュフロー（税引前）万円 */
  annualCashFlow: number
  /** ストレステスト結果（審査金利ベース） */
  stressTest: {
    /** ストレスNOI（万円） */
    noi: number
    /** ストレスADS（万円） */
    ads: number
    /** ストレスDSCR */
    dscr: number
    /** ストレス時キャッシュフロー（万円） */
    cashFlow: number
  }
  /** 評価 */
  evaluation: {
    level: 'excellent' | 'good' | 'caution' | 'danger' | 'critical'
    label: string
    description: string
  }
  /** 銀行評価 */
  bankEvaluation: {
    level: 'excellent' | 'good' | 'caution' | 'danger' | 'critical'
    label: string
    description: string
  }
  /** 月額返済額（万円） */
  monthlyPayment: number
  /** 借入可能上限額（万円）- DSCRを1.2とした場合 */
  maxLoanAmount: number
  /** 入力パラメーター */
  input: DSCRInput
}

/**
 * PMT関数（元利均等返済の年間返済額を計算）
 */
function calculateADS(
  loanAmount: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12
  const totalPayments = termYears * 12

  if (monthlyRate === 0) {
    return loanAmount / termYears
  }

  const factor = Math.pow(1 + monthlyRate, totalPayments)
  const monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1)
  return monthlyPayment * 12
}

/**
 * NOIを計算
 */
function calculateNOI(
  annualRent: number,
  vacancyRate: number,
  expenseRate: number
): number {
  // EGI = GPI × (1 - 空室率)
  const egi = annualRent * (1 - vacancyRate / 100)
  // NOI = EGI - 運営経費
  const expenses = annualRent * (expenseRate / 100)
  return egi - expenses
}

/**
 * DSCRを評価
 */
function evaluateDSCR(dscr: number): DSCRResult['evaluation'] {
  if (dscr >= 1.5) {
    return {
      level: 'excellent',
      label: '非常に良好',
      description: '十分な返済余力があり、金利上昇にも耐えられる水準とされています',
    }
  }
  if (dscr >= 1.3) {
    return {
      level: 'good',
      label: '良好',
      description: '都市銀行・メガバンクの一般的な融資基準を満たす水準とされています',
    }
  }
  if (dscr >= 1.2) {
    return {
      level: 'caution',
      label: '標準',
      description: '地方銀行・信用金庫の一般的な融資基準とされています',
    }
  }
  if (dscr >= 1.0) {
    return {
      level: 'danger',
      label: '要注意',
      description: '返済余力が少なく、空室や金利上昇で赤字になる可能性があるとされています',
    }
  }
  return {
    level: 'critical',
    label: '危険',
    description: 'キャッシュフローが赤字の状態です。融資審査は困難とされています',
  }
}

/**
 * 借入可能上限額を逆算（目標DSCRから）
 */
function calculateMaxLoanAmount(
  noi: number,
  targetDSCR: number,
  annualRate: number,
  termYears: number
): number {
  // 必要ADS = NOI / 目標DSCR
  const requiredADS = noi / targetDSCR

  // 年賦償還率（K）を計算
  const monthlyRate = annualRate / 100 / 12
  const totalPayments = termYears * 12

  if (monthlyRate === 0) {
    return requiredADS * termYears
  }

  const factor = Math.pow(1 + monthlyRate, totalPayments)
  const k = (monthlyRate * factor) / (factor - 1) * 12

  // 借入可能額 = 必要ADS / K
  return requiredADS / k
}

/**
 * DSCRを計算
 */
export function calculateDSCR(input: DSCRInput): DSCRResult {
  const {
    annualRentInMan,
    vacancyRate,
    expenseRate,
    loanAmountInMan,
    interestRate,
    loanTermYears,
    stressInterestRate,
    stressVacancyRate,
  } = input

  // 実行金利ベースの計算
  const noi = calculateNOI(annualRentInMan, vacancyRate, expenseRate)
  const ads = calculateADS(loanAmountInMan, interestRate, loanTermYears)
  const dscr = ads > 0 ? noi / ads : 0
  const annualCashFlow = noi - ads
  const monthlyPayment = ads / 12

  // ストレステスト（審査金利・審査空室率ベース）
  const stressRate = stressInterestRate ?? interestRate
  const stressVacancy = stressVacancyRate ?? vacancyRate
  const stressNoi = calculateNOI(annualRentInMan, stressVacancy, expenseRate)
  const stressAds = calculateADS(loanAmountInMan, stressRate, loanTermYears)
  const stressDscr = stressAds > 0 ? stressNoi / stressAds : 0
  const stressCashFlow = stressNoi - stressAds

  // 評価
  const evaluation = evaluateDSCR(dscr)
  const bankEvaluation = evaluateDSCR(stressDscr)

  // 借入可能上限額（DSCR 1.2を目標）
  const maxLoanAmount = calculateMaxLoanAmount(noi, 1.2, stressRate, loanTermYears)

  return {
    noi: Math.round(noi * 100) / 100,
    ads: Math.round(ads * 100) / 100,
    dscr: Math.round(dscr * 100) / 100,
    annualCashFlow: Math.round(annualCashFlow * 100) / 100,
    stressTest: {
      noi: Math.round(stressNoi * 100) / 100,
      ads: Math.round(stressAds * 100) / 100,
      dscr: Math.round(stressDscr * 100) / 100,
      cashFlow: Math.round(stressCashFlow * 100) / 100,
    },
    evaluation,
    bankEvaluation,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    maxLoanAmount: Math.round(maxLoanAmount),
    input,
  }
}

/**
 * DSCR目安基準（金融機関別）
 */
export function getDSCRBenchmarks(): Array<{
  category: string
  dscrMin: number
  description: string
}> {
  return [
    { category: '都市銀行（メガバンク）', dscrMin: 1.3, description: '最も厳格。物件単体の収益力で評価' },
    { category: '地方銀行', dscrMin: 1.2, description: '積算評価も重視。担保余力があれば柔軟' },
    { category: '信用金庫・信用組合', dscrMin: 1.1, description: '審査は柔軟。融資期間は短め' },
    { category: 'ノンバンク', dscrMin: 1.0, description: '金利は高いが、審査基準は緩め' },
  ]
}

/**
 * 物件タイプ別DSCR目安
 */
export function getDSCRByPropertyType(): Array<{
  propertyType: string
  dscrMin: number
  reason: string
}> {
  return [
    { propertyType: 'レジデンス（住居系）', dscrMin: 1.2, reason: '景気変動に強く、リスクが低い' },
    { propertyType: 'オフィス・商業施設', dscrMin: 1.4, reason: 'テナント退去リスクが高い' },
    { propertyType: 'ホテル・宿泊施設', dscrMin: 1.5, reason: '売上変動が大きく、外部要因に脆弱' },
  ]
}
