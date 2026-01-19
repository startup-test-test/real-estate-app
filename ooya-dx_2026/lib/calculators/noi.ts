/**
 * NOI（営業純収益）計算ロジック
 * Net Operating Income - 不動産投資の基本指標
 */

export interface NOIInput {
  // 収入
  annualRentInMan: number           // 年間想定賃料（万円）- GPI
  vacancyRate: number               // 想定空室率（%）
  badDebtRate: number               // 貸倒損失率（%）
  otherIncomeInMan: number          // その他収入（万円）- 駐車場・自販機等

  // 経費（OPEX）- 詳細入力モード
  pmFeeRate: number                 // PM管理費率（%）
  bmFeeInMan: number                // BM管理費（万円/年）
  propertyTaxInMan: number          // 固定資産税・都市計画税（万円/年）
  maintenanceRate: number           // 修繕維持費率（%）
  insuranceInMan: number            // 損害保険料（万円/年）
  leasingCostInMan: number          // 募集費用（万円/年）
  otherExpenseInMan: number         // その他経費（万円/年）

  // 簡易入力モード用
  useSimpleMode: boolean            // 簡易モード使用フラグ
  opexRate: number                  // 経費率（%）- 簡易モード用
}

export interface NOIResult {
  // 収入
  gpi: number                       // GPI（万円）- 潜在総収益
  vacancyLoss: number               // 空室損失（万円）
  badDebtLoss: number               // 貸倒損失（万円）
  otherIncome: number               // その他収入（万円）
  egi: number                       // EGI（万円）- 実効総収益

  // 経費
  pmFee: number                     // PM管理費（万円）
  bmFee: number                     // BM管理費（万円）
  propertyTax: number               // 固定資産税等（万円）
  maintenance: number               // 修繕維持費（万円）
  insurance: number                 // 損害保険料（万円）
  leasingCost: number               // 募集費用（万円）
  otherExpense: number              // その他経費（万円）
  totalOpex: number                 // OPEX合計（万円）

  // 結果
  noi: number                       // NOI（万円）
  opexRatio: number                 // 経費率（%）
  noiYield: number | null           // NOI利回り（%）- 物件価格入力時のみ

  // キャッシュフローツリー表示用
  cashFlowTree: CashFlowTreeItem[]
}

export interface CashFlowTreeItem {
  label: string
  value: number
  type: 'income' | 'expense' | 'subtotal' | 'result'
  indent: number
}

/**
 * NOIを計算
 * @param input 入力パラメータ
 * @param propertyPriceInMan 物件価格（万円）- NOI利回り計算用（オプション）
 * @returns 計算結果
 */
export function calculateNOI(input: NOIInput, propertyPriceInMan?: number): NOIResult {
  const {
    annualRentInMan,
    vacancyRate,
    badDebtRate,
    otherIncomeInMan,
    pmFeeRate,
    bmFeeInMan,
    propertyTaxInMan,
    maintenanceRate,
    insuranceInMan,
    leasingCostInMan,
    otherExpenseInMan,
    useSimpleMode,
    opexRate,
  } = input

  // GPI = 年間想定賃料
  const gpi = annualRentInMan

  // 空室損失 = GPI × 空室率
  const vacancyLoss = gpi * (vacancyRate / 100)

  // 貸倒損失 = GPI × 貸倒率
  const badDebtLoss = gpi * (badDebtRate / 100)

  // その他収入
  const otherIncome = otherIncomeInMan

  // EGI = GPI - 空室損失 - 貸倒損失 + その他収入
  const egi = gpi - vacancyLoss - badDebtLoss + otherIncome

  // OPEX計算
  let pmFee: number
  let bmFee: number
  let propertyTax: number
  let maintenance: number
  let insurance: number
  let leasingCost: number
  let otherExpense: number
  let totalOpex: number

  if (useSimpleMode) {
    // 簡易モード: 経費率からOPEXを一括計算
    totalOpex = gpi * (opexRate / 100)
    // 内訳は概算で配分
    pmFee = totalOpex * 0.15        // PM費 15%
    bmFee = totalOpex * 0.10        // BM費 10%
    propertyTax = totalOpex * 0.35  // 固定資産税 35%
    maintenance = totalOpex * 0.20  // 修繕費 20%
    insurance = totalOpex * 0.05    // 保険 5%
    leasingCost = totalOpex * 0.10  // 募集費 10%
    otherExpense = totalOpex * 0.05 // その他 5%
  } else {
    // 詳細モード: 各項目を個別計算
    pmFee = gpi * (pmFeeRate / 100)
    bmFee = bmFeeInMan
    propertyTax = propertyTaxInMan
    maintenance = gpi * (maintenanceRate / 100)
    insurance = insuranceInMan
    leasingCost = leasingCostInMan
    otherExpense = otherExpenseInMan
    totalOpex = pmFee + bmFee + propertyTax + maintenance + insurance + leasingCost + otherExpense
  }

  // NOI = EGI - OPEX
  const noi = egi - totalOpex

  // 経費率 = OPEX / GPI
  const opexRatioCalc = gpi > 0 ? (totalOpex / gpi) * 100 : 0

  // NOI利回り = NOI / 物件価格
  const noiYield = propertyPriceInMan && propertyPriceInMan > 0
    ? (noi / propertyPriceInMan) * 100
    : null

  // キャッシュフローツリー
  const cashFlowTree: CashFlowTreeItem[] = [
    { label: 'GPI（潜在総収益）', value: gpi, type: 'income', indent: 0 },
    { label: '空室損失', value: -vacancyLoss, type: 'expense', indent: 1 },
    { label: '貸倒損失', value: -badDebtLoss, type: 'expense', indent: 1 },
    { label: 'その他収入', value: otherIncome, type: 'income', indent: 1 },
    { label: 'EGI（実効総収益）', value: egi, type: 'subtotal', indent: 0 },
    { label: 'PM管理費', value: -pmFee, type: 'expense', indent: 1 },
    { label: 'BM管理費', value: -bmFee, type: 'expense', indent: 1 },
    { label: '固定資産税・都市計画税', value: -propertyTax, type: 'expense', indent: 1 },
    { label: '修繕維持費', value: -maintenance, type: 'expense', indent: 1 },
    { label: '損害保険料', value: -insurance, type: 'expense', indent: 1 },
    { label: '募集費用', value: -leasingCost, type: 'expense', indent: 1 },
    { label: 'その他経費', value: -otherExpense, type: 'expense', indent: 1 },
    { label: 'OPEX合計', value: -totalOpex, type: 'subtotal', indent: 0 },
    { label: 'NOI（営業純収益）', value: noi, type: 'result', indent: 0 },
  ]

  return {
    gpi: Math.round(gpi * 10) / 10,
    vacancyLoss: Math.round(vacancyLoss * 10) / 10,
    badDebtLoss: Math.round(badDebtLoss * 10) / 10,
    otherIncome: Math.round(otherIncome * 10) / 10,
    egi: Math.round(egi * 10) / 10,
    pmFee: Math.round(pmFee * 10) / 10,
    bmFee: Math.round(bmFee * 10) / 10,
    propertyTax: Math.round(propertyTax * 10) / 10,
    maintenance: Math.round(maintenance * 10) / 10,
    insurance: Math.round(insurance * 10) / 10,
    leasingCost: Math.round(leasingCost * 10) / 10,
    otherExpense: Math.round(otherExpense * 10) / 10,
    totalOpex: Math.round(totalOpex * 10) / 10,
    noi: Math.round(noi * 10) / 10,
    opexRatio: Math.round(opexRatioCalc * 100) / 100,
    noiYield: noiYield !== null ? Math.round(noiYield * 100) / 100 : null,
    cashFlowTree,
  }
}

/**
 * 物件タイプ別の経費率目安を返す
 */
export function getOpexRateByPropertyType(propertyType: string): { min: number; max: number; typical: number } {
  switch (propertyType) {
    case 'condo-new':
      return { min: 15, max: 20, typical: 17 }
    case 'condo-used':
      return { min: 18, max: 25, typical: 20 }
    case 'apartment-rc':
      return { min: 20, max: 25, typical: 22 }
    case 'apartment-wood':
      return { min: 25, max: 30, typical: 27 }
    case 'commercial':
      return { min: 30, max: 40, typical: 35 }
    default:
      return { min: 20, max: 25, typical: 22 }
  }
}

/**
 * NOIの評価を返す
 */
export function getNOIEvaluation(noiYield: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor'
  message: string
  color: string
} {
  if (noiYield >= 7) {
    return {
      level: 'excellent',
      message: '高利回り（地方・築古物件の水準）',
      color: 'green',
    }
  } else if (noiYield >= 5) {
    return {
      level: 'good',
      message: '良好（一棟物件の目安）',
      color: 'blue',
    }
  } else if (noiYield >= 3) {
    return {
      level: 'fair',
      message: '標準（都心物件の水準）',
      color: 'amber',
    }
  } else {
    return {
      level: 'poor',
      message: '低利回り（都心一等地の水準）',
      color: 'orange',
    }
  }
}
