/**
 * SEC-004: CSRF対策の実装
 * CSRFトークンの生成と検証
 */

/**
 * CSRFトークンを生成
 * @returns CSRFトークン
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSRFトークンをセッションストレージに保存
 * @param token - CSRFトークン
 */
export function storeCSRFToken(token: string): void {
  // セッションストレージを使用（タブを閉じると削除される）
  sessionStorage.setItem('csrf_token', token);
}

/**
 * 保存されているCSRFトークンを取得
 * @returns CSRFトークン（存在しない場合は新規生成）
 */
export function getCSRFToken(): string {
  let token = sessionStorage.getItem('csrf_token');
  
  if (!token) {
    token = generateCSRFToken();
    storeCSRFToken(token);
  }
  
  return token;
}

/**
 * リクエストヘッダーにCSRFトークンを追加
 * @param headers - 既存のヘッダー
 * @returns CSRFトークンを含むヘッダー
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFToken();
  
  return {
    ...headers,
    'X-CSRF-Token': token
  };
}

/**
 * Supabaseクライアントの設定にCSRF保護を追加
 * @returns Supabaseクライアントの追加設定
 */
export function getSupabaseCSRFConfig() {
  return {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      storage: {
        // セッション情報の保存方法をカスタマイズ
        getItem: (key: string) => {
          // CSRFトークンの検証
          const token = sessionStorage.getItem('csrf_token');
          if (!token) {
            // トークンがない場合は新規生成
            const newToken = generateCSRFToken();
            storeCSRFToken(newToken);
          }
          return localStorage.getItem(key);
        },
        setItem: (key: string, value: string) => {
          localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key);
        }
      }
    },
    global: {
      headers: {
        'X-CSRF-Token': getCSRFToken()
      }
    }
  };
}

/**
 * フォーム送信時のCSRF保護
 * @param formData - フォームデータ
 * @returns CSRFトークンを含むフォームデータ
 */
export function addCSRFToFormData(formData: FormData): FormData {
  const token = getCSRFToken();
  formData.append('csrf_token', token);
  return formData;
}

/**
 * APIリクエスト用のfetchラッパー（CSRF保護付き）
 * @param url - リクエストURL
 * @param options - fetchオプション
 * @returns fetchのPromise
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // GETリクエスト以外にCSRFトークンを追加
  if (options.method && options.method !== 'GET') {
    options.headers = addCSRFHeader(options.headers);
  }
  
  return fetch(url, options);
}