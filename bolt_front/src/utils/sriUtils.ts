/**
 * SEC-032: Subresource Integrity (SRI) ユーティリティ
 * 外部リソースの整合性を検証するためのヘルパー関数
 */

/**
 * 外部リソース用のlink要素を安全に作成
 */
export const createSecureLink = (
  href: string,
  options: {
    rel?: string;
    type?: string;
    crossorigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
  } = {}
): HTMLLinkElement => {
  const link = document.createElement('link');
  link.href = href;
  
  // デフォルト値を設定
  link.rel = options.rel || 'stylesheet';
  link.crossOrigin = options.crossorigin || 'anonymous';
  
  if (options.type) {
    link.type = options.type;
  }
  
  if (options.integrity) {
    link.integrity = options.integrity;
  }
  
  return link;
};

/**
 * Google Fonts用の安全な読み込み
 * 注意: Google Fontsは動的にCSSを生成するため、完全なSRIは使用できない
 * 代わりにCSPとCORSで保護
 */
export const loadGoogleFonts = (fontFamily: string, weights: string[] = ['400', '500', '600', '700']): void => {
  // 既存のGoogle Fontsリンクをチェック
  const existingLink = document.querySelector(`link[href*="fonts.googleapis.com"][href*="${fontFamily.replace(/\s+/g, '+')}"]`);
  if (existingLink) {
    return;
  }
  
  // preconnectが既に存在するかチェック
  if (!document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]')) {
    const preconnect1 = createSecureLink('https://fonts.googleapis.com', {
      rel: 'preconnect'
    });
    document.head.appendChild(preconnect1);
  }
  
  if (!document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')) {
    const preconnect2 = createSecureLink('https://fonts.gstatic.com', {
      rel: 'preconnect',
      crossorigin: 'anonymous'
    });
    document.head.appendChild(preconnect2);
  }
  
  // フォントCSS読み込み
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${weights.join(';')}&display=swap`;
  const fontLink = createSecureLink(fontUrl);
  document.head.appendChild(fontLink);
};

/**
 * 外部スクリプト用のscript要素を安全に作成
 */
export const createSecureScript = (
  src: string,
  options: {
    async?: boolean;
    defer?: boolean;
    crossorigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
    nonce?: string;
  } = {}
): HTMLScriptElement => {
  const script = document.createElement('script');
  script.src = src;
  
  // デフォルト値を設定
  script.crossOrigin = options.crossorigin || 'anonymous';
  
  if (options.async) {
    script.async = true;
  }
  
  if (options.defer) {
    script.defer = true;
  }
  
  if (options.integrity) {
    script.integrity = options.integrity;
  }
  
  if (options.nonce) {
    script.nonce = options.nonce;
  }
  
  return script;
};

/**
 * インラインスタイルを安全に作成
 * Google Fontsのような動的CSSの代替として使用
 */
export const createSecureInlineStyle = (css: string, nonce?: string): HTMLStyleElement => {
  const style = document.createElement('style');
  style.textContent = css;
  
  if (nonce) {
    style.nonce = nonce;
  }
  
  return style;
};

/**
 * フォントファイルの直接読み込み（SRI対応）
 * ローカルホストされたフォントファイル用
 */
export const loadFontWithSRI = (
  fontName: string,
  fontUrl: string,
  _integrity: string, // 将来的にSRIをサポートするためのパラメータ
  fontWeight: string | number = 400
): void => {
  const css = `
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}');
      font-weight: ${fontWeight};
      font-display: swap;
    }
  `;
  
  const style = createSecureInlineStyle(css);
  document.head.appendChild(style);
};

/**
 * セキュリティヘッダーの推奨設定
 */
export const RECOMMENDED_CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self'",
    "img-src 'self' data: https:",
    "connect-src 'self'"
  ].join('; ')
};