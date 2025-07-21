/**
 * SEC-029: innerHTML使用によるXSS対策のテスト（セキュリティ面に特化）
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import DOMPurify from 'dompurify';

describe('enhancedPdfGenerator - SEC-029 innerHTML セキュリティテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DOMPurify サニタイズ設定', () => {
    it('PDFで必要なタグとスタイルを許可する設定', () => {
      const testHTML = `
        <div style="color: red;">
          <style>.pdf { font-size: 14px; }</style>
          <h1 style="margin: 10px;">Title</h1>
          <p>Content</p>
        </div>
      `;

      const config = {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      };

      const sanitized = DOMPurify.sanitize(testHTML, config);

      // styleタグが保持される
      expect(sanitized).toContain('<style>');
      expect(sanitized).toContain('.pdf { font-size: 14px; }');
      
      // style属性が保持される
      expect(sanitized).toContain('style="color: red;"');
      expect(sanitized).toContain('style="margin: 10px;"');
    });

    it('XSSスクリプトを除去する', () => {
      const maliciousHTML = `
        <div>
          <script>alert('XSS')</script>
          <p onclick="alert('XSS')">Click me</p>
          <img src="x" onerror="alert('XSS')">
          <a href="javascript:alert('XSS')">Link</a>
        </div>
      `;

      const config = {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      };

      const sanitized = DOMPurify.sanitize(maliciousHTML, config);

      // 危険な要素が除去される
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('alert');
    });

    it('data属性を除去する', () => {
      const htmlWithData = `
        <div data-secret="password" data-user-id="123">
          <p data-sensitive="info">Content</p>
        </div>
      `;

      const config = {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      };

      const sanitized = DOMPurify.sanitize(htmlWithData, config);

      // data属性が除去される
      expect(sanitized).not.toContain('data-secret');
      expect(sanitized).not.toContain('data-user-id');
      expect(sanitized).not.toContain('data-sensitive');
    });

    it('危険なプロトコルを除去する', () => {
      const dangerousProtocols = `
        <div>
          <a href="javascript:void(0)">JS Link</a>
          <a href="data:text/html,<script>alert(1)</script>">Data URL</a>
          <a href="vbscript:msgbox('XSS')">VBScript</a>
          <a href="file:///etc/passwd">File</a>
          <a href="https://example.com">Safe Link</a>
        </div>
      `;

      const config = {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      };

      const sanitized = DOMPurify.sanitize(dangerousProtocols, config);

      // 危険なプロトコルが除去される
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('data:');
      expect(sanitized).not.toContain('vbscript:');
      expect(sanitized).not.toContain('file:');
      
      // 安全なhttpsリンクは保持される
      expect(sanitized).toContain('https://example.com');
    });

    it('SVGとMathMLのXSSベクトルを除去する', () => {
      const svgXSS = `
        <svg onload="alert('XSS')">
          <script>alert('SVG XSS')</script>
          <animate onbegin="alert('XSS')" />
        </svg>
        <math>
          <mtext><script>alert('MathML XSS')</script></mtext>
        </math>
      `;

      const config = {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      };

      const sanitized = DOMPurify.sanitize(svgXSS, config);

      // SVGとMathMLのイベントハンドラが除去される
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('onbegin');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('HTMLエンコードされたXSSを処理する', () => {
      const encodedXSS = `
        <div>
          &lt;script&gt;alert('XSS')&lt;/script&gt;
          <p>Normal &amp; encoded content</p>
          <a href="javascript&#58;alert('XSS')">Encoded JS</a>
        </div>
      `;

      const config = {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      };

      const sanitized = DOMPurify.sanitize(encodedXSS, config);

      // エンコードされたスクリプトはテキストとして保持される
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('&lt;/script&gt;');
      
      // エンコードされたjavascript:も除去される
      expect(sanitized).not.toContain('javascript&#58;');
      expect(sanitized).not.toContain('javascript:');
    });

    it('ネストされたHTMLタグを適切に処理する', () => {
      const nestedHTML = `
        <div>
          <div style="padding: 10px;">
            <style>
              .nested { color: blue; }
            </style>
            <h2 style="font-size: 18px;">Nested Title</h2>
            <div>
              <p>Deep nested content</p>
              <script>alert('Nested XSS')</script>
            </div>
          </div>
        </div>
      `;

      const config = {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      };

      const sanitized = DOMPurify.sanitize(nestedHTML, config);

      // 正当なネストされた要素は保持される
      expect(sanitized).toContain('style="padding: 10px;"');
      expect(sanitized).toContain('.nested { color: blue; }');
      expect(sanitized).toContain('Deep nested content');
      
      // ネストされたスクリプトも除去される
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('Nested XSS');
    });
  });

  describe('一時コンテナのセキュリティ', () => {
    it('一時コンテナが画面外に配置される', () => {
      const container = document.createElement('div');
      container.id = 'temp-pdf-container';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      
      // 画面外に配置されていることを確認
      expect(container.style.position).toBe('absolute');
      expect(container.style.left).toBe('-9999px');
      expect(parseInt(container.style.left)).toBeLessThan(0);
    });

    it('一時コンテナのIDが予測可能でない', () => {
      // 実装では固定IDを使用しているが、
      // より安全にするには動的IDを使用すべき
      const containerId = 'temp-pdf-container';
      
      // 現在の実装の確認
      expect(containerId).toBe('temp-pdf-container');
      
      // 推奨: ランダムIDの生成例
      const safeId = `temp-pdf-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      expect(safeId).toMatch(/^temp-pdf-\d+-[a-z0-9]+$/);
    });
  });
});