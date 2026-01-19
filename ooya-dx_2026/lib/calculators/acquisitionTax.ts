/**
 * 不動産取得税計算ロジック
 *
 * 参考:
 * - 総務省「地方税制度｜不動産取得税」
 * - 東京都主税局
 * - 三井のリハウス「不動産取得税｜2025年度税金の手引き」
 */

// 中古住宅の築年数別控除額テーブル（東京都基準）
const USED_HOUSING_DEDUCTION_TABLE = [
  { startDate: new Date('1997-04-01'), deduction: 12000000 },  // 1,200万円
  { startDate: new Date('1989-04-01'), deduction: 10000000 },  // 1,000万円
  { startDate: new Date('1985-07-01'), deduction: 4500000 },   // 450万円
  { startDate: new Date('1981-07-01'), deduction: 4200000 },   // 420万円
  { startDate: new Date('1976-01-01'), deduction: 3500000 },   // 350万円
  { startDate: new Date('1973-01-01'), deduction: 2300000 },   // 230万円
  { startDate: new Date('1964-01-01'), deduction: 1500000 },   // 150万円
  { startDate: new Date('1954-07-01'), deduction: 1000000 },   // 100万円
  { startDate: new Date('1900-01-01'), deduction: 0 },         // それ以前
]

export interface AcquisitionTaxInput {
  // 建物情報
  buildingEvaluation: number       // 建物の固定資産税評価額（円）
  isNewBuilding: boolean           // 新築かどうか
  floorArea: number                // 床面積（m²）
  builtDate?: Date                 // 新築年月日（中古の場合）
  isResidential: boolean           // 住宅かどうか
  isLongTermQuality?: boolean      // 認定長期優良住宅かどうか（新築の場合）
  isForSelfResidence?: boolean     // 自己居住用かどうか（中古住宅の場合に影響）

  // 土地情報
  landEvaluation: number           // 土地の固定資産税評価額（円）
  landArea: number                 // 土地面積（m²）
}

export interface AcquisitionTaxResult {
  // 建物の税額
  buildingTaxBase: number          // 建物の課税標準額
  buildingDeduction: number        // 建物の控除額
  buildingTaxableAmount: number    // 建物の課税対象額
  buildingTax: number              // 建物の税額
  buildingTaxRate: number          // 建物の税率

  // 土地の税額
  landTaxBase: number              // 土地の課税標準額（1/2後）
  landInitialTax: number           // 土地の控除前税額
  landDeduction: number            // 土地の控除額
  landTax: number                  // 土地の税額
  landTaxRate: number              // 土地の税率

  // 合計
  totalTax: number                 // 合計税額

  // 適用情報
  buildingDeductionType: string    // 適用された控除の種類
  isLandDeductionApplied: boolean  // 土地の控除が適用されたか
}

/**
 * 中古住宅の築年数から控除額を取得
 */
function getUsedHousingDeduction(builtDate: Date): number {
  for (const row of USED_HOUSING_DEDUCTION_TABLE) {
    if (builtDate >= row.startDate) {
      return row.deduction
    }
  }
  return 0
}

/**
 * 不動産取得税を計算
 */
export function calculateAcquisitionTax(input: AcquisitionTaxInput): AcquisitionTaxResult {
  const {
    buildingEvaluation,
    isNewBuilding,
    floorArea,
    builtDate,
    isResidential,
    isLongTermQuality,
    isForSelfResidence = true,  // デフォルトは自己居住用
    landEvaluation,
    landArea
  } = input

  // 税率（住宅は3%、非住宅は4%）※2027年3月31日までの特例
  const buildingTaxRate = isResidential ? 0.03 : 0.04
  const landTaxRate = 0.03  // 土地は常に3%（特例）

  // ========== 建物の税額計算 ==========
  let buildingDeduction = 0
  let buildingDeductionType = 'なし'

  // 床面積要件のチェック
  const minArea = isNewBuilding ? 40 : 50  // 新築は40m²以上、中古は50m²以上（共同住宅の場合40m²）
  const maxArea = 240
  const isAreaValid = floorArea >= minArea && floorArea <= maxArea

  if (isResidential && isAreaValid) {
    if (isNewBuilding) {
      // 新築住宅の控除
      if (isLongTermQuality) {
        buildingDeduction = 13000000  // 1,300万円（認定長期優良住宅）
        buildingDeductionType = '認定長期優良住宅控除（1,300万円）'
      } else {
        buildingDeduction = 12000000  // 1,200万円
        buildingDeductionType = '新築住宅控除（1,200万円）'
      }
    } else if (builtDate && isForSelfResidence) {
      // 中古住宅の控除（築年数テーブル参照）
      // ※自己居住用のみ適用、投資用（賃貸用）は適用外
      buildingDeduction = getUsedHousingDeduction(builtDate)
      if (buildingDeduction > 0) {
        buildingDeductionType = `中古住宅控除（${(buildingDeduction / 10000).toLocaleString()}万円）`
      }
    }
  }

  // 建物の課税標準額と税額
  const buildingTaxBase = buildingEvaluation
  const buildingTaxableAmount = Math.max(0, buildingTaxBase - buildingDeduction)
  const buildingTax = Math.floor(buildingTaxableAmount * buildingTaxRate)

  // ========== 土地の税額計算 ==========

  // ステップ1: 課税標準の特例（1/2）
  const landTaxBase = Math.floor(landEvaluation * 0.5)
  const landInitialTax = Math.floor(landTaxBase * landTaxRate)

  // ステップ2: 住宅用土地の控除
  let landDeduction = 0
  let isLandDeductionApplied = false

  // 建物が住宅要件を満たしている場合のみ土地の控除適用
  if (isResidential && isAreaValid && buildingDeduction > 0) {
    // A: 定額法
    const deductionA = 45000

    // B: 面積按分法
    // (土地1m²あたりの評価額 / 2) × (住宅の床面積 × 2、上限200m²) × 3%
    const unitPrice = landArea > 0 ? landEvaluation / landArea : 0
    const limitArea = Math.min(floorArea * 2, 200)
    const deductionB = Math.floor((unitPrice * 0.5) * limitArea * 0.03)

    landDeduction = Math.max(deductionA, deductionB)
    isLandDeductionApplied = true
  }

  // 土地の最終税額（マイナスにならない）
  const landTax = Math.max(0, landInitialTax - landDeduction)

  // ========== 合計 ==========
  const totalTax = buildingTax + landTax

  return {
    buildingTaxBase,
    buildingDeduction,
    buildingTaxableAmount,
    buildingTax,
    buildingTaxRate,
    landTaxBase,
    landInitialTax,
    landDeduction,
    landTax,
    landTaxRate,
    totalTax,
    buildingDeductionType,
    isLandDeductionApplied
  }
}
