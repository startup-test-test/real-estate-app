/**
 * SEC-006: ファイルアップロードセキュリティ検証のテスト
 */

import { describe, test, expect, vi } from 'vitest';
import {
  validateFileName,
  validateMimeType,
  validateFileContent,
  performSecurityValidation,
  generateSecureFileName
} from '../fileSecurityValidator';

describe('ファイル名検証', () => {
  test('正常なファイル名を受け入れる', () => {
    const validNames = [
      'image.jpg',
      'property-photo.png',
      'house_123.webp',
      '物件画像.jpeg'
    ];

    validNames.forEach(name => {
      const result = validateFileName(name);
      expect(result.isValid).toBe(true);
    });
  });

  test('危険なファイル名を拒否する', () => {
    const dangerousNames = [
      'image<script>.jpg',
      '../../../etc/passwd.jpg',
      'image.php.jpg',
      'image.exe.jpg',
      'image\x00.jpg',
      'a'.repeat(256) + '.jpg'
    ];

    dangerousNames.forEach(name => {
      const result = validateFileName(name);
      expect(result.isValid).toBe(false);
    });
  });

  test('パストラバーサル攻撃を防ぐ', () => {
    const pathTraversalNames = [
      '../image.jpg',
      '..\\image.jpg',
      './../../image.jpg',
      'folder/../image.jpg'
    ];

    pathTraversalNames.forEach(name => {
      const result = validateFileName(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不正なファイル名');
    });
  });

  test('サポートされていない拡張子を拒否する', () => {
    const unsupportedFiles = [
      'document.pdf',
      'script.js',
      'program.exe',
      'image.gif',
      'video.mp4'
    ];

    unsupportedFiles.forEach(name => {
      const result = validateFileName(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('サポートされていないファイル形式');
    });
  });
});

describe('MIMEタイプ検証', () => {
  test('許可されたMIMEタイプを受け入れる', () => {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    validTypes.forEach(type => {
      const file = new File([''], 'test.jpg', { type });
      const result = validateMimeType(file);
      expect(result.isValid).toBe(true);
    });
  });

  test('許可されていないMIMEタイプを拒否する', () => {
    const invalidTypes = [
      'text/plain',
      'application/javascript',
      'application/x-php',
      'image/svg+xml',
      'image/gif'
    ];

    invalidTypes.forEach(type => {
      const file = new File([''], 'test.jpg', { type });
      const result = validateMimeType(file);
      expect(result.isValid).toBe(false);
    });
  });
});

describe('ファイル内容検証', () => {
  test('正常な画像データを受け入れる', async () => {
    const normalContent = 'normal image data without malicious content';
    const file = new File([normalContent], 'test.jpg', { type: 'image/jpeg' });
    
    const result = await validateFileContent(file);
    expect(result.isValid).toBe(true);
  });

  test('スクリプトタグを含むファイルを拒否する', async () => {
    const maliciousContents = [
      '<script>alert("XSS")</script>',
      '<img onload="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<?php system("rm -rf /"); ?>',
      '<iframe src="evil.com"></iframe>'
    ];

    for (const content of maliciousContents) {
      const file = new File([content], 'test.jpg', { type: 'image/jpeg' });
      const result = await validateFileContent(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不正なコンテンツ');
    }
  });
});

describe('総合的なセキュリティ検証', () => {
  // 画像サイズのモック
  global.Image = class {
    width = 800;
    height = 600;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';
    
    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  } as any;

  // URL.createObjectURLのモック
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  test('正常なファイルを受け入れる', async () => {
    const file = new File(['valid image data'], 'property.jpg', { 
      type: 'image/jpeg' 
    });
    Object.defineProperty(file, 'size', { value: 1024 * 500 }); // 500KB

    const result = await performSecurityValidation(file);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toBeUndefined();
  });

  test('小さすぎるファイルに警告を出す', async () => {
    const file = new File(['tiny'], 'tiny.jpg', { 
      type: 'image/jpeg' 
    });
    Object.defineProperty(file, 'size', { value: 500 }); // 500バイト

    const result = await performSecurityValidation(file);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('ファイルサイズが小さすぎます（1KB未満）');
  });

  test('大きすぎるファイルを拒否する', async () => {
    const file = new File(['large image'], 'large.jpg', { 
      type: 'image/jpeg' 
    });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB

    const result = await performSecurityValidation(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('ファイルサイズが大きすぎます');
  });

  test('画像サイズが大きすぎる場合は拒否する', async () => {
    // 大きすぎる画像のモック
    const LargeImage = class extends (global.Image as any) {
      width = 15000;
      height = 15000;
    };
    const originalImage = global.Image;
    global.Image = LargeImage as any;

    const file = new File(['large dimensions'], 'huge.jpg', { 
      type: 'image/jpeg' 
    });
    Object.defineProperty(file, 'size', { value: 1024 * 500 });

    const result = await performSecurityValidation(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('画像サイズが大きすぎます');

    // モックをリセット
    global.Image = originalImage;
  });
});

describe('セキュアなファイル名生成', () => {
  test('セキュアで一意なファイル名を生成する', () => {
    const originalNames = [
      'image.jpg',
      'photo.PNG',
      'dangerous<script>.jpg',
      '../../../etc/passwd.jpg'
    ];

    const generatedNames = originalNames.map(name => generateSecureFileName(name));
    
    // 全てのファイル名が異なることを確認
    const uniqueNames = new Set(generatedNames);
    expect(uniqueNames.size).toBe(generatedNames.length);

    // 生成されたファイル名の形式を確認
    generatedNames.forEach(name => {
      expect(name).toMatch(/^property_\d+_[a-z0-9]+\.(jpg|png|webp|jpeg)$/);
    });
  });

  test('拡張子を適切に処理する', () => {
    const testCases = [
      { input: 'image.JPG', expectedExt: '.jpg' },
      { input: 'photo.PNG', expectedExt: '.png' },
      { input: 'picture.WebP', expectedExt: '.webp' },
      { input: 'no-extension', expectedExt: '.jpg' }
    ];

    testCases.forEach(({ input, expectedExt }) => {
      const result = generateSecureFileName(input);
      expect(result.endsWith(expectedExt)).toBe(true);
    });
  });
});