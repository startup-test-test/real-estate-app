/**
 * 日付・時刻関連のユーティリティ関数
 */

/**
 * データベースの日時文字列を日本時間として正しく扱う
 * @param dateString - データベースからの日時文字列
 * @returns Date オブジェクト
 */
export const parseJSTDate = (dateString: string): Date => {
  // データベースがJSTで保存されているため、そのまま日本時間として扱う
  // "2024-01-01 15:00:00" → 日本時間の15時として解釈
  return new Date(dateString + ' GMT+0900');
};

/**
 * 日時を日本語形式で表示
 * @param date - Dateオブジェクトまたは日時文字列
 * @returns フォーマットされた日時文字列
 */
export const formatJSTDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseJSTDate(date) : date;
  
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo'
  });
};

/**
 * 相対的な時間表示（例：3分前、2時間前）
 * @param date - Dateオブジェクトまたは日時文字列
 * @returns 相対的な時間文字列
 */
export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseJSTDate(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  
  return formatJSTDate(d);
};