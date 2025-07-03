/**
 * バリデーション関連のユーティリティ関数
 */

/**
 * URLの形式が正しいかをバリデーションする
 * @param url 検証するURL文字列
 * @returns エラーメッセージまたはnull（エラーなし）
 */
export const validatePropertyUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    new URL(url);
    return null; // エラーなし
  } catch {
    return 'URLの形式が正しくありません';
  }
};