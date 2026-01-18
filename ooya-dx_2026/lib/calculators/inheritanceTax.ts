/**
 * 相続税計算ロジック
 *
 * 参考法令：
 * - 相続税法第15条（基礎控除）
 * - 相続税法第16条（税率）
 * - 相続税法第19条の2（配偶者の税額軽減）
 *
 * 注意：本計算は概算値であり、実際の税額は個別の状況により異なります。
 *       正確な税額については税理士等の専門家にご相談ください。
 */

// =================================================================
// 型定義
// =================================================================

/** 相続人の種類 */
export type HeirType =
  | 'spouse'              // 配偶者
  | 'child'               // 子
  | 'parent'              // 親（直系尊属）
  | 'sibling'             // 兄弟姉妹

/** 相続人の構成 */
export interface HeirComposition {
  /** 配偶者の有無 */
  hasSpouse: boolean
  /** 子の人数（代襲相続人含む） */
  childCount: number
  /** 養子の人数（税法上の制限適用前） */
  adoptedChildCount?: number
  /** 実子がいるか */
  hasNaturalChild?: boolean
  /** 親の人数（子がいない場合） */
  parentCount?: number
  /** 兄弟姉妹の人数（子も親もいない場合） */
  siblingCount?: number
}

/** 相続税計算の入力パラメータ */
export interface InheritanceTaxInput {
  /** 遺産総額（円） */
  totalAssets: number
  /** 債務・葬式費用（円） */
  debts: number
  /** 相続人の構成 */
  heirs: HeirComposition
  /** 生命保険金（円） */
  lifeInsurance?: number
  /** 死亡退職金（円） */
  retirementBenefit?: number
}

/** 相続人ごとの計算結果 */
export interface HeirTaxResult {
  /** 相続人の種類 */
  heirType: HeirType
  /** 法定相続分 */
  legalShare: string
  /** 法定相続分に応ずる取得金額 */
  legalShareAmount: number
  /** 算出税額（法定相続分） */
  calculatedTax: number
}

/** 相続税計算結果 */
export interface InheritanceTaxResult {
  /** 遺産総額 */
  totalAssets: number
  /** 債務・葬式費用 */
  debts: number
  /** 生命保険金の非課税枠 */
  lifeInsuranceExemption: number
  /** 死亡退職金の非課税枠 */
  retirementBenefitExemption: number
  /** 課税対象の保険金 */
  taxableInsurance: number
  /** 課税対象の退職金 */
  taxableRetirement: number
  /** 正味の遺産額 */
  netAssets: number
  /** 法定相続人の数（税法上） */
  legalHeirCount: number
  /** 基礎控除額 */
  basicDeduction: number
  /** 課税遺産総額 */
  taxableEstate: number
  /** 相続税の総額 */
  totalTax: number
  /** 各相続人の計算詳細 */
  heirDetails: HeirTaxResult[]
  /** 申告の要否 */
  requiresDeclaration: boolean
  /** 適用された税率情報 */
  appliedRates: string[]
  /** 注意事項 */
  notes: string[]
}

// =================================================================
// 税率テーブル（令和6年時点）
// =================================================================

/** 相続税の速算表 */
const INHERITANCE_TAX_TABLE = [
  { threshold: 10000000, rate: 0.10, deduction: 0, label: '10%' },
  { threshold: 30000000, rate: 0.15, deduction: 500000, label: '15%' },
  { threshold: 50000000, rate: 0.20, deduction: 2000000, label: '20%' },
  { threshold: 100000000, rate: 0.30, deduction: 7000000, label: '30%' },
  { threshold: 200000000, rate: 0.40, deduction: 17000000, label: '40%' },
  { threshold: 300000000, rate: 0.50, deduction: 42000000, label: '50%' },
  { threshold: 600000000, rate: 0.50, deduction: 42000000, label: '50%' },
  { threshold: Infinity, rate: 0.55, deduction: 72000000, label: '55%' },
]

/** 基礎控除の固定部分 */
const BASIC_DEDUCTION_BASE = 30000000 // 3,000万円

/** 基礎控除の相続人1人あたりの加算額 */
const BASIC_DEDUCTION_PER_HEIR = 6000000 // 600万円

/** 生命保険金・死亡退職金の非課税枠（1人あたり） */
const INSURANCE_EXEMPTION_PER_HEIR = 5000000 // 500万円

// =================================================================
// 計算関数
// =================================================================

/**
 * 法定相続人の数を計算（税法上の制限を適用）
 */
function calculateLegalHeirCount(heirs: HeirComposition): number {
  let count = 0

  // 配偶者は常に相続人
  if (heirs.hasSpouse) {
    count += 1
  }

  // 第1順位: 子（代襲相続人含む）
  if (heirs.childCount > 0) {
    // 養子の人数制限（税法上）
    const adoptedCount = heirs.adoptedChildCount || 0
    const naturalChildExists = heirs.hasNaturalChild ?? (heirs.childCount > adoptedCount)

    // 実子がいる場合は養子1人まで、いない場合は2人まで
    const maxAdopted = naturalChildExists ? 1 : 2
    const countableAdopted = Math.min(adoptedCount, maxAdopted)

    // 実子の数を計算
    const naturalCount = heirs.childCount - adoptedCount

    count += naturalCount + countableAdopted
    return count
  }

  // 第2順位: 直系尊属（親）
  if (heirs.parentCount && heirs.parentCount > 0) {
    count += heirs.parentCount
    return count
  }

  // 第3順位: 兄弟姉妹
  if (heirs.siblingCount && heirs.siblingCount > 0) {
    count += heirs.siblingCount
    return count
  }

  // 相続人がいない場合でも最低1として計算
  return Math.max(count, 1)
}

/**
 * 法定相続分を計算
 */
function calculateLegalShares(heirs: HeirComposition): { type: HeirType; share: number; count: number; shareLabel: string }[] {
  const shares: { type: HeirType; share: number; count: number; shareLabel: string }[] = []
  const hasSpouse = heirs.hasSpouse
  const childCount = heirs.childCount
  const parentCount = heirs.parentCount || 0
  const siblingCount = heirs.siblingCount || 0

  // 配偶者と子の場合
  if (hasSpouse && childCount > 0) {
    shares.push({ type: 'spouse', share: 0.5, count: 1, shareLabel: '1/2' })
    shares.push({ type: 'child', share: 0.5 / childCount, count: childCount, shareLabel: `1/2 × 1/${childCount}` })
    return shares
  }

  // 配偶者と親の場合
  if (hasSpouse && parentCount > 0) {
    shares.push({ type: 'spouse', share: 2/3, count: 1, shareLabel: '2/3' })
    shares.push({ type: 'parent', share: (1/3) / parentCount, count: parentCount, shareLabel: `1/3 × 1/${parentCount}` })
    return shares
  }

  // 配偶者と兄弟姉妹の場合
  if (hasSpouse && siblingCount > 0) {
    shares.push({ type: 'spouse', share: 0.75, count: 1, shareLabel: '3/4' })
    shares.push({ type: 'sibling', share: 0.25 / siblingCount, count: siblingCount, shareLabel: `1/4 × 1/${siblingCount}` })
    return shares
  }

  // 配偶者のみの場合
  if (hasSpouse) {
    shares.push({ type: 'spouse', share: 1, count: 1, shareLabel: '全部' })
    return shares
  }

  // 子のみの場合
  if (childCount > 0) {
    shares.push({ type: 'child', share: 1 / childCount, count: childCount, shareLabel: `1/${childCount}` })
    return shares
  }

  // 親のみの場合
  if (parentCount > 0) {
    shares.push({ type: 'parent', share: 1 / parentCount, count: parentCount, shareLabel: `1/${parentCount}` })
    return shares
  }

  // 兄弟姉妹のみの場合
  if (siblingCount > 0) {
    shares.push({ type: 'sibling', share: 1 / siblingCount, count: siblingCount, shareLabel: `1/${siblingCount}` })
    return shares
  }

  return shares
}

/**
 * 税額を計算（速算表を使用）
 */
function calculateTaxFromTable(amount: number): { tax: number; rate: string } {
  if (amount <= 0) {
    return { tax: 0, rate: '-' }
  }

  const bracket = INHERITANCE_TAX_TABLE.find(b => amount <= b.threshold) || INHERITANCE_TAX_TABLE[INHERITANCE_TAX_TABLE.length - 1]
  const tax = Math.floor(amount * bracket.rate - bracket.deduction)

  return {
    tax: Math.max(0, tax),
    rate: bracket.label,
  }
}

/**
 * 相続人の種類を日本語に変換
 */
function getHeirTypeLabel(type: HeirType): string {
  switch (type) {
    case 'spouse': return '配偶者'
    case 'child': return '子'
    case 'parent': return '親'
    case 'sibling': return '兄弟姉妹'
  }
}

/**
 * 相続税を計算
 *
 * @param input 計算入力パラメータ
 * @returns 計算結果（概算）
 */
export function calculateInheritanceTax(input: InheritanceTaxInput): InheritanceTaxResult {
  const {
    totalAssets,
    debts,
    heirs,
    lifeInsurance = 0,
    retirementBenefit = 0,
  } = input

  const notes: string[] = []
  const appliedRates: string[] = []

  // =================================================================
  // 1. 法定相続人の数を確定
  // =================================================================
  const legalHeirCount = calculateLegalHeirCount(heirs)

  // =================================================================
  // 2. 基礎控除額を計算
  // =================================================================
  const basicDeduction = BASIC_DEDUCTION_BASE + (BASIC_DEDUCTION_PER_HEIR * legalHeirCount)

  // =================================================================
  // 3. 生命保険金・死亡退職金の非課税枠を計算
  // =================================================================
  const insuranceExemption = INSURANCE_EXEMPTION_PER_HEIR * legalHeirCount
  const retirementExemption = INSURANCE_EXEMPTION_PER_HEIR * legalHeirCount

  const taxableInsurance = Math.max(0, lifeInsurance - insuranceExemption)
  const taxableRetirement = Math.max(0, retirementBenefit - retirementExemption)

  // =================================================================
  // 4. 正味の遺産額を計算
  // =================================================================
  const netAssets = totalAssets - debts + taxableInsurance + taxableRetirement

  // =================================================================
  // 5. 課税遺産総額を計算
  // =================================================================
  const taxableEstate = Math.max(0, netAssets - basicDeduction)

  // 基礎控除以下の場合
  if (taxableEstate <= 0) {
    return {
      totalAssets,
      debts,
      lifeInsuranceExemption: Math.min(lifeInsurance, insuranceExemption),
      retirementBenefitExemption: Math.min(retirementBenefit, retirementExemption),
      taxableInsurance,
      taxableRetirement,
      netAssets,
      legalHeirCount,
      basicDeduction,
      taxableEstate: 0,
      totalTax: 0,
      heirDetails: [],
      requiresDeclaration: false,
      appliedRates: [],
      notes,
    }
  }

  // =================================================================
  // 6. 法定相続分で按分して相続税の総額を計算
  // =================================================================
  const legalShares = calculateLegalShares(heirs)
  const heirDetails: HeirTaxResult[] = []
  let totalTax = 0

  for (const share of legalShares) {
    // 各相続人の法定相続分に応ずる取得金額
    const legalShareAmount = Math.floor(taxableEstate * share.share)

    // 税額計算
    const { tax, rate } = calculateTaxFromTable(legalShareAmount)

    // 相続人数分の税額を加算
    totalTax += tax * share.count

    if (rate !== '-') {
      appliedRates.push(`${getHeirTypeLabel(share.type)}：${rate}`)
    }

    heirDetails.push({
      heirType: share.type,
      legalShare: share.shareLabel,
      legalShareAmount,
      calculatedTax: tax,
    })
  }

  // =================================================================
  // 7. 注意事項
  // =================================================================
  notes.push('本シミュレーターは概算計算のため、実際の税額は異なる場合があります')
  notes.push('配偶者の税額軽減（最大1億6千万円）、小規模宅地等の特例などは考慮していません')
  notes.push('不動産の評価額は相続税評価額（路線価等）を使用する必要があります')
  notes.push('正確な税額については税理士等の専門家にご相談ください')

  return {
    totalAssets,
    debts,
    lifeInsuranceExemption: Math.min(lifeInsurance, insuranceExemption),
    retirementBenefitExemption: Math.min(retirementBenefit, retirementExemption),
    taxableInsurance,
    taxableRetirement,
    netAssets,
    legalHeirCount,
    basicDeduction,
    taxableEstate,
    totalTax,
    heirDetails,
    requiresDeclaration: true,
    appliedRates,
    notes,
  }
}

// =================================================================
// 早見表用データ
// =================================================================

/** 相続税早見表データ（配偶者と子2人の場合） */
export const INHERITANCE_TAX_QUICK_TABLE = [
  { assets: 50000000, tax: 100000 },       // 5,000万円 → 10万円
  { assets: 60000000, tax: 600000 },       // 6,000万円 → 60万円
  { assets: 70000000, tax: 1125000 },      // 7,000万円 → 112.5万円
  { assets: 80000000, tax: 1750000 },      // 8,000万円 → 175万円
  { assets: 100000000, tax: 3150000 },     // 1億円 → 315万円
  { assets: 150000000, tax: 9200000 },     // 1.5億円 → 920万円
  { assets: 200000000, tax: 16700000 },    // 2億円 → 1,670万円
  { assets: 300000000, tax: 34600000 },    // 3億円 → 3,460万円
  { assets: 500000000, tax: 77100000 },    // 5億円 → 7,710万円
]

/** 相続税早見表データ（子2人のみの場合） */
export const INHERITANCE_TAX_QUICK_TABLE_NO_SPOUSE = [
  { assets: 50000000, tax: 800000 },       // 5,000万円 → 80万円
  { assets: 60000000, tax: 1800000 },      // 6,000万円 → 180万円
  { assets: 70000000, tax: 3200000 },      // 7,000万円 → 320万円
  { assets: 80000000, tax: 4700000 },      // 8,000万円 → 470万円
  { assets: 100000000, tax: 7700000 },     // 1億円 → 770万円
  { assets: 150000000, tax: 18400000 },    // 1.5億円 → 1,840万円
  { assets: 200000000, tax: 33400000 },    // 2億円 → 3,340万円
  { assets: 300000000, tax: 69200000 },    // 3億円 → 6,920万円
  { assets: 500000000, tax: 154200000 },   // 5億円 → 1億5,420万円
]

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 金額を万円単位でフォーマット
 */
export function formatManYen(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toLocaleString('ja-JP')}億円`
  }
  return `${(amount / 10000).toLocaleString('ja-JP')}万円`
}

/**
 * 金額を日本語形式でフォーマット
 */
export function formatYen(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}円`
}
