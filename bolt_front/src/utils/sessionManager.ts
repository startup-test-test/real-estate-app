/**
 * SEC-005: セッション管理の強化
 * SEC-047: localStorage機密情報保存対策
 * セキュアなセッション管理機能
 */

import type { User, Session } from '@supabase/supabase-js';
import { SecureStorage } from './cryptoUtils';

// セッションタイムアウト時間（ミリ秒）
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1分ごとにチェック

export interface SecureSession extends Session {
  lastActivity?: number;
  expiresAt?: number;
}

/**
 * セッション管理クラス
 */
export class SessionManager {
  private static instance: SessionManager;
  private lastActivityTime: number = Date.now();
  private activityCheckInterval?: NodeJS.Timeout;
  private sessionTimeoutCallback?: () => void;

  private constructor() {
    this.setupActivityTracking();
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * アクティビティトラッキングのセットアップ
   */
  private setupActivityTracking(): void {
    // ユーザーアクティビティを検知
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.updateActivity(), { passive: true });
    });

    // 定期的にセッションタイムアウトをチェック
    this.activityCheckInterval = setInterval(() => {
      this.checkSessionTimeout();
    }, ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * アクティビティを更新
   */
  private updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  /**
   * セッションタイムアウトをチェック
   */
  private checkSessionTimeout(): void {
    const inactiveTime = Date.now() - this.lastActivityTime;
    
    if (inactiveTime >= SESSION_TIMEOUT && this.sessionTimeoutCallback) {
      this.sessionTimeoutCallback();
    }
  }

  /**
   * セッションタイムアウト時のコールバックを設定
   */
  setSessionTimeoutCallback(callback: () => void): void {
    this.sessionTimeoutCallback = callback;
  }

  /**
   * セッションを保存（セキュアな方法）
   * SEC-047: 暗号化して保存
   */
  async saveSession(user: User, session: Session, rememberMe: boolean = false): Promise<void> {
    const secureSession: SecureSession = {
      ...session,
      lastActivity: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT
    };

    // セッション情報をエンコード
    const encodedSession = this.encodeSession(secureSession);
    const encodedUser = this.encodeUser(user);

    if (rememberMe) {
      // SEC-047: Remember Me の場合は暗号化してlocalStorageに保存
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7日間
      await SecureStorage.setItem('secure_session', {
        data: encodedSession,
        expires: expirationTime
      });
      await SecureStorage.setItem('secure_user', {
        data: encodedUser,
        expires: expirationTime
      });
    } else {
      // 通常はsessionStorageに保存（ブラウザを閉じると削除）
      sessionStorage.setItem('secure_session', encodedSession);
      sessionStorage.setItem('secure_user', encodedUser);
    }

    // アクティビティを更新
    this.updateActivity();
  }

  /**
   * セッションを復元
   * SEC-047: 暗号化されたデータを復号化
   */
  async restoreSession(): Promise<{ user: User | null; session: SecureSession | null }> {
    try {
      // まずsessionStorageを確認
      let encodedSession = sessionStorage.getItem('secure_session');
      let encodedUser = sessionStorage.getItem('secure_user');

      // sessionStorageにない場合は暗号化されたlocalStorageを確認
      if (!encodedSession || !encodedUser) {
        // SEC-047: 暗号化されたデータを復号化
        const storedSession = await SecureStorage.getItem('secure_session');
        const storedUser = await SecureStorage.getItem('secure_user');

        if (storedSession && storedUser) {
          // 有効期限をチェック
          if (storedSession.expires && storedSession.expires > Date.now() &&
              storedUser.expires && storedUser.expires > Date.now()) {
            encodedSession = storedSession.data;
            encodedUser = storedUser.data;
          } else {
            // 期限切れの場合は削除
            this.clearSession();
            return { user: null, session: null };
          }
        }
      }

      if (encodedSession && encodedUser) {
        const session = this.decodeSession(encodedSession);
        const user = this.decodeUser(encodedUser);

        // セッションの有効性をチェック
        if (session && session.expiresAt && session.expiresAt > Date.now()) {
          // アクティビティを更新
          this.updateActivity();
          return { user, session };
        }
      }
    } catch (error) {
      console.error('セッション復元エラー:', error);
      this.clearSession();
    }

    return { user: null, session: null };
  }

  /**
   * セッションをクリア
   * SEC-047: 暗号化されたデータも安全に削除
   */
  clearSession(): void {
    // セッションストレージをクリア
    sessionStorage.removeItem('secure_session');
    sessionStorage.removeItem('secure_user');
    
    // SEC-047: 暗号化されたデータを削除
    SecureStorage.removeItem('secure_session');
    SecureStorage.removeItem('secure_user');
    
    // 旧形式のデータも削除（後方互換性）
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_session');
    sessionStorage.removeItem('mock_user');
    sessionStorage.removeItem('mock_session');
  }

  /**
   * セッションをエンコード
   */
  private encodeSession(session: SecureSession): string {
    // Base64エンコード（本番環境では暗号化を推奨）
    return btoa(JSON.stringify(session));
  }

  /**
   * セッションをデコード
   */
  private decodeSession(encodedSession: string): SecureSession | null {
    try {
      return JSON.parse(atob(encodedSession));
    } catch {
      return null;
    }
  }

  /**
   * ユーザー情報をエンコード
   */
  private encodeUser(user: User): string {
    // センシティブな情報を除外
    const safeUser = {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      created_at: user.created_at
    };
    return btoa(JSON.stringify(safeUser));
  }

  /**
   * ユーザー情報をデコード
   */
  private decodeUser(encodedUser: string): User | null {
    try {
      const decoded = JSON.parse(atob(encodedUser));
      // 必要なプロパティを復元
      return {
        ...decoded,
        app_metadata: {},
        aud: 'authenticated'
      } as User;
    } catch {
      return null;
    }
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }
  }

  /**
   * セッションの残り時間を取得（ミリ秒）
   */
  getSessionRemainingTime(): number {
    const inactiveTime = Date.now() - this.lastActivityTime;
    const remainingTime = SESSION_TIMEOUT - inactiveTime;
    return Math.max(0, remainingTime);
  }

  /**
   * セッションをリフレッシュ
   */
  refreshSession(): void {
    this.updateActivity();
  }
}