/**
 * SEC-069: エラーメッセージの詳細露出対策
 * セキュアなエラーハンドリングユーティリティ
 */

interface ErrorInfo {
  code: string;
  userMessage: string;
  logMessage?: string;
  context?: Record<string, any>;
}

// エラーコード定義
export const ERROR_CODES = {
  // 認証関連
  AUTH_FAILED: 'AUTH_001',
  AUTH_EXPIRED: 'AUTH_002',
  AUTH_INVALID: 'AUTH_003',
  
  // API関連
  API_NETWORK: 'API_001',
  API_TIMEOUT: 'API_002',
  API_SERVER: 'API_003',
  API_VALIDATION: 'API_004',
  
  // データ関連
  DATA_VALIDATION: 'DATA_001',
  DATA_NOT_FOUND: 'DATA_002',
  DATA_SAVE_FAILED: 'DATA_003',
  
  // ファイル関連
  FILE_UPLOAD_FAILED: 'FILE_001',
  FILE_SIZE_EXCEEDED: 'FILE_002',
  FILE_TYPE_INVALID: 'FILE_003',
  
  // その他
  UNKNOWN: 'UNKNOWN_001',
  PERMISSION_DENIED: 'PERM_001',
  RATE_LIMIT: 'RATE_001'
} as const;

// ユーザー向けメッセージのマッピング
const USER_MESSAGES: Record<string, string> = {
  [ERROR_CODES.AUTH_FAILED]: 'ログインに失敗しました。もう一度お試しください。',
  [ERROR_CODES.AUTH_EXPIRED]: 'セッションの有効期限が切れました。再度ログインしてください。',
  [ERROR_CODES.AUTH_INVALID]: '認証情報が無効です。',
  
  [ERROR_CODES.API_NETWORK]: 'ネットワークエラーが発生しました。接続を確認してください。',
  [ERROR_CODES.API_TIMEOUT]: 'リクエストがタイムアウトしました。もう一度お試しください。',
  [ERROR_CODES.API_SERVER]: 'サーバーエラーが発生しました。しばらく待ってからお試しください。',
  [ERROR_CODES.API_VALIDATION]: '入力内容に誤りがあります。確認してください。',
  
  [ERROR_CODES.DATA_VALIDATION]: '入力データが正しくありません。',
  [ERROR_CODES.DATA_NOT_FOUND]: '指定されたデータが見つかりません。',
  [ERROR_CODES.DATA_SAVE_FAILED]: 'データの保存に失敗しました。',
  
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'ファイルのアップロードに失敗しました。',
  [ERROR_CODES.FILE_SIZE_EXCEEDED]: 'ファイルサイズが大きすぎます。',
  [ERROR_CODES.FILE_TYPE_INVALID]: '許可されていないファイル形式です。',
  
  [ERROR_CODES.UNKNOWN]: '予期しないエラーが発生しました。',
  [ERROR_CODES.PERMISSION_DENIED]: 'この操作を実行する権限がありません。',
  [ERROR_CODES.RATE_LIMIT]: 'リクエストが多すぎます。しばらく待ってからお試しください。'
};

/**
 * エラーハンドリングクラス
 */
export class SecureErrorHandler {
  private static isDevelopment = import.meta.env.DEV;
  
  /**
   * エラーを処理してセキュアな情報を返す
   */
  static handle(error: unknown, context?: Record<string, any>): ErrorInfo {
    // エラーの種類を判定
    const errorCode = this.determineErrorCode(error);
    const userMessage = USER_MESSAGES[errorCode] || USER_MESSAGES[ERROR_CODES.UNKNOWN];
    
    // 開発環境のみ詳細情報をログ
    const logMessage = this.isDevelopment ? this.extractDetailedError(error) : undefined;
    
    // セキュアなエラー情報を返す
    return {
      code: errorCode,
      userMessage,
      logMessage,
      context: this.isDevelopment ? context : undefined
    };
  }
  
  /**
   * エラーコードを判定
   */
  private static determineErrorCode(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // ネットワークエラー
      if (message.includes('network') || message.includes('fetch')) {
        return ERROR_CODES.API_NETWORK;
      }
      
      // タイムアウト
      if (message.includes('timeout') || message.includes('abort')) {
        return ERROR_CODES.API_TIMEOUT;
      }
      
      // 認証エラー
      if (message.includes('auth') || message.includes('unauthorized') || message.includes('401')) {
        return ERROR_CODES.AUTH_FAILED;
      }
      
      // 権限エラー
      if (message.includes('permission') || message.includes('forbidden') || message.includes('403')) {
        return ERROR_CODES.PERMISSION_DENIED;
      }
      
      // バリデーションエラー
      if (message.includes('validation') || message.includes('invalid')) {
        return ERROR_CODES.DATA_VALIDATION;
      }
      
      // レート制限
      if (message.includes('rate limit') || message.includes('429')) {
        return ERROR_CODES.RATE_LIMIT;
      }
      
      // サーバーエラー
      if (message.includes('500') || message.includes('502') || message.includes('503')) {
        return ERROR_CODES.API_SERVER;
      }
    }
    
    return ERROR_CODES.UNKNOWN;
  }
  
  /**
   * 詳細なエラー情報を抽出（開発環境のみ）
   */
  private static extractDetailedError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}`;
    }
    
    return String(error);
  }
  
  /**
   * エラーをログに記録（本番環境では詳細を隠蔽）
   */
  static log(error: unknown, context?: Record<string, any>): void {
    const errorInfo = this.handle(error, context);
    
    if (this.isDevelopment) {
      // 開発環境では詳細情報を表示
      console.error('Error Details:', {
        code: errorInfo.code,
        message: errorInfo.userMessage,
        details: errorInfo.logMessage,
        context: errorInfo.context
      });
    } else {
      // 本番環境では最小限の情報のみ
      console.error(`Error [${errorInfo.code}]: ${errorInfo.userMessage}`);
    }
  }
  
  /**
   * APIエラーレスポンスを処理
   */
  static async handleApiResponse(response: Response): Promise<ErrorInfo> {
    let errorCode = ERROR_CODES.API_SERVER;
    let details: any = null;
    
    // ステータスコードによる判定
    switch (response.status) {
      case 400:
        errorCode = ERROR_CODES.API_VALIDATION;
        break;
      case 401:
        errorCode = ERROR_CODES.AUTH_FAILED;
        break;
      case 403:
        errorCode = ERROR_CODES.PERMISSION_DENIED;
        break;
      case 404:
        errorCode = ERROR_CODES.DATA_NOT_FOUND;
        break;
      case 429:
        errorCode = ERROR_CODES.RATE_LIMIT;
        break;
      case 500:
      case 502:
      case 503:
        errorCode = ERROR_CODES.API_SERVER;
        break;
    }
    
    // レスポンスボディを安全に取得
    try {
      const text = await response.text();
      if (text) {
        details = JSON.parse(text);
      }
    } catch {
      // JSONパースエラーは無視
    }
    
    return {
      code: errorCode,
      userMessage: USER_MESSAGES[errorCode],
      logMessage: this.isDevelopment ? JSON.stringify(details) : undefined
    };
  }
}

/**
 * グローバルエラーハンドラーの設定
 */
export function setupGlobalErrorHandler(): void {
  // 未処理のPromiseエラーをキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    SecureErrorHandler.log(event.reason, {
      type: 'unhandledrejection',
      promise: event.promise
    });
    
    // デフォルトの動作を防ぐ（コンソールへの出力を防ぐ）
    event.preventDefault();
  });
  
  // 通常のエラーをキャッチ
  window.addEventListener('error', (event) => {
    SecureErrorHandler.log(event.error || event.message, {
      type: 'error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
    
    // デフォルトの動作を防ぐ
    event.preventDefault();
  });
}