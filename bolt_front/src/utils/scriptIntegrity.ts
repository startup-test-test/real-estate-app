/**
 * SEC-067: 外部スクリプトの整合性チェック
 * SubResource Integrity (SRI) を使用して外部スクリプトの改ざんを防ぐ
 */

interface ScriptConfig {
  src: string;
  integrity?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 信頼できるCDNのホワイトリスト
 */
const TRUSTED_CDNS = [
  'https://cdn.jsdelivr.net',
  'https://unpkg.com',
  'https://cdnjs.cloudflare.com',
  'https://code.jquery.com',
  'https://maxcdn.bootstrapcdn.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

/**
 * URLが信頼できるCDNからのものかチェック
 */
function isTrustedCDN(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return TRUSTED_CDNS.some(cdn => urlObj.origin === cdn || urlObj.origin.startsWith(cdn));
  } catch {
    return false;
  }
}

/**
 * SRIハッシュを検証
 */
function validateIntegrity(integrity: string): boolean {
  // SRIハッシュの形式をチェック (sha256-, sha384-, sha512-)
  const sriPattern = /^(sha256|sha384|sha512)-[A-Za-z0-9+/]+=*$/;
  const hashes = integrity.split(' ');
  return hashes.every(hash => sriPattern.test(hash));
}

/**
 * 安全に外部スクリプトを読み込む
 * @param config スクリプト設定
 * @returns Promise<void>
 */
export async function loadExternalScript(config: ScriptConfig): Promise<void> {
  const { src, integrity, crossOrigin = 'anonymous', async = true, defer = false, onLoad, onError } = config;

  // URLの検証
  if (!src || typeof src !== 'string') {
    throw new Error('スクリプトのURLが無効です');
  }

  // プロトコルのチェック
  if (!src.startsWith('https://')) {
    throw new Error('HTTPSプロトコルのみ許可されています');
  }

  // 信頼できるCDNかチェック
  if (!isTrustedCDN(src)) {
    console.warn(`警告: ${src} は信頼できるCDNのリストに含まれていません`);
  }

  // SRIが提供されていない場合は警告
  if (!integrity) {
    console.warn(`警告: ${src} にはintegrity属性が設定されていません。改ざんのリスクがあります。`);
  } else if (!validateIntegrity(integrity)) {
    throw new Error('無効なintegrity属性です');
  }

  // 既に読み込まれているかチェック
  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript) {
    console.log(`スクリプト ${src} は既に読み込まれています`);
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    // SRIの設定
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = crossOrigin;
    }

    // イベントハンドラ
    script.onload = () => {
      console.log(`スクリプト ${src} が正常に読み込まれました`);
      onLoad?.();
      resolve();
    };

    script.onerror = () => {
      const error = new Error(`スクリプト ${src} の読み込みに失敗しました`);
      console.error(error);
      onError?.(error);
      reject(error);
    };

    // CSPヘッダーが設定されているか確認（開発環境のみ）
    if (import.meta.env.DEV) {
      checkCSPHeaders();
    }

    document.head.appendChild(script);
  });
}

/**
 * Content Security Policy (CSP) ヘッダーの確認
 */
function checkCSPHeaders(): void {
  // メタタグでCSPが設定されているかチェック
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    console.warn('CSPヘッダーが設定されていません。セキュリティリスクがあります。');
  }
}

/**
 * 複数のスクリプトを順番に読み込む
 * @param configs スクリプト設定の配列
 */
export async function loadExternalScripts(configs: ScriptConfig[]): Promise<void> {
  for (const config of configs) {
    try {
      await loadExternalScript(config);
    } catch (error) {
      console.error(`スクリプト ${config.src} の読み込みに失敗しました:`, error);
      throw error;
    }
  }
}

/**
 * スタイルシートを安全に読み込む
 * @param href スタイルシートのURL
 * @param integrity SRIハッシュ（オプション）
 */
export function loadExternalStylesheet(href: string, integrity?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // URLの検証
    if (!href.startsWith('https://')) {
      reject(new Error('HTTPSプロトコルのみ許可されています'));
      return;
    }

    // 既に読み込まれているかチェック
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      console.log(`スタイルシート ${href} は既に読み込まれています`);
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    
    if (integrity) {
      link.integrity = integrity;
      link.crossOrigin = 'anonymous';
    }

    link.onload = () => {
      console.log(`スタイルシート ${href} が正常に読み込まれました`);
      resolve();
    };

    link.onerror = () => {
      const error = new Error(`スタイルシート ${href} の読み込みに失敗しました`);
      console.error(error);
      reject(error);
    };

    document.head.appendChild(link);
  });
}

/**
 * CSPメタタグを動的に追加
 * @param policy CSPポリシー文字列
 */
export function setCSPPolicy(policy: string): void {
  // 既存のCSPメタタグを削除
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }

  // 新しいCSPメタタグを追加
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = policy;
  document.head.appendChild(meta);
}

/**
 * 推奨CSPポリシーを取得
 */
export function getRecommendedCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.supabase.co https://api.openai.com wss://*.supabase.co",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests"
  ].join('; ');
}