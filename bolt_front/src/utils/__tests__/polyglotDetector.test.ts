/**
 * SEC-027: ポリグロットファイル攻撃対策のテスト
 */

import { describe, it, expect } from 'vitest';
import { detectPolyglotFile, isSecureImageFileWithPolyglotCheck } from '../polyglotDetector';

// テスト用のファイルを作成するヘルパー関数
const createTestFile = (content: string | Uint8Array, name: string, type: string): File => {
  const blob = content instanceof Uint8Array 
    ? new Blob([content], { type })
    : new Blob([content], { type });
  return new File([blob], name, { type });
};

// 正常なJPEGファイルのヘッダーとフッター
const createValidJPEG = (): Uint8Array => {
  const header = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
  const footer = new Uint8Array([0xFF, 0xD9]);
  const content = new Uint8Array(100); // ダミーデータ
  
  const result = new Uint8Array(header.length + content.length + footer.length);
  result.set(header, 0);
  result.set(content, header.length);
  result.set(footer, header.length + content.length);
  
  return result;
};

// 正常なPNGファイルのヘッダーとフッター
const createValidPNG = (): Uint8Array => {
  const header = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const iend = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  const content = new Uint8Array(100); // ダミーデータ
  
  const result = new Uint8Array(header.length + content.length + iend.length);
  result.set(header, 0);
  result.set(content, header.length);
  result.set(iend, header.length + content.length);
  
  return result;
};

describe('PolyglotDetector', () => {
  describe('detectPolyglotFile', () => {
    it('正常なJPEGファイルを検証する', async () => {
      const validJPEG = createValidJPEG();
      const file = createTestFile(validJPEG, 'test.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(result.confidence).toBe(100);
    });

    it('正常なPNGファイルを検証する', async () => {
      const validPNG = createValidPNG();
      const file = createTestFile(validPNG, 'test.png', 'image/png');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(result.confidence).toBe(100);
    });

    it('HTMLタグを含むファイルを検出する', async () => {
      const maliciousContent = '<script>alert("XSS")</script>';
      const file = createTestFile(maliciousContent, 'malicious.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.threats[0]).toContain('危険なHTMLパターン');
    });

    it('PHPコードを含むファイルを検出する', async () => {
      const phpContent = '<?php system($_GET["cmd"]); ?>';
      const file = createTestFile(phpContent, 'shell.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats).toContain('PHPコードパターンが検出されました');
    });

    it('JavaScriptイベントハンドラを検出する', async () => {
      const xssContent = '<img src=x onerror=alert(1)>';
      const file = createTestFile(xssContent, 'xss.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
    });

    it('二重拡張子を検出する', async () => {
      const validJPEG = createValidJPEG();
      const file = createTestFile(validJPEG, 'image.php.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats).toContain('二重拡張子が検出されました（例: image.php.jpg）');
    });

    it('Windows実行ファイルのシグネチャを検出する', async () => {
      const exeHeader = new Uint8Array([0x4D, 0x5A]); // MZ
      const file = createTestFile(exeHeader, 'malware.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats).toContain('Windows実行ファイルのシグネチャが検出されました');
    });

    it('JPEG終端マーカーの後の不審なデータを検出する', async () => {
      const validJPEG = createValidJPEG();
      const extraData = new TextEncoder().encode('<script>alert("hidden")</script>');
      const combined = new Uint8Array(validJPEG.length + extraData.length);
      combined.set(validJPEG, 0);
      combined.set(extraData, validJPEG.length);
      
      const file = createTestFile(combined, 'polyglot.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats.some(t => t.includes('JPEG終端マーカーの後に'))).toBe(true);
    });

    it('Base64エンコードされたデータURLを検出する', async () => {
      const dataUrl = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
      const file = createTestFile(dataUrl, 'data.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
    });

    it('疑わしい拡張子を含むファイル名を検出する', async () => {
      const validJPEG = createValidJPEG();
      const file = createTestFile(validJPEG, 'image.exe.jpg', 'image/jpeg');
      
      const result = await detectPolyglotFile(file);
      
      expect(result.isClean).toBe(false);
      expect(result.threats.some(t => t.includes('.exe'))).toBe(true);
    });
  });

  describe('isSecureImageFileWithPolyglotCheck', () => {
    it('クリーンなファイルを受け入れる', async () => {
      const validJPEG = createValidJPEG();
      const file = createTestFile(validJPEG, 'clean.jpg', 'image/jpeg');
      
      const result = await isSecureImageFileWithPolyglotCheck(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.details?.isClean).toBe(true);
    });

    it('ポリグロットファイルを拒否する', async () => {
      const polyglotContent = `
        ${String.fromCharCode(0xFF, 0xD8, 0xFF)}
        <script>alert('XSS')</script>
        <?php system($_GET['cmd']); ?>
      `;
      const file = createTestFile(polyglotContent, 'polyglot.jpg', 'image/jpeg');
      
      const result = await isSecureImageFileWithPolyglotCheck(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('セキュリティリスクが検出されました');
      expect(result.details?.isClean).toBe(false);
    });

    it('複数の脅威を検出した場合の信頼度スコア', async () => {
      const multiThreat = `
        <script>alert(1)</script>
        <?php eval($_POST['code']); ?>
        <iframe src="evil.com"></iframe>
      `;
      const file = createTestFile(multiThreat, 'multi-threat.jpg', 'image/jpeg');
      
      const result = await isSecureImageFileWithPolyglotCheck(file);
      
      expect(result.isValid).toBe(false);
      expect(result.details?.threats.length).toBeGreaterThan(2);
      expect(result.details?.confidence).toBeLessThan(50);
    });
  });
});