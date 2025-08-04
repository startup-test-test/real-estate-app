import { describe, it, expect, vi } from 'vitest';
import { sanitizeUrl, sanitizeImageUrl, sanitizeText } from './securityUtils';

describe('securityUtils', () => {
  describe('sanitizeUrl', () => {
    it('安全なHTTPSのURLはそのまま返す', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('安全なHTTPのURLはそのまま返す', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('相対URLはそのまま返す', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
      expect(sanitizeUrl('relative/path')).toBe('relative/path');
    });

    it('javascript:プロトコルをブロック', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(sanitizeUrl('javascript:alert("XSS")')).toBe('#');
      expect(consoleSpy).toHaveBeenCalledWith('Potentially dangerous URL blocked:', 'javascript:alert("XSS")');
      consoleSpy.mockRestore();
    });

    it('data:プロトコルをブロック', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBe('#');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('vbscript:プロトコルをブロック', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe('#');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('大文字小文字を無視してブロック', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(sanitizeUrl('JavaScript:alert("XSS")')).toBe('#');
      expect(sanitizeUrl('JAVASCRIPT:alert("XSS")')).toBe('#');
      consoleSpy.mockRestore();
    });

    it('nullやundefinedは#を返す', () => {
      expect(sanitizeUrl(null)).toBe('#');
      expect(sanitizeUrl(undefined)).toBe('#');
      expect(sanitizeUrl('')).toBe('#');
    });

    it('前後の空白を削除', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('sanitizeImageUrl', () => {
    const defaultImage = 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400';

    it('安全なHTTPSの画像URLはそのまま返す', () => {
      expect(sanitizeImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    });

    it('相対パスの画像URLはそのまま返す', () => {
      expect(sanitizeImageUrl('/images/photo.jpg')).toBe('/images/photo.jpg');
    });

    it('javascript:プロトコルはデフォルト画像を返す', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(sanitizeImageUrl('javascript:alert("XSS")')).toBe(defaultImage);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('nullやundefinedはデフォルト画像を返す', () => {
      expect(sanitizeImageUrl(null)).toBe(defaultImage);
      expect(sanitizeImageUrl(undefined)).toBe(defaultImage);
      expect(sanitizeImageUrl('')).toBe(defaultImage);
    });

    it('カスタムデフォルト画像を指定できる', () => {
      const customDefault = '/default.jpg';
      expect(sanitizeImageUrl(null, customDefault)).toBe(customDefault);
      expect(sanitizeImageUrl('javascript:alert("XSS")', customDefault)).toBe(customDefault);
    });
  });

  describe('sanitizeText', () => {
    it('通常のテキストはそのまま返す', () => {
      expect(sanitizeText('Hello World')).toBe('Hello World');
    });

    it('HTMLタグをエスケープ', () => {
      expect(sanitizeText('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('HTMLエンティティをエスケープ', () => {
      expect(sanitizeText('Tom & Jerry')).toBe('Tom &amp; Jerry');
      expect(sanitizeText('"Hello"')).toBe('&quot;Hello&quot;');
      expect(sanitizeText("It's me")).toBe('It&#039;s me');
    });

    it('複数のHTMLタグをエスケープ', () => {
      expect(sanitizeText('<div><img src="x" onerror="alert(1)"></div>'))
        .toBe('&lt;div&gt;&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;&lt;/div&gt;');
    });

    it('nullやundefinedは空文字を返す', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
    });
  });
});