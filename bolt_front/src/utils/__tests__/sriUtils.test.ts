/**
 * SEC-032: SRIユーティリティのテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createSecureLink,
  loadGoogleFonts,
  createSecureScript,
  createSecureInlineStyle,
  loadFontWithSRI,
  RECOMMENDED_CSP_HEADERS
} from '../sriUtils';

describe('sriUtils - SEC-032 SRI対策', () => {
  beforeEach(() => {
    // DOM環境をクリーンアップ
    document.head.innerHTML = '';
  });

  afterEach(() => {
    // DOM環境をクリーンアップ
    document.head.innerHTML = '';
  });

  describe('createSecureLink', () => {
    it('基本的なlink要素を作成する', () => {
      const link = createSecureLink('https://example.com/style.css');
      
      expect(link.tagName).toBe('LINK');
      expect(link.href).toBe('https://example.com/style.css');
      expect(link.rel).toBe('stylesheet');
      expect(link.crossOrigin).toBe('anonymous');
    });

    it('integrity属性を設定できる', () => {
      const link = createSecureLink('https://example.com/style.css', {
        integrity: 'sha384-abc123'
      });
      
      expect(link.integrity).toBe('sha384-abc123');
    });

    it('カスタムオプションを設定できる', () => {
      const link = createSecureLink('https://example.com/font.woff2', {
        rel: 'preload',
        type: 'font/woff2',
        crossorigin: 'use-credentials'
      });
      
      expect(link.rel).toBe('preload');
      expect(link.type).toBe('font/woff2');
      expect(link.crossOrigin).toBe('use-credentials');
    });
  });

  describe('loadGoogleFonts', () => {
    it('Google Fontsを読み込む', () => {
      loadGoogleFonts('Noto Sans JP');
      
      const links = document.querySelectorAll('link');
      expect(links.length).toBe(3); // preconnect x2 + font CSS
      
      const fontLink = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
      expect(fontLink).toBeTruthy();
      expect(fontLink?.getAttribute('href')).toContain('Noto+Sans+JP');
    });

    it('既存のフォントは重複して読み込まない', () => {
      // 最初の読み込み
      loadGoogleFonts('Noto Sans JP');
      const firstLoadLinks = document.querySelectorAll('link');
      const firstFontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]');
      
      // 2回目の読み込み
      loadGoogleFonts('Noto Sans JP');
      const secondLoadLinks = document.querySelectorAll('link');
      const secondFontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]');
      
      // link要素の総数が増えていないことを確認
      expect(secondLoadLinks.length).toBe(firstLoadLinks.length);
      expect(secondFontLinks.length).toBe(firstFontLinks.length);
      expect(firstFontLinks.length).toBe(1);
    });

    it('カスタムウェイトを指定できる', () => {
      loadGoogleFonts('Roboto', ['300', '400', '700']);
      
      const fontLink = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
      expect(fontLink?.getAttribute('href')).toContain('wght@300;400;700');
    });
  });

  describe('createSecureScript', () => {
    it('基本的なscript要素を作成する', () => {
      const script = createSecureScript('https://example.com/script.js');
      
      expect(script.tagName).toBe('SCRIPT');
      expect(script.src).toBe('https://example.com/script.js');
      expect(script.crossOrigin).toBe('anonymous');
    });

    it('integrity属性を設定できる', () => {
      const script = createSecureScript('https://example.com/script.js', {
        integrity: 'sha384-xyz789'
      });
      
      expect(script.integrity).toBe('sha384-xyz789');
    });

    it('async/deferを設定できる', () => {
      const script = createSecureScript('https://example.com/script.js', {
        async: true,
        defer: true
      });
      
      expect(script.async).toBe(true);
      expect(script.defer).toBe(true);
    });

    it('nonceを設定できる', () => {
      const script = createSecureScript('https://example.com/script.js', {
        nonce: 'abc123'
      });
      
      expect(script.nonce).toBe('abc123');
    });
  });

  describe('createSecureInlineStyle', () => {
    it('インラインスタイルを作成する', () => {
      const css = 'body { color: red; }';
      const style = createSecureInlineStyle(css);
      
      expect(style.tagName).toBe('STYLE');
      expect(style.textContent).toBe(css);
    });

    it('nonceを設定できる', () => {
      const style = createSecureInlineStyle('body { color: blue; }', 'nonce123');
      
      expect(style.nonce).toBe('nonce123');
    });
  });

  describe('loadFontWithSRI', () => {
    it('フォントファイルを@font-faceで読み込む', () => {
      loadFontWithSRI(
        'Custom Font',
        '/fonts/custom.woff2',
        'sha384-fontHash',
        700
      );
      
      const style = document.querySelector('style');
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain('@font-face');
      expect(style?.textContent).toContain("font-family: 'Custom Font'");
      expect(style?.textContent).toContain('font-weight: 700');
    });
  });

  describe('RECOMMENDED_CSP_HEADERS', () => {
    it('推奨CSPヘッダーが定義されている', () => {
      expect(RECOMMENDED_CSP_HEADERS['Content-Security-Policy']).toBeDefined();
      expect(RECOMMENDED_CSP_HEADERS['Content-Security-Policy']).toContain("default-src 'self'");
      expect(RECOMMENDED_CSP_HEADERS['Content-Security-Policy']).toContain('https://fonts.googleapis.com');
      expect(RECOMMENDED_CSP_HEADERS['Content-Security-Policy']).toContain('https://fonts.gstatic.com');
    });
  });
});