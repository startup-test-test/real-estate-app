/**
 * SEC-028: 外部URL検証不備対策
 * オープンリダイレクト攻撃を防ぐためのURL検証機能
 */

/**
 * 許可されたドメインのリスト
 */
const ALLOWED_DOMAINS = [
  // 本番環境
  'ooya-dx.com',
  'www.ooya-dx.com',
  
  // 開発環境
  'localhost',
  '127.0.0.1',
  
  // GitHub Codespaces
  '.app.github.dev',
  '.preview.app.github.dev',
  
  // Vercel プレビュー
  '.vercel.app',
  
  // Render.com
  '.onrender.com',
];

/**
 * 許可された相対パスのパターン
 */
const ALLOWED_PATH_PATTERNS = [
  /^\/$/,                    // ホーム
  /^\/dashboard\/?$/,        // ダッシュボード
  /^\/simulator\/?$/,        // シミュレーター
  /^\/share\/[a-zA-Z0-9-]+$/,  // 共有ビュー
  /^\/collaboration\/[a-zA-Z0-9-]+$/, // コラボレーション
  /^\/login\/?$/,            // ログイン
  /^\/signup\/?$/,           // サインアップ
  /^\/reset-password\/?$/,   // パスワードリセット
  /^\/terms\/?$/,            // 利用規約
  /^\/privacy\/?$/,          // プライバシーポリシー
  /^\/user-guide\/?$/,       // ユーザーガイド
  /^\/faq\/?$/,              // FAQ
  /^\/premium\/?$/,          // プレミアムプラン
  /^\/email-confirmed\/?$/,  // メール確認
  /^\/market-analysis\/?$/,  // 市場分析
  /^\/transaction-search\/?$/, // 取引検索
];

/**
 * URLが安全かどうかを検証
 */
export const isValidRedirectUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }

  try {
    // 相対URLの場合
    if (url.startsWith('/') && !url.startsWith('//')) {
      // パスのみを検証
      const path = url.split('?')[0].split('#')[0];
      return ALLOWED_PATH_PATTERNS.some(pattern => pattern.test(path));
    }

    // 絶対URLの場合
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      
      // プロトコルをチェック
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }
      
      // ホスト名をチェック
      const hostname = urlObj.hostname.toLowerCase();
      
      // 完全一致または部分一致でチェック
      return ALLOWED_DOMAINS.some(domain => {
        if (domain.startsWith('.')) {
          // サブドメインを含む場合（例：.app.github.dev）
          return hostname.endsWith(domain) || hostname === domain.substring(1);
        } else {
          // 完全一致
          return hostname === domain;
        }
      });
    }

    // その他のプロトコル（javascript:, data:, etc）は拒否
    return false;
  } catch (error) {
    // URL解析エラーの場合は安全でないとみなす
    console.error('URL validation error:', error);
    return false;
  }
};

/**
 * 安全なリダイレクトURLを取得
 * 検証に失敗した場合はデフォルトURLを返す
 */
export const getSafeRedirectUrl = (
  url: string | null | undefined,
  defaultUrl: string = '/'
): string => {
  if (!url) {
    return defaultUrl;
  }

  // URLデコード（エンコードされている場合）
  const decodedUrl = decodeURIComponent(url);
  
  // 検証
  if (isValidRedirectUrl(decodedUrl)) {
    return decodedUrl;
  }
  
  console.warn('Unsafe redirect URL detected:', url);
  return defaultUrl;
};

/**
 * 現在のオリジンを取得（テスト可能な形で）
 */
export const getCurrentOrigin = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

/**
 * URLが現在のオリジンと同じかどうかをチェック
 */
export const isSameOrigin = (url: string): boolean => {
  try {
    // 相対URLの場合は常に同一オリジン
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }
    
    // 絶対URLの場合のみチェック
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      const currentOrigin = getCurrentOrigin();
      return urlObj.origin === currentOrigin;
    }
    
    // その他の場合（不正なURL等）
    return false;
  } catch {
    return false;
  }
};

/**
 * 安全なwindow.location.href設定
 */
export const safeWindowLocationAssign = (url: string): void => {
  const safeUrl = getSafeRedirectUrl(url);
  
  // getSafeRedirectUrlが危険なURLを既に除外しているが、
  // 絶対URLの場合は念のため同一オリジンチェックも行う
  if (safeUrl.startsWith('http://') || safeUrl.startsWith('https://')) {
    if (!isSameOrigin(safeUrl)) {
      console.warn('Cross-origin redirect blocked:', safeUrl);
      window.location.href = '/';
      return;
    }
  }
  
  window.location.href = safeUrl;
};

/**
 * URLパラメータから安全にリダイレクトURLを取得
 */
export const getRedirectUrlFromParams = (
  searchParams: URLSearchParams
): string | null => {
  // 複数の可能なパラメータ名をチェック
  const possibleParams = ['redirect', 'return', 'returnUrl', 'next'];
  
  for (const param of possibleParams) {
    const url = searchParams.get(param);
    if (url && isValidRedirectUrl(url)) {
      return url;
    }
  }
  
  return null;
};

/**
 * 危険なプロトコルをチェック
 */
export const hasDangerousProtocol = (url: string): boolean => {
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
    'chrome:',
    'chrome-extension:',
  ];
  
  const lowerUrl = url.toLowerCase().trim();
  return dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol));
};