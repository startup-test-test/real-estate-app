/**
 * 収益還元法（直接還元法）計算ロジック
 *
 * 参考資料：
 * - 国土交通省「不動産鑑定評価基準」
 * - 日本不動産研究所「不動産の賃貸経営者調査」
 *
 * 計算式: P = NOI / R
 * - P: 収益価格
 * - NOI: 純営業収益（Net Operating Income）
 * - R: 還元利回り（Cap Rate）
 *
 * 注意：本計算は概算値であり、実際の不動産評価額は個別の状況により異なります。
 *       正確な評価については不動産鑑定士等の専門家にご相談ください。
 */

// =================================================================
// 型定義
// =================================================================

/** 収益還元法計算の入力パラメータ */
export interface IncomeCapitalizationInput {
  /** 年間賃料収入（満室想定・円） */
  annualRentIncome: number
  /** 空室率（%） */
  vacancyRate: number
  /** 運営費率（%）- 簡易計算用 */
  operatingExpenseRate: number
  /** 還元利回り（%） */
  capRate: number
}

/** 収益還元法計算結果 */
export interface IncomeCapitalizationResult {
  /** 年間賃料収入（満室想定） */
  annualRentIncome: number
  /** 空室損失 */
  vacancyLoss: number
  /** 実効総収入（EGI） */
  effectiveGrossIncome: number
  /** 運営費用（OPEX） */
  operatingExpenses: number
  /** 純営業収益（NOI） */
  netOperatingIncome: number
  /** 還元利回り */
  capRate: number
  /** 収益価格（評価額） */
  propertyValue: number
  /** NOI利回り（実質利回り） */
  noiYield: number
  /** 表面利回り */
  grossYield: number
}

// =================================================================
// 定数
// =================================================================

/** エリア別キャップレート目安（参考値） */
export const CAP_RATE_REFERENCE: {
  area: string
  rcNew: string
  rcOld: string
  wood: string
}[] = [
  { area: '東京・都心5区', rcNew: '3.5〜4.0%', rcOld: '4.2〜4.8%', wood: '4.5〜5.5%' },
  { area: '東京・城南/城西', rcNew: '3.8〜4.2%', rcOld: '4.5〜5.0%', wood: '5.0〜6.0%' },
  { area: '大阪・名古屋', rcNew: '4.2〜4.8%', rcOld: '5.0〜5.8%', wood: '6.0〜7.0%' },
  { area: '地方中核都市', rcNew: '4.8〜5.5%', rcOld: '6.0〜7.0%', wood: '7.5〜9.0%' },
]

/** 運営費率目安（参考値） */
export const OPERATING_EXPENSE_REFERENCE = {
  low: { rate: 15, label: '低め（15%）', description: '新築・良好な管理状態' },
  standard: { rate: 20, label: '標準（20%）', description: '一般的な賃貸物件' },
  high: { rate: 25, label: '高め（25%）', description: '築古・EV有り・積極管理' },
  veryHigh: { rate: 30, label: '要注意（30%）', description: '大規模修繕期・高空室率' },
}

/** 空室率目安（参考値） */
export const VACANCY_RATE_REFERENCE = {
  urban: { rate: 3, label: '都心・駅近（3%）' },
  suburban: { rate: 5, label: '郊外・ファミリー（5%）' },
  regional: { rate: 8, label: '地方・築古（8%）' },
  risk: { rate: 10, label: 'リスク高め（10%）' },
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 収益還元法（直接還元法）による物件評価額を計算
 */
export function calculateIncomeCapitalization(
  input: IncomeCapitalizationInput
): IncomeCapitalizationResult {
  const {
    annualRentIncome,
    vacancyRate,
    operatingExpenseRate,
    capRate,
  } = input

  // =================================================================
  // 1. 空室損失の計算
  // =================================================================
  const vacancyLoss = Math.round(annualRentIncome * (vacancyRate / 100))

  // =================================================================
  // 2. 実効総収入（EGI: Effective Gross Income）の計算
  // =================================================================
  const effectiveGrossIncome = annualRentIncome - vacancyLoss

  // =================================================================
  // 3. 運営費用（OPEX）の計算
  // =================================================================
  // 運営費率をEGIに対して適用（一般的な計算方法）
  const operatingExpenses = Math.round(effectiveGrossIncome * (operatingExpenseRate / 100))

  // =================================================================
  // 4. 純営業収益（NOI: Net Operating Income）の計算
  // =================================================================
  const netOperatingIncome = effectiveGrossIncome - operatingExpenses

  // =================================================================
  // 5. 収益価格（Property Value）の計算
  // =================================================================
  // P = NOI / R（直接還元法の基本式）
  const propertyValue = capRate > 0 ? Math.round(netOperatingIncome / (capRate / 100)) : 0

  // =================================================================
  // 6. 利回り指標の計算
  // =================================================================
  // NOI利回り（実質利回り）
  const noiYield = propertyValue > 0 ? (netOperatingIncome / propertyValue) * 100 : 0

  // 表面利回り（グロス利回り）
  const grossYield = propertyValue > 0 ? (annualRentIncome / propertyValue) * 100 : 0

  return {
    annualRentIncome,
    vacancyLoss,
    effectiveGrossIncome,
    operatingExpenses,
    netOperatingIncome,
    capRate,
    propertyValue,
    noiYield,
    grossYield,
  }
}

/**
 * 逆算：目標収益価格から必要なNOIを計算
 */
export function calculateRequiredNOI(
  targetPropertyValue: number,
  capRate: number
): number {
  return Math.round(targetPropertyValue * (capRate / 100))
}

/**
 * 逆算：目標収益価格から必要な年間賃料を計算
 */
export function calculateRequiredRent(
  targetPropertyValue: number,
  capRate: number,
  vacancyRate: number,
  operatingExpenseRate: number
): number {
  const requiredNOI = calculateRequiredNOI(targetPropertyValue, capRate)
  // NOI = EGI × (1 - OPEX率)
  // EGI = GPI × (1 - 空室率)
  // したがって: NOI = GPI × (1 - 空室率) × (1 - OPEX率)
  // GPI = NOI / ((1 - 空室率) × (1 - OPEX率))
  const vacancyFactor = 1 - vacancyRate / 100
  const opexFactor = 1 - operatingExpenseRate / 100
  return Math.round(requiredNOI / (vacancyFactor * opexFactor))
}

// =================================================================
// 早見表データ生成
// =================================================================

export interface QuickReferenceItem {
  annualRent: number
  capRate: number
  propertyValue: number
  noi: number
}

/**
 * 早見表データを生成
 * 空室率5%、運営費率20%として計算
 */
export function generateQuickReference(): QuickReferenceItem[] {
  const rentAmounts = [600, 1000, 1200, 1500, 2000] // 万円
  const capRates = [4.0, 5.0, 6.0, 7.0, 8.0] // %

  const items: QuickReferenceItem[] = []

  for (const rent of rentAmounts) {
    for (const cap of capRates) {
      const result = calculateIncomeCapitalization({
        annualRentIncome: rent * 10000,
        vacancyRate: 5,
        operatingExpenseRate: 20,
        capRate: cap,
      })
      items.push({
        annualRent: rent,
        capRate: cap,
        propertyValue: Math.round(result.propertyValue / 10000), // 万円
        noi: Math.round(result.netOperatingIncome / 10000), // 万円
      })
    }
  }

  return items
}

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 金額を万円単位でフォーマット
 */
export function formatManYen(amount: number): string {
  if (amount >= 100000000) {
    return `約${(amount / 100000000).toLocaleString('ja-JP', { maximumFractionDigits: 2 })}億円`
  }
  if (amount >= 10000) {
    return `約${Math.round(amount / 10000).toLocaleString('ja-JP')}万円`
  }
  return `${amount.toLocaleString('ja-JP')}円`
}

/**
 * 金額を億万円表記でフォーマット（例: 1億2000万円）
 */
export function formatOkuManYen(amountInYen: number): string {
  const amountInMan = amountInYen / 10000
  if (amountInMan >= 10000) {
    const oku = Math.floor(amountInMan / 10000)
    const man = Math.round(amountInMan % 10000)
    if (man === 0) {
      return `約${oku}億円`
    }
    return `約${oku}億${man.toLocaleString()}万円`
  }
  return `約${Math.round(amountInMan).toLocaleString()}万円`
}

/**
 * パーセントをフォーマット
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}
