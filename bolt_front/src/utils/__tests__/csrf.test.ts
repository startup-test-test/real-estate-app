/**
 * SEC-004: CSRF対策のテスト
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  addCSRFHeader,
  getSupabaseCSRFConfig,
  addCSRFToFormData,
  secureFetch
} from '../csrf';

// モックの設定
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

const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  })
};

// グローバルオブジェクトのモック
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// crypto.getRandomValuesのモック
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    })
  }
});

// fetchのモック
global.fetch = vi.fn();

describe('CSRF Protection', () => {
  beforeEach(() => {
    // 各テスト前にストレージをクリア
    mockSessionStorage.clear();
    mockLocalStorage.store = {};
    vi.clearAllMocks();
  });

  describe('generateCSRFToken', () => {
    test('64文字の16進数文字列を生成する', () => {
      const token = generateCSRFToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    test('毎回異なるトークンを生成する', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('storeCSRFToken', () => {
    test('セッションストレージにトークンを保存する', () => {
      const token = 'test-csrf-token';
      storeCSRFToken(token);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
      expect(mockSessionStorage.store['csrf_token']).toBe(token);
    });
  });

  describe('getCSRFToken', () => {
    test('保存されているトークンを取得する', () => {
      const token = 'existing-csrf-token';
      mockSessionStorage.store['csrf_token'] = token;
      
      const retrievedToken = getCSRFToken();
      expect(retrievedToken).toBe(token);
    });

    test('トークンが存在しない場合は新規生成して保存する', () => {
      const token = getCSRFToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
    });
  });

  describe('addCSRFHeader', () => {
    test('ヘッダーにCSRFトークンを追加する', () => {
      const token = 'test-csrf-token';
      mockSessionStorage.store['csrf_token'] = token;
      
      const headers = addCSRFHeader();
      expect(headers).toEqual({
        'X-CSRF-Token': token
      });
    });

    test('既存のヘッダーを保持しつつCSRFトークンを追加する', () => {
      const token = 'test-csrf-token';
      mockSessionStorage.store['csrf_token'] = token;
      
      const existingHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      };
      
      const headers = addCSRFHeader(existingHeaders);
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
        'X-CSRF-Token': token
      });
    });
  });

  describe('getSupabaseCSRFConfig', () => {
    test('Supabase設定オブジェクトを返す', () => {
      const config = getSupabaseCSRFConfig();
      
      expect(config).toHaveProperty('auth');
      expect(config).toHaveProperty('global');
      expect(config.auth).toHaveProperty('persistSession', true);
      expect(config.auth).toHaveProperty('detectSessionInUrl', true);
      expect(config.auth).toHaveProperty('autoRefreshToken', true);
      expect(config.auth).toHaveProperty('storage');
      expect(config.global).toHaveProperty('headers');
    });

    test('storage.getItemがCSRFトークンを検証する', () => {
      const config = getSupabaseCSRFConfig();
      const key = 'test-key';
      const value = 'test-value';
      mockLocalStorage.store[key] = value;
      
      const result = config.auth.storage.getItem(key);
      expect(result).toBe(value);
      
      // CSRFトークンが生成されることを確認
      expect(mockSessionStorage.store['csrf_token']).toBeDefined();
    });
  });

  describe('addCSRFToFormData', () => {
    test('FormDataにCSRFトークンを追加する', () => {
      const token = 'test-csrf-token';
      mockSessionStorage.store['csrf_token'] = token;
      
      const formData = new FormData();
      formData.append('name', 'test');
      
      const updatedFormData = addCSRFToFormData(formData);
      expect(updatedFormData.get('csrf_token')).toBe(token);
      expect(updatedFormData.get('name')).toBe('test');
    });
  });

  describe('secureFetch', () => {
    test('GETリクエストにはCSRFトークンを追加しない', async () => {
      const mockResponse = new Response('OK');
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      await secureFetch('/api/test');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {});
    });

    test('POSTリクエストにCSRFトークンを追加する', async () => {
      const token = 'test-csrf-token';
      mockSessionStorage.store['csrf_token'] = token;
      
      const mockResponse = new Response('OK');
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      await secureFetch('/api/test', { method: 'POST' });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token
        }
      });
    });

    test('PUT、DELETE、PATCHリクエストにもCSRFトークンを追加する', async () => {
      const token = 'test-csrf-token';
      mockSessionStorage.store['csrf_token'] = token;
      
      const mockResponse = new Response('OK');
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const methods = ['PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        await secureFetch('/api/test', { method });
        
        expect(global.fetch).toHaveBeenCalledWith('/api/test', {
          method,
          headers: {
            'X-CSRF-Token': token
          }
        });
      }
    });

    test('既存のヘッダーとオプションを保持する', async () => {
      const token = 'test-csrf-token';
      mockSessionStorage.store['csrf_token'] = token;
      
      const mockResponse = new Response('OK');
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      await secureFetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: 'test' })
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        body: JSON.stringify({ data: 'test' })
      });
    });
  });
});