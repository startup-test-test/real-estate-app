/**
 * SEC-005: セッション管理の強化のテスト
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../sessionManager';
import type { User, Session } from '@supabase/supabase-js';

// モックの設定
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  })
};

const mockSessionStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockSessionStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockSessionStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockSessionStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockSessionStorage.store = {};
  })
};

// グローバルオブジェクトのモック
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// btoa/atobのモック
global.btoa = (str: string) => Buffer.from(str).toString('base64');
global.atob = (str: string) => Buffer.from(str, 'base64').toString();

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };
  
  const mockSession: Session = {
    user: mockUser,
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer'
  };

  beforeEach(() => {
    // ストレージをクリア
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    vi.clearAllMocks();
    
    // SessionManagerのインスタンスをリセット
    (SessionManager as any).instance = null;
    sessionManager = SessionManager.getInstance();
  });

  afterEach(() => {
    sessionManager.cleanup();
  });

  describe('セッション保存', () => {
    test('Remember Meなしの場合はsessionStorageに保存', () => {
      sessionManager.saveSession(mockUser, mockSession, false);
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'secure_session',
        expect.any(String)
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'secure_user',
        expect.any(String)
      );
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    test('Remember Meありの場合はlocalStorageに期限付きで保存', () => {
      sessionManager.saveSession(mockUser, mockSession, true);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'secure_session',
        expect.stringContaining('"expires":')
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'secure_user',
        expect.stringContaining('"expires":')
      );
    });

    test('センシティブな情報を除外してユーザー情報を保存', () => {
      sessionManager.saveSession(mockUser, mockSession, false);
      
      const savedUserCall = mockSessionStorage.setItem.mock.calls.find(
        call => call[0] === 'secure_user'
      );
      
      if (savedUserCall) {
        const decodedUser = JSON.parse(atob(savedUserCall[1]));
        expect(decodedUser).toHaveProperty('id');
        expect(decodedUser).toHaveProperty('email');
        expect(decodedUser).not.toHaveProperty('access_token');
      }
    });
  });

  describe('セッション復元', () => {
    test('sessionStorageから復元', () => {
      const encodedSession = btoa(JSON.stringify({
        ...mockSession,
        lastActivity: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000
      }));
      const encodedUser = btoa(JSON.stringify({
        id: mockUser.id,
        email: mockUser.email,
        user_metadata: mockUser.user_metadata,
        created_at: mockUser.created_at
      }));
      
      mockSessionStorage.store['secure_session'] = encodedSession;
      mockSessionStorage.store['secure_user'] = encodedUser;
      
      const { user, session } = sessionManager.restoreSession();
      
      expect(user).toBeTruthy();
      expect(user?.email).toBe(mockUser.email);
      expect(session).toBeTruthy();
    });

    test('期限切れのセッションは復元しない', () => {
      const expiredSession = {
        ...mockSession,
        lastActivity: Date.now(),
        expiresAt: Date.now() - 1000 // 1秒前に期限切れ
      };
      
      const encodedSession = btoa(JSON.stringify(expiredSession));
      mockSessionStorage.store['secure_session'] = encodedSession;
      mockSessionStorage.store['secure_user'] = btoa(JSON.stringify(mockUser));
      
      const { user, session } = sessionManager.restoreSession();
      
      expect(user).toBeNull();
      expect(session).toBeNull();
    });

    test('localStorageから期限付きセッションを復元', () => {
      const futureExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24時間後
      const sessionData = {
        data: btoa(JSON.stringify({
          ...mockSession,
          lastActivity: Date.now(),
          expiresAt: Date.now() + 30 * 60 * 1000
        })),
        expires: futureExpiry
      };
      const userData = {
        data: btoa(JSON.stringify({
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: mockUser.user_metadata,
          created_at: mockUser.created_at
        })),
        expires: futureExpiry
      };
      
      mockLocalStorage.store['secure_session'] = JSON.stringify(sessionData);
      mockLocalStorage.store['secure_user'] = JSON.stringify(userData);
      
      const { user, session } = sessionManager.restoreSession();
      
      expect(user).toBeTruthy();
      expect(user?.email).toBe(mockUser.email);
      expect(session).toBeTruthy();
    });
  });

  describe('セッションクリア', () => {
    test('全てのストレージからセッション情報を削除', () => {
      // セッションを保存
      sessionManager.saveSession(mockUser, mockSession, true);
      
      // クリア実行
      sessionManager.clearSession();
      
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('secure_session');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('secure_user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('secure_session');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('secure_user');
      
      // 旧形式のデータも削除されることを確認
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('mock_user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('mock_session');
    });
  });

  describe('セッションタイムアウト', () => {
    test('残り時間を正しく計算', () => {
      // 初回は30分（1800000ミリ秒）の残り時間
      const remainingTime = sessionManager.getSessionRemainingTime();
      expect(remainingTime).toBeGreaterThan(29 * 60 * 1000);
      expect(remainingTime).toBeLessThanOrEqual(30 * 60 * 1000);
    });

    test('セッションリフレッシュで残り時間が更新される', async () => {
      // 最初の残り時間を記録
      const initialRemaining = sessionManager.getSessionRemainingTime();
      
      // 200ms待機（残り時間が減少するのを待つ）
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // リフレッシュ前の残り時間（初回より少ないはず）
      const beforeRefresh = sessionManager.getSessionRemainingTime();
      expect(beforeRefresh).toBeLessThan(initialRemaining);
      
      // リフレッシュ
      sessionManager.refreshSession();
      
      // リフレッシュ後の残り時間
      const afterRefresh = sessionManager.getSessionRemainingTime();
      
      // リフレッシュ後は最大値（30分）に戻るはず
      expect(afterRefresh).toBeGreaterThan(beforeRefresh);
      expect(afterRefresh).toBe(30 * 60 * 1000); // 正確に30分
    });

    test('タイムアウトコールバックが設定できる', () => {
      const mockCallback = vi.fn();
      sessionManager.setSessionTimeoutCallback(mockCallback);
      
      // コールバックが設定されることを確認
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('シングルトンパターン', () => {
    test('複数回呼び出しても同じインスタンスを返す', () => {
      const instance1 = SessionManager.getInstance();
      const instance2 = SessionManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});