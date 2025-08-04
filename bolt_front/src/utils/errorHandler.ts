/**
 * エラーハンドリングユーティリティ
 * 技術的な詳細を隠蔽し、ユーザーフレンドリーなメッセージを提供
 */

// エラータイプの定義
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// エラーメッセージのマッピング
const errorMessages: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'ネットワーク接続に問題があります。インターネット接続を確認してください。',
  [ErrorType.VALIDATION]: '入力内容に問題があります。赤色で表示された項目を修正してください。',
  [ErrorType.AUTH]: '認証エラーが発生しました。再度ログインしてください。',
  [ErrorType.SERVER]: 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。',
  [ErrorType.UNKNOWN]: '予期しないエラーが発生しました。問題が続く場合は、サポートにお問い合わせください。'
};

// HTTPステータスコードからエラータイプを判定
const getErrorTypeFromStatus = (status: number): ErrorType => {
  if (status === 0) return ErrorType.NETWORK;
  if (status === 400) return ErrorType.VALIDATION;
  if (status === 401 || status === 403) return ErrorType.AUTH;
  if (status >= 500) return ErrorType.SERVER;
  return ErrorType.UNKNOWN;
};

// エラーからユーザー向けメッセージを生成
export const getUserFriendlyErrorMessage = (error: any): string => {
  // 既にユーザーフレンドリーなメッセージがある場合はそのまま返す
  if (error.userMessage) {
    return error.userMessage;
  }

  // HTTPステータスコードがある場合
  if (error.status) {
    const errorType = getErrorTypeFromStatus(error.status);
    return errorMessages[errorType];
  }

  // ネットワークエラーの判定
  if (error.name === 'NetworkError' || 
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch')) {
    return errorMessages[ErrorType.NETWORK];
  }

  // 認証エラーの判定
  if (error.message?.toLowerCase().includes('auth') ||
      error.message?.toLowerCase().includes('token')) {
    return errorMessages[ErrorType.AUTH];
  }

  // デフォルトメッセージ
  return errorMessages[ErrorType.UNKNOWN];
};

// 開発環境でのみ詳細ログを出力
export const logError = (context: string, error: any): void => {
  if (import.meta.env.DEV) {
    console.error(`[${context}] エラー詳細:`, {
      message: error.message,
      stack: error.stack,
      status: error.status,
      response: error.response,
      timestamp: new Date().toISOString()
    });
  } else {
    // 本番環境では最小限のログのみ
    console.error(`[${context}] エラーが発生しました`);
  }
};

// APIエラーレスポンスの処理
export const handleApiError = async (response: Response): Promise<Error> => {
  let errorMessage = getUserFriendlyErrorMessage({ status: response.status });
  let details: any = null;

  try {
    const errorData = await response.json();
    
    // バックエンドからの詳細メッセージがある場合
    if (errorData.details && Array.isArray(errorData.details)) {
      // バリデーションエラーの場合は詳細を含める
      if (response.status === 400) {
        errorMessage = errorData.details
          .map((msg: string) => msg.replace('propertyName', '物件名'))
          .join('\n');
      }
      details = errorData.details;
    } else if (errorData.error) {
      // 開発環境でのみ技術的詳細を表示
      if (import.meta.env.DEV) {
        details = errorData.error;
      }
    }
  } catch (e) {
    // JSONパースエラーは無視
  }

  const error: any = new Error(errorMessage);
  error.status = response.status;
  error.details = details;
  error.userMessage = errorMessage;
  
  return error;
};

// エラー境界コンポーネント用のエラー情報
export interface ErrorInfo {
  message: string;
  type: ErrorType;
  timestamp: Date;
  context?: string;
}

// エラー情報の作成
export const createErrorInfo = (error: any, context?: string): ErrorInfo => {
  return {
    message: getUserFriendlyErrorMessage(error),
    type: error.status ? getErrorTypeFromStatus(error.status) : ErrorType.UNKNOWN,
    timestamp: new Date(),
    context
  };
};