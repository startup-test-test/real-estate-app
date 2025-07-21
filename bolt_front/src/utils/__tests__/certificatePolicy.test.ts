/**
 * SEC-033: Certificate Policy テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isTrustedDomain,
  secureFetch,
  createSecureWebSocket,
  handleCertificateError,
  SECURITY_HEADERS,
  PUBLIC_KEY_PINS
} from '../certificatePolicy';

// fetch のモック
global.fetch = vi.fn();

// WebSocket のモック
global.WebSocket = vi.fn().mockImplementation((url: string) => ({
  url,
  readyState: 0,
  close: vi.fn()
}));

// alert のモック
global.alert = vi.fn();

describe('certificatePolicy - SEC-033 Certificate Pinning代替策', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isTrustedDomain', () => {
    it('信頼できるドメインを正しく判定する', () => {
      // 信頼できるドメイン
      expect(isTrustedDomain('https://supabase.co/api')).toBe(true);
      expect(isTrustedDomain('https://api.supabase.com/v1')).toBe(true);
      expect(isTrustedDomain('https://fonts.googleapis.com/css')).toBe(true);
      expect(isTrustedDomain('https://github.com/repo')).toBe(true);
    });

    it('サブドメインも許可する', () => {
      expect(isTrustedDomain('https://api.supabase.co/endpoint')).toBe(true);
      expect(isTrustedDomain('https://cdn.supabase.com/assets')).toBe(true);
    });

    it('HTTPSでないURLは拒否する', () => {
      expect(isTrustedDomain('http://supabase.co/api')).toBe(false);
      expect(isTrustedDomain('http://github.com')).toBe(false);
    });

    it('信頼できないドメインは拒否する', () => {
      expect(isTrustedDomain('https://malicious.com')).toBe(false);
      expect(isTrustedDomain('https://fake-supabase.co')).toBe(false);
      expect(isTrustedDomain('https://supabase.co.evil.com')).toBe(false);
    });

    it('無効なURLは拒否する', () => {
      expect(isTrustedDomain('not-a-url')).toBe(false);
      expect(isTrustedDomain('')).toBe(false);
    });
  });

  describe('secureFetch', () => {
    it('信頼できるドメインへのリクエストを許可する', async () => {
      const mockResponse = new Response('ok');
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      const result = await secureFetch('https://supabase.co/api/data');

      expect(fetch).toHaveBeenCalledWith(
        'https://supabase.co/api/data',
        expect.objectContaining({
          credentials: 'same-origin',
          mode: 'cors',
          redirect: 'error'
        })
      );
      expect(result).toBe(mockResponse);
    });

    it('信頼できないドメインへのリクエストを拒否する', async () => {
      await expect(
        secureFetch('https://malicious.com/api')
      ).rejects.toThrow('Untrusted domain');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('オプションを正しくマージする', async () => {
      const mockResponse = new Response('ok');
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

      await secureFetch('https://github.com/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://github.com/api',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          mode: 'cors',
          redirect: 'error'
        })
      );
    });

    it('Certificate Transparencyヘッダーをログに記録する', async () => {
      const mockResponse = new Response('ok', {
        headers: { 'expect-ct': 'max-age=86400' }
      });
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse);
      
      const consoleSpy = vi.spyOn(console, 'log');

      await secureFetch('https://supabase.co/api');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Certificate Transparency enabled:',
        'max-age=86400'
      );
    });
  });

  describe('createSecureWebSocket', () => {
    it('WSSプロトコルのWebSocketを作成する', () => {
      const ws = createSecureWebSocket('wss://api.supabase.co/realtime');

      expect(WebSocket).toHaveBeenCalledWith('wss://api.supabase.co/realtime');
      expect(ws).toBeDefined();
    });

    it('WSプロトコルは拒否する', () => {
      expect(() => {
        createSecureWebSocket('ws://api.supabase.co/realtime');
      }).toThrow('WebSocket must use WSS protocol');
    });

    it('信頼できないドメインは拒否する', () => {
      expect(() => {
        createSecureWebSocket('wss://malicious.com/realtime');
      }).toThrow('Untrusted WebSocket domain');
    });
  });

  describe('handleCertificateError', () => {
    it('証明書エラーを検出してアラートを表示する', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      handleCertificateError({ code: 'ERR_CERT_AUTHORITY_INVALID' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Certificate error detected:',
        expect.any(Object)
      );
      expect(alert).toHaveBeenCalledWith(
        'セキュリティ警告: 証明書エラーが検出されました。接続が安全でない可能性があります。'
      );
    });

    it('その他の証明書エラーも処理する', () => {
      handleCertificateError({ code: 'ERR_CERT_DATE_INVALID' });
      expect(alert).toHaveBeenCalled();

      handleCertificateError({ code: 'ERR_CERT_COMMON_NAME_INVALID' });
      expect(alert).toHaveBeenCalledTimes(2);
    });

    it('証明書以外のエラーは無視する', () => {
      handleCertificateError({ code: 'NETWORK_ERROR' });
      expect(alert).not.toHaveBeenCalled();
    });
  });

  describe('SECURITY_HEADERS', () => {
    it('必要なセキュリティヘッダーが定義されている', () => {
      expect(SECURITY_HEADERS['Strict-Transport-Security']).toBeDefined();
      expect(SECURITY_HEADERS['Expect-CT']).toBeDefined();
      expect(SECURITY_HEADERS['Content-Security-Policy']).toBeDefined();
      expect(SECURITY_HEADERS['X-Frame-Options']).toBeDefined();
    });

    it('HSTSが適切に設定されている', () => {
      expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain('max-age=31536000');
      expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain('includeSubDomains');
      expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain('preload');
    });

    it('CSPが適切に設定されている', () => {
      const csp = SECURITY_HEADERS['Content-Security-Policy'];
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain('upgrade-insecure-requests');
      expect(csp).toContain('https://*.supabase.co');
    });
  });

  describe('PUBLIC_KEY_PINS', () => {
    it('公開鍵ピン情報が定義されている', () => {
      expect(PUBLIC_KEY_PINS).toBeDefined();
      expect(PUBLIC_KEY_PINS['supabase.co']).toBeDefined();
      expect(Array.isArray(PUBLIC_KEY_PINS['supabase.co'])).toBe(true);
    });
  });
});