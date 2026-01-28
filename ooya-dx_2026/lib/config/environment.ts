/**
 * 環境判定ユーティリティ
 * ブラウザのホスト名から現在の実行環境を判定
 */

export enum Environment {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  CODESPACES = 'codespaces',
  LOCAL = 'local'
}

/**
 * 現在の実行環境を判定
 * @returns {Environment} 現在の環境
 */
export const getCurrentEnvironment = (): Environment => {
  // SSRチェック
  if (typeof window === 'undefined') {
    return Environment.DEVELOPMENT;
  }

  const hostname = window.location.hostname;
  
  // 本番環境
  if (hostname === 'ooya.tech' || hostname === 'www.ooya.tech') {
    return Environment.PRODUCTION;
  }
  
  // 開発環境（dev.ooya.tech）
  if (hostname === 'dev.ooya.tech') {
    return Environment.DEVELOPMENT;
  }
  
  // GitHub Codespaces
  if (hostname.includes('.app.github.dev')) {
    return Environment.CODESPACES;
  }
  
  // ローカル開発
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return Environment.LOCAL;
  }
  
  // デフォルトは開発環境として扱う
  console.warn(`Unknown hostname: ${hostname}, defaulting to development environment`);
  return Environment.DEVELOPMENT;
};

/**
 * 環境情報を取得
 * @returns 環境の詳細情報
 */
export const getEnvironmentInfo = () => {
  const env = getCurrentEnvironment();

  // SSRチェック
  if (typeof window === 'undefined') {
    return {
      environment: env,
      hostname: '',
      protocol: '',
      port: '',
      url: '',
      isProduction: env === Environment.PRODUCTION,
      isDevelopment: env === Environment.DEVELOPMENT,
      isCodespaces: env === Environment.CODESPACES,
      isLocal: env === Environment.LOCAL
    };
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  return {
    environment: env,
    hostname,
    protocol,
    port,
    url: window.location.href,
    isProduction: env === Environment.PRODUCTION,
    isDevelopment: env === Environment.DEVELOPMENT,
    isCodespaces: env === Environment.CODESPACES,
    isLocal: env === Environment.LOCAL
  };
};