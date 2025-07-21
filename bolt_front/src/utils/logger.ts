/**
 * SEC-023: 機密情報のログ出力対策
 * 環境に応じてログ出力を制御するユーティリティ
 */

export interface LoggerConfig {
  enabledInProduction: boolean;
  enabledInDevelopment: boolean;
  maskSensitiveData: boolean;
}

// デフォルト設定
const defaultConfig: LoggerConfig = {
  enabledInProduction: false,
  enabledInDevelopment: true,
  maskSensitiveData: true
};

// 環境判定（動的に評価するため関数化）
const isProduction = () => import.meta.env.PROD;
const isDevelopment = () => import.meta.env.DEV;

// 機密情報のパターン
const sensitivePatterns = [
  // メールアドレス
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // JWT トークン
  /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g,
  // APIキー（一般的なパターン）
  /[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]\s*[:=]\s*["']?[A-Za-z0-9\-_]{20,}["']?/g,
  // パスワード（key-valueパターン）
  /[Pp]assword\s*[:=]\s*["']?[^"'\s]+["']?/g,
  // クレジットカード番号（簡易パターン）
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // 電話番号（日本）
  /\b0\d{1,4}-?\d{1,4}-?\d{4}\b/g,
  // URLに含まれるトークンやキー
  /[?&](token|key|secret|password|auth)=[^&\s]+/gi
];

/**
 * 機密情報をマスクする
 * @param data マスクする対象データ
 * @returns マスクされたデータ
 */
function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    let masked = data;
    sensitivePatterns.forEach(pattern => {
      masked = masked.replace(pattern, '***MASKED***');
    });
    return masked;
  }
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => maskSensitiveData(item));
    }
    
    const maskedObj: any = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'apikey', 'api_key', 'auth', 'authorization'];
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        maskedObj[key] = '***MASKED***';
      } else {
        maskedObj[key] = maskSensitiveData(value);
      }
    }
    return maskedObj;
  }
  
  return data;
}

/**
 * 安全なログ出力クラス
 */
export class SecureLogger {
  private config: LoggerConfig;
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  /**
   * ログ出力が有効かチェック
   */
  private isEnabled(): boolean {
    if (isProduction()) {
      return this.config.enabledInProduction;
    }
    if (isDevelopment()) {
      return this.config.enabledInDevelopment;
    }
    return false;
  }
  
  /**
   * データを安全に処理
   */
  private processData(...args: any[]): any[] {
    if (!this.config.maskSensitiveData) {
      return args;
    }
    return args.map(arg => maskSensitiveData(arg));
  }
  
  /**
   * console.logの安全なラッパー
   */
  log(...args: any[]): void {
    if (this.isEnabled()) {
      console.log(...this.processData(...args));
    }
  }
  
  /**
   * console.errorの安全なラッパー
   */
  error(...args: any[]): void {
    if (this.isEnabled()) {
      console.error(...this.processData(...args));
    }
  }
  
  /**
   * console.warnの安全なラッパー
   */
  warn(...args: any[]): void {
    if (this.isEnabled()) {
      console.warn(...this.processData(...args));
    }
  }
  
  /**
   * console.infoの安全なラッパー
   */
  info(...args: any[]): void {
    if (this.isEnabled()) {
      console.info(...this.processData(...args));
    }
  }
  
  /**
   * console.debugの安全なラッパー
   */
  debug(...args: any[]): void {
    if (this.isEnabled()) {
      console.debug(...this.processData(...args));
    }
  }
  
  /**
   * console.tableの安全なラッパー
   */
  table(data: any): void {
    if (this.isEnabled()) {
      console.table(this.processData(data)[0]);
    }
  }
}

// デフォルトのロガーインスタンス
export const logger = new SecureLogger();

// 既存のconsole.*を置き換えるヘルパー関数
export function replaceConsoleWithSecureLogger(): void {
  if (isProduction()) {
    // 本番環境ではconsoleメソッドを無効化
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.table = () => {};
  }
}

// グローバルエラーハンドラーで機密情報をマスク
export function setupSecureErrorHandler(): void {
  window.addEventListener('error', (event) => {
    if (isProduction()) {
      // 本番環境ではエラーの詳細を隠蔽
      // 注: preventDefault()を呼ぶとデフォルトのエラー処理も止まるため、
      // ログだけマスクして、デフォルト処理は継続させる
      logger.error('An error occurred');
    } else {
      // 開発環境では機密情報をマスクして出力
      logger.error('Error:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (isProduction()) {
      // 本番環境では詳細を隠蔽
      logger.error('An unhandled promise rejection occurred');
    } else {
      // 開発環境では機密情報をマスクして出力
      logger.error('Unhandled Promise Rejection:', event.reason);
    }
  });
}