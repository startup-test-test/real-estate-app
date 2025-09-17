/**
 * マスターデータ定数
 */

// 物件ステータス選択肢
export const propertyStatusOptions = [
  { value: '検討中', label: '🔍 検討中' },
  { value: '内見予定', label: '👀 内見予定' },
  { value: '申込検討', label: '📝 申込検討' },
  { value: '契約手続中', label: '📋 契約手続中' },
  { value: '取得済み', label: '🏠 取得済み' },
  { value: '売却済み', label: '💰 売却済み' },
  { value: '見送り', label: '❌ 見送り' },
  { value: '保留', label: '⏸️ 保留' }
];

// 融資タイプ選択肢
export const loanTypeOptions = [
  { value: '元利均等', label: '元利均等' },
  { value: '元金均等', label: '元金均等' }
];

// 所有形態選択肢
export const ownershipTypeOptions = [
  { value: '個人', label: '個人' },
  { value: '法人', label: '法人' }
];

// 建物構造選択肢
export const buildingStructureOptions = [
  { value: '', label: '-- 選択してください --' },
  { value: '木造', label: '木造' },
  { value: '軽量鉄骨造', label: '軽量鉄骨造' },
  { value: '重量鉄骨造', label: '重量鉄骨造' },
  { value: 'RC造', label: 'RC造（鉄筋コンクリート造）' },
  { value: 'SRC造', label: 'SRC造（鉄骨鉄筋コンクリート造）' }
];

// 法人向け実効税率選択肢
export const corporateTaxRateOptions = [
  { value: '15', label: '15% - 中小法人（所得800万円以下）' },
  { value: '23', label: '23% - 中小法人（所得800万円超）' },
  { value: '30', label: '30% - 一般法人' },
  { value: '34', label: '34% - 大企業（地方税込み）' },
  { value: 'custom', label: 'その他（カスタム入力）' }
];

// 個人向け所得税率選択肢
export const individualTaxRateOptions = [
  { value: '5', label: '5% - 課税所得195万円以下' },
  { value: '10', label: '10% - 課税所得330万円以下' },
  { value: '20', label: '20% - 課税所得695万円以下' },
  { value: '23', label: '23% - 課税所得900万円以下' },
  { value: '33', label: '33% - 課税所得1800万円以下' },
  { value: '40', label: '40% - 課税所得4000万円以下' },
  { value: '45', label: '45% - 課税所得4000万円超' },
  { value: 'custom', label: 'その他（カスタム入力）' }
];