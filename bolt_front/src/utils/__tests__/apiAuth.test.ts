/**
 * SEC-022: API認証システムのテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { ApiAuthManager } from '../apiAuth';
import { SecureStorage } from '../cryptoUtils';

// SecureStorageをモック
vi.mock('../cryptoUtils', () => ({
  SecureStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

// グローバルのfetchをモック
global.fetch = vi.fn() as Mock;

describe('ApiAuthManager', () => {
  let apiAuth: ApiAuthManager;

  beforeEach(() => {
    // シングルトンインスタンスをリセット
    (ApiAuthManager as any).instance = null;
    apiAuth = ApiAuthManager.getInstance();
    vi.clearAllMocks();
    // テスト環境を設定
    vi.stubEnv('VITE_API_URL', 'https://test-api.example.com');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('トークン管理', () => {
    it('トークンを正常に保存できること', async () => {
      const tokenData = {
        access_token: 'test-token-123',
        token_type: 'bearer',
        expires_in: 3600
      };

      await apiAuth.saveToken(tokenData);

      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'api_access_token',
        'test-token-123'
      );
      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'api_token_expiry',
        expect.any(Number)
      );
    });

    it('保存に失敗した場合はsessionStorageにフォールバックすること', async () => {
      (SecureStorage.setItem as Mock).mockRejectedValue(new Error('Storage error'));
      
      const tokenData = {
        access_token: 'test-token-123',
        token_type: 'bearer',
        expires_in: 3600
      };

      await apiAuth.saveToken(tokenData);

      expect(sessionStorage.getItem('api_access_token')).toBe('test-token-123');
    });

    it('期限切れのトークンは自動的にクリアされること', async () => {
      const expiredTime = Date.now() - 10 * 60 * 1000; // 10分前
      (SecureStorage.getItem as Mock)
        .mockResolvedValueOnce('expired-token')
        .mockResolvedValueOnce(expiredTime);

      // private loadStoredTokenメソッドを呼び出す（コンストラクタで呼ばれる）
      (ApiAuthManager as any).instance = null;
      apiAuth = ApiAuthManager.getInstance();
      
      // 非同期処理を待つ
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(SecureStorage.removeItem).toHaveBeenCalledWith('api_access_token');
      expect(SecureStorage.removeItem).toHaveBeenCalledWith('api_token_expiry');
    });

    it('トークンをクリアできること', async () => {
      await apiAuth.clearToken();

      expect(SecureStorage.removeItem).toHaveBeenCalledWith('api_access_token');
      expect(SecureStorage.removeItem).toHaveBeenCalledWith('api_token_expiry');
      expect(sessionStorage.getItem('api_access_token')).toBeNull();
      expect(sessionStorage.getItem('api_token_expiry')).toBeNull();
    });
  });

  describe('認証ヘッダー', () => {
    it('有効なトークンがある場合は認証ヘッダーを返すこと', async () => {
      const futureTime = Date.now() + 60 * 60 * 1000; // 1時間後
      const tokenData = {
        access_token: 'valid-token',
        token_type: 'bearer',
        expires_in: 3600
      };
      
      await apiAuth.saveToken(tokenData);
      
      const headers = apiAuth.getAuthHeaders();
      
      expect(headers).toEqual({
        'Authorization': 'Bearer valid-token'
      });
    });

    it('トークンがない場合は空のオブジェクトを返すこと', () => {
      const headers = apiAuth.getAuthHeaders();
      expect(headers).toEqual({});
    });
  });

  describe('Supabaseトークン交換', () => {
    it('Supabaseセッションを使用してAPIトークンを取得できること', async () => {
      const mockTokenResponse = {
        access_token: 'api-token-123',
        token_type: 'bearer',
        expires_in: 3600
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse
      });

      const supabaseSession = {
        access_token: 'supabase-token',
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      };

      const result = await apiAuth.obtainToken(supabaseSession);

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/auth/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            supabase_token: 'supabase-token',
            user_id: 'user-123',
            email: 'test@example.com'
          })
        })
      );
      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'api_access_token',
        'api-token-123'
      );
    });

    it('トークン取得に失敗した場合はfalseを返すこと', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await apiAuth.obtainToken({});

      expect(result).toBe(false);
    });
  });

  describe('認証付きfetch', () => {
    beforeEach(async () => {
      const tokenData = {
        access_token: 'auth-token',
        token_type: 'bearer',
        expires_in: 3600
      };
      await apiAuth.saveToken(tokenData);
    });

    it('認証ヘッダーを含めてリクエストを送信すること', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      await apiAuth.authenticatedFetch('https://api.example.com/data');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer auth-token'
          }
        })
      );
    });

    it('401エラーの場合はトークンをクリアしてエラーを投げること', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(
        apiAuth.authenticatedFetch('https://api.example.com/data')
      ).rejects.toThrow('Authentication required');

      expect(SecureStorage.removeItem).toHaveBeenCalledWith('api_access_token');
    });

    it('既存のヘッダーとマージすること', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      await apiAuth.authenticatedFetch('https://api.example.com/data', {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value'
        }
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'value',
            'Authorization': 'Bearer auth-token'
          }
        })
      );
    });
  });

  describe('シングルトンパターン', () => {
    it('同じインスタンスを返すこと', () => {
      const instance1 = ApiAuthManager.getInstance();
      const instance2 = ApiAuthManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('トークン期限チェック', () => {
    it('期限が切れていないトークンは有効と判定されること', async () => {
      const tokenData = {
        access_token: 'valid-token',
        token_type: 'bearer',
        expires_in: 3600 // 1時間
      };
      
      await apiAuth.saveToken(tokenData);
      
      expect(apiAuth.isTokenExpired()).toBe(false);
    });

    it('期限切れ5分前のトークンは期限切れと判定されること', async () => {
      const tokenData = {
        access_token: 'soon-expired-token',
        token_type: 'bearer',
        expires_in: 240 // 4分
      };
      
      await apiAuth.saveToken(tokenData);
      
      expect(apiAuth.isTokenExpired()).toBe(true);
    });
  });
});