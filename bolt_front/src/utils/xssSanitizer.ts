/**
 * SEC-012: シミュレーター入力フィールドXSS対策
 * DOMPurifyを使用した高度なXSS防御
 */

import DOMPurify from 'dompurify';

/**
 * DOMPurifyの設定オプション
 */
const SIMULATOR_INPUT_CONFIG = {
  // 許可するタグ（基本的にはテキストのみ）
  ALLOWED_TAGS: [],
  // 許可する属性（なし）
  ALLOWED_ATTR: [],
  // データURIスキームを禁止
  ALLOW_DATA_ATTR: false,
  // テキストコンテンツは保持
  KEEP_CONTENT: true,
  // 危険なタグを禁止
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 
                'meta', 'form', 'svg', 'math', 'img', 'audio', 'video'],
  // 危険な属性を禁止
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 
                'onblur', 'onchange', 'onsubmit', 'style', 'srcdoc']
};

/**
 * シミュレーター入力用のサニタイザー（物件名、住所など）
 * @param input サニタイズする入力値
 * @param maxLength 最大文字数（デフォルト: 200）
 * @returns サニタイズされた安全な文字列
 */
export const sanitizeSimulatorInput = (input: string, maxLength: number = 200): string => {
  if (!input || typeof input !== 'string') return '';
  
  // 前処理：危険なパターンを事前に除去
  let preprocessed = input
    // NULL文字と制御文字を除去
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Zero Width文字を除去
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // エスケープシーケンスを除去
    .replace(/\\x[0-9a-fA-F]{2}/g, '')
    .replace(/\\u[0-9a-fA-F]{4}/g, '')
    // 危険なプロトコルを事前に除去
    .replace(/(?:javascript|vbscript|data|file|ftp|blob):/gi, '');
  
  // DOMPurifyでサニタイズ
  let sanitized = DOMPurify.sanitize(preprocessed, SIMULATOR_INPUT_CONFIG);
  
  // 後処理：追加のクリーンアップ
  sanitized = sanitized
    // 残った不要な文字を除去
    .replace(/[<>]/g, '')
    // 連続する空白を1つにする
    .replace(/\s+/g, ' ')
    .trim();
  
  // 文字数制限
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * メモ・備考用のサニタイザー（改行を保持）
 * @param input サニタイズする入力値
 * @param maxLength 最大文字数（デフォルト: 1000）
 * @returns サニタイズされた安全な文字列
 */
export const sanitizeMemoInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // 前処理：危険なパターンを事前に除去（改行は保持）
  let preprocessed = input
    // NULL文字と制御文字を除去（改行は除く）
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Zero Width文字を除去
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // 危険なプロトコルを事前に除去
    .replace(/(?:javascript|vbscript|data|file|ftp|blob):/gi, '');
  
  // DOMPurifyでサニタイズ（改行を保持する設定）
  const memoConfig = {
    ...SIMULATOR_INPUT_CONFIG,
    KEEP_CONTENT: true,
    ALLOWED_TAGS: ['br'], // 改行タグのみ許可
  };
  
  let sanitized = DOMPurify.sanitize(preprocessed, memoConfig);
  
  // <br>タグを改行文字に変換
  sanitized = sanitized.replace(/<br\s*\/?>/gi, '\n');
  
  // 後処理
  sanitized = sanitized
    // 残った不要な文字を除去
    .replace(/[<>]/g, '')
    // 連続する改行を2つまでに制限
    .replace(/\n{3,}/g, '\n\n')
    // 各行の連続する空白を1つにする
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .trim();
  
  // 文字数制限
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * URL入力用のサニタイザー
 * @param url サニタイズするURL
 * @returns サニタイズされた安全なURL、または空文字列
 */
export const sanitizeUrlInput = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  // 危険なプロトコルをチェック
  const dangerousProtocols = /^(?:javascript|vbscript|data|file|ftp|blob):/i;
  if (dangerousProtocols.test(url.trim())) {
    return '';
  }
  
  // DOMPurifyでサニタイズ
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false
  });
  
  // URLとして妥当かチェック
  try {
    const parsed = new URL(sanitized);
    // HTTPとHTTPSのみ許可
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return sanitized;
  } catch {
    // 相対URLの場合はそのまま返す（ただし危険な文字は除去済み）
    return sanitized;
  }
};

/**
 * HTMLエスケープ（表示用）
 * @param text エスケープするテキスト
 * @returns エスケープされたHTML安全な文字列
 */
export const escapeHtmlForDisplay = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  const escapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, char => escapeMap[char]);
};

/**
 * 入力値の型とコンテキストに応じたサニタイズ
 * @param value サニタイズする値
 * @param context 入力のコンテキスト
 * @returns サニタイズされた値
 */
export const sanitizeByContext = (
  value: string, 
  context: 'property' | 'memo' | 'url' | 'display'
): string => {
  switch (context) {
    case 'property':
      return sanitizeSimulatorInput(value);
    case 'memo':
      return sanitizeMemoInput(value);
    case 'url':
      return sanitizeUrlInput(value);
    case 'display':
      return escapeHtmlForDisplay(value);
    default:
      // デフォルトは最も厳格なサニタイズ
      return sanitizeSimulatorInput(value);
  }
};