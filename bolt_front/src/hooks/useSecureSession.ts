/**
 * SEC-005: セキュアなセッション管理フック
 */

import { useEffect, useRef, useCallback } from 'react';
import { SessionManager } from '../utils/sessionManager';
import { useSupabaseAuth } from './useSupabaseAuth';

interface UseSecureSessionOptions {
  onSessionTimeout?: () => void;
  warningTime?: number; // タイムアウト前の警告時間（ミリ秒）
}

export function useSecureSession(options: UseSecureSessionOptions = {}) {
  const { onSessionTimeout, warningTime = 5 * 60 * 1000 } = options; // デフォルト5分前に警告
  const { signOut } = useSupabaseAuth();
  const sessionManager = useRef(SessionManager.getInstance());
  const warningShownRef = useRef(false);
  const warningIntervalRef = useRef<NodeJS.Timeout>();

  // セッションタイムアウト処理
  const handleSessionTimeout = useCallback(async () => {
    console.log('セッションタイムアウト：自動ログアウトします');
    
    // カスタムコールバックがあれば実行
    if (onSessionTimeout) {
      onSessionTimeout();
    }
    
    // 自動ログアウト
    await signOut();
    
    // タイムアウトメッセージを表示（オプション）
    alert('セッションがタイムアウトしました。再度ログインしてください。');
  }, [onSessionTimeout, signOut]);

  // セッション警告チェック
  const checkSessionWarning = useCallback(() => {
    const remainingTime = sessionManager.current.getSessionRemainingTime();
    
    if (remainingTime <= warningTime && remainingTime > 0 && !warningShownRef.current) {
      warningShownRef.current = true;
      
      const minutes = Math.ceil(remainingTime / 60000);
      const confirmed = confirm(
        `セッションが約${minutes}分後にタイムアウトします。\n` +
        '続行するには「OK」をクリックしてください。'
      );
      
      if (confirmed) {
        sessionManager.current.refreshSession();
        warningShownRef.current = false;
      }
    } else if (remainingTime > warningTime) {
      warningShownRef.current = false;
    }
  }, [warningTime]);

  useEffect(() => {
    // セッションタイムアウトコールバックを設定
    sessionManager.current.setSessionTimeoutCallback(handleSessionTimeout);
    
    // 定期的に警告をチェック
    warningIntervalRef.current = setInterval(checkSessionWarning, 30000); // 30秒ごと
    
    // ページ離脱時の警告
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const remainingTime = sessionManager.current.getSessionRemainingTime();
      if (remainingTime < warningTime && remainingTime > 0) {
        e.preventDefault();
        e.returnValue = 'セッションがまもなくタイムアウトします。';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleSessionTimeout, checkSessionWarning, warningTime]);

  // セッションリフレッシュ関数
  const refreshSession = useCallback(() => {
    sessionManager.current.refreshSession();
    warningShownRef.current = false;
  }, []);

  // 残り時間取得関数
  const getRemainingTime = useCallback(() => {
    return sessionManager.current.getSessionRemainingTime();
  }, []);

  return {
    refreshSession,
    getRemainingTime
  };
}