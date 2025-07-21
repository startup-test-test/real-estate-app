/**
 * SEC-067: 外部スクリプトの整合性チェックのテスト
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  loadExternalScript, 
  loadExternalScripts, 
  loadExternalStylesheet,
  setCSPPolicy,
  getRecommendedCSP
} from '../scriptIntegrity';

describe('scriptIntegrity - 外部スクリプトの整合性チェック', () => {
  let mockScript: HTMLScriptElement;
  let mockLink: HTMLLinkElement;

  beforeEach(() => {
    // DOM要素のモック
    mockScript = document.createElement('script');
    mockLink = document.createElement('link');
    
    const originalCreateElement = document.createElement.bind(document);
    
    // document.createElementのモック
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'script') return mockScript;
      if (tagName === 'link') return mockLink;
      if (tagName === 'meta') return originalCreateElement('meta');
      return originalCreateElement(tagName);
    });
    
    // document.head.appendChildのモック
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
    
    // document.querySelectorのモック
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    
    // console.warnとconsole.logのモック
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadExternalScript', () => {
    test('正常なスクリプト読み込み（SRIあり）', async () => {
      const config = {
        src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
        integrity: 'sha384-QVn7Yx1axmMVCR4EpXlDjAI5+dCH5mW3QJoy0aGr6Ij8SmZJxYYH5NjZMtfKjLJL',
        onLoad: vi.fn()
      };

      const loadPromise = loadExternalScript(config);
      
      // onloadイベントを発火
      mockScript.onload?.(new Event('load'));
      
      await loadPromise;

      expect(mockScript.src).toBe(config.src);
      expect(mockScript.integrity).toBe(config.integrity);
      expect(mockScript.crossOrigin).toBe('anonymous');
      expect(mockScript.async).toBe(true);
      expect(config.onLoad).toHaveBeenCalled();
    });

    test('SRIなしの場合は警告を出力', async () => {
      const config = {
        src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
      };

      const loadPromise = loadExternalScript(config);
      mockScript.onload?.(new Event('load'));
      await loadPromise;

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('integrity属性が設定されていません')
      );
    });

    test('HTTPSではないURLは拒否', async () => {
      const config = {
        src: 'http://example.com/script.js'
      };

      await expect(loadExternalScript(config)).rejects.toThrow(
        'HTTPSプロトコルのみ許可されています'
      );
    });

    test('無効なintegrity属性は拒否', async () => {
      const config = {
        src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
        integrity: 'invalid-hash'
      };

      await expect(loadExternalScript(config)).rejects.toThrow(
        '無効なintegrity属性です'
      );
    });

    test('信頼できないCDNの場合は警告', async () => {
      const config = {
        src: 'https://untrusted-cdn.com/script.js',
        integrity: 'sha384-QVn7Yx1axmMVCR4EpXlDjAI5+dCH5mW3QJoy0aGr6Ij8SmZJxYYH5NjZMtfKjLJL'
      };

      const loadPromise = loadExternalScript(config);
      mockScript.onload?.(new Event('load'));
      await loadPromise;

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('信頼できるCDNのリストに含まれていません')
      );
    });

    test('スクリプト読み込みエラーの処理', async () => {
      const config = {
        src: 'https://cdn.jsdelivr.net/npm/nonexistent@1.0.0/script.js',
        onError: vi.fn()
      };

      const loadPromise = loadExternalScript(config);
      mockScript.onerror?.(new Event('error'));

      await expect(loadPromise).rejects.toThrow(
        'スクリプト https://cdn.jsdelivr.net/npm/nonexistent@1.0.0/script.js の読み込みに失敗しました'
      );
      expect(config.onError).toHaveBeenCalled();
    });

    test('既に読み込まれているスクリプトはスキップ', async () => {
      const existingScript = document.createElement('script');
      vi.spyOn(document, 'querySelector').mockReturnValue(existingScript);

      const config = {
        src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
      };

      await loadExternalScript(config);

      expect(document.head.appendChild).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('既に読み込まれています')
      );
    });

    test('複数のSRIハッシュをサポート', async () => {
      const config = {
        src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
        integrity: 'sha256-abc123 sha384-def456 sha512-ghi789'
      };

      const loadPromise = loadExternalScript(config);
      mockScript.onload?.(new Event('load'));
      await loadPromise;

      expect(mockScript.integrity).toBe(config.integrity);
    });
  });

  describe('loadExternalScripts', () => {
    test('複数のスクリプトを順番に読み込む', async () => {
      const configs = [
        {
          src: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
          integrity: 'sha384-vtXRMe3mGCx5N9cv00yn4r6ra5AiFmltrTaHXQW1L7LTDqe5aENzekABo5o2'
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
          integrity: 'sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p'
        }
      ];

      // 各スクリプトの読み込みを開始
      configs.forEach((_, index) => {
        setTimeout(() => {
          const mockAppendChild = document.head.appendChild as vi.Mock;
          const scripts = mockAppendChild.mock.calls;
          if (scripts[index]) {
            mockScript.onload?.(new Event('load'));
          }
        }, 10);
      });

      await loadExternalScripts(configs);

      expect(document.head.appendChild).toHaveBeenCalledTimes(2);
    });

    test('1つのスクリプトが失敗したら処理を中断', async () => {
      const configs = [
        {
          src: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js'
        },
        {
          src: 'https://invalid-url.com/script.js'
        }
      ];

      setTimeout(() => {
        mockScript.onerror?.(new Event('error'));
      }, 10);

      await expect(loadExternalScripts(configs)).rejects.toThrow();
    });
  });

  describe('loadExternalStylesheet', () => {
    test('スタイルシートの正常な読み込み', async () => {
      const href = 'https://fonts.googleapis.com/css2?family=Roboto&display=swap';
      const integrity = 'sha384-abcdef123456';

      const loadPromise = loadExternalStylesheet(href, integrity);
      mockLink.onload?.(new Event('load'));
      
      await loadPromise;

      expect(mockLink.rel).toBe('stylesheet');
      expect(mockLink.href).toBe(href);
      expect(mockLink.integrity).toBe(integrity);
      expect(mockLink.crossOrigin).toBe('anonymous');
    });

    test('HTTPSではないスタイルシートは拒否', async () => {
      const href = 'http://example.com/style.css';

      await expect(loadExternalStylesheet(href)).rejects.toThrow(
        'HTTPSプロトコルのみ許可されています'
      );
    });
  });

  describe('CSP設定', () => {
    test('CSPポリシーを設定', () => {
      const policy = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net";
      setCSPPolicy(policy);

      // appendChildが呼ばれたことを確認
      expect(document.head.appendChild).toHaveBeenCalled();
      
      // 最後に追加された要素を取得
      const mockAppendChild = document.head.appendChild as vi.Mock;
      const lastCall = mockAppendChild.mock.calls[mockAppendChild.mock.calls.length - 1];
      const metaTag = lastCall[0] as HTMLMetaElement;
      
      expect(metaTag).toBeDefined();
      expect(metaTag.httpEquiv).toBe('Content-Security-Policy');
      expect(metaTag.content).toBe(policy);
    });

    test('推奨CSPポリシーの取得', () => {
      const csp = getRecommendedCSP();
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("upgrade-insecure-requests");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    test('既存のCSPメタタグを置き換え', () => {
      const existingMeta = document.createElement('meta');
      existingMeta.httpEquiv = 'Content-Security-Policy';
      vi.spyOn(document, 'querySelector').mockReturnValue(existingMeta);
      vi.spyOn(existingMeta, 'remove').mockImplementation(() => {});

      const newPolicy = "default-src 'none'";
      setCSPPolicy(newPolicy);

      expect(existingMeta.remove).toHaveBeenCalled();
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });
});