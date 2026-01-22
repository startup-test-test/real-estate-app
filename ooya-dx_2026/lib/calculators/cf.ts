/**
 * CF（キャッシュフロー）計算ロジック
 *
 * キャッシュフローツリー:
 * GPI（総潜在収入）→ EGI（有効総収入）→ NOI（営業純収益）→ BTCF（税引前CF）→ ATCF（税引後CF）
 *
 * 参考:
 * - 不動産証券化協会 用語集
 * - 国税庁 No.2260 所得税の税率
 */

export interface CFInput {
  /** 年間満室想定収入（万円）- GPI */
  annualGPIInMan: number
  /** 空室率（%） */
  vacancyRate: number
  /** 年間運営経費（万円）- OPEX */
  annualOpexInMan: number
  /** 年間ローン返済額（万円）- ADS（元利合計） */
  annualADSInMan: number
  /** 減価償却費（万円）- 税金計算用 */
  annualDepreciationInMan?: number
  /** 支払利息（万円）- 税金計算用 */
  annualInterestInMan?: number
  /** 所得税・住民税率（%）- デフォルト30% */
  taxRate?: number
}

export interface CFResult {
  /** GPI - 総潜在収入（万円） */
  gpi: number
  /** 空室損（万円） */
  vacancyLoss: number
  /** EGI - 有効総収入（万円） */
  egi: number
  /** OPEX - 運営経費（万円） */
  opex: number
  /** NOI - 営業純収益（万円） */
  noi: number
  /** ADS - 年間ローン返済額（万円） */
  ads: number
  /** BTCF - 税引前キャッシュフロー（万円） */
  btcf: number
  /** 課税所得（万円）- NOI - 支払利息 - 減価償却費 */
  taxableIncome: number | null
  /** 所得税・住民税（万円） */
  incomeTax: number | null
  /** ATCF - 税引後キャッシュフロー（万円） */
  atcf: number | null
  /** 月間BTCF（万円） */
  monthlyBTCF: number
  /** 月間ATCF（万円） */
  monthlyATCF: number | null
  /** 経費率（%）- OPEX / EGI */
  opexRatio: number
  /** DSCR - 債務返済カバー率 */
  dscr: number | null
  /** 入力パラメーター */
  input: {
    annualGPIInMan: number
    vacancyRate: number
    annualOpexInMan: number
    annualADSInMan: number
    annualDepreciationInMan: number
    annualInterestInMan: number
    taxRate: number
  }
}

/**
 * キャッシュフローを計算
 */
export function calculateCF(input: CFInput): CFResult {
  const {
    annualGPIInMan,
    vacancyRate,
    annualOpexInMan,
    annualADSInMan,
    annualDepreciationInMan = 0,
    annualInterestInMan = 0,
    taxRate = 30,
  } = input

  // GPI（総潜在収入）
  const gpi = annualGPIInMan

  // 空室損
  const vacancyLoss = gpi * (vacancyRate / 100)

  // EGI（有効総収入）= GPI - 空室損
  const egi = gpi - vacancyLoss

  // OPEX（運営経費）
  const opex = annualOpexInMan

  // NOI（営業純収益）= EGI - OPEX
  const noi = egi - opex

  // ADS（年間ローン返済額）
  const ads = annualADSInMan

  // BTCF（税引前キャッシュフロー）= NOI - ADS
  const btcf = noi - ads

  // 課税所得の計算（減価償却費・支払利息が入力されている場合）
  let taxableIncome: number | null = null
  let incomeTax: number | null = null
  let atcf: number | null = null

  if (annualDepreciationInMan > 0 || annualInterestInMan > 0) {
    // 課税所得 = NOI - 支払利息 - 減価償却費
    taxableIncome = noi - annualInterestInMan - annualDepreciationInMan

    // 所得税・住民税（マイナスの場合は0）
    incomeTax = taxableIncome > 0 ? taxableIncome * (taxRate / 100) : 0

    // ATCF（税引後キャッシュフロー）= BTCF - 税金
    atcf = btcf - incomeTax
  }

  // 経費率
  const opexRatio = egi > 0 ? (opex / egi) * 100 : 0

  // DSCR（債務返済カバー率）= NOI / ADS
  const dscr = ads > 0 ? noi / ads : null

  // 月間計算
  const monthlyBTCF = btcf / 12
  const monthlyATCF = atcf !== null ? atcf / 12 : null

  return {
    gpi: Math.round(gpi * 100) / 100,
    vacancyLoss: Math.round(vacancyLoss * 100) / 100,
    egi: Math.round(egi * 100) / 100,
    opex: Math.round(opex * 100) / 100,
    noi: Math.round(noi * 100) / 100,
    ads: Math.round(ads * 100) / 100,
    btcf: Math.round(btcf * 100) / 100,
    taxableIncome: taxableIncome !== null ? Math.round(taxableIncome * 100) / 100 : null,
    incomeTax: incomeTax !== null ? Math.round(incomeTax * 100) / 100 : null,
    atcf: atcf !== null ? Math.round(atcf * 100) / 100 : null,
    monthlyBTCF: Math.round(monthlyBTCF * 100) / 100,
    monthlyATCF: monthlyATCF !== null ? Math.round(monthlyATCF * 100) / 100 : null,
    opexRatio: Math.round(opexRatio * 100) / 100,
    dscr: dscr !== null ? Math.round(dscr * 100) / 100 : null,
    input: {
      annualGPIInMan,
      vacancyRate,
      annualOpexInMan,
      annualADSInMan,
      annualDepreciationInMan,
      annualInterestInMan,
      taxRate,
    },
  }
}

/**
 * 複数年のキャッシュフロー推移を計算
 */
export function calculateCFProjection(
  input: CFInput,
  years: number,
  options?: {
    /** 家賃上昇率（%/年）- デフォルト0% */
    rentGrowthRate?: number
    /** 経費上昇率（%/年）- デフォルト1% */
    opexGrowthRate?: number
  }
): Array<{
  year: number
  btcf: number
  atcf: number | null
  cumulativeBTCF: number
  cumulativeATCF: number | null
}> {
  const { rentGrowthRate = 0, opexGrowthRate = 1 } = options || {}
  const results: Array<{
    year: number
    btcf: number
    atcf: number | null
    cumulativeBTCF: number
    cumulativeATCF: number | null
  }> = []

  let cumulativeBTCF = 0
  let cumulativeATCF: number | null = 0

  for (let year = 1; year <= years; year++) {
    // 収入・経費の成長を反映
    const adjustedInput: CFInput = {
      ...input,
      annualGPIInMan: input.annualGPIInMan * Math.pow(1 + rentGrowthRate / 100, year - 1),
      annualOpexInMan: input.annualOpexInMan * Math.pow(1 + opexGrowthRate / 100, year - 1),
    }

    const yearResult = calculateCF(adjustedInput)
    cumulativeBTCF += yearResult.btcf

    if (yearResult.atcf !== null && cumulativeATCF !== null) {
      cumulativeATCF += yearResult.atcf
    } else {
      cumulativeATCF = null
    }

    results.push({
      year,
      btcf: yearResult.btcf,
      atcf: yearResult.atcf,
      cumulativeBTCF: Math.round(cumulativeBTCF * 100) / 100,
      cumulativeATCF: cumulativeATCF !== null ? Math.round(cumulativeATCF * 100) / 100 : null,
    })
  }

  return results
}
