/**
 * SEC-027: 画像検証の統合テスト
 * マジックナンバー検証とポリグロット検出の統合動作を確認
 */

import { describe, it, expect } from 'vitest';
import { validateImageFileAsync } from '../imageUtils';

// テスト用のファイルを作成するヘルパー関数
const createTestFile = (content: string | Uint8Array, name: string, type: string): File => {
  const blob = content instanceof Uint8Array 
    ? new Blob([content], { type })
    : new Blob([content], { type });
  return new File([blob], name, { type });
};

// 正常なJPEGファイルを作成（完全版）
const createCompleteValidJPEG = (): Uint8Array => {
  // JPEGヘッダー（SOI + APP0）
  const header = new Uint8Array([
    0xFF, 0xD8, // SOI (Start of Image)
    0xFF, 0xE0, // APP0 marker
    0x00, 0x10, // APP0 length
    0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // JFIF version
    0x00, // units
    0x00, 0x01, 0x00, 0x01, // X and Y density
    0x00, 0x00  // thumbnail
  ]);
  
  // ダミーの画像データ
  const imageData = new Uint8Array(100);
  
  // JPEG終端マーカー
  const footer = new Uint8Array([0xFF, 0xD9]); // EOI (End of Image)
  
  // 結合
  const result = new Uint8Array(header.length + imageData.length + footer.length);
  result.set(header, 0);
  result.set(imageData, header.length);
  result.set(footer, header.length + imageData.length);
  
  return result;
};

// ポリグロットファイルを作成（JPEG + HTML）
const createPolyglotJPEG = (): Uint8Array => {
  const jpeg = createCompleteValidJPEG();
  const htmlPayload = new TextEncoder().encode('<script>alert("XSS")</script>');
  
  // JPEGの後にHTMLを追加
  const result = new Uint8Array(jpeg.length + htmlPayload.length);
  result.set(jpeg, 0);
  result.set(htmlPayload, jpeg.length);
  
  return result;
};

describe('ImageUtils Integration Tests', () => {
  describe('validateImageFileAsync - 統合テスト', () => {
    it('正常なJPEGファイルを受け入れる', async () => {
      const validJPEG = createCompleteValidJPEG();
      const file = createTestFile(validJPEG, 'test.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('ファイルサイズが大きすぎる場合は拒否する', async () => {
      // 3MBのファイルを作成
      const largeContent = new Uint8Array(3 * 1024 * 1024);
      const file = createTestFile(largeContent, 'large.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('2MB以下');
    });

    it('サポートされていないファイル形式を拒否する', async () => {
      const file = createTestFile('test', 'test.txt', 'text/plain');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('JPEG、PNG、WebP');
    });

    it('偽装されたファイル（テキストをJPEGとして）を拒否する', async () => {
      const textContent = 'This is not an image';
      const file = createTestFile(textContent, 'fake.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('画像形式と一致しません');
    });

    it('ポリグロットファイル（JPEG + HTML）を拒否する', async () => {
      const polyglot = createPolyglotJPEG();
      const file = createTestFile(polyglot, 'polyglot.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('セキュリティリスク');
    });

    it('二重拡張子のファイルを拒否する', async () => {
      const validJPEG = createCompleteValidJPEG();
      const file = createTestFile(validJPEG, 'image.php.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('疑わしい拡張子');
    });

    it('実行ファイルのシグネチャを持つファイルを拒否する', async () => {
      // PEヘッダー（MZ）で始まるファイル
      const exeContent = new Uint8Array([0x4D, 0x5A, ...new Array(100).fill(0)]);
      const file = createTestFile(exeContent, 'malware.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      // マジックナンバーチェックかポリグロット検出のいずれかで拒否される
      expect(result.error).toBeTruthy();
    });

    it('PHPコードを含むファイルを拒否する', async () => {
      const phpContent = '<?php system($_GET["cmd"]); ?>';
      const file = createTestFile(phpContent, 'shell.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('セキュリティシナリオテスト', () => {
    it('アップロード攻撃シナリオ1: HTMLインジェクション', async () => {
      const attack = `
        <img src=x onerror=alert(1)>
        <script>document.cookie</script>
      `;
      const file = createTestFile(attack, 'xss.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('画像形式と一致しません');
    });

    it('アップロード攻撃シナリオ2: Base64エンコードされたペイロード', async () => {
      const base64Attack = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
      const file = createTestFile(base64Attack, 'base64.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
    });

    it('アップロード攻撃シナリオ3: 複合攻撃（有効なJPEGヘッダー + 悪意のあるペイロード）', async () => {
      // 有効なJPEGヘッダーで始まるが、HTMLを含む
      const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF]);
      const htmlPayload = new TextEncoder().encode('<iframe src="evil.com"></iframe>');
      const combined = new Uint8Array(jpegHeader.length + htmlPayload.length);
      combined.set(jpegHeader, 0);
      combined.set(htmlPayload, jpegHeader.length);
      
      const file = createTestFile(combined, 'complex.jpg', 'image/jpeg');
      
      const result = await validateImageFileAsync(file);
      
      expect(result.isValid).toBe(false);
      // マジックナンバーは通過するかもしれないが、ポリグロット検出で捕まえる
    });
  });
});