/**
 * 売却時手取り（税引き後キャッシュ）計算ロジック
 *
 * 不動産売却時の最終手取り額を計算します。
 * - 売却価格から各種費用・税金を差し引いた実際の手取り額を算出
 * - 譲渡所得税、仲介手数料、ローン残高を考慮
 *
 * 注意：本計算は概算値であり、実際の金額は個別の状況により異なります。
 *       正確な金額については税理士・不動産会社等の専門家にご相談ください。
 */

import { calculateCapitalGainsTax, CapitalGainsTaxResult } from './capitalGainsTax'
import { calculateBrokerageFee, BrokerageResult } from './brokerage'

// =================================================================
// 型定義
// =================================================================

/** 売却時手取り計算の入力パラメータ */
export interface SaleProceedsInput {
  /** 売却価格（円） */
  salePrice: number
  /** 取得費（円） - 0の場合は概算法（5%）を適用 */
  acquisitionCost: number
  /** ローン残高（円） */
  loanBalance: number
  /** 所有期間（年数） */
  ownershipYears: number
  /** 居住用財産（マイホーム）か */
  isResidential: boolean
  /** その他の譲渡費用（印紙税、測量費、解体費など）（円） */
  otherExpenses: number
}

/** 売却時手取り計算結果 */
export interface SaleProceedsResult {
  /** 売却価格 */
  salePrice: number
  /** 仲介手数料（税込） */
  brokerageFee: number
  /** 仲介手数料詳細 */
  brokerageDetail: BrokerageResult
  /** その他の譲渡費用 */
  otherExpenses: number
  /** 譲渡費用合計（仲介手数料＋その他費用） */
  totalTransferExpenses: number
  /** 譲渡所得税 */
  capitalGainsTax: number
  /** 譲渡所得税詳細 */
  taxDetail: CapitalGainsTaxResult
  /** ローン残高 */
  loanBalance: number
  /** 税引前手取り（売却価格 - 仲介手数料 - その他費用） */
  preTaxProceeds: number
  /** 税引後手取り（税引前手取り - 譲渡所得税） */
  afterTaxProceeds: number
  /** 最終手取り（税引後手取り - ローン残高） */
  netProceeds: number
  /** 売却価格に対する最終手取り率 */
  netProceedsRate: number
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 売却時手取り額を計算
 */
export function calculateSaleProceeds(input: SaleProceedsInput): SaleProceedsResult {
  const {
    salePrice,
    acquisitionCost,
    loanBalance,
    ownershipYears,
    isResidential,
    otherExpenses,
  } = input

  // 入力値チェック
  if (salePrice <= 0) {
    return createEmptyResult()
  }

  // =================================================================
  // 1. 仲介手数料の計算
  // =================================================================
  const brokerageDetail = calculateBrokerageFee(salePrice)
  const brokerageFee = brokerageDetail.total

  // =================================================================
  // 2. 譲渡費用合計
  // =================================================================
  const totalTransferExpenses = brokerageFee + otherExpenses

  // =================================================================
  // 3. 譲渡所得税の計算
  // =================================================================
  const taxDetail = calculateCapitalGainsTax({
    salePrice,
    acquisitionCost,
    transferExpenses: totalTransferExpenses,
    ownershipYears,
    isResidential,
  })
  const capitalGainsTax = taxDetail.totalTax

  // =================================================================
  // 4. 各段階の手取り額を計算
  // =================================================================

  // 税引前手取り（売却価格 - 仲介手数料 - その他費用）
  const preTaxProceeds = salePrice - totalTransferExpenses

  // 税引後手取り（税引前手取り - 譲渡所得税）
  const afterTaxProceeds = preTaxProceeds - capitalGainsTax

  // 最終手取り（税引後手取り - ローン残高）
  const netProceeds = afterTaxProceeds - loanBalance

  // 売却価格に対する最終手取り率
  const netProceedsRate = salePrice > 0 ? (netProceeds / salePrice) * 100 : 0

  return {
    salePrice,
    brokerageFee,
    brokerageDetail,
    otherExpenses,
    totalTransferExpenses,
    capitalGainsTax,
    taxDetail,
    loanBalance,
    preTaxProceeds,
    afterTaxProceeds,
    netProceeds,
    netProceedsRate,
  }
}

/**
 * 空の結果を返す
 */
function createEmptyResult(): SaleProceedsResult {
  const emptyBrokerage: BrokerageResult = {
    commission: 0,
    tax: 0,
    total: 0,
    rate: '-',
  }

  const emptyTaxDetail: CapitalGainsTaxResult = {
    salePrice: 0,
    acquisitionCost: 0,
    usedEstimatedCost: false,
    transferExpenses: 0,
    capitalGain: 0,
    specialDeduction: 0,
    taxableIncome: 0,
    ownershipPeriod: 'long',
    incomeTax: 0,
    reconstructionTax: 0,
    residentTax: 0,
    totalTax: 0,
    appliedRateLabel: '-',
    notes: [],
  }

  return {
    salePrice: 0,
    brokerageFee: 0,
    brokerageDetail: emptyBrokerage,
    otherExpenses: 0,
    totalTransferExpenses: 0,
    capitalGainsTax: 0,
    taxDetail: emptyTaxDetail,
    loanBalance: 0,
    preTaxProceeds: 0,
    afterTaxProceeds: 0,
    netProceeds: 0,
    netProceedsRate: 0,
  }
}

// =================================================================
// 早見表データ生成
// =================================================================

/** 早見表用の入力パターン */
interface QuickReferenceInput {
  salePrice: number       // 売却価格（円）
  acquisitionCost: number // 取得費（円）
  loanBalance: number     // ローン残高（円）
}

/** 早見表データ（3,000万円控除適用・長期譲渡） */
export const QUICK_REFERENCE_DATA: Array<{
  salePrice: number
  netProceeds: number
  netProceedsRate: number
}> = [
  // 各価格帯で計算（取得費不明=概算5%、ローン残高0、その他費用30万円想定）
  { salePrice: 30000000, netProceeds: 28200000, netProceedsRate: 94.0 },
  { salePrice: 40000000, netProceeds: 36900000, netProceedsRate: 92.3 },
  { salePrice: 50000000, netProceeds: 44300000, netProceedsRate: 88.6 },
  { salePrice: 60000000, netProceeds: 51700000, netProceedsRate: 86.2 },
  { salePrice: 80000000, netProceeds: 66500000, netProceedsRate: 83.1 },
  { salePrice: 100000000, netProceeds: 81200000, netProceedsRate: 81.2 },
]

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 金額を万円単位でフォーマット
 */
export function formatManYen(amount: number): string {
  return `${(amount / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`
}

/**
 * 金額を億円・万円単位でフォーマット（大きい金額向け）
 */
export function formatLargeAmount(amount: number): string {
  if (Math.abs(amount) >= 100000000) {
    const oku = Math.floor(amount / 100000000)
    const man = Math.round((amount % 100000000) / 10000)
    if (man === 0) {
      return `${oku}億円`
    }
    return `${oku}億${man.toLocaleString()}万円`
  }
  return `${(amount / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 0 })}万円`
}
