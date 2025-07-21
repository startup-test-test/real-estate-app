/**
 * SEC-028: 外部URL検証不備対策のテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidRedirectUrl,
  getSafeRedirectUrl,
  getCurrentOrigin,
  isSameOrigin,
  safeWindowLocationAssign,
  getRedirectUrlFromParams,
  hasDangerousProtocol
} from '../urlValidator';

describe('urlValidator', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // window.locationをモック
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      origin: 'https://ooya-dx.com',
      href: ''
    } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('isValidRedirectUrl', () => {
    it('空のURLを拒否する', () => {
      expect(isValidRedirectUrl('')).toBe(false);
      expect(isValidRedirectUrl(null as any)).toBe(false);
      expect(isValidRedirectUrl(undefined as any)).toBe(false);
    });

    it('許可された相対URLを受け入れる', () => {
      expect(isValidRedirectUrl('/')).toBe(true);
      expect(isValidRedirectUrl('/dashboard')).toBe(true);
      expect(isValidRedirectUrl('/simulator')).toBe(true);
      expect(isValidRedirectUrl('/share/abc123')).toBe(true);
      expect(isValidRedirectUrl('/collaboration/xyz789')).toBe(true);
    });

    it('許可されていない相対URLを拒否する', () => {
      expect(isValidRedirectUrl('/admin')).toBe(false);
      expect(isValidRedirectUrl('/api/internal')).toBe(false);
      expect(isValidRedirectUrl('/../../etc/passwd')).toBe(false);
    });

    it('許可されたドメインの絶対URLを受け入れる', () => {
      expect(isValidRedirectUrl('https://ooya-dx.com/')).toBe(true);
      expect(isValidRedirectUrl('https://www.ooya-dx.com/dashboard')).toBe(true);
      expect(isValidRedirectUrl('http://localhost:3000/simulator')).toBe(true);
      expect(isValidRedirectUrl('https://test.vercel.app/share/123')).toBe(true);
    });

    it('許可されていないドメインの絶対URLを拒否する', () => {
      expect(isValidRedirectUrl('https://evil.com/phishing')).toBe(false);
      expect(isValidRedirectUrl('http://attacker.net')).toBe(false);
      expect(isValidRedirectUrl('https://google.com')).toBe(false);
    });

    it('危険なプロトコルを拒否する', () => {
      expect(isValidRedirectUrl('javascript:alert(1)')).toBe(false);
      expect(isValidRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidRedirectUrl('vbscript:msgbox("XSS")')).toBe(false);
      expect(isValidRedirectUrl('file:///etc/passwd')).toBe(false);
    });

    it('プロトコル相対URLを拒否する', () => {
      expect(isValidRedirectUrl('//evil.com/redirect')).toBe(false);
      expect(isValidRedirectUrl('//ooya-dx.com/safe')).toBe(false);
    });
  });

  describe('getSafeRedirectUrl', () => {
    it('安全なURLをそのまま返す', () => {
      expect(getSafeRedirectUrl('/dashboard')).toBe('/dashboard');
      expect(getSafeRedirectUrl('https://ooya-dx.com/simulator')).toBe('https://ooya-dx.com/simulator');
    });

    it('危険なURLに対してデフォルトURLを返す', () => {
      expect(getSafeRedirectUrl('javascript:alert(1)')).toBe('/');
      expect(getSafeRedirectUrl('https://evil.com')).toBe('/');
      expect(getSafeRedirectUrl(null)).toBe('/');
    });

    it('カスタムデフォルトURLを使用する', () => {
      expect(getSafeRedirectUrl('javascript:alert(1)', '/dashboard')).toBe('/dashboard');
      expect(getSafeRedirectUrl(null, '/home')).toBe('/home');
    });

    it('エンコードされたURLをデコードして検証する', () => {
      expect(getSafeRedirectUrl('%2Fdashboard')).toBe('/dashboard');
      expect(getSafeRedirectUrl('https%3A%2F%2Fooya-dx.com%2Fsimulator')).toBe('https://ooya-dx.com/simulator');
      expect(getSafeRedirectUrl('javascript%3Aalert(1)')).toBe('/');
    });
  });

  describe('getCurrentOrigin', () => {
    it('現在のオリジンを返す', () => {
      expect(getCurrentOrigin()).toBe('https://ooya-dx.com');
    });
  });

  describe('isSameOrigin', () => {
    it('同一オリジンのURLを正しく判定する', () => {
      expect(isSameOrigin('https://ooya-dx.com/dashboard')).toBe(true);
      expect(isSameOrigin('/dashboard')).toBe(true);
      expect(isSameOrigin('https://ooya-dx.com:443/page')).toBe(true);
    });

    it('異なるオリジンのURLを正しく判定する', () => {
      expect(isSameOrigin('https://evil.com/dashboard')).toBe(false);
      expect(isSameOrigin('http://ooya-dx.com/dashboard')).toBe(false);
      expect(isSameOrigin('https://ooya-dx.com:8080/page')).toBe(false);
    });

    it('無効なURLに対してfalseを返す', () => {
      expect(isSameOrigin('not-a-url')).toBe(false);
      expect(isSameOrigin('')).toBe(false);
    });
  });

  describe('safeWindowLocationAssign', () => {
    beforeEach(() => {
      window.location.href = '';
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('安全な相対URLにリダイレクトする', () => {
      safeWindowLocationAssign('/dashboard');
      expect(window.location.href).toBe('/dashboard');
    });

    it('同一オリジンの絶対URLにリダイレクトする', () => {
      safeWindowLocationAssign('https://ooya-dx.com/simulator');
      expect(window.location.href).toBe('https://ooya-dx.com/simulator');
    });

    it('異なるオリジンへのリダイレクトをブロックする', () => {
      safeWindowLocationAssign('https://evil.com/phishing');
      expect(window.location.href).toBe('/');
      expect(console.warn).toHaveBeenCalledWith('Unsafe redirect URL detected:', 'https://evil.com/phishing');
    });

    it('危険なプロトコルをブロックする', () => {
      safeWindowLocationAssign('javascript:alert(1)');
      expect(window.location.href).toBe('/');
    });
  });

  describe('getRedirectUrlFromParams', () => {
    it('複数のパラメータ名から有効なURLを取得する', () => {
      const params = new URLSearchParams('redirect=%2Fdashboard&other=value');
      expect(getRedirectUrlFromParams(params)).toBe('/dashboard');

      const params2 = new URLSearchParams('return=%2Fsimulator');
      expect(getRedirectUrlFromParams(params2)).toBe('/simulator');

      const params3 = new URLSearchParams('next=%2Fshare%2Fabc123');
      expect(getRedirectUrlFromParams(params3)).toBe('/share/abc123');
    });

    it('無効なURLの場合はnullを返す', () => {
      const params = new URLSearchParams('redirect=javascript%3Aalert(1)');
      expect(getRedirectUrlFromParams(params)).toBe(null);

      const params2 = new URLSearchParams('return=https%3A%2F%2Fevil.com');
      expect(getRedirectUrlFromParams(params2)).toBe(null);
    });

    it('パラメータがない場合はnullを返す', () => {
      const params = new URLSearchParams('other=value');
      expect(getRedirectUrlFromParams(params)).toBe(null);
    });
  });

  describe('hasDangerousProtocol', () => {
    it('危険なプロトコルを検出する', () => {
      expect(hasDangerousProtocol('javascript:alert(1)')).toBe(true);
      expect(hasDangerousProtocol('data:text/html,<script>alert(1)</script>')).toBe(true);
      expect(hasDangerousProtocol('vbscript:msgbox("XSS")')).toBe(true);
      expect(hasDangerousProtocol('file:///etc/passwd')).toBe(true);
      expect(hasDangerousProtocol('JAVASCRIPT:alert(1)')).toBe(true);
      expect(hasDangerousProtocol('  javascript:alert(1)  ')).toBe(true);
    });

    it('安全なプロトコルに対してfalseを返す', () => {
      expect(hasDangerousProtocol('https://example.com')).toBe(false);
      expect(hasDangerousProtocol('http://localhost')).toBe(false);
      expect(hasDangerousProtocol('/relative/path')).toBe(false);
      expect(hasDangerousProtocol('')).toBe(false);
    });
  });
});