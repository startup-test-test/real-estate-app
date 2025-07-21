/**
 * SEC-039: Edge Function用セキュアログユーティリティ
 * 機密情報をマスクしてログ出力する
 */

interface LogContext {
  functionName?: string;
  userId?: string;
  action?: string;
}

/**
 * 機密情報をマスクする
 */
export const maskSensitiveData = (data: any): any => {
  if (typeof data === 'string') {
    // JWT トークンをマスク
    if (data.includes('eyJ')) {
      return data.replace(/eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, '[MASKED_TOKEN]');
    }
    
    // メールアドレスをマスク
    if (data.includes('@')) {
      return data.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, name, domain) => {
        const maskedName = name.length > 2 
          ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
          : '**';
        return `${maskedName}@${domain}`;
      });
    }
    
    // APIキーやパスワードをマスク
    if (data.match(/key|password|secret|token/i)) {
      return '[MASKED_SENSITIVE_DATA]';
    }
    
    return data;
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked: any = Array.isArray(data) ? [] : {};
    
    for (const key in data) {
      // 機密性の高いキーは値を完全にマスク
      if (key.match(/password|secret|key|token|auth|credential/i)) {
        masked[key] = '[MASKED]';
      } 
      // メールアドレスフィールドは部分マスク
      else if (key.match(/email|user_email|recipient/i)) {
        masked[key] = maskSensitiveData(data[key]);
      }
      // その他は再帰的に処理
      else {
        masked[key] = maskSensitiveData(data[key]);
      }
    }
    
    return masked;
  }
  
  return data;
};

/**
 * エラーオブジェクトから安全な情報のみを抽出
 */
export const sanitizeError = (error: any): object => {
  const sanitized: any = {
    name: error?.name || 'UnknownError',
    message: error?.message ? maskSensitiveData(error.message) : 'An error occurred',
  };
  
  // Supabaseエラーの特殊処理
  if (error?.code) {
    sanitized.code = error.code;
  }
  
  if (error?.status) {
    sanitized.status = error.status;
  }
  
  // スタックトレースは本番環境では含めない
  if (Deno.env.get('DENO_ENV') !== 'production' && error?.stack) {
    sanitized.stack = maskSensitiveData(error.stack);
  }
  
  return sanitized;
};

/**
 * セキュアなログ出力
 */
export class SecureLogger {
  private context: LogContext;
  
  constructor(context: LogContext = {}) {
    this.context = context;
  }
  
  private formatLog(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = Object.entries(this.context)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    
    let log = `[${timestamp}] [${level}] ${contextStr ? `[${contextStr}] ` : ''}${message}`;
    
    if (data) {
      const maskedData = maskSensitiveData(data);
      log += ` ${JSON.stringify(maskedData)}`;
    }
    
    return log;
  }
  
  info(message: string, data?: any): void {
    console.log(this.formatLog('INFO', message, data));
  }
  
  warn(message: string, data?: any): void {
    console.warn(this.formatLog('WARN', message, data));
  }
  
  error(message: string, error?: any): void {
    const sanitized = error ? sanitizeError(error) : undefined;
    console.error(this.formatLog('ERROR', message, sanitized));
  }
  
  debug(message: string, data?: any): void {
    // 本番環境ではデバッグログを出力しない
    if (Deno.env.get('DENO_ENV') !== 'production') {
      console.log(this.formatLog('DEBUG', message, data));
    }
  }
}

/**
 * デフォルトのロガーインスタンス
 */
export const logger = new SecureLogger();