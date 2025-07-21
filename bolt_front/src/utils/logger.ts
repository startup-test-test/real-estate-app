/**
 * SEC-023/SEC-008: 機密情報のログ出力対策・デバッグ情報の漏洩対策
 * 環境に応じてログ出力を制御するユーティリティ
 * ログレベル管理とフィルタリング機能を追加
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  LOG = 3,
  DEBUG = 4
}

export interface LoggerConfig {
  enabledInProduction: boolean;
  enabledInDevelopment: boolean;
  maskSensitiveData: boolean;
  logLevel: LogLevel;
  // 特定のカテゴリのログを有効/無効にする
  enabledCategories?: string[];
  disabledCategories?: string[];
  // ログをバッファリングして一括出力
  bufferLogs?: boolean;
  maxBufferSize?: number;
}

// デフォルト設定
const defaultConfig: LoggerConfig = {
  enabledInProduction: false,
  enabledInDevelopment: true,
  maskSensitiveData: true,
  logLevel: import.meta.env.PROD ? LogLevel.ERROR : LogLevel.DEBUG,
  bufferLogs: false,
  maxBufferSize: 100
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
  private logBuffer: Array<{ level: LogLevel; category?: string; args: any[] }> = [];
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  /**
   * ログレベルをチェック
   */
  private checkLogLevel(level: LogLevel): boolean {
    return level <= this.config.logLevel;
  }
  
  /**
   * カテゴリが有効かチェック
   */
  private isCategoryEnabled(category?: string): boolean {
    if (!category) return true;
    
    // 無効カテゴリに含まれている場合は false
    if (this.config.disabledCategories?.includes(category)) {
      return false;
    }
    
    // 有効カテゴリが指定されている場合は、含まれているかチェック
    if (this.config.enabledCategories && this.config.enabledCategories.length > 0) {
      return this.config.enabledCategories.includes(category);
    }
    
    return true;
  }
  
  /**
   * ログ出力が有効かチェック
   */
  private isEnabled(level: LogLevel, category?: string): boolean {
    // 環境チェック
    const envEnabled = isProduction() 
      ? this.config.enabledInProduction 
      : isDevelopment() 
        ? this.config.enabledInDevelopment 
        : false;
    
    if (!envEnabled) return false;
    
    // ログレベルチェック
    if (!this.checkLogLevel(level)) return false;
    
    // カテゴリチェック
    if (!this.isCategoryEnabled(category)) return false;
    
    return true;
  }
  
  /**
   * ログをバッファに追加
   */
  private addToBuffer(level: LogLevel, category: string | undefined, args: any[]): void {
    if (!this.config.bufferLogs) return;
    
    this.logBuffer.push({ level, category, args });
    
    // バッファサイズを超えたら古いものから削除
    if (this.logBuffer.length > (this.config.maxBufferSize || 100)) {
      this.logBuffer.shift();
    }
  }
  
  /**
   * バッファをフラッシュ
   */
  flushBuffer(): void {
    if (!this.config.bufferLogs || this.logBuffer.length === 0) return;
    
    const consoleObj = (this as any).originalConsole || originalConsole;
    consoleObj.group('Buffered Logs');
    this.logBuffer.forEach(({ level, category, args }) => {
      const levelName = LogLevel[level];
      const prefix = category ? `[${category}] ` : '';
      consoleObj.log(`${levelName}: ${prefix}`, ...args);
    });
    consoleObj.groupEnd();
    
    this.logBuffer = [];
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
   * 実際のログ出力処理
   */
  private outputLog(level: LogLevel, method: 'log' | 'error' | 'warn' | 'info' | 'debug', category: string | undefined, args: any[]): void {
    const processedArgs = this.processData(...args);
    
    if (this.config.bufferLogs) {
      this.addToBuffer(level, category, processedArgs);
    } else {
      const prefix = category ? `[${category}] ` : '';
      // originalConsoleがある場合はそれを使用（無限ループ防止）
      const consoleMethod = (this as any).originalConsole?.[method] || originalConsole[method];
      consoleMethod(prefix, ...processedArgs);
    }
  }
  
  /**
   * カテゴリ付きログメソッドを生成
   */
  category(category: string): Pick<SecureLogger, 'log' | 'error' | 'warn' | 'info' | 'debug'> {
    return {
      log: (...args: any[]) => this.log(category, ...args),
      error: (...args: any[]) => this.error(category, ...args),
      warn: (...args: any[]) => this.warn(category, ...args),
      info: (...args: any[]) => this.info(category, ...args),
      debug: (...args: any[]) => this.debug(category, ...args)
    };
  }
  
  /**
   * console.logの安全なラッパー
   */
  log(categoryOrArg?: string | any, ...args: any[]): void {
    const category = typeof categoryOrArg === 'string' && args.length > 0 ? categoryOrArg : undefined;
    const actualArgs = category ? args : [categoryOrArg, ...args];
    
    if (this.isEnabled(LogLevel.LOG, category)) {
      this.outputLog(LogLevel.LOG, 'log', category, actualArgs);
    }
  }
  
  /**
   * console.errorの安全なラッパー
   */
  error(categoryOrArg?: string | any, ...args: any[]): void {
    const category = typeof categoryOrArg === 'string' && args.length > 0 ? categoryOrArg : undefined;
    const actualArgs = category ? args : [categoryOrArg, ...args];
    
    if (this.isEnabled(LogLevel.ERROR, category)) {
      this.outputLog(LogLevel.ERROR, 'error', category, actualArgs);
    }
  }
  
  /**
   * console.warnの安全なラッパー
   */
  warn(categoryOrArg?: string | any, ...args: any[]): void {
    const category = typeof categoryOrArg === 'string' && args.length > 0 ? categoryOrArg : undefined;
    const actualArgs = category ? args : [categoryOrArg, ...args];
    
    if (this.isEnabled(LogLevel.WARN, category)) {
      this.outputLog(LogLevel.WARN, 'warn', category, actualArgs);
    }
  }
  
  /**
   * console.infoの安全なラッパー
   */
  info(categoryOrArg?: string | any, ...args: any[]): void {
    const category = typeof categoryOrArg === 'string' && args.length > 0 ? categoryOrArg : undefined;
    const actualArgs = category ? args : [categoryOrArg, ...args];
    
    if (this.isEnabled(LogLevel.INFO, category)) {
      this.outputLog(LogLevel.INFO, 'info', category, actualArgs);
    }
  }
  
  /**
   * console.debugの安全なラッパー
   */
  debug(categoryOrArg?: string | any, ...args: any[]): void {
    const category = typeof categoryOrArg === 'string' && args.length > 0 ? categoryOrArg : undefined;
    const actualArgs = category ? args : [categoryOrArg, ...args];
    
    if (this.isEnabled(LogLevel.DEBUG, category)) {
      this.outputLog(LogLevel.DEBUG, 'debug', category, actualArgs);
    }
  }
  
  /**
   * console.tableの安全なラッパー
   */
  table(data: any, category?: string): void {
    if (this.isEnabled(LogLevel.LOG, category)) {
      const processedData = this.processData(data)[0];
      if (this.config.bufferLogs) {
        this.addToBuffer(LogLevel.LOG, category, [processedData]);
      } else {
        const prefix = category ? `[${category}] ` : '';
        const consoleObj = (this as any).originalConsole || originalConsole;
        consoleObj.log(prefix);
        consoleObj.table(processedData);
      }
    }
  }
  
  /**
   * 設定を更新
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * 現在の設定を取得
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// デフォルトのロガーインスタンス
export const logger = new SecureLogger();

// カテゴリ別ロガーの作成
export const authLogger = logger.category('auth');
export const apiLogger = logger.category('api');
export const dataLogger = logger.category('data');
export const uiLogger = logger.category('ui');
export const debugLogger = logger.category('debug');

// 元のconsoleメソッドを保存（ログ出力に使用）
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  table: console.table
};

// 既存のconsole.*を置き換えるヘルパー関数
export function replaceConsoleWithSecureLogger(config?: Partial<LoggerConfig>): void {
  // カスタム設定がある場合は適用
  if (config) {
    logger.updateConfig(config);
  }
  
  // グローバルに保存（デバッグ用）
  if (isDevelopment()) {
    (window as any).__originalConsole = originalConsole;
  }
  
  // SecureLoggerインスタンスを作成（元のconsoleメソッドを使用）
  const secureLoggerWithOriginalConsole = new SecureLogger({
    ...logger.getConfig(),
    ...config
  });
  
  // SecureLoggerが元のconsoleメソッドを使用するように設定
  (secureLoggerWithOriginalConsole as any).originalConsole = originalConsole;
  
  // console メソッドを SecureLogger に置き換え
  console.log = (...args: any[]) => secureLoggerWithOriginalConsole.log(...args);
  console.error = (...args: any[]) => secureLoggerWithOriginalConsole.error(...args);
  console.warn = (...args: any[]) => secureLoggerWithOriginalConsole.warn(...args);
  console.info = (...args: any[]) => secureLoggerWithOriginalConsole.info(...args);
  console.debug = (...args: any[]) => secureLoggerWithOriginalConsole.debug(...args);
  console.table = (data: any) => secureLoggerWithOriginalConsole.table(data);
  
  // console.group系のメソッドも制御
  if (isProduction()) {
    console.group = () => {};
    console.groupCollapsed = () => {};
    console.groupEnd = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
    console.trace = () => {};
    console.assert = () => {};
    console.count = () => {};
    console.countReset = () => {};
    console.clear = () => {};
  }
  
  // 設定確認用のログ（開発環境のみ）
  if (isDevelopment()) {
    originalConsole.info('[system] SecureLogger initialized');
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