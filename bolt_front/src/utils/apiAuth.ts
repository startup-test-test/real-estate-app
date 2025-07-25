/**
 * SEC-022: API認証システム - フロントエンド実装
 * JWTトークン管理とAPI通信の認証ヘッダー設定
 */

import { SecureStorage } from './cryptoUtils';

// トークン保存キー
const TOKEN_KEY = 'api_access_token';
const TOKEN_EXPIRY_KEY = 'api_token_expiry';
const CSRF_TOKEN_KEY = 'csrf_token';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  role?: string;
  csrf_token?: string;
}

/**
 * API認証管理クラス
 */
export class ApiAuthManager {
  private static instance: ApiAuthManager;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private csrfToken: string | null = null;

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
      const storedCsrf = await SecureStorage.getItem(CSRF_TOKEN_KEY);

      if (storedToken && storedExpiry) {
        this.token = storedToken as string;
        this.tokenExpiry = storedExpiry as number;
        this.csrfToken = storedCsrf as string || null;

        // 期限切れチェック
        if (this.isTokenExpired()) {
          await this.clearToken();
        }
      }
      
      // フォールバック: localStorageから読み込み
      if (!this.token) {
        const localToken = localStorage.getItem(TOKEN_KEY);
        const localExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        const localCsrf = localStorage.getItem(CSRF_TOKEN_KEY);
        
        if (localToken && localExpiry) {
          this.token = localToken;
          this.tokenExpiry = parseInt(localExpiry, 10);
          this.csrfToken = localCsrf;
        }
      }
      
      // さらにフォールバック: sessionStorageから読み込み
      if (!this.token) {
        const sessionToken = sessionStorage.getItem(TOKEN_KEY);
        const sessionExpiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
        const sessionCsrf = sessionStorage.getItem(CSRF_TOKEN_KEY);
        
        if (sessionToken && sessionExpiry) {
          this.token = sessionToken;
          this.tokenExpiry = parseInt(sessionExpiry, 10);
          this.csrfToken = sessionCsrf;
        }
      }
      
      // CSRFトークンだけsessionStorageにある場合の対応
      if (!this.csrfToken && sessionStorage.getItem(CSRF_TOKEN_KEY)) {
        this.csrfToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
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
    this.csrfToken = tokenData.csrf_token || null;

    try {
      await SecureStorage.setItem(TOKEN_KEY, this.token);
      await SecureStorage.setItem(TOKEN_EXPIRY_KEY, this.tokenExpiry);
      if (this.csrfToken) {
        await SecureStorage.setItem(CSRF_TOKEN_KEY, this.csrfToken);
      }
    } catch (error) {
      // SEC-049: エラー詳細をログに出力しない
      // フォールバック: セッションストレージに保存
      sessionStorage.setItem(TOKEN_KEY, this.token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, this.tokenExpiry.toString());
      if (this.csrfToken) {
        sessionStorage.setItem(CSRF_TOKEN_KEY, this.csrfToken);
      }
    }
  }

  /**
   * トークンをクリア
   */
  async clearToken(): Promise<void> {
    this.token = null;
    this.tokenExpiry = null;
    this.csrfToken = null;

    try {
      await SecureStorage.removeItem(TOKEN_KEY);
      await SecureStorage.removeItem(TOKEN_EXPIRY_KEY);
      await SecureStorage.removeItem(CSRF_TOKEN_KEY);
    } catch (error) {
      // SEC-049: エラー詳細をログに出力しない
    }

    // セッションストレージもクリア
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
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
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };
    
    // CSRFトークンがある場合は追加
    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }
    
    // デバッグログ
    console.warn('🔍 Auth headers:', headers);
    console.warn('🔍 CSRF token:', this.csrfToken);
    console.warn('🔍 Token exists:', !!this.token);
    
    return headers;
  }

  /**
   * APIトークンを取得（Supabase認証情報を使用）
   */
  async obtainToken(supabaseSession: any): Promise<boolean> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      // 一時的な対処：認証エンドポイントが利用できない場合は認証をスキップ
      const isAuthDisabled = import.meta.env.VITE_DISABLE_API_AUTH === 'true';
      if (isAuthDisabled) {
        console.warn('API認証が無効化されています（開発用）');
        // ダミートークンを設定
        const dummyToken: TokenData = {
          access_token: 'dummy-token-for-development',
          token_type: 'bearer',
          expires_in: 3600,
          role: 'standard',
          csrf_token: 'dummy-csrf-token'
        };
        await this.saveToken(dummyToken);
        return true;
      }
      
      // 開発環境では簡易認証を使用
      const isDevelopment = import.meta.env.DEV;
      const requestBody = isDevelopment 
        ? {
            email: supabaseSession?.user?.email || 'admin@example.com',
            password: 'password123'
          }
        : {
            supabase_token: supabaseSession?.access_token,
            user_id: supabaseSession?.user?.id,
            email: supabaseSession?.user?.email
          };

      const response = await fetch(`${apiUrl}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
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
          role: 'standard',
          csrf_token: 'dummy-csrf-token'
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

/**
 * SEC-057: セキュアなAPIクライアント
 * 認証付きでバックエンドAPIを呼び出すためのヘルパー関数
 */
export const secureApiClient = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = `${apiUrl}${endpoint}`;
  
  return apiAuth.authenticatedFetch(fullUrl, options);
};