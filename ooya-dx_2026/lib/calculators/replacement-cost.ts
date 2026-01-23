/**
 * 再調達価格（再調達原価）シミュレーター
 * 国土交通省「建築着工統計」の標準建築価額表を参考にした建物評価
 */

// =================================================================
// 型定義
// =================================================================
export type BuildingStructure = 'wood' | 'steel' | 'rc' | 'src'
export type BuildingUsage = 'residential' | 'office' | 'restaurant' | 'retail' | 'hotel'

export interface StructureConfig {
  value: BuildingStructure
  label: string
  usefulLife: number
}

export interface UsageConfig {
  value: BuildingUsage
  label: string
}

export interface ReplacementCostResult {
  unitPrice: number         // 建築単価（円/㎡）
  replacementCost: number   // 再調達価格（円）
  remainingLife: number     // 残存耐用年数（年）
  residualRate: number  // 残価率（0〜1）
  assessedValue: number     // 建物積算評価（円）
  usefulLife: number        // 法定耐用年数
}

// =================================================================
// 定数
// =================================================================

// 建物構造オプション
export const STRUCTURE_OPTIONS: StructureConfig[] = [
  { value: 'wood', label: '木造', usefulLife: 22 },
  { value: 'steel', label: '鉄骨造（S造）', usefulLife: 34 },
  { value: 'rc', label: '鉄筋コンクリート造（RC造）', usefulLife: 47 },
  { value: 'src', label: '鉄骨鉄筋コンクリート造（SRC造）', usefulLife: 47 },
]

// 建物用途オプション
export const USAGE_OPTIONS: UsageConfig[] = [
  { value: 'residential', label: '住宅用' },
  { value: 'office', label: '事務所用' },
  { value: 'restaurant', label: '飲食店用' },
  { value: 'retail', label: '店舗用' },
  { value: 'hotel', label: '旅館・ホテル用' },
]

// 標準建築価額表（円/㎡）
// 国土交通省「建築着工統計」令和5年度を参考
// 構造×用途の組み合わせで単価を設定
export const UNIT_PRICE_TABLE: Record<BuildingStructure, Record<BuildingUsage, number>> = {
  wood: {
    residential: 175000,   // 木造住宅
    office: 185000,        // 木造事務所
    restaurant: 195000,    // 木造飲食店
    retail: 180000,        // 木造店舗
    hotel: 210000,         // 木造旅館
  },
  steel: {
    residential: 220000,   // 鉄骨造住宅
    office: 250000,        // 鉄骨造事務所
    restaurant: 270000,    // 鉄骨造飲食店
    retail: 240000,        // 鉄骨造店舗
    hotel: 290000,         // 鉄骨造旅館
  },
  rc: {
    residential: 260000,   // RC造住宅
    office: 300000,        // RC造事務所
    restaurant: 320000,    // RC造飲食店
    retail: 280000,        // RC造店舗
    hotel: 350000,         // RC造旅館
  },
  src: {
    residential: 290000,   // SRC造住宅
    office: 340000,        // SRC造事務所
    restaurant: 360000,    // SRC造飲食店
    retail: 310000,        // SRC造店舗
    hotel: 390000,         // SRC造旅館
  },
}

// 法定耐用年数マップ
export const USEFUL_LIFE_MAP: Record<BuildingStructure, number> = {
  wood: 22,
  steel: 34,
  rc: 47,
  src: 47,
}

// =================================================================
// 計算関数
// =================================================================

/**
 * 再調達価格・建物積算評価を計算
 */
export function calculateReplacementCost(
  floorArea: number,        // 延床面積（㎡）
  buildingAge: number,      // 築年数
  structure: BuildingStructure,
  usage: BuildingUsage
): ReplacementCostResult | null {
  if (floorArea <= 0) {
    return null
  }

  // 建築単価を取得
  const unitPrice = UNIT_PRICE_TABLE[structure][usage]

  // 法定耐用年数を取得
  const usefulLife = USEFUL_LIFE_MAP[structure]

  // 再調達価格 = 建築単価 × 延床面積
  const replacementCost = Math.round(unitPrice * floorArea)

  // 残存耐用年数（0以上）
  const remainingLife = Math.max(0, usefulLife - buildingAge)

  // 残価率（残存価値率）
  const residualRate = usefulLife > 0 ? remainingLife / usefulLife : 0

  // 建物積算評価 = 再調達価格 × 残価率
  const assessedValue = Math.round(replacementCost * residualRate)

  return {
    unitPrice,
    replacementCost,
    remainingLife,
    residualRate,
    assessedValue,
    usefulLife,
  }
}

/**
 * 構造情報を取得
 */
export function getStructureConfig(structure: BuildingStructure): StructureConfig {
  return STRUCTURE_OPTIONS.find(s => s.value === structure) || STRUCTURE_OPTIONS[0]
}

/**
 * 用途情報を取得
 */
export function getUsageConfig(usage: BuildingUsage): UsageConfig {
  return USAGE_OPTIONS.find(u => u.value === usage) || USAGE_OPTIONS[0]
}
