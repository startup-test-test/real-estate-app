/**
 * SEC-065: 環境変数の直接露出対策のテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configProxy, getPublicConfig, getSecureConfig, getSupabaseAnonKey, initializeConfig } from '../configProxy';
import * as apiAuth from '../apiAuth';

// モックの設定
vi.mock('../apiAuth', () => ({
  apiAuth: {
    getToken: vi.fn()
  }
}));

describe('ConfigProxyClient', () => {
  let fetchMock: any;
  let originalEnv: any;

  beforeEach(() => {
    // fetchのモック
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    
    // configProxyのキャッシュをクリア
    configProxy.clearCache();
    
    // 元の環境変数を保存
    originalEnv = import.meta.env;
    
    // 環境変数のモック
    vi.stubGlobal('import', {
      meta: {
        env: {
          DEV: false,
          PROD: true,
          VITE_SUPABASE_URL: 'https://test.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'test-anon-key-1234567890',
          VITE_ENV: 'production',
          VITE_API_BASE_URL: '/api'
        }
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    // 元の環境変数を復元
    vi.stubGlobal('import', { meta: { env: originalEnv } });
  });

  describe('getPublicConfig', () => {
    it('公開設定を取得できる', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anon_key_preview: 'test-anon-key-123...7890',
          has_anon_key: true
        },
        features: {
          auth_enabled: true,
          mock_auth_enabled: false,
          api_base_url: '/api'
        },
        environment: {
          mode: 'production',
          is_production: true
        }
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      const config = await getPublicConfig();
      
      expect(fetchMock).toHaveBeenCalledWith('/api/config/public');
      expect(config).toEqual(mockConfig);
    });

    it('エラー時はフォールバック設定を返す', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const config = await getPublicConfig();
      
      // フォールバック設定が返されることを確認
      expect(config.supabase.url).toBeTruthy();
      expect(config.supabase.has_anon_key).toBeTruthy();
      expect(config.environment.mode).toBeTruthy();
    });

    it('キャッシュされた設定を返す', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anon_key_preview: 'test-anon-key-123...7890',
          has_anon_key: true
        },
        features: {
          auth_enabled: true,
          mock_auth_enabled: false,
          api_base_url: '/api'
        },
        environment: {
          mode: 'production',
          is_production: true
        }
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      // 1回目の呼び出し
      await getPublicConfig();
      
      // 2回目の呼び出し（キャッシュから）
      const config = await getPublicConfig();
      
      // fetchは1回だけ呼ばれる
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(config).toEqual(mockConfig);
    });
  });

  describe('getSecureConfig', () => {
    it('認証トークンがある場合はセキュア設定を取得', async () => {
      vi.mocked(apiAuth.apiAuth.getToken).mockReturnValue('test-token');

      const mockSecureConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anon_key_preview: 'test-anon-key-123...7890',
          has_anon_key: true
        },
        features: {
          auth_enabled: true,
          mock_auth_enabled: false,
          api_base_url: '/api'
        },
        environment: {
          mode: 'production',
          is_production: true
        },
        secure_token: 'secure-token-123'
      };

      const mockSecureData = {
        supabase_anon_key: 'test-anon-key-full-1234567890',
        token: 'secure-token-123'
      };

      // セキュア設定の取得
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSecureConfig
      });

      // セキュアデータの取得
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSecureData
      });

      const config = await getSecureConfig();
      
      expect(fetchMock).toHaveBeenCalledWith('/api/config/secure', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      expect(config).toEqual(mockSecureConfig);
    });

    it('認証トークンがない場合は公開設定を返す', async () => {
      vi.mocked(apiAuth.apiAuth.getToken).mockReturnValue(null);

      const mockPublicConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anon_key_preview: 'test-anon-key-123...7890',
          has_anon_key: true
        },
        features: {
          auth_enabled: true,
          mock_auth_enabled: false,
          api_base_url: '/api'
        },
        environment: {
          mode: 'production',
          is_production: true
        }
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPublicConfig
      });

      const config = await getSecureConfig();
      
      expect(config).toEqual(mockPublicConfig);
    });
  });

  describe('getSupabaseAnonKey', () => {
    it('開発環境では環境変数から直接取得', async () => {
      // 開発環境に設定
      vi.stubGlobal('import', {
        meta: {
          env: {
            DEV: true,
            PROD: false,
            VITE_SUPABASE_ANON_KEY: 'dev-anon-key'
          }
        }
      });

      // configProxyのキャッシュをクリア（環境変数変更後）
      configProxy.clearCache();

      const anonKey = await getSupabaseAnonKey();
      
      expect(anonKey).toBe('dev-anon-key');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('本番環境ではセキュア設定から取得', async () => {
      vi.mocked(apiAuth.apiAuth.getToken).mockReturnValue('test-token');

      const mockSecureConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anon_key_preview: 'test-anon-key-123...7890',
          has_anon_key: true
        },
        features: {
          auth_enabled: true,
          mock_auth_enabled: false,
          api_base_url: '/api'
        },
        environment: {
          mode: 'production',
          is_production: true
        },
        secure_token: 'secure-token-123'
      };

      const mockSecureData = {
        supabase_anon_key: 'prod-anon-key-full',
        token: 'secure-token-123'
      };

      // セキュア設定の取得
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSecureConfig
      });

      // セキュアデータの取得
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSecureData
      });

      const anonKey = await getSupabaseAnonKey();
      
      expect(anonKey).toBe('prod-anon-key-full');
    });
  });

  describe('initializeConfig', () => {
    it('初期化時に公開設定を取得', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anon_key_preview: 'test-anon-key-123...7890',
          has_anon_key: true
        },
        features: {
          auth_enabled: true,
          mock_auth_enabled: false,
          api_base_url: '/api'
        },
        environment: {
          mode: 'production',
          is_production: true
        }
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      await initializeConfig();
      
      expect(fetchMock).toHaveBeenCalledWith('/api/config/public');
    });

    it('認証済みの場合はセキュア設定も取得', async () => {
      vi.mocked(apiAuth.apiAuth.getToken).mockReturnValue('test-token');

      const mockPublicConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anon_key_preview: 'test-anon-key-123...7890',
          has_anon_key: true
        },
        features: {
          auth_enabled: true,
          mock_auth_enabled: false,
          api_base_url: '/api'
        },
        environment: {
          mode: 'production',
          is_production: true
        }
      };

      const mockSecureConfig = {
        ...mockPublicConfig,
        secure_token: 'secure-token-123'
      };

      // 公開設定
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPublicConfig
      });

      // セキュア設定
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSecureConfig
      });

      // セキュアデータ（スキップ）
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await initializeConfig();
      
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
});