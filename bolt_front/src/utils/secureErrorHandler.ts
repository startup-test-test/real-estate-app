/**
 * SEC-069: エラーメッセージの詳細露出対策
 * 本番環境では詳細なエラー情報を隠蔽し、開発環境でのみ詳細を表示
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * エラーコードの定義
 */
export enum ErrorCode {
  // 認証関連
  AUTH_FAILED = 'AUTH_001',
  AUTH_EXPIRED = 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSION = 'AUTH_003',
  
  // 入力検証
  VALIDATION_FAILED = 'VAL_001',
  INVALID_INPUT = 'VAL_002',
  
  // API関連
  API_ERROR = 'API_001',
  NETWORK_ERROR = 'API_002',
  TIMEOUT_ERROR = 'API_003',
  
  // データベース関連
  DB_ERROR = 'DB_001',
  DB_CONNECTION_FAILED = 'DB_002',
  
  // ファイル関連
  FILE_UPLOAD_ERROR = 'FILE_001',
  FILE_INVALID_TYPE = 'FILE_002',
  FILE_TOO_LARGE = 'FILE_003',
  
  // 一般的なエラー
  UNKNOWN_ERROR = 'GEN_001',
  INTERNAL_ERROR = 'GEN_002'
}

/**
 * エラーレベルの定義
 */
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * セキュアなエラー情報
 */
export interface SecureError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  requestId: string;
  timestamp: string;
  level: ErrorLevel;
}

/**
 * 環境判定
 */
function isDevelopment(): boolean {
  return import.meta.env.MODE === 'development' || 
         import.meta.env.VITE_ENV === 'development';
}

/**
 * エラーコードからユーザー向けメッセージを取得
 */
function getUserMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.AUTH_FAILED]: '認証に失敗しました。再度ログインしてください。',
    [ErrorCode.AUTH_EXPIRED]: 'セッションの有効期限が切れました。再度ログインしてください。',
    [ErrorCode.AUTH_INSUFFICIENT_PERMISSION]: 'この操作を実行する権限がありません。',
    [ErrorCode.VALIDATION_FAILED]: '入力内容に誤りがあります。確認して再度お試しください。',
    [ErrorCode.INVALID_INPUT]: '無効な入力値です。正しい形式で入力してください。',
    [ErrorCode.API_ERROR]: 'サーバーとの通信でエラーが発生しました。しばらく待ってから再度お試しください。',
    [ErrorCode.NETWORK_ERROR]: 'ネットワーク接続を確認してください。',
    [ErrorCode.TIMEOUT_ERROR]: 'リクエストがタイムアウトしました。再度お試しください。',
    [ErrorCode.DB_ERROR]: 'データの処理中にエラーが発生しました。',
    [ErrorCode.DB_CONNECTION_FAILED]: 'データベースへの接続に失敗しました。',
    [ErrorCode.FILE_UPLOAD_ERROR]: 'ファイルのアップロードに失敗しました。',
    [ErrorCode.FILE_INVALID_TYPE]: '対応していないファイル形式です。',
    [ErrorCode.FILE_TOO_LARGE]: 'ファイルサイズが大きすぎます。',
    [ErrorCode.UNKNOWN_ERROR]: '予期しないエラーが発生しました。',
    [ErrorCode.INTERNAL_ERROR]: 'システムエラーが発生しました。管理者にお問い合わせください。'
  };
  
  return messages[code] || messages[ErrorCode.UNKNOWN_ERROR];
}

/**
 * エラーをエラーコードに変換
 */
function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // 認証関連
    if (message.includes('auth') || message.includes('unauthorized')) {
      return ErrorCode.AUTH_FAILED;
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return ErrorCode.AUTH_INSUFFICIENT_PERMISSION;
    }
    
    // ネットワーク関連
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCode.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ErrorCode.TIMEOUT_ERROR;
    }
    
    // データベース関連
    if (message.includes('database') || message.includes('supabase')) {
      return ErrorCode.DB_ERROR;
    }
    
    // ファイル関連
    if (message.includes('upload')) {
      return ErrorCode.FILE_UPLOAD_ERROR;
    }
    
    // 検証関連
    if (message.includes('valid')) {
      return ErrorCode.VALIDATION_FAILED;
    }
  }
  
  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * エラーレベルを判定
 */
function getErrorLevel(code: ErrorCode): ErrorLevel {
  const criticalCodes = [
    ErrorCode.DB_CONNECTION_FAILED,
    ErrorCode.INTERNAL_ERROR
  ];
  
  const errorCodes = [
    ErrorCode.AUTH_FAILED,
    ErrorCode.API_ERROR,
    ErrorCode.DB_ERROR
  ];
  
  const warningCodes = [
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.INVALID_INPUT,
    ErrorCode.FILE_INVALID_TYPE,
    ErrorCode.FILE_TOO_LARGE
  ];
  
  if (criticalCodes.includes(code)) return ErrorLevel.CRITICAL;
  if (errorCodes.includes(code)) return ErrorLevel.ERROR;
  if (warningCodes.includes(code)) return ErrorLevel.WARNING;
  
  return ErrorLevel.INFO;
}

/**
 * セキュアなエラーハンドリング
 */
export function handleError(error: unknown, context?: string): SecureError {
  const requestId = uuidv4();
  const errorCode = getErrorCode(error);
  const level = getErrorLevel(errorCode);
  const timestamp = new Date().toISOString();
  
  const secureError: SecureError = {
    code: errorCode,
    message: error instanceof Error ? error.message : 'Unknown error',
    userMessage: getUserMessage(errorCode),
    requestId,
    timestamp,
    level
  };
  
  // 開発環境でのみ詳細をログ出力
  if (isDevelopment()) {
    console.group(`🔴 Error [${requestId}]`);
    console.error('Context:', context || 'Unknown');
    console.error('Error Code:', errorCode);
    console.error('Level:', level);
    console.error('Timestamp:', timestamp);
    console.error('Original Error:', error);
    if (error instanceof Error && error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    console.groupEnd();
  } else {
    // 本番環境では最小限の情報のみ
    console.error(`Error occurred [${requestId}] - Code: ${errorCode}`);
  }
  
  return secureError;
}

/**
 * エラーをユーザーに表示するためのメッセージを取得
 */
export function getDisplayMessage(error: unknown): string {
  const secureError = handleError(error);
  return secureError.userMessage;
}

/**
 * API エラーレスポンスを処理
 */
export function handleApiError(response: Response, data?: any): SecureError {
  let errorCode: ErrorCode;
  
  switch (response.status) {
    case 401:
      errorCode = ErrorCode.AUTH_FAILED;
      break;
    case 403:
      errorCode = ErrorCode.AUTH_INSUFFICIENT_PERMISSION;
      break;
    case 400:
      errorCode = ErrorCode.VALIDATION_FAILED;
      break;
    case 500:
    case 502:
    case 503:
      errorCode = ErrorCode.API_ERROR;
      break;
    default:
      errorCode = ErrorCode.UNKNOWN_ERROR;
  }
  
  // エラーコードを直接指定してSecureErrorを作成
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  const level = getErrorLevel(errorCode);
  const message = data?.message || `HTTP ${response.status}`;
  
  const secureError: SecureError = {
    code: errorCode,
    message,
    userMessage: getUserMessage(errorCode),
    requestId,
    timestamp,
    level
  };
  
  // 開発環境でのみ詳細をログ出力
  if (isDevelopment()) {
    console.group(`🔴 API Error [${requestId}]`);
    console.error('Status:', response.status);
    console.error('Error Code:', errorCode);
    console.error('Message:', message);
    console.error('Response Data:', data);
    console.groupEnd();
  } else {
    console.error(`API Error occurred [${requestId}] - Code: ${errorCode}`);
  }
  
  return secureError;
}

/**
 * グローバルエラーハンドラーの設定
 */
export function setupGlobalErrorHandler(): void {
  // 未処理のPromiseエラーをキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    handleError(event.reason, 'Unhandled Promise Rejection');
  });
  
  // 通常のエラーをキャッチ
  window.addEventListener('error', (event) => {
    event.preventDefault();
    handleError(event.error || event.message, 'Global Error');
  });
}

/**
 * React Error Boundary用のエラーハンドラー
 */
export function handleReactError(error: Error, errorInfo: React.ErrorInfo): SecureError {
  const context = `React Error Boundary - Component Stack: ${errorInfo.componentStack}`;
  return handleError(error, context);
}