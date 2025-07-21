import { SetStateAction, Dispatch } from 'react';
import { handleError as handleSecureError, getDisplayMessage } from './secureErrorHandler';

export interface ShareError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Supabaseエラーの詳細ログ出力
 */
export const logSupabaseError = (error: any, operation: string): void => {
  // セキュアなエラーハンドラーを使用
  handleSecureError(error, `Supabase ${operation}`);
};

/**
 * 統一エラーハンドリング関数
 */
export const handleShareError = (
  error: any,
  operation: string,
  setError: Dispatch<SetStateAction<string | null>>,
  customMessage?: string
): string => {
  // セキュアなエラーハンドラーを使用
  const errorMessage = customMessage || getDisplayMessage(error);
  setError(errorMessage);
  return errorMessage;
};

/**
 * メール送信エラーの特別処理
 */
export const handleEmailError = (
  error: any,
  setError: Dispatch<SetStateAction<string | null>>
): void => {
  handleSecureError(error, 'Email Send');
  
  let errorMessage: string;
  
  // メールエラーの特別なケース
  if (error?.message?.includes('rate limit')) {
    errorMessage = 'メール送信の制限に達しました。しばらく時間をおいて再度お試しください。';
  } else if (error?.message?.includes('Invalid email')) {
    errorMessage = 'メールアドレスが無効です。正しいメールアドレスを入力してください。';
  } else {
    errorMessage = getDisplayMessage(error);
  }
  
  setError(errorMessage);
  throw new Error(errorMessage);
};

/**
 * ローディング状態管理のヘルパー
 */
export const withLoadingState = async <T>(
  operation: () => Promise<T>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  operationName: string
): Promise<T | null> => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await operation();
    return result;
  } catch (error) {
    handleShareError(error, operationName, setError);
    return null;
  } finally {
    setLoading(false);
  }
};

/**
 * 共通エラーメッセージ定数
 */
export const SHARE_ERROR_MESSAGES = {
  UNAUTHORIZED: 'ユーザーが認証されていません。ログインしてください。',
  SHARE_CREATE_FAILED: '共有の作成に失敗しました',
  SHARE_NOT_FOUND: '共有が見つかりません',
  INVITATION_SEND_FAILED: '招待の送信に失敗しました',
  COMMENT_POST_FAILED: 'コメントの投稿に失敗しました',
  COMMENT_DELETE_FAILED: 'コメントの削除に失敗しました',
  COMMENT_EDIT_FAILED: 'コメントの編集に失敗しました',
  REACTION_FAILED: 'リアクションの処理に失敗しました',
  ACCESS_LOG_FAILED: 'アクセスログの記録に失敗しました',
  UNKNOWN_ERROR: '予期しないエラーが発生しました'
} as const;