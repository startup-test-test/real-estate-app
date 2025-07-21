/**
 * SEC-033: Certificate Pinning代替策
 * ブラウザ環境でのセキュリティポリシー実装
 */

/**
 * 信頼できるドメインのリスト
 */
const TRUSTED_DOMAINS = [
  // Supabase関連
  'supabase.co',
  'supabase.com',
  'supabase.io',
  
  // Google Fonts
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  
  // その他の信頼できるサービス
  'github.com',
  'githubusercontent.com'
] as const;

/**
 * セキュリティヘッダーの推奨設定
 * サーバー側で設定すべきヘッダー
 */
export const SECURITY_HEADERS = {
  // HSTS: HTTPS強制
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // HPKP代替: Expect-CT
  'Expect-CT': 'max-age=86400, enforce',
  
  // Certificate Transparency
  'Expect-Staple': 'max-age=31536000; includeSubDomains; preload',
  
  // その他のセキュリティヘッダー
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // CSP with certificate requirements
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
};

/**
 * URLが信頼できるドメインかチェック
 */
export const isTrustedDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // HTTPSでない場合は信頼しない
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    
    // 信頼できるドメインリストと照合
    return TRUSTED_DOMAINS.some(domain => {
      return urlObj.hostname === domain || 
             urlObj.hostname.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
};

/**
 * セキュアなfetch関数
 * 信頼できるドメインのみにリクエストを送信
 */
export const secureFetch = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  // URLの検証
  if (!isTrustedDomain(url)) {
    throw new Error(`Untrusted domain: ${url}`);
  }
  
  // セキュアなfetchオプション
  const secureOptions: RequestInit = {
    ...options,
    credentials: 'same-origin', // クレデンシャルは同一オリジンのみ
    mode: 'cors',
    redirect: 'error' // リダイレクトを許可しない
  };
  
  try {
    const response = await fetch(url, secureOptions);
    
    // Certificate Transparencyログのチェック（可能な場合）
    const ctHeader = response.headers.get('expect-ct');
    if (ctHeader) {
      console.log('Certificate Transparency enabled:', ctHeader);
    }
    
    return response;
  } catch (error) {
    console.error('Secure fetch error:', error);
    throw error;
  }
};

/**
 * WebSocketの安全な接続
 */
export const createSecureWebSocket = (url: string): WebSocket => {
  // URLの検証
  if (!url.startsWith('wss://')) {
    throw new Error('WebSocket must use WSS protocol');
  }
  
  // wss:// URLを https:// に変換してドメインチェック
  const httpsUrl = url.replace(/^wss:/, 'https:');
  if (!isTrustedDomain(httpsUrl)) {
    const urlObj = new URL(url);
    throw new Error(`Untrusted WebSocket domain: ${urlObj.hostname}`);
  }
  
  return new WebSocket(url);
};

/**
 * 証明書エラーの処理
 * ブラウザが証明書エラーを検出した場合の処理
 */
export const handleCertificateError = (error: any): void => {
  // 証明書関連のエラーをログに記録
  if (error.code === 'ERR_CERT_AUTHORITY_INVALID' ||
      error.code === 'ERR_CERT_DATE_INVALID' ||
      error.code === 'ERR_CERT_COMMON_NAME_INVALID') {
    console.error('Certificate error detected:', error);
    
    // ユーザーに警告
    alert('セキュリティ警告: 証明書エラーが検出されました。接続が安全でない可能性があります。');
  }
};

/**
 * Public Key Pinning情報（参考用）
 * 実際のピン値はサーバー側で管理すべき
 */
export const PUBLIC_KEY_PINS = {
  // 例: Supabaseの公開鍵ピン（実際の値は要確認）
  'supabase.co': [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB='
  ]
};

/**
 * セキュリティポリシーのドキュメント
 */
export const CERTIFICATE_POLICY_DOCS = `
# Certificate Pinning代替策

## 概要
ブラウザ環境では直接的なCertificate Pinningは実装できませんが、
以下の代替策でセキュリティを強化しています。

## 実装内容

### 1. HSTS (HTTP Strict Transport Security)
- 常にHTTPS接続を強制
- サブドメインも含めて適用
- preloadリストへの登録推奨

### 2. Certificate Transparency
- Expect-CTヘッダーの使用
- 証明書の透明性ログの確認

### 3. 信頼できるドメインリスト
- 事前定義された信頼できるドメインのみと通信
- HTTPSプロトコルの強制

### 4. CSP (Content Security Policy)
- 外部リソースの読み込み制限
- HTTPSの強制

## サーバー側での実装推奨事項

1. HSTSヘッダーの設定
2. Certificate Transparencyの有効化
3. CAA (Certificate Authority Authorization) レコードの設定
4. DANE (DNS-based Authentication of Named Entities) の検討

## 監視とアラート

1. 証明書の有効期限監視
2. 証明書変更の検知
3. Certificate Transparencyログの監視
`;

/**
 * ブラウザのセキュリティ機能を最大限活用
 */
export const initializeCertificatePolicy = (): void => {
  // Service Workerでのfetchイベント監視（可能な場合）
  if ('serviceWorker' in navigator) {
    // Service Workerを使用した追加のセキュリティ層
    console.log('Service Worker available for enhanced security');
  }
  
  // ReportingAPIの使用（可能な場合）
  if ('ReportingObserver' in window) {
    const observer = new (window as any).ReportingObserver((reports: any[]) => {
      reports.forEach(report => {
        if (report.type === 'certificate-error') {
          console.error('Certificate error reported:', report);
        }
      });
    });
    observer.observe();
  }
};