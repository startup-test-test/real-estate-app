/**
 * 登録免許税計算ロジック
 *
 * 登録免許税 = 課税標準額 × 税率
 * - 課税標準額: 1,000円未満切り捨て（最低1,000円）
 * - 税額: 100円未満切り捨て（最低1,000円）
 */

// 税率定義（2026年時点）
export const TAX_RATES = {
  // 土地の移転登記（売買）
  land: {
    standard: 0.02,    // 本則 2.0%
    reduced: 0.015,    // 軽減 1.5%（令和11年3月末まで延長予定）
  },
  // 建物の保存登記（新築）
  buildingPreservation: {
    standard: 0.004,           // 本則 0.4%
    reduced: 0.0015,           // 一般住宅軽減 0.15%
    longTermQuality: 0.001,    // 長期優良住宅 0.1%
    lowCarbon: 0.001,          // 認定低炭素住宅 0.1%
  },
  // 建物の移転登記（中古売買）
  buildingTransfer: {
    standard: 0.02,            // 本則 2.0%
    reduced: 0.003,            // 一般住宅軽減 0.3%
    longTermQuality: 0.001,    // 長期優良住宅 0.1%
    lowCarbon: 0.001,          // 認定低炭素住宅 0.1%
    resale: 0.001,             // 買取再販 0.1%
  },
  // 抵当権設定
  mortgage: {
    standard: 0.004,   // 本則 0.4%
    reduced: 0.001,    // 住宅軽減 0.1%
  },
  // 相続
  inheritance: {
    rate: 0.004,       // 0.4%
  },
}

// 新築建物の法務局認定単価（令和6年度・主要地域）
// 実際は都道府県・法務局ごとに異なる
export const NEW_BUILDING_UNIT_PRICES: Record<string, Record<string, number>> = {
  // 東京法務局管轄
  tokyo: {
    wood: 107000,      // 木造
    steel: 121000,     // 鉄骨造
    rc: 130000,        // 鉄筋コンクリート造
  },
  // その他の地域（概算値）
  default: {
    wood: 95000,
    steel: 110000,
    rc: 120000,
  },
}

// 入力パラメータ
export interface RegistrationTaxInput {
  // 取引種別
  transactionType: 'newPurchase' | 'usedPurchase' | 'landOnly'

  // 土地
  hasLand: boolean
  landAssessedValue?: number      // 固定資産税評価額（わかる場合）
  landMarketPrice?: number        // 売買価格（評価額不明の場合）

  // 建物
  hasBuilding: boolean
  buildingType?: 'new' | 'used'
  buildingAssessedValue?: number  // 固定資産税評価額（中古の場合）
  buildingMarketPrice?: number    // 売買価格（評価額不明の場合）

  // 新築の場合
  prefecture?: string             // 都道府県
  structure?: 'wood' | 'steel' | 'rc'  // 構造
  floorArea?: number              // 床面積（㎡）

  // 軽減条件
  isSelfResidential: boolean      // 自己居住用
  isLongTermQuality: boolean      // 長期優良住宅
  isLowCarbon: boolean            // 低炭素住宅
  isResale: boolean               // 買取再販住宅

  // 住宅ローン
  hasLoan: boolean
  loanAmount?: number             // 借入額
}

// 計算結果
export interface RegistrationTaxResult {
  // 土地
  landTax: number
  landTaxBase: number
  landTaxRate: number

  // 建物
  buildingTax: number
  buildingTaxBase: number
  buildingTaxRate: number

  // 抵当権
  mortgageTax: number
  mortgageTaxBase: number
  mortgageTaxRate: number

  // 合計
  totalTax: number

  // 軽減適用状況
  reductionApplied: {
    land: boolean
    building: boolean
    mortgage: boolean
  }

  // 適用税率（表示用）
  appliedRates: {
    land: string
    building: string
    mortgage: string
  }
}

/**
 * 課税標準の端数処理（1,000円未満切り捨て、最低1,000円）
 */
function roundTaxBase(value: number): number {
  if (value <= 0) return 0
  const rounded = Math.floor(value / 1000) * 1000
  return rounded < 1000 ? 1000 : rounded
}

/**
 * 税額の端数処理（100円未満切り捨て、最低1,000円）
 */
function roundTaxAmount(value: number): number {
  if (value <= 0) return 0
  const rounded = Math.floor(value / 100) * 100
  return rounded < 1000 ? 1000 : rounded
}

/**
 * 軽減条件を満たすかチェック
 */
function meetsReductionRequirements(input: RegistrationTaxInput): boolean {
  // 自己居住用であること
  if (!input.isSelfResidential) return false

  // 床面積50㎡以上（新築の場合のみチェック可能）
  if (input.buildingType === 'new' && input.floorArea && input.floorArea < 50) {
    return false
  }

  return true
}

/**
 * 新築建物の課税標準を計算（法務局認定価格）
 */
function calculateNewBuildingTaxBase(
  prefecture: string,
  structure: 'wood' | 'steel' | 'rc',
  floorArea: number
): number {
  // 東京かその他かで単価を決定
  const region = prefecture === '東京都' ? 'tokyo' : 'default'
  const unitPrices = NEW_BUILDING_UNIT_PRICES[region]
  const unitPrice = unitPrices[structure]

  return floorArea * unitPrice
}

/**
 * 登録免許税を計算
 */
export function calculateRegistrationTax(input: RegistrationTaxInput): RegistrationTaxResult {
  const canApplyReduction = meetsReductionRequirements(input)

  let landTax = 0
  let landTaxBase = 0
  let landTaxRate = 0
  let landReductionApplied = false

  let buildingTax = 0
  let buildingTaxBase = 0
  let buildingTaxRate = 0
  let buildingReductionApplied = false

  let mortgageTax = 0
  let mortgageTaxBase = 0
  let mortgageTaxRate = 0
  let mortgageReductionApplied = false

  // === 1. 土地の計算 ===
  if (input.hasLand) {
    // 課税標準を決定
    if (input.landAssessedValue && input.landAssessedValue > 0) {
      landTaxBase = input.landAssessedValue
    } else if (input.landMarketPrice && input.landMarketPrice > 0) {
      // 売買価格から推定（約70%）
      landTaxBase = input.landMarketPrice * 0.7
    }

    landTaxBase = roundTaxBase(landTaxBase)

    // 土地は住宅用に限らず軽減税率1.5%が適用（令和11年まで延長予定）
    landTaxRate = TAX_RATES.land.reduced
    landReductionApplied = true

    if (landTaxBase > 0) {
      landTax = roundTaxAmount(landTaxBase * landTaxRate)
    }
  }

  // === 2. 建物の計算 ===
  if (input.hasBuilding) {
    if (input.buildingType === 'new') {
      // 新築：法務局認定価格で計算
      if (input.prefecture && input.structure && input.floorArea) {
        buildingTaxBase = calculateNewBuildingTaxBase(
          input.prefecture,
          input.structure,
          input.floorArea
        )
      }
      buildingTaxBase = roundTaxBase(buildingTaxBase)

      // 税率決定（保存登記）
      if (canApplyReduction) {
        if (input.isLongTermQuality) {
          buildingTaxRate = TAX_RATES.buildingPreservation.longTermQuality
        } else if (input.isLowCarbon) {
          buildingTaxRate = TAX_RATES.buildingPreservation.lowCarbon
        } else {
          buildingTaxRate = TAX_RATES.buildingPreservation.reduced
        }
        buildingReductionApplied = true
      } else {
        buildingTaxRate = TAX_RATES.buildingPreservation.standard
      }
    } else {
      // 中古：評価額で計算
      if (input.buildingAssessedValue && input.buildingAssessedValue > 0) {
        buildingTaxBase = input.buildingAssessedValue
      } else if (input.buildingMarketPrice && input.buildingMarketPrice > 0) {
        // 売買価格から推定（約60%）
        buildingTaxBase = input.buildingMarketPrice * 0.6
      }
      buildingTaxBase = roundTaxBase(buildingTaxBase)

      // 税率決定（移転登記）
      if (canApplyReduction) {
        if (input.isResale) {
          buildingTaxRate = TAX_RATES.buildingTransfer.resale
        } else if (input.isLongTermQuality) {
          buildingTaxRate = TAX_RATES.buildingTransfer.longTermQuality
        } else if (input.isLowCarbon) {
          buildingTaxRate = TAX_RATES.buildingTransfer.lowCarbon
        } else {
          buildingTaxRate = TAX_RATES.buildingTransfer.reduced
        }
        buildingReductionApplied = true
      } else {
        buildingTaxRate = TAX_RATES.buildingTransfer.standard
      }
    }

    if (buildingTaxBase > 0) {
      buildingTax = roundTaxAmount(buildingTaxBase * buildingTaxRate)
    }
  }

  // === 3. 抵当権設定の計算 ===
  if (input.hasLoan && input.loanAmount && input.loanAmount > 0) {
    mortgageTaxBase = roundTaxBase(input.loanAmount)

    // 住宅軽減が適用できるか
    if (canApplyReduction) {
      mortgageTaxRate = TAX_RATES.mortgage.reduced
      mortgageReductionApplied = true
    } else {
      mortgageTaxRate = TAX_RATES.mortgage.standard
    }

    mortgageTax = roundTaxAmount(mortgageTaxBase * mortgageTaxRate)
  }

  // 合計
  const totalTax = landTax + buildingTax + mortgageTax

  return {
    landTax,
    landTaxBase,
    landTaxRate,
    buildingTax,
    buildingTaxBase,
    buildingTaxRate,
    mortgageTax,
    mortgageTaxBase,
    mortgageTaxRate,
    totalTax,
    reductionApplied: {
      land: landReductionApplied,
      building: buildingReductionApplied,
      mortgage: mortgageReductionApplied,
    },
    appliedRates: {
      land: `${(landTaxRate * 100).toFixed(1)}%`,
      building: `${(buildingTaxRate * 100).toFixed(2)}%`,
      mortgage: `${(mortgageTaxRate * 100).toFixed(1)}%`,
    },
  }
}

// 早見表データ用の計算（新築建売の場合）
export function generateQuickReferenceData() {
  const prices = [2000, 3000, 4000, 5000, 6000, 7000, 8000]

  return prices.map(price => {
    // 想定: 土地50%、建物50%、100㎡、木造、ローン80%
    const landPrice = price * 0.5 * 10000
    const floorArea = 100
    const loanAmount = price * 0.8 * 10000

    const result = calculateRegistrationTax({
      transactionType: 'newPurchase',
      hasLand: true,
      landMarketPrice: landPrice,
      hasBuilding: true,
      buildingType: 'new',
      prefecture: 'default',
      structure: 'wood',
      floorArea,
      isSelfResidential: true,
      isLongTermQuality: false,
      isLowCarbon: false,
      isResale: false,
      hasLoan: true,
      loanAmount,
    })

    return {
      price: `${price.toLocaleString()}万円`,
      tax: `約${Math.round(result.totalTax / 10000)}万円`,
      detail: `土地${Math.round(result.landTax / 10000)}万+建物${Math.round(result.buildingTax / 1000)}千+抵当${Math.round(result.mortgageTax / 10000)}万`,
    }
  })
}
