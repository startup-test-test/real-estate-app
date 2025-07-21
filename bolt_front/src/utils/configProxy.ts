/**
 * SEC-065: 環境変数の直接露出対策
 * バックエンドのプロキシ経由で設定を安全に取得
 */

import { apiAuth } from './apiAuth';

interface PublicConfig {
  supabase: {
    url: string;
    anon_key_preview: string;
    has_anon_key: boolean;
  };
  features: {
    auth_enabled: boolean;
    mock_auth_enabled: boolean;
    api_base_url: string;
  };
  environment: {
    mode: string;
    is_production: boolean;
  };
}

interface SecureConfig extends PublicConfig {
  secure_token?: string;
}

interface SecureData {
  supabase_anon_key: string;
  token: string;
}

class ConfigProxyClient {
  private static instance: ConfigProxyClient;
  private publicConfig: PublicConfig | null = null;
  private secureConfig: SecureConfig | null = null;
  private supabaseAnonKey: string | null = null;
  private configPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): ConfigProxyClient {
    if (!ConfigProxyClient.instance) {
      ConfigProxyClient.instance = new ConfigProxyClient();
    }
    return ConfigProxyClient.instance;
  }

  /**
   * 公開設定を取得
   */
  public async getPublicConfig(): Promise<PublicConfig> {
    if (this.publicConfig) {
      return this.publicConfig;
    }

    try {
      const response = await fetch('/api/config/public');
      if (!response.ok) {
        throw new Error('Failed to fetch public config');
      }
      
      this.publicConfig = await response.json();
      return this.publicConfig;
    } catch (error) {
      console.error('Failed to fetch public config:', error);
      // フォールバック: 従来の環境変数を使用
      return this.getFallbackConfig();
    }
  }

  /**
   * 認証済みユーザー向けの安全な設定を取得
   */
  public async getSecureConfig(): Promise<SecureConfig> {
    if (this.secureConfig) {
      return this.secureConfig;
    }

    try {
      const token = apiAuth.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/config/secure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch secure config');
      }

      this.secureConfig = await response.json();
      
      // セキュアトークンがある場合は、完全なキーを取得
      if (this.secureConfig.secure_token) {
        await this.retrieveSecureData(this.secureConfig.secure_token);
      }

      return this.secureConfig;
    } catch (error) {
      console.error('Failed to fetch secure config:', error);
      // フォールバック: 公開設定を返す
      return await this.getPublicConfig();
    }
  }

  /**
   * Supabase Anon Keyを取得
   */
  public async getSupabaseAnonKey(): Promise<string> {
    // 既に取得済みの場合はそれを返す
    if (this.supabaseAnonKey) {
      return this.supabaseAnonKey;
    }

    // 開発環境では従来の環境変数を使用
    if (import.meta.env.DEV) {
      this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      return this.supabaseAnonKey;
    }

    // 本番環境ではセキュア設定から取得
    try {
      await this.getSecureConfig();
      if (!this.supabaseAnonKey) {
        throw new Error('Failed to retrieve Supabase anon key');
      }
      return this.supabaseAnonKey;
    } catch (error) {
      console.error('Failed to get Supabase anon key:', error);
      // 最終的なフォールバック
      return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    }
  }

  /**
   * セキュアデータを取得
   */
  private async retrieveSecureData(secureToken: string): Promise<void> {
    try {
      const token = apiAuth.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/config/retrieve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: secureToken })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve secure data');
      }

      const data: SecureData = await response.json();
      this.supabaseAnonKey = data.supabase_anon_key;
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
    }
  }

  /**
   * フォールバック設定を取得
   */
  private getFallbackConfig(): PublicConfig {
    return {
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anon_key_preview: this.maskKey(import.meta.env.VITE_SUPABASE_ANON_KEY || ''),
        has_anon_key: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      features: {
        auth_enabled: true,
        mock_auth_enabled: import.meta.env.VITE_ENV !== 'production',
        api_base_url: import.meta.env.VITE_API_BASE_URL || '/api'
      },
      environment: {
        mode: import.meta.env.VITE_ENV || 'development',
        is_production: import.meta.env.VITE_ENV === 'production'
      }
    };
  }

  /**
   * キーをマスク
   */
  private maskKey(key: string): string {
    if (key.length <= 40) return key;
    return key.substring(0, 20) + '...' + key.substring(key.length - 20);
  }

  /**
   * 設定を初期化（アプリ起動時に呼び出す）
   */
  public async initialize(): Promise<void> {
    if (this.configPromise) {
      return this.configPromise;
    }

    this.configPromise = (async () => {
      try {
        // 公開設定を取得
        await this.getPublicConfig();
        
        // 認証済みの場合はセキュア設定も取得
        const token = apiAuth.getToken();
        if (token) {
          await this.getSecureConfig();
        }
      } catch (error) {
        console.error('Failed to initialize config proxy:', error);
      }
    })();

    return this.configPromise;
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    this.publicConfig = null;
    this.secureConfig = null;
    this.supabaseAnonKey = null;
    this.configPromise = null;
  }
}

// シングルトンインスタンスをエクスポート
export const configProxy = ConfigProxyClient.getInstance();

// 便利な関数をエクスポート
export const getPublicConfig = () => configProxy.getPublicConfig();
export const getSecureConfig = () => configProxy.getSecureConfig();
export const getSupabaseAnonKey = () => configProxy.getSupabaseAnonKey();
export const initializeConfig = () => configProxy.initialize();