/**
 * 印紙税計算ロジック
 *
 * 参考法令：
 * - 印紙税法（昭和42年法律第23号）
 * - 租税特別措置法第91条（軽減措置）
 *
 * 軽減措置適用期間：2014年4月1日〜2027年3月31日
 *
 * 注意：本計算は概算値であり、実際の税額は個別の状況により異なります。
 *       正確な税額については税務署等にご確認ください。
 */

// =================================================================
// 型定義
// =================================================================

/** 契約の種類 */
export type ContractType =
  | 'real_estate_sale'      // 第1号文書：不動産売買契約書
  | 'construction_work'     // 第2号文書：建設工事請負契約書
  | 'receipt'               // 第17号文書：領収書

/** 契約形態 */
export type ContractFormat =
  | 'paper'                 // 書面契約
  | 'electronic'            // 電子契約

/** 売主の属性（領収書用） */
export type SellerType =
  | 'corporation'           // 法人
  | 'individual_home'       // 個人（マイホーム）→ 非課税
  | 'individual_business'   // 個人（事業用）

/** 印紙税計算の入力パラメータ */
export interface StampTaxInput {
  /** 契約の種類 */
  contractType: ContractType
  /** 契約金額（円） */
  contractAmount: number
  /** 契約形態（書面/電子） */
  contractFormat: ContractFormat
  /** 契約日（軽減措置判定用） */
  contractDate?: Date
  /** 消費税が区分記載されているか */
  isTaxExcluded: boolean
  /** 売主の属性（領収書の場合のみ） */
  sellerType?: SellerType
}

/** 印紙税計算結果 */
export interface StampTaxResult {
  /** 契約金額 */
  contractAmount: number
  /** 契約の種類（表示用） */
  contractTypeName: string
  /** 印紙税額 */
  stampTaxAmount: number
  /** 本則税額（軽減前） */
  standardTaxAmount: number
  /** 軽減額 */
  reductionAmount: number
  /** 軽減措置が適用されたか */
  isReduced: boolean
  /** 電子契約で非課税か */
  isElectronicExempt: boolean
  /** 営業に関しない受取書で非課税か */
  isNonBusinessExempt: boolean
  /** 注意事項 */
  notes: string[]
}

// =================================================================
// 税率テーブル（令和9年3月31日までの軽減措置対応）
// =================================================================

/** 第1号文書：不動産売買契約書の税額テーブル */
const REAL_ESTATE_SALE_TAX_TABLE = [
  { min: 0,              max: 10000,           standard: 0,      reduced: 0 },          // 非課税
  { min: 10000,          max: 100000,          standard: 200,    reduced: 200 },        // 軽減対象外
  { min: 100000,         max: 500000,          standard: 400,    reduced: 200 },        // 軽減適用開始
  { min: 500000,         max: 1000000,         standard: 1000,   reduced: 500 },
  { min: 1000000,        max: 5000000,         standard: 2000,   reduced: 1000 },
  { min: 5000000,        max: 10000000,        standard: 10000,  reduced: 5000 },
  { min: 10000000,       max: 50000000,        standard: 20000,  reduced: 10000 },      // 住宅売買の主要ゾーン
  { min: 50000000,       max: 100000000,       standard: 60000,  reduced: 30000 },
  { min: 100000000,      max: 500000000,       standard: 100000, reduced: 60000 },
  { min: 500000000,      max: 1000000000,      standard: 200000, reduced: 160000 },
  { min: 1000000000,     max: 5000000000,      standard: 400000, reduced: 320000 },
  { min: 5000000000,     max: Infinity,        standard: 600000, reduced: 480000 },     // 上限
]

/** 第2号文書：建設工事請負契約書の税額テーブル */
const CONSTRUCTION_WORK_TAX_TABLE = [
  { min: 0,              max: 10000,           standard: 0,      reduced: 0 },          // 非課税
  { min: 10000,          max: 1000000,         standard: 200,    reduced: 200 },        // 軽減対象外（売買との違い）
  { min: 1000000,        max: 2000000,         standard: 400,    reduced: 200 },        // 軽減適用開始
  { min: 2000000,        max: 3000000,         standard: 1000,   reduced: 500 },
  { min: 3000000,        max: 5000000,         standard: 2000,   reduced: 1000 },
  { min: 5000000,        max: 10000000,        standard: 10000,  reduced: 5000 },
  { min: 10000000,       max: 50000000,        standard: 20000,  reduced: 10000 },      // 注文住宅のボリュームゾーン
  { min: 50000000,       max: 100000000,       standard: 60000,  reduced: 30000 },
  { min: 100000000,      max: 500000000,       standard: 100000, reduced: 60000 },
  { min: 500000000,      max: 1000000000,      standard: 200000, reduced: 160000 },
  { min: 1000000000,     max: 5000000000,      standard: 400000, reduced: 320000 },
  { min: 5000000000,     max: Infinity,        standard: 600000, reduced: 480000 },
]

/** 第17号文書：領収書の税額テーブル */
const RECEIPT_TAX_TABLE = [
  { min: 0,              max: 50000,           standard: 0,      reduced: 0 },          // 非課税
  { min: 50000,          max: 1000000,         standard: 200,    reduced: 200 },
  { min: 1000000,        max: 2000000,         standard: 400,    reduced: 400 },
  { min: 2000000,        max: 3000000,         standard: 600,    reduced: 600 },
  { min: 3000000,        max: 5000000,         standard: 1000,   reduced: 1000 },
  { min: 5000000,        max: 10000000,        standard: 2000,   reduced: 2000 },
  { min: 10000000,       max: 20000000,        standard: 4000,   reduced: 4000 },
  { min: 20000000,       max: 30000000,        standard: 6000,   reduced: 6000 },
  { min: 30000000,       max: 50000000,        standard: 10000,  reduced: 10000 },
  { min: 50000000,       max: 100000000,       standard: 20000,  reduced: 20000 },
  { min: 100000000,      max: 200000000,       standard: 40000,  reduced: 40000 },
  { min: 200000000,      max: 300000000,       standard: 60000,  reduced: 60000 },
  { min: 300000000,      max: 500000000,       standard: 100000, reduced: 100000 },
  { min: 500000000,      max: 1000000000,      standard: 150000, reduced: 150000 },
  { min: 1000000000,     max: Infinity,        standard: 200000, reduced: 200000 },
]

/** 軽減措置の適用期限 */
const REDUCTION_DEADLINE = new Date('2027-03-31')

// =================================================================
// 計算関数
// =================================================================

/**
 * 印紙税を計算
 *
 * @param input 計算入力パラメータ
 * @returns 計算結果
 */
export function calculateStampTax(input: StampTaxInput): StampTaxResult {
  const {
    contractType,
    contractAmount,
    contractFormat,
    contractDate = new Date(),
    sellerType,
  } = input

  const notes: string[] = []
  let contractTypeName = ''

  // =================================================================
  // 1. 電子契約の場合は非課税
  // =================================================================
  if (contractFormat === 'electronic') {
    contractTypeName = getContractTypeName(contractType)
    return {
      contractAmount,
      contractTypeName,
      stampTaxAmount: 0,
      standardTaxAmount: 0,
      reductionAmount: 0,
      isReduced: false,
      isElectronicExempt: true,
      isNonBusinessExempt: false,
      notes: [],
    }
  }

  // =================================================================
  // 2. 領収書で個人マイホーム売却の場合は非課税
  // =================================================================
  if (contractType === 'receipt' && sellerType === 'individual_home') {
    return {
      contractAmount,
      contractTypeName: '領収書（不動産売却代金）',
      stampTaxAmount: 0,
      standardTaxAmount: 0,
      reductionAmount: 0,
      isReduced: false,
      isElectronicExempt: false,
      isNonBusinessExempt: true,
      notes: [],
    }
  }

  // =================================================================
  // 3. 税額テーブルの選択と軽減措置判定
  // =================================================================
  let taxTable: typeof REAL_ESTATE_SALE_TAX_TABLE
  let canApplyReduction = false

  switch (contractType) {
    case 'real_estate_sale':
      taxTable = REAL_ESTATE_SALE_TAX_TABLE
      contractTypeName = '不動産売買契約書'
      // 軽減措置：10万円超かつ期限内
      canApplyReduction = contractAmount > 100000 && contractDate <= REDUCTION_DEADLINE
      break

    case 'construction_work':
      taxTable = CONSTRUCTION_WORK_TAX_TABLE
      contractTypeName = '建設工事請負契約書'
      // 軽減措置：100万円超かつ期限内
      canApplyReduction = contractAmount > 1000000 && contractDate <= REDUCTION_DEADLINE
      break

    case 'receipt':
      taxTable = RECEIPT_TAX_TABLE
      contractTypeName = '領収書（不動産売却代金）'
      canApplyReduction = false // 領収書には軽減措置なし
      break

    default:
      taxTable = REAL_ESTATE_SALE_TAX_TABLE
      contractTypeName = '契約書'
  }

  // =================================================================
  // 4. 税額の計算
  // =================================================================
  const bracket = taxTable.find(b => contractAmount > b.min && contractAmount <= b.max)
    || taxTable[taxTable.length - 1]

  const standardTaxAmount = bracket.standard
  const stampTaxAmount = canApplyReduction ? bracket.reduced : bracket.standard
  const reductionAmount = standardTaxAmount - stampTaxAmount
  const isReduced = reductionAmount > 0

  return {
    contractAmount,
    contractTypeName,
    stampTaxAmount,
    standardTaxAmount,
    reductionAmount,
    isReduced,
    isElectronicExempt: false,
    isNonBusinessExempt: false,
    notes,
  }
}

// =================================================================
// 早見表用データ
// =================================================================

/** 不動産売買契約書の早見表データ */
export const REAL_ESTATE_SALE_QUICK_REFERENCE = [
  { amount: 1000000, standard: 1000, reduced: 500 },
  { amount: 3000000, standard: 2000, reduced: 1000 },
  { amount: 5000000, standard: 2000, reduced: 1000 },
  { amount: 10000000, standard: 10000, reduced: 5000 },
  { amount: 20000000, standard: 20000, reduced: 10000 },
  { amount: 30000000, standard: 20000, reduced: 10000 },
  { amount: 50000000, standard: 20000, reduced: 10000 },
  { amount: 80000000, standard: 60000, reduced: 30000 },
  { amount: 100000000, standard: 60000, reduced: 30000 },
  { amount: 300000000, standard: 100000, reduced: 60000 },
  { amount: 500000000, standard: 100000, reduced: 60000 },
]

/** 建設工事請負契約書の早見表データ */
export const CONSTRUCTION_WORK_QUICK_REFERENCE = [
  { amount: 1000000, standard: 200, reduced: 200 },
  { amount: 2000000, standard: 400, reduced: 200 },
  { amount: 3000000, standard: 1000, reduced: 500 },
  { amount: 5000000, standard: 2000, reduced: 1000 },
  { amount: 10000000, standard: 10000, reduced: 5000 },
  { amount: 20000000, standard: 20000, reduced: 10000 },
  { amount: 30000000, standard: 20000, reduced: 10000 },
  { amount: 50000000, standard: 20000, reduced: 10000 },
  { amount: 100000000, standard: 60000, reduced: 30000 },
]

/** 領収書の早見表データ */
export const RECEIPT_QUICK_REFERENCE = [
  { amount: 500000, standard: 200, reduced: 200 },
  { amount: 1000000, standard: 200, reduced: 200 },
  { amount: 2000000, standard: 400, reduced: 400 },
  { amount: 5000000, standard: 1000, reduced: 1000 },
  { amount: 10000000, standard: 2000, reduced: 2000 },
  { amount: 20000000, standard: 4000, reduced: 4000 },
  { amount: 30000000, standard: 6000, reduced: 6000 },
  { amount: 50000000, standard: 10000, reduced: 10000 },
  { amount: 100000000, standard: 20000, reduced: 20000 },
]

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 契約種類名を取得
 */
function getContractTypeName(contractType: ContractType): string {
  switch (contractType) {
    case 'real_estate_sale':
      return '不動産売買契約書'
    case 'construction_work':
      return '建設工事請負契約書'
    case 'receipt':
      return '領収書（不動産売却代金）'
    default:
      return '契約書'
  }
}

/**
 * 金額を日本語形式でフォーマット（万円単位）
 */
export function formatYen(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toLocaleString('ja-JP')}億円`
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toLocaleString('ja-JP')}万円`
  }
  return `${amount.toLocaleString('ja-JP')}円`
}

/**
 * 税額を日本語形式でフォーマット
 */
export function formatTax(amount: number): string {
  if (amount === 0) return '非課税'
  return `${amount.toLocaleString('ja-JP')}円`
}
