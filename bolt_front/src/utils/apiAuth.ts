/**
 * SEC-022: API認証システム - フロントエンド実装
 * JWTトークン管理とAPI通信の認証ヘッダー設定
 */

import { SecureStorage } from './cryptoUtils';

// トークン保存キー
const TOKEN_KEY = 'api_access_token';
const TOKEN_EXPIRY_KEY = 'api_token_expiry';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  role?: string;
}

/**
 * API認証管理クラス
 */
export class ApiAuthManager {
  private static instance: ApiAuthManager;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {
    this.loadStoredToken();
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): ApiAuthManager {
    if (!ApiAuthManager.instance) {
      ApiAuthManager.instance = new ApiAuthManager();
    }
    return ApiAuthManager.instance;
  }

  /**
   * 保存されたトークンを読み込む
   */
  private async loadStoredToken(): Promise<void> {
    try {
      const storedToken = await SecureStorage.getItem(TOKEN_KEY);
      const storedExpiry = await SecureStorage.getItem(TOKEN_EXPIRY_KEY);

      if (storedToken && storedExpiry) {
        this.token = storedToken as string;
        this.tokenExpiry = storedExpiry as number;

        // 期限切れチェック
        if (this.isTokenExpired()) {
          await this.clearToken();
        }
      }
    } catch (error) {
      // SEC-049: 機密情報を含む可能性があるエラーはログに出力しない
      // 本番環境ではconsoleが無効化されているが、念のため削除
    }
  }

  /**
   * トークンを保存
   */
  async saveToken(tokenData: TokenData): Promise<void> {
    this.token = tokenData.access_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

    try {
      await SecureStorage.setItem(TOKEN_KEY, this.token);
      await SecureStorage.setItem(TOKEN_EXPIRY_KEY, this.tokenExpiry);
    } catch (error) {
      // SEC-049: エラー詳細をログに出力しない
      // フォールバック: セッションストレージに保存
      sessionStorage.setItem(TOKEN_KEY, this.token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, this.tokenExpiry.toString());
    }
  }

  /**
   * トークンをクリア
   */
  async clearToken(): Promise<void> {
    this.token = null;
    this.tokenExpiry = null;

    try {
      await SecureStorage.removeItem(TOKEN_KEY);
      await SecureStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      // SEC-049: エラー詳細をログに出力しない
    }

    // セッションストレージもクリア
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  /**
   * 現在のトークンを取得
   */
  getToken(): string | null {
    if (this.isTokenExpired()) {
      this.clearToken();
      return null;
    }
    return this.token;
  }

  /**
   * トークンが期限切れかチェック
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiry) {
      return true;
    }
    // 1分の余裕を持って期限切れ判定（シミュレーション実行中の誤判定を防ぐ）
    return Date.now() > (this.tokenExpiry - 1 * 60 * 1000);
  }

  /**
   * 認証ヘッダーを取得
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      return {};
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * APIトークンを取得（Supabase認証情報を使用）
   */
  async obtainToken(supabaseSession: any): Promise<boolean> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://real-estate-app-1-iii4.onrender.com';
      
      // 一時的な対処：認証エンドポイントが利用できない場合は認証をスキップ
      const isAuthDisabled = import.meta.env.VITE_DISABLE_API_AUTH === 'true';
      if (isAuthDisabled) {
        console.warn('API認証が無効化されています（開発用）');
        // ダミートークンを設定
        const dummyToken: TokenData = {
          access_token: 'dummy-token-for-development',
          token_type: 'bearer',
          expires_in: 3600,
          role: 'standard'
        };
        await this.saveToken(dummyToken);
        return true;
      }
      
      const response = await fetch(`${apiUrl}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supabase_token: supabaseSession?.access_token,
          user_id: supabaseSession?.user?.id,
          email: supabaseSession?.user?.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to obtain API token');
      }

      const tokenData: TokenData = await response.json();
      await this.saveToken(tokenData);
      return true;
    } catch (error) {
      // SEC-049: トークン取得エラーの詳細をログに出力しない
      // 一時的な対処：エラー時も続行可能にする
      if (import.meta.env.VITE_DISABLE_API_AUTH === 'true') {
        const dummyToken: TokenData = {
          access_token: 'dummy-token-for-development',
          token_type: 'bearer',
          expires_in: 3600,
          role: 'standard'
        };
        await this.saveToken(dummyToken);
        return true;
      }
      return false;
    }
  }

  /**
   * 認証付きfetchラッパー
   * SEC-055: 機密情報のキャッシュ防止ヘッダーを追加
   */
  async authenticatedFetch(url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
    // SEC-055: デフォルトのキャッシュ制御ヘッダー
    const defaultHeaders: Record<string, string> = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // 認証が無効化されている場合も、キャッシュ制御ヘッダーは適用
    if (import.meta.env.VITE_DISABLE_API_AUTH === 'true') {
      return fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });
    }
    
    const authHeaders = this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
        ...authHeaders
      }
    });

    // 401エラーの場合はトークンを再取得して1回だけリトライ
    if (response.status === 401 && retryCount === 0) {
      await this.clearToken();
      
      // Supabaseセッションから新しいトークンを取得
      try {
        const { supabase } = await import('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const success = await this.obtainToken(session);
          if (success) {
            // 新しいトークンで再試行
            return this.authenticatedFetch(url, options, 1);
          }
        }
      } catch (error) {
        // SEC-049: エラー詳細をログに出力しない
      }
      
      throw new Error('Authentication required');
    }

    return response;
  }
}

// エクスポート
export const apiAuth = ApiAuthManager.getInstance();