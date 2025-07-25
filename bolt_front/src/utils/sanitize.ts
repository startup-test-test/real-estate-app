/**
 * テキスト入力のサニタイゼーションユーティリティ（SEC-015対応）
 */

/**
 * HTMLエンティティをエスケープする
 * @param text エスケープするテキスト
 * @returns エスケープされたテキスト
 */
export const escapeHtml = (text: string): string => {
  if (!text) return '';
  
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, char => htmlEscapeMap[char]);
};

/**
 * 物件名・住所などの入力値をサニタイズする（SEC-012強化版）
 * @param input サニタイズする入力値
 * @returns サニタイズされた入力値
 */
export const sanitizePropertyInput = (input: string): string => {
  if (!input) return '';
  
  // SEC-012: より厳密なXSS対策
  let sanitized = input
    // HTMLエンティティをデコード（攻撃を検出するため）
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#(\d+);/gi, (match, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/gi, (match, code) => String.fromCharCode(parseInt(code, 16)));
  
  // 危険なパターンを除去
  sanitized = sanitized
    // スクリプトタグを除去（大文字小文字、空白を考慮）
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    // イベントハンドラを除去（より包括的）
    .replace(/\s*on\w+\s*=\s*["']?[^"'>]*["']?/gi, '')
    // 危険なタグを除去（開始タグと終了タグ両方）
    .replace(/<\s*(iframe|object|embed|link|style|base|form|meta|img|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    // 自己完結型の危険なタグも除去
    .replace(/<\s*(img|input|source|track|area|br|col|hr|param|meta|link|svg)\s*[^>]*\/?>/gi, '')
    // HTMLコメントを除去
    .replace(/<!--[\s\S]*?-->/g, '')
    // 危険なプロトコルを除去（より広範囲）
    .replace(/(javascript|vbscript|data|file|ftp|blob):/gi, '')
    // Unicode制御文字を除去
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '')
    // NULL文字を確実に除去
    .replace(/\0/g, '')
    // エスケープシーケンスを除去
    .replace(/\\x[0-9a-fA-F]{2}/g, '')
    .replace(/\\u[0-9a-fA-F]{4}/g, '');
  
  // 残りのHTMLタグを除去（より厳密に）
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // 連続する空白を1つにする
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // SEC-012: 最大文字数を制限（物件名・住所として妥当な長さ）
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * メモ・コメントなどの長文入力をサニタイズする
 * @param text サニタイズするテキスト
 * @param maxLength 最大文字数（デフォルト: 1000）
 * @returns サニタイズされたテキスト
 */
export const sanitizeLongText = (text: string, maxLength: number = 1000): string => {
  if (!text) return '';
  
  // 危険な文字列パターンを除去（改行は保持）
  let sanitized = text
    // スクリプトタグを除去
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // イベントハンドラを除去
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // 危険なタグを除去
    .replace(/<(iframe|object|embed|link|style|base|form)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // HTMLコメントを除去
    .replace(/<!--[\s\S]*?-->/g, '')
    // 制御文字を除去（改行は除く）
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // 残りのHTMLタグを除去
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  // 連続する改行を2つまでに制限
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  // 最大文字数を制限
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
};

/**
 * 表示時に安全にHTMLエスケープする
 * @param text エスケープするテキスト
 * @returns エスケープされたテキスト
 */
export const displaySafeText = (text: string): string => {
  return escapeHtml(text);
};