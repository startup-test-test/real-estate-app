import { describe, it, expect } from 'vitest';
import { 
  sanitizeFilePath, 
  extractSecureFileNameFromUrl,
  validateFileName 
} from '../fileSecurityValidator';

describe('SEC-014: ファイル名パストラバーサル対策', () => {
  describe('sanitizeFilePath', () => {
    it('正常なファイル名を受け入れる', () => {
      const testCases = [
        'image.jpg',
        'property_12345_abc.png',
        'test-file.webp',
        'my_photo_2024.jpeg'
      ];

      testCases.forEach(filePath => {
        const result = sanitizeFilePath(filePath);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedPath).toBe(filePath);
      });
    });

    it('パストラバーサル攻撃パターンを拒否する', () => {
      const maliciousPatterns = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        'images/../../../etc/passwd',
        'property-images/../../config.php',
        './../../sensitive-data.txt',
        '~/home/user/.ssh/id_rsa',
        '/etc/passwd',
        '\\windows\\system32\\drivers\\etc\\hosts',
        'image.jpg/../../../etc/passwd',
        '%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '%252e%252e%252fetc%252fpasswd',
        '..%c0%af..%c0%afetc%c0%afpasswd',
        'image\x00.jpg',
        'file\x01name.png',
        '....//....//etc/passwd',
        '..;/etc/passwd'
      ];

      maliciousPatterns.forEach(pattern => {
        const result = sanitizeFilePath(pattern);
        expect(result.isValid).toBe(false);
        // エラーメッセージは異なる場合があるため、無効であることのみを確認
      });
    });

    it('ディレクトリトラバーサル後のファイル名のみを抽出する', () => {
      const testCases = [
        { input: 'uploads/images/photo.jpg', expected: 'photo.jpg' },
        { input: 'path/to/file.png', expected: 'file.png' },
        { input: 'deep/nested/folder/image.webp', expected: 'image.webp' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sanitizeFilePath(input);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedPath).toBe(expected);
      });
    });

    it('空のパスを拒否する', () => {
      const emptyPaths = ['', ' ', '   ', '\t', '\n'];

      emptyPaths.forEach(path => {
        const result = sanitizeFilePath(path);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('空のファイルパス');
      });
    });

    it('Windowsスタイルのパスを正規化する', () => {
      const windowsPaths = [
        { input: 'folder\\file.jpg', expected: 'file.jpg' },
        { input: 'C:\\Users\\Public\\image.png', expected: 'image.png' },
        { input: 'path\\to\\photo.webp', expected: 'photo.webp' }
      ];

      windowsPaths.forEach(({ input, expected }) => {
        const result = sanitizeFilePath(input);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedPath).toBe(expected);
      });
    });

    it('複数の連続したスラッシュを正規化する', () => {
      const paths = [
        { input: 'folder//file.jpg', expected: 'file.jpg' },
        { input: 'path///to////image.png', expected: 'image.png' },
        { input: '//leading//slashes//photo.webp', expected: 'photo.webp' }
      ];

      paths.forEach(({ input, expected }) => {
        const result = sanitizeFilePath(input);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedPath).toBe(expected);
      });
    });
  });

  describe('extractSecureFileNameFromUrl', () => {
    it('正常なURLからファイル名を抽出する', () => {
      const urls = [
        {
          url: 'https://example.com/images/photo.jpg',
          expected: 'photo.jpg'
        },
        {
          url: 'https://storage.googleapis.com/bucket/property_123_abc.png',
          expected: 'property_123_abc.png'
        },
        {
          url: 'http://localhost:3000/uploads/image.webp',
          expected: 'image.webp'
        }
      ];

      urls.forEach(({ url, expected }) => {
        const result = extractSecureFileNameFromUrl(url);
        expect(result).toBe(expected);
      });
    });

    it('パストラバーサルを含むURLを拒否する', () => {
      const maliciousUrls = [
        'https://example.com/images/../../../etc/passwd',
        'http://localhost/uploads/..\\..\\config.php',
        'https://storage.com/bucket/%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        'https://example.com/files/image.jpg/../../../sensitive.txt'
      ];

      maliciousUrls.forEach(url => {
        const result = extractSecureFileNameFromUrl(url);
        expect(result).toBeNull();
      });
    });

    it('無効なURLを適切に処理する', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com/file.jpg',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        ''
      ];

      invalidUrls.forEach(url => {
        const result = extractSecureFileNameFromUrl(url);
        expect(result).toBeNull();
      });
    });
  });

  describe('validateFileName - SEC-014追加テスト', () => {
    it('エンコードされたパストラバーサルパターンを検出する', () => {
      const encodedPatterns = [
        'file%2e%2e%2fpasswd',
        '%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ];

      encodedPatterns.forEach(pattern => {
        const result = validateFileName(pattern);
        // %2eを含むパターンは検出される
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('不正なファイル名');
      });
    });

    it('隠しファイルパターンを検証する', () => {
      const hiddenFiles = [
        '.htaccess',
        '.env',
        '.git',
        '.bashrc'
      ];

      hiddenFiles.forEach(fileName => {
        const result = validateFileName(fileName);
        // 拡張子がないため無効
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('サポートされていないファイル形式');
      });
    });

    it('特殊なUnicode文字を含むファイル名を検証する', () => {
      const unicodeFileNames = [
        'image\u0000.jpg',  // NULL文字
        'file\u0001.png',   // 制御文字
        'photo\u202e.webp', // Right-to-Left Override
        'test\ufefffile.jpeg' // Zero Width No-Break Space
      ];

      unicodeFileNames.forEach(fileName => {
        const result = validateFileName(fileName);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('使用できない文字');
      });
    });
  });
});