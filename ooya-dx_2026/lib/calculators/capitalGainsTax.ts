/**
 * 譲渡所得税計算ロジック（不動産売却時）
 *
 * 参考法令：
 * - 所得税法第33条（譲渡所得）
 * - 租税特別措置法第31条（長期譲渡所得の課税の特例）
 * - 租税特別措置法第35条（居住用財産の譲渡所得の特別控除）
 *
 * 注意：本計算は概算値であり、実際の税額は個別の状況により異なります。
 *       正確な税額については税理士等の専門家にご相談ください。
 */

// =================================================================
// 型定義
// =================================================================

/** 所有期間区分 */
export type OwnershipPeriod = 'short' | 'long' | 'over10years'

/** 譲渡所得税計算の入力パラメータ */
export interface CapitalGainsTaxInput {
  /** 売却価格（円） */
  salePrice: number
  /** 取得費（円） - 0の場合は概算法（5%）を適用 */
  acquisitionCost: number
  /** 譲渡費用（円） */
  transferExpenses: number
  /** 所有期間（年数） */
  ownershipYears: number
  /** 居住用財産（マイホーム）か */
  isResidential: boolean
}

/** 譲渡所得税計算結果 */
export interface CapitalGainsTaxResult {
  /** 譲渡価額 */
  salePrice: number
  /** 取得費 */
  acquisitionCost: number
  /** 概算法を使用したか */
  usedEstimatedCost: boolean
  /** 譲渡費用 */
  transferExpenses: number
  /** 譲渡所得（売却益） */
  capitalGain: number
  /** 特別控除額 */
  specialDeduction: number
  /** 課税譲渡所得 */
  taxableIncome: number
  /** 所有期間区分 */
  ownershipPeriod: OwnershipPeriod
  /** 所得税額 */
  incomeTax: number
  /** 復興特別所得税額 */
  reconstructionTax: number
  /** 住民税額 */
  residentTax: number
  /** 合計税額 */
  totalTax: number
  /** 適用税率（表示用） */
  appliedRateLabel: string
  /** 注意事項 */
  notes: string[]
}

// =================================================================
// 税率定数
// =================================================================

/** 短期譲渡所得（5年以下）の税率 */
const SHORT_TERM_RATES = {
  incomeTax: 0.30,           // 所得税 30%
  reconstructionTax: 0.0063, // 復興特別所得税 0.63% (30% × 2.1%)
  residentTax: 0.09,         // 住民税 9%
  total: 0.3963,             // 合計 39.63%
}

/** 長期譲渡所得（5年超）の税率 */
const LONG_TERM_RATES = {
  incomeTax: 0.15,            // 所得税 15%
  reconstructionTax: 0.00315, // 復興特別所得税 0.315% (15% × 2.1%)
  residentTax: 0.05,          // 住民税 5%
  total: 0.20315,             // 合計 20.315%
}

/** 10年超軽減税率（6,000万円以下部分） */
const REDUCED_RATES_LOW = {
  incomeTax: 0.10,           // 所得税 10%
  reconstructionTax: 0.0021, // 復興特別所得税 0.21% (10% × 2.1%)
  residentTax: 0.04,         // 住民税 4%
  total: 0.1421,             // 合計 14.21%
}

/** 10年超軽減税率（6,000万円超部分） */
const REDUCED_RATES_HIGH = LONG_TERM_RATES // 20.315%

/** 6,000万円の境界（10年超軽減税率） */
const REDUCED_RATE_THRESHOLD = 60000000 // 6,000万円

/** 居住用財産の特別控除額 */
const RESIDENTIAL_DEDUCTION = 30000000 // 3,000万円

// =================================================================
// 計算関数
// =================================================================

/**
 * 所有期間を判定
 */
function determineOwnershipPeriod(years: number, isResidential: boolean): OwnershipPeriod {
  if (years > 10 && isResidential) return 'over10years'
  if (years > 5) return 'long'
  return 'short'
}

/**
 * 譲渡所得税を計算
 */
export function calculateCapitalGainsTax(input: CapitalGainsTaxInput): CapitalGainsTaxResult {
  const {
    salePrice,
    acquisitionCost,
    transferExpenses,
    ownershipYears,
    isResidential,
  } = input

  // =================================================================
  // 1. 取得費の決定（実額 or 概算5%）
  // =================================================================
  let effectiveAcquisitionCost = acquisitionCost
  let usedEstimatedCost = false

  const estimatedCost = Math.floor(salePrice * 0.05)

  if (acquisitionCost <= 0 || acquisitionCost < estimatedCost) {
    // 概算法の方が有利な場合、または取得費不明の場合
    effectiveAcquisitionCost = estimatedCost
    usedEstimatedCost = true
  }

  // =================================================================
  // 2. 譲渡所得（売却益）の算出
  // =================================================================
  const capitalGain = salePrice - effectiveAcquisitionCost - transferExpenses

  // =================================================================
  // 3. 特別控除の適用
  // =================================================================
  let specialDeduction = 0
  if (isResidential && capitalGain > 0) {
    specialDeduction = Math.min(capitalGain, RESIDENTIAL_DEDUCTION)
  }

  // =================================================================
  // 4. 課税譲渡所得の算出
  // =================================================================
  const taxableIncome = Math.max(0, capitalGain - specialDeduction)

  // =================================================================
  // 5. 所有期間の判定
  // =================================================================
  const ownershipPeriod = determineOwnershipPeriod(ownershipYears, isResidential)

  // =================================================================
  // 6. 税額の計算
  // =================================================================
  let incomeTax = 0
  let reconstructionTax = 0
  let residentTax = 0
  let appliedRateLabel = ''

  if (taxableIncome <= 0) {
    appliedRateLabel = '-'
  } else if (ownershipPeriod === 'short') {
    // 短期譲渡所得
    incomeTax = Math.floor(taxableIncome * SHORT_TERM_RATES.incomeTax)
    reconstructionTax = Math.floor(taxableIncome * SHORT_TERM_RATES.reconstructionTax)
    residentTax = Math.floor(taxableIncome * SHORT_TERM_RATES.residentTax)
    appliedRateLabel = '短期（約39.63%）'
  } else if (ownershipPeriod === 'over10years') {
    // 10年超軽減税率（2段階）
    if (taxableIncome <= REDUCED_RATE_THRESHOLD) {
      // 全額が6,000万円以下
      incomeTax = Math.floor(taxableIncome * REDUCED_RATES_LOW.incomeTax)
      reconstructionTax = Math.floor(taxableIncome * REDUCED_RATES_LOW.reconstructionTax)
      residentTax = Math.floor(taxableIncome * REDUCED_RATES_LOW.residentTax)
      appliedRateLabel = '10年超軽減（約14.21%）'
    } else {
      // 6,000万円以下部分と超過部分で分割計算
      const lowPortion = REDUCED_RATE_THRESHOLD
      const highPortion = taxableIncome - REDUCED_RATE_THRESHOLD

      incomeTax = Math.floor(
        lowPortion * REDUCED_RATES_LOW.incomeTax +
        highPortion * REDUCED_RATES_HIGH.incomeTax
      )
      reconstructionTax = Math.floor(
        lowPortion * REDUCED_RATES_LOW.reconstructionTax +
        highPortion * REDUCED_RATES_HIGH.reconstructionTax
      )
      residentTax = Math.floor(
        lowPortion * REDUCED_RATES_LOW.residentTax +
        highPortion * REDUCED_RATES_HIGH.residentTax
      )
      appliedRateLabel = '10年超軽減（約14.21%/約20.315%）'
    }
  } else {
    // 長期譲渡所得
    incomeTax = Math.floor(taxableIncome * LONG_TERM_RATES.incomeTax)
    reconstructionTax = Math.floor(taxableIncome * LONG_TERM_RATES.reconstructionTax)
    residentTax = Math.floor(taxableIncome * LONG_TERM_RATES.residentTax)
    appliedRateLabel = '長期（約20.315%）'
  }

  const totalTax = incomeTax + reconstructionTax + residentTax

  return {
    salePrice,
    acquisitionCost: effectiveAcquisitionCost,
    usedEstimatedCost,
    transferExpenses,
    capitalGain,
    specialDeduction,
    taxableIncome,
    ownershipPeriod,
    incomeTax,
    reconstructionTax,
    residentTax,
    totalTax,
    appliedRateLabel,
    notes: [],
  }
}

// =================================================================
// 早見表データ生成
// =================================================================

/** 早見表用データ（3,000万円控除適用・長期譲渡・取得費は売却額の5%概算法） */
export const QUICK_REFERENCE_TABLE = [
  { salePrice: 40000000, taxAmount: 1625200 },    // 4,000万円 → 約163万円（課税800万）
  { salePrice: 50000000, taxAmount: 3555125 },    // 5,000万円 → 約356万円（課税1,750万）
  { salePrice: 60000000, taxAmount: 5485050 },    // 6,000万円 → 約549万円（課税2,700万）
  { salePrice: 70000000, taxAmount: 7414975 },    // 7,000万円 → 約742万円（課税3,650万）
  { salePrice: 80000000, taxAmount: 9344900 },    // 8,000万円 → 約935万円（課税4,600万）
  { salePrice: 100000000, taxAmount: 13204750 },  // 1億円 → 約1,321万円（課税6,500万）
]

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 金額を万円単位でフォーマット
 */
export function formatManYen(amount: number): string {
  return `${(amount / 10000).toLocaleString('ja-JP')}万円`
}
