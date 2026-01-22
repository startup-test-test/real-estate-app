/**
 * キャップレート（還元利回り）計算ロジック
 *
 * キャップレート = NOI ÷ 物件価格 × 100
 * 物件価格の逆算 = NOI ÷ キャップレート
 */

// 計算結果の型定義
export interface CapRateResult {
  capRate: number           // キャップレート（%）
  propertyPriceInMan: number // 物件価格（万円）
  noiInMan: number          // NOI（万円）
  monthlyNoiInMan: number   // 月額NOI（万円）
}

// 逆算結果の型定義
export interface ReverseCapRateResult {
  propertyPriceInMan: number // 物件価格（万円）
  noiInMan: number          // NOI（万円）
  capRate: number           // 想定キャップレート（%）
}

// 地域別キャップレート相場データ（2025年時点）
export interface RegionalCapRate {
  region: string
  propertyType: string
  rate: number
  trend: 'up' | 'down' | 'flat'
  note: string
}

// 地域別キャップレート相場（日本不動産研究所 2025年4月データベース）
export const regionalCapRates: RegionalCapRate[] = [
  // 東京（城南）
  { region: '東京（城南）', propertyType: 'ワンルーム', rate: 3.7, trend: 'down', note: '目黒・世田谷等。過去最低水準' },
  { region: '東京（城南）', propertyType: 'ファミリー', rate: 3.8, trend: 'flat', note: '実需との競合あり' },
  // 東京（城東）
  { region: '東京（城東）', propertyType: 'ワンルーム', rate: 3.9, trend: 'flat', note: '墨田・江東エリア' },
  // 横浜
  { region: '横浜', propertyType: 'ファミリー', rate: 4.3, trend: 'down', note: '賃貸需要が底堅い' },
  // 大阪
  { region: '大阪', propertyType: 'ワンルーム', rate: 4.5, trend: 'flat', note: '万博後の需給に注視' },
  { region: '大阪', propertyType: 'ファミリー', rate: 4.5, trend: 'flat', note: '' },
  // 名古屋
  { region: '名古屋', propertyType: 'ワンルーム', rate: 4.3, trend: 'down', note: 'リニア期待あり' },
  { region: '名古屋', propertyType: 'ファミリー', rate: 4.6, trend: 'down', note: '' },
  // 福岡
  { region: '福岡', propertyType: 'ワンルーム', rate: 4.5, trend: 'flat', note: '人口増加都市として人気' },
  { region: '福岡', propertyType: 'ファミリー', rate: 4.9, trend: 'flat', note: '' },
  // 札幌
  { region: '札幌', propertyType: 'ワンルーム', rate: 5.0, trend: 'flat', note: '積雪リスク織り込み' },
  { region: '札幌', propertyType: 'ファミリー', rate: 5.3, trend: 'flat', note: '' },
  // 仙台
  { region: '仙台', propertyType: 'ワンルーム', rate: 5.0, trend: 'flat', note: '' },
  { region: '仙台', propertyType: 'ファミリー', rate: 5.3, trend: 'flat', note: '' },
]

// 物件タイプ別の経費率目安（簡易計算用）
export const propertyTypeOpexRates: { [key: string]: { min: number; max: number; typical: number } } = {
  'condo-new': { min: 15, max: 20, typical: 18 },
  'condo-used': { min: 20, max: 25, typical: 22 },
  'apartment-rc': { min: 20, max: 25, typical: 22 },
  'apartment-wood': { min: 25, max: 30, typical: 27 },
  'commercial': { min: 30, max: 40, typical: 35 },
}

/**
 * キャップレートを計算
 * @param noiInMan NOI（万円/年）
 * @param propertyPriceInMan 物件価格（万円）
 * @returns 計算結果
 */
export function calculateCapRate(
  noiInMan: number,
  propertyPriceInMan: number
): CapRateResult | null {
  if (noiInMan <= 0 || propertyPriceInMan <= 0) {
    return null
  }

  const capRate = (noiInMan / propertyPriceInMan) * 100
  const monthlyNoiInMan = Math.round(noiInMan / 12 * 10) / 10

  return {
    capRate: Math.round(capRate * 100) / 100,
    propertyPriceInMan,
    noiInMan,
    monthlyNoiInMan,
  }
}

/**
 * 物件価格を逆算
 * @param noiInMan NOI（万円/年）
 * @param targetCapRate 想定キャップレート（%）
 * @returns 逆算結果
 */
export function calculatePropertyPrice(
  noiInMan: number,
  targetCapRate: number
): ReverseCapRateResult | null {
  if (noiInMan <= 0 || targetCapRate <= 0) {
    return null
  }

  const propertyPriceInMan = Math.round(noiInMan / (targetCapRate / 100))

  return {
    propertyPriceInMan,
    noiInMan,
    capRate: targetCapRate,
  }
}

/**
 * 表面利回りからNOIを概算（簡易計算用）
 * @param grossYield 表面利回り（%）
 * @param propertyPriceInMan 物件価格（万円）
 * @param opexRate 経費率（%）- デフォルト20%
 * @param vacancyRate 空室率（%）- デフォルト5%
 * @returns 概算NOI（万円/年）
 */
export function estimateNoiFromGrossYield(
  grossYield: number,
  propertyPriceInMan: number,
  opexRate: number = 20,
  vacancyRate: number = 5
): number {
  const annualRentInMan = propertyPriceInMan * (grossYield / 100)
  const effectiveRentInMan = annualRentInMan * (1 - vacancyRate / 100)
  const noiInMan = effectiveRentInMan * (1 - opexRate / 100)
  return Math.round(noiInMan * 10) / 10
}

/**
 * イールドギャップを計算
 * @param capRate キャップレート（%）
 * @param interestRate 借入金利（%）
 * @returns イールドギャップ（%）
 */
export function calculateYieldGap(
  capRate: number,
  interestRate: number
): { yieldGap: number; isNegativeLeverage: boolean; riskLevel: 'safe' | 'caution' | 'warning' } {
  const yieldGap = capRate - interestRate
  const isNegativeLeverage = yieldGap < 0

  let riskLevel: 'safe' | 'caution' | 'warning' = 'safe'
  if (yieldGap < 0) {
    riskLevel = 'warning'
  } else if (yieldGap < 1.5) {
    riskLevel = 'caution'
  }

  return {
    yieldGap: Math.round(yieldGap * 100) / 100,
    isNegativeLeverage,
    riskLevel,
  }
}

/**
 * 地域別キャップレートを取得
 * @param region 地域名
 * @param propertyType 物件タイプ（オプション）
 * @returns 該当するキャップレート一覧
 */
export function getRegionalCapRates(
  region?: string,
  propertyType?: string
): RegionalCapRate[] {
  let filtered = regionalCapRates

  if (region) {
    filtered = filtered.filter(r => r.region === region)
  }
  if (propertyType) {
    filtered = filtered.filter(r => r.propertyType === propertyType)
  }

  return filtered
}

/**
 * 物件価格の妥当性を評価
 * @param actualPriceInMan 実際の物件価格（万円）
 * @param noiInMan NOI（万円/年）
 * @param marketCapRate 市場の標準キャップレート（%）
 * @returns 評価結果
 */
export function evaluatePropertyValue(
  actualPriceInMan: number,
  noiInMan: number,
  marketCapRate: number
): {
  theoreticalPriceInMan: number
  differenceInMan: number
  differencePercent: number
  evaluation: 'cheap' | 'fair' | 'expensive'
} {
  const theoreticalPriceInMan = Math.round(noiInMan / (marketCapRate / 100))
  const differenceInMan = actualPriceInMan - theoreticalPriceInMan
  const differencePercent = Math.round((differenceInMan / theoreticalPriceInMan) * 100 * 10) / 10

  let evaluation: 'cheap' | 'fair' | 'expensive' = 'fair'
  if (differencePercent < -5) {
    evaluation = 'cheap'
  } else if (differencePercent > 5) {
    evaluation = 'expensive'
  }

  return {
    theoreticalPriceInMan,
    differenceInMan,
    differencePercent,
    evaluation,
  }
}
