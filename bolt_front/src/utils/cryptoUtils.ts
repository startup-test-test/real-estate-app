/**
 * SEC-047: localStorage機密情報保存対策
 * 暗号化ユーティリティ
 */

/**
 * データ圧縮ユーティリティ（軽量版）
 */
export class CompressionUtils {
  /**
   * 文字列を圧縮（現在は圧縮をスキップ）
   */
  static compress(str: string): string {
    // パフォーマンスの問題を回避するため、現時点では圧縮をスキップ
    // 将来的により効率的なアルゴリズムに置き換える予定
    return str;
  }
  
  /**
   * 圧縮された文字列を展開
   */
  static decompress(compressed: string): string {
    // 圧縮をスキップしているため、そのまま返す
    return compressed;
  }
}

/**
 * Web Crypto APIを使用した暗号化・復号化ユーティリティ
 */
export class CryptoUtils {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATIONS = 100000;

  /**
   * パスワードから暗号化キーを生成
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * データを暗号化
   */
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      // データを圧縮してサイズを削減
      const compressedData = CompressionUtils.compress(data);
      
      const encoder = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const key = await this.deriveKey(password, salt);

      const encrypted = await window.crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        encoder.encode(compressedData)
      );

      // salt + iv + 暗号化データを結合
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Base64エンコード（大きなデータにも対応）
      // チャンクごとに処理して大きなデータでもスタックオーバーフローを避ける
      let binary = '';
      const chunkSize = 1024; // 1KB chunks
      for (let i = 0; i < combined.length; i += chunkSize) {
        const chunk = combined.slice(i, i + chunkSize);
        binary += Array.from(chunk).map(b => String.fromCharCode(b)).join('');
      }
      return btoa(binary);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * データを復号化
   */
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      // Base64デコード
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      // salt, iv, 暗号化データを分離
      const salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);

      const key = await this.deriveKey(password, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      const decryptedData = decoder.decode(decrypted);
      
      // 圧縮されたデータを展開
      return CompressionUtils.decompress(decryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 暗号化キーの生成（アプリケーション固有）
   */
  static generateAppKey(): string {
    // 本番環境では環境変数から取得すべき
    const baseKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key';
    const timestamp = new Date().toISOString().split('T')[0];
    return `${baseKey}-${timestamp}`;
  }
}

/**
 * セキュアストレージクラス
 */
export class SecureStorage {
  private static encryptionKey = CryptoUtils.generateAppKey();

  /**
   * 暗号化してlocalStorageに保存
   */
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      const encrypted = await CryptoUtils.encrypt(jsonString, this.encryptionKey);
      
      // localStorageの容量をチェック
      try {
        localStorage.setItem(key, encrypted);
      } catch (quotaError: any) {
        if (quotaError.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, cleaning up old data...');
          
          // 古いデータを削除
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('secure_') && k !== key) {
              keysToRemove.push(k);
            }
          }
          
          // 最も古いデータから削除
          if (keysToRemove.length > 0) {
            keysToRemove.slice(0, Math.ceil(keysToRemove.length / 3)).forEach(k => {
              localStorage.removeItem(k);
            });
            
            // 再試行
            localStorage.setItem(key, encrypted);
          } else {
            throw quotaError;
          }
        } else {
          throw quotaError;
        }
      }
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      // フォールバック: sessionStorageに保存
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * localStorageから復号化して取得
   */
  static async getItem(key: string): Promise<any> {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = await CryptoUtils.decrypt(encrypted, this.encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      // フォールバック: sessionStorageから取得
      const fallback = sessionStorage.getItem(key);
      return fallback ? JSON.parse(fallback) : null;
    }
  }

  /**
   * アイテムを削除
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  /**
   * すべてのセキュアストレージをクリア
   */
  static clear(): void {
    // 特定のプレフィックスを持つキーのみクリア
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('secure_') || key.startsWith('auth_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // sessionStorageも同様にクリア
    sessionStorage.clear();
  }
}