/**
 * SEC-047: localStorage機密情報保存対策のテスト
 * cryptoUtils.tsの暗号化・復号化機能のテスト
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { CryptoUtils, SecureStorage } from '../cryptoUtils';

// Web Crypto APIのモック
const mockCrypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  }
};

// TextEncoder/TextDecoderのポリフィル（Node.js環境用）
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str: string): Uint8Array {
      const buf = Buffer.from(str, 'utf8');
      const arr = new Uint8Array(buf.length);
      for (let i = 0; i < buf.length; i++) {
        arr[i] = buf[i];
      }
      return arr;
    }
  } as any;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr: Uint8Array): string {
      return Buffer.from(arr).toString('utf8');
    }
  } as any;
}

describe('CryptoUtils', () => {
  beforeAll(() => {
    // Web Crypto APIをモック
    (global as any).window = {
      crypto: mockCrypto
    };
  });

  describe('encrypt', () => {
    it('文字列を暗号化できること', async () => {
      const testData = 'test secret data';
      const password = 'test-password';

      // モックの設定
      mockCrypto.subtle.importKey.mockResolvedValue('mockKeyMaterial');
      mockCrypto.subtle.deriveKey.mockResolvedValue('mockKey');
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(32));

      const encrypted = await CryptoUtils.encrypt(testData, password);

      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
    });

    it('空文字列を暗号化できること', async () => {
      const testData = '';
      const password = 'test-password';

      mockCrypto.subtle.importKey.mockResolvedValue('mockKeyMaterial');
      mockCrypto.subtle.deriveKey.mockResolvedValue('mockKey');
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(16));

      const encrypted = await CryptoUtils.encrypt(testData, password);

      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('暗号化エラー時に例外を投げること', async () => {
      const testData = 'test data';
      const password = 'test-password';

      mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));

      await expect(CryptoUtils.encrypt(testData, password)).rejects.toThrow('Failed to encrypt data');
    });
  });

  describe('decrypt', () => {
    it('暗号化されたデータを復号化できること', async () => {
      const originalData = 'test secret data';
      const password = 'test-password';

      // 暗号化のモック
      const mockEncryptedBuffer = new ArrayBuffer(32);
      const mockEncryptedArray = new Uint8Array(mockEncryptedBuffer);
      for (let i = 0; i < mockEncryptedArray.length; i++) {
        mockEncryptedArray[i] = i;
      }

      // Base64エンコードされた暗号化データを作成
      const salt = new Uint8Array(16);
      const iv = new Uint8Array(12);
      const combined = new Uint8Array(salt.length + iv.length + mockEncryptedArray.length);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(mockEncryptedArray, salt.length + iv.length);
      const encryptedData = btoa(String.fromCharCode(...combined));

      // 復号化のモック
      const encoder = new TextEncoder();
      const originalBuffer = encoder.encode(originalData).buffer;
      mockCrypto.subtle.importKey.mockResolvedValue('mockKeyMaterial');
      mockCrypto.subtle.deriveKey.mockResolvedValue('mockKey');
      mockCrypto.subtle.decrypt.mockResolvedValue(originalBuffer);

      const decrypted = await CryptoUtils.decrypt(encryptedData, password);

      expect(decrypted).toBe(originalData);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
    });

    it('不正な暗号化データで例外を投げること', async () => {
      const invalidData = 'invalid-base64-data!!!';
      const password = 'test-password';

      await expect(CryptoUtils.decrypt(invalidData, password)).rejects.toThrow('Failed to decrypt data');
    });

    it('間違ったパスワードで例外を投げること', async () => {
      const encryptedData = btoa('some-encrypted-data');
      const wrongPassword = 'wrong-password';

      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));

      await expect(CryptoUtils.decrypt(encryptedData, wrongPassword)).rejects.toThrow('Failed to decrypt data');
    });
  });

  describe('generateAppKey', () => {
    it('アプリケーションキーを生成できること', () => {
      const key = CryptoUtils.generateAppKey();

      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
      expect(key).toContain('-');
    });

    it('日付を含むキーを生成すること', () => {
      const key = CryptoUtils.generateAppKey();
      const today = new Date().toISOString().split('T')[0];

      expect(key).toContain(today);
    });
  });
});

describe('SecureStorage', () => {
  beforeAll(() => {
    // localStorageとsessionStorageのモック
    const storageMock = {
      data: {} as Record<string, string>,
      getItem: vi.fn((key: string) => storageMock.data[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        storageMock.data[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storageMock.data[key];
      }),
      clear: vi.fn(() => {
        storageMock.data = {};
      }),
      get length() {
        return Object.keys(storageMock.data).length;
      },
      key: vi.fn((index: number) => {
        return Object.keys(storageMock.data)[index] || null;
      })
    };

    (global as any).localStorage = storageMock;
    (global as any).sessionStorage = { ...storageMock, data: {} };
  });

  describe('setItem', () => {
    it('データを暗号化して保存できること', async () => {
      const key = 'test-key';
      const value = { secret: 'data', number: 123 };

      // 暗号化のモック
      mockCrypto.subtle.importKey.mockResolvedValue('mockKeyMaterial');
      mockCrypto.subtle.deriveKey.mockResolvedValue('mockKey');
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(32));

      await SecureStorage.setItem(key, value);

      expect(localStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));
      const storedValue = localStorage.getItem(key);
      expect(storedValue).toBeTruthy();
      expect(storedValue).not.toBe(JSON.stringify(value)); // 暗号化されていること
    });

    it('暗号化エラー時にsessionStorageにフォールバックすること', async () => {
      const key = 'test-key';
      const value = { data: 'fallback test' };

      // 暗号化エラーをシミュレート
      mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));

      await SecureStorage.setItem(key, value);

      expect(sessionStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });

  describe('getItem', () => {
    it('暗号化されたデータを復号化して取得できること', async () => {
      const key = 'test-key';
      const originalValue = { secret: 'data', number: 456 };

      // 暗号化されたデータを設定
      const encryptedData = btoa('encrypted-data');
      localStorage.setItem(key, encryptedData);

      // 復号化のモック
      const encoder = new TextEncoder();
      const originalBuffer = encoder.encode(JSON.stringify(originalValue)).buffer;
      mockCrypto.subtle.importKey.mockResolvedValue('mockKeyMaterial');
      mockCrypto.subtle.deriveKey.mockResolvedValue('mockKey');
      mockCrypto.subtle.decrypt.mockResolvedValue(originalBuffer);

      const retrievedValue = await SecureStorage.getItem(key);

      expect(retrievedValue).toEqual(originalValue);
    });

    it('存在しないキーでnullを返すこと', async () => {
      const value = await SecureStorage.getItem('non-existent-key');

      expect(value).toBeNull();
    });

    it('復号化エラー時にsessionStorageからフォールバックすること', async () => {
      const key = 'fallback-key';
      const fallbackValue = { fallback: true };

      // localStorageに不正なデータ
      localStorage.setItem(key, 'invalid-encrypted-data');
      
      // sessionStorageにフォールバックデータ
      sessionStorage.setItem(key, JSON.stringify(fallbackValue));

      // 復号化エラーをシミュレート
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));

      const value = await SecureStorage.getItem(key);

      expect(value).toEqual(fallbackValue);
    });
  });

  describe('removeItem', () => {
    it('localStorageとsessionStorageから削除できること', () => {
      const key = 'test-key';

      localStorage.setItem(key, 'value1');
      sessionStorage.setItem(key, 'value2');

      SecureStorage.removeItem(key);

      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('セキュア関連のキーのみクリアすること', () => {
      // テストデータを設定
      localStorage.setItem('secure_token', 'encrypted1');
      localStorage.setItem('auth_session', 'encrypted2');
      localStorage.setItem('normal_data', 'not-encrypted');

      SecureStorage.clear();

      // secure_とauth_で始まるキーは削除される
      expect(localStorage.removeItem).toHaveBeenCalledWith('secure_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_session');
      
      // sessionStorageは全てクリア
      expect(sessionStorage.clear).toHaveBeenCalled();
    });
  });
});