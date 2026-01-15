/**
 * 不動産法人税計算ロジック
 *
 * 法人税法・地方税法に基づく計算
 * 対象：資本金1億円以下の中小法人（不動産賃貸業）
 */

// 税率定数（2025年現在）
const TAX_RATES = {
  // 法人税（国税）
  corporateTax: {
    reduced: 0.15,      // 800万円以下：15%（軽減税率）
    standard: 0.232,    // 800万円超：23.2%
    threshold: 8000000, // 800万円
  },
  // 地方法人税（国税）
  localCorporateTax: 0.103, // 10.3%
  // 法人住民税（法人税割）
  residentTax: {
    standard: 0.07,    // 標準税率：7.0%
    excess: 0.104,     // 超過税率（東京23区等）：10.4%
  },
  // 法人住民税（均等割）- 資本金1,000万円以下・従業員50人以下
  equalLevy: 70000,    // 年間7万円
  // 法人事業税（所得割）- 東京都の場合
  businessTax: {
    tier1Rate: 0.035,      // 400万円以下：3.5%
    tier1Threshold: 4000000,
    tier2Rate: 0.053,      // 400万超〜800万円以下：5.3%
    tier2Threshold: 8000000,
    tier3Rate: 0.07,       // 800万円超：7.0%
    // 超過税率
    tier1RateExcess: 0.0375,
    tier2RateExcess: 0.05665,
    tier3RateExcess: 0.0748,
  },
  // 特別法人事業税（国税）
  specialBusinessTax: 0.37, // 37%
}

// 計算結果の型定義
export interface CorporateTaxResult {
  // 各税目
  corporateTax: number          // 法人税（国税）
  localCorporateTax: number     // 地方法人税（国税）
  residentTaxPortion: number    // 法人住民税（法人税割）
  equalLevy: number             // 法人住民税（均等割）
  businessTax: number           // 法人事業税
  specialBusinessTax: number    // 特別法人事業税
  // 合計
  totalTax: number              // 税額合計
  effectiveRate: number         // 実効税率
  // 内訳情報
  breakdown: {
    corporateTaxRate: string
    residentTaxRate: string
    businessTaxRates: string
  }
}

// 個人との比較結果
export interface ComparisonResult {
  corporate: CorporateTaxResult
  individual: {
    incomeTax: number
    residentTax: number
    total: number
    effectiveRate: number
  }
  difference: number              // 差額（法人 - 個人）
  meritAmount: number            // 法人化メリット額（マイナスなら法人が有利）
}

/**
 * 法人税を計算
 * @param taxableIncome 課税所得（円）
 * @returns 法人税額
 */
function calculateCorporateTax(taxableIncome: number): { tax: number; rate: string } {
  if (taxableIncome <= 0) {
    return { tax: 0, rate: '-' }
  }

  const threshold = TAX_RATES.corporateTax.threshold

  if (taxableIncome <= threshold) {
    // 800万円以下：全額15%
    const tax = taxableIncome * TAX_RATES.corporateTax.reduced
    return { tax, rate: '15%' }
  } else {
    // 800万円超：800万円まで15%、超過分23.2%
    const taxLower = threshold * TAX_RATES.corporateTax.reduced
    const taxUpper = (taxableIncome - threshold) * TAX_RATES.corporateTax.standard
    return { tax: taxLower + taxUpper, rate: '15% / 23.2%' }
  }
}

/**
 * 法人事業税を計算（3段階税率）
 * @param taxableIncome 課税所得（円）
 * @param useExcessRate 超過税率を使用するか（東京23区等）
 * @returns 法人事業税額
 */
function calculateBusinessTax(taxableIncome: number, useExcessRate: boolean = false): { tax: number; rates: string } {
  if (taxableIncome <= 0) {
    return { tax: 0, rates: '-' }
  }

  const rates = TAX_RATES.businessTax
  const tier1Rate = useExcessRate ? rates.tier1RateExcess : rates.tier1Rate
  const tier2Rate = useExcessRate ? rates.tier2RateExcess : rates.tier2Rate
  const tier3Rate = useExcessRate ? rates.tier3RateExcess : rates.tier3Rate

  let tax = 0
  const rateLabels: string[] = []

  // 400万円以下の部分
  if (taxableIncome <= rates.tier1Threshold) {
    tax = taxableIncome * tier1Rate
    rateLabels.push(`${(tier1Rate * 100).toFixed(2)}%`)
  }
  // 400万円超〜800万円以下の部分
  else if (taxableIncome <= rates.tier2Threshold) {
    tax = rates.tier1Threshold * tier1Rate +
          (taxableIncome - rates.tier1Threshold) * tier2Rate
    rateLabels.push(`${(tier1Rate * 100).toFixed(2)}%`, `${(tier2Rate * 100).toFixed(2)}%`)
  }
  // 800万円超の部分
  else {
    tax = rates.tier1Threshold * tier1Rate +
          (rates.tier2Threshold - rates.tier1Threshold) * tier2Rate +
          (taxableIncome - rates.tier2Threshold) * tier3Rate
    rateLabels.push(`${(tier1Rate * 100).toFixed(2)}%`, `${(tier2Rate * 100).toFixed(2)}%`, `${(tier3Rate * 100).toFixed(2)}%`)
  }

  return { tax, rates: rateLabels.join(' / ') }
}

/**
 * 不動産法人税等を計算（メイン関数）
 * @param taxableIncome 課税所得（円）
 * @param options オプション
 * @returns 計算結果
 */
export function calculateCorporateTaxTotal(
  taxableIncome: number,
  options?: {
    isTokyo23?: boolean        // 東京23区か（超過税率適用）
    useExcessRate?: boolean    // 住民税の超過税率を適用するか
  }
): CorporateTaxResult {
  if (taxableIncome <= 0) {
    return {
      corporateTax: 0,
      localCorporateTax: 0,
      residentTaxPortion: 0,
      equalLevy: TAX_RATES.equalLevy,  // 均等割は赤字でも発生
      businessTax: 0,
      specialBusinessTax: 0,
      totalTax: TAX_RATES.equalLevy,
      effectiveRate: 0,
      breakdown: {
        corporateTaxRate: '-',
        residentTaxRate: '-',
        businessTaxRates: '-',
      },
    }
  }

  const isTokyo23 = options?.isTokyo23 ?? false
  const useExcessRate = options?.useExcessRate ?? false

  // 1. 法人税（国税）
  const { tax: corporateTax, rate: corporateTaxRate } = calculateCorporateTax(taxableIncome)

  // 2. 地方法人税（国税）- 法人税額ベース
  const localCorporateTax = corporateTax * TAX_RATES.localCorporateTax

  // 3. 法人住民税（法人税割）- 法人税額ベース
  const residentTaxRate = useExcessRate
    ? TAX_RATES.residentTax.excess
    : TAX_RATES.residentTax.standard
  const residentTaxPortion = corporateTax * residentTaxRate

  // 4. 法人住民税（均等割）- 固定
  const equalLevy = TAX_RATES.equalLevy

  // 5. 法人事業税 - 所得ベース
  const { tax: businessTax, rates: businessTaxRates } = calculateBusinessTax(taxableIncome, isTokyo23)

  // 6. 特別法人事業税 - 事業税額ベース
  const specialBusinessTax = businessTax * TAX_RATES.specialBusinessTax

  // 合計
  const totalTax = Math.floor(
    corporateTax + localCorporateTax + residentTaxPortion + equalLevy + businessTax + specialBusinessTax
  )

  // 実効税率
  const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0

  return {
    corporateTax: Math.floor(corporateTax),
    localCorporateTax: Math.floor(localCorporateTax),
    residentTaxPortion: Math.floor(residentTaxPortion),
    equalLevy,
    businessTax: Math.floor(businessTax),
    specialBusinessTax: Math.floor(specialBusinessTax),
    totalTax,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    breakdown: {
      corporateTaxRate,
      residentTaxRate: `${(residentTaxRate * 100).toFixed(1)}%`,
      businessTaxRates,
    },
  }
}

/**
 * 個人の所得税・住民税を計算（比較用）
 * @param income 所得金額（円）
 * @returns 税額
 */
function calculateIndividualTax(income: number): { incomeTax: number; residentTax: number; total: number; effectiveRate: number } {
  if (income <= 0) {
    return { incomeTax: 0, residentTax: 0, total: 0, effectiveRate: 0 }
  }

  // 所得税の税率テーブル（2025年現在）
  const incomeTaxBrackets = [
    { limit: 1950000, rate: 0.05, deduction: 0 },
    { limit: 3300000, rate: 0.10, deduction: 97500 },
    { limit: 6950000, rate: 0.20, deduction: 427500 },
    { limit: 9000000, rate: 0.23, deduction: 636000 },
    { limit: 18000000, rate: 0.33, deduction: 1536000 },
    { limit: 40000000, rate: 0.40, deduction: 2796000 },
    { limit: Infinity, rate: 0.45, deduction: 4796000 },
  ]

  // 所得税の計算
  let incomeTax = 0
  for (const bracket of incomeTaxBrackets) {
    if (income <= bracket.limit) {
      incomeTax = income * bracket.rate - bracket.deduction
      break
    }
  }

  // 復興特別所得税（2.1%）
  incomeTax = incomeTax * 1.021

  // 住民税（一律10%）
  const residentTax = income * 0.10

  const total = Math.floor(incomeTax + residentTax)
  const effectiveRate = (total / income) * 100

  return {
    incomeTax: Math.floor(incomeTax),
    residentTax: Math.floor(residentTax),
    total,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  }
}

/**
 * 法人と個人の税額を比較
 * @param taxableIncome 課税所得（円）
 * @param options オプション
 * @returns 比較結果
 */
export function compareCorporateVsIndividual(
  taxableIncome: number,
  options?: {
    isTokyo23?: boolean
    useExcessRate?: boolean
  }
): ComparisonResult {
  const corporate = calculateCorporateTaxTotal(taxableIncome, options)
  const individual = calculateIndividualTax(taxableIncome)

  return {
    corporate,
    individual,
    difference: corporate.totalTax - individual.total,
    meritAmount: individual.total - corporate.totalTax,  // 正なら法人が有利
  }
}

/**
 * 法人化の損益分岐点を計算（概算）
 * @returns 損益分岐点の課税所得
 */
export function calculateBreakEvenPoint(): number {
  // 一般的に課税所得900万円〜1,000万円が分岐点とされる
  // 社会保険料を考慮すると1,000万円〜1,200万円
  return 9000000
}

/**
 * 早見表データを生成
 */
export function generateQuickReference(): Array<{
  income: string
  corporateTax: string
  effectiveRate: string
}> {
  const incomeList = [4000000, 6000000, 8000000, 10000000, 15000000, 20000000, 30000000, 50000000]

  return incomeList.map(income => {
    const result = calculateCorporateTaxTotal(income)
    return {
      income: `${(income / 10000).toLocaleString('ja-JP')}万円`,
      corporateTax: `約${Math.round(result.totalTax / 10000).toLocaleString('ja-JP')}万円`,
      effectiveRate: `約${result.effectiveRate.toFixed(1)}%`,
    }
  })
}
