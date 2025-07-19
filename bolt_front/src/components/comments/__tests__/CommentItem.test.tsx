import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import CommentItem, { CommentData } from '../CommentItem';

// DOMPurifyのモック
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((dirty: string, config?: any) => {
      if (!dirty) return '';
      
      // 簡易的なサニタイゼーション実装
      let clean = dirty
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
      
      // 許可されたタグ以外を除去
      if (config?.ALLOWED_TAGS) {
        const allowedTags = config.ALLOWED_TAGS.join('|');
        const regex = new RegExp(`<(?!\/?(?:${allowedTags})\\b)[^>]+>`, 'gi');
        clean = clean.replace(regex, '');
      }
      
      return clean;
    })
  }
}));

describe('CommentItem XSS対策テスト', () => {
  const mockComment: CommentData = {
    id: '1',
    content: '',
    created_at: new Date().toISOString(),
    user: {
      id: 'user1',
      email: 'test@example.com',
      full_name: 'Test User'
    }
  };

  describe('悪意のあるコンテンツの無害化', () => {
    test('scriptタグが除去される', () => {
      const maliciousComment = {
        ...mockComment,
        content: 'Hello <script>alert("XSS")</script> World'
      };
      
      render(<CommentItem comment={maliciousComment} />);
      
      const content = screen.getByText(/Hello.*World/);
      expect(content.innerHTML).not.toContain('<script>');
      expect(content.innerHTML).not.toContain('alert');
    });

    test('イベントハンドラが除去される', () => {
      const maliciousComment = {
        ...mockComment,
        content: '<img src="x" onerror="alert(\'XSS\')" />'
      };
      
      render(<CommentItem comment={maliciousComment} />);
      
      const content = screen.getByText('', { selector: 'p' });
      expect(content.innerHTML).not.toContain('onerror');
      expect(content.innerHTML).not.toContain('alert');
    });

    test('javascript:プロトコルが除去される', () => {
      const maliciousComment = {
        ...mockComment,
        content: '<a href="javascript:alert(\'XSS\')">Click me</a>'
      };
      
      render(<CommentItem comment={maliciousComment} />);
      
      // pタグを取得して内容を確認
      const content = screen.getByText('Click me');
      const pElement = content.parentElement;
      expect(pElement?.innerHTML).not.toContain('javascript:');
    });

    test('複数のXSS攻撃パターンが同時に除去される', () => {
      const maliciousComment = {
        ...mockComment,
        content: `
          <script>alert('XSS1')</script>
          <img src="x" onerror="alert('XSS2')" />
          <a href="javascript:alert('XSS3')">Link</a>
          <div onclick="alert('XSS4')">Click</div>
        `
      };
      
      render(<CommentItem comment={maliciousComment} />);
      
      // pタグを取得して内容を確認
      const container = screen.getByText((_content, element) => {
        return element?.tagName === 'P';
      });
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('onerror');
      expect(container.innerHTML).not.toContain('javascript:');
      expect(container.innerHTML).not.toContain('onclick');
    });
  });

  describe('許可されたHTMLタグの保持', () => {
    test('許可されたタグ（bold, italic, emphasis, strong）は保持される', () => {
      const safeComment = {
        ...mockComment,
        content: '<b>Bold</b> <i>Italic</i> <em>Emphasis</em> <strong>Strong</strong>'
      };
      
      render(<CommentItem comment={safeComment} />);
      
      const content = screen.getByText('', { selector: 'p' });
      expect(content.innerHTML).toContain('<b>Bold</b>');
      expect(content.innerHTML).toContain('<i>Italic</i>');
      expect(content.innerHTML).toContain('<em>Emphasis</em>');
      expect(content.innerHTML).toContain('<strong>Strong</strong>');
    });

    test('改行タグ（br）は保持される', () => {
      const safeComment = {
        ...mockComment,
        content: 'Line 1<br>Line 2<br/>Line 3'
      };
      
      render(<CommentItem comment={safeComment} />);
      
      // brタグが正しく表示されることを確認
      const content = screen.getByText((_content, element) => {
        return element?.tagName === 'P' && element.innerHTML.includes('<br');
      });
      expect(content).toBeTruthy();
    });
  });

  describe('通常のテキストコンテンツの表示', () => {
    test('プレーンテキストは正常に表示される', () => {
      const normalComment = {
        ...mockComment,
        content: 'これは通常のコメントです。'
      };
      
      render(<CommentItem comment={normalComment} />);
      
      expect(screen.getByText('これは通常のコメントです。')).toBeTruthy();
    });

    test('特殊文字を含むテキストも正常に表示される', () => {
      const specialComment = {
        ...mockComment,
        content: '特殊文字: < > & " \' を含むコメント'
      };
      
      render(<CommentItem comment={specialComment} />);
      
      expect(screen.getByText(/特殊文字:.*を含むコメント/)).toBeTruthy();
    });

    test('改行を含むテキストも正常に表示される', () => {
      const multilineComment = {
        ...mockComment,
        content: '1行目\n2行目\n3行目'
      };
      
      render(<CommentItem comment={multilineComment} />);
      
      expect(screen.getByText(/1行目.*2行目.*3行目/s)).toBeTruthy();
    });
  });

  describe('エッジケースのテスト', () => {
    test('空のコンテンツでもエラーが発生しない', () => {
      const emptyComment = {
        ...mockComment,
        content: ''
      };
      
      expect(() => render(<CommentItem comment={emptyComment} />)).not.toThrow();
    });

    test('nullやundefinedのコンテンツでもエラーが発生しない', () => {
      const nullComment = {
        ...mockComment,
        content: null as any
      };
      
      expect(() => render(<CommentItem comment={nullComment} />)).not.toThrow();
    });

    test('非常に長いコンテンツでも正常に処理される', () => {
      const longComment = {
        ...mockComment,
        content: 'A'.repeat(10000)
      };
      
      expect(() => render(<CommentItem comment={longComment} />)).not.toThrow();
    });
  });
});