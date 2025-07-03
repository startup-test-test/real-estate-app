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