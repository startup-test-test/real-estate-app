/**
 * セキュリティユーティリティ関数
 */

/**
 * URLをサニタイズして安全にする
 * @param url - サニタイズするURL
 * @returns サニタイズ済みのURL（危険な場合は'#'）
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  // 空またはnullの場合
  if (!url) return '#';
  
  // 文字列に変換
  const urlString = String(url).trim();
  
  // 危険なプロトコルをチェック（javascript:, data:, vbscript: など）
  const dangerousProtocols = /^(javascript|data|vbscript|file|about|chrome):/i;
  if (dangerousProtocols.test(urlString)) {
    console.warn('Potentially dangerous URL blocked:', urlString);
    return '#';
  }
  
  // 相対URLまたは安全なプロトコル（http/https）の場合はそのまま返す
  return urlString;
};

/**
 * 画像URLをサニタイズして安全にする
 * @param imageUrl - サニタイズする画像URL
 * @param defaultImage - デフォルト画像のURL
 * @returns サニタイズ済みの画像URL
 */
export const sanitizeImageUrl = (
  imageUrl: string | undefined | null,
  defaultImage: string = 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400'
): string => {
  // 空またはnullの場合はデフォルト画像
  if (!imageUrl) return defaultImage;
  
  // 文字列に変換
  const urlString = String(imageUrl).trim();
  
  // 危険なプロトコルをチェック
  const dangerousProtocols = /^(javascript|data|vbscript|file|about|chrome):/i;
  if (dangerousProtocols.test(urlString)) {
    console.warn('Potentially dangerous image URL blocked:', urlString);
    return defaultImage;
  }
  
  // HTTPSまたはHTTPで始まる場合、または相対パスの場合は許可
  const validImageUrl = /^(https?:\/\/|\/)/i;
  if (validImageUrl.test(urlString) || !urlString.includes(':')) {
    return urlString;
  }
  
  // その他の場合はデフォルト画像
  return defaultImage;
};

/**
 * テキストをサニタイズしてHTMLタグを無効化
 * @param text - サニタイズするテキスト
 * @returns サニタイズ済みのテキスト
 */
export const sanitizeText = (text: string | undefined | null): string => {
  if (!text) return '';
  
  // HTMLエンティティをエスケープ
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};