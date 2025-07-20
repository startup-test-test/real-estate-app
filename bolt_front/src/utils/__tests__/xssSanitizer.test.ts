import { describe, it, expect, beforeAll } from 'vitest'
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
import { 
  sanitizeSimulatorInput, 
  sanitizeMemoInput, 
  sanitizeUrlInput,
  escapeHtmlForDisplay,
  sanitizeByContext
} from '../xssSanitizer'

// DOMPurifyのセットアップ
beforeAll(() => {
  const window = new JSDOM('').window
  // @ts-ignore
  global.window = window
  // @ts-ignore
  global.document = window.document
})

describe('xssSanitizer - SEC-012 DOMPurifyベースのXSS対策', () => {
  describe('sanitizeSimulatorInput', () => {
    it('基本的なXSS攻撃を防御する', () => {
      const attacks = [
        { input: '<script>alert("XSS")</script>物件名', expected: '物件名' },
        { input: '物件名<img src=x onerror=alert(1)>', expected: '物件名' },
        { input: '<iframe src="evil.com">物件名</iframe>', expected: '物件名' },
        { input: 'javascript:alert("XSS")物件名', expected: 'alert("XSS")物件名' },
        { input: '<svg onload=alert(1)>物件名</svg>', expected: '物件名' }
      ]
      
      attacks.forEach(({ input, expected }) => {
        const result = sanitizeSimulatorInput(input)
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
        expect(result).not.toContain('script')
        expect(result).not.toContain('javascript:')
        expect(result).not.toContain('onerror')
        expect(result).not.toContain('onload')
        // 攻撃によってはテキストが完全に除去される場合がある
        if (expected) {
          expect(result).toBe(expected)
        }
      })
    })

    it('正常な入力を保持する', () => {
      const validInputs = [
        'カーサ○○マンション',
        '東京都渋谷区1-2-3',
        'Casa Blanca 201号室',
        'ザ・タワー（高層階）',
        '物件名 with spaces'
      ]
      
      validInputs.forEach(input => {
        const result = sanitizeSimulatorInput(input)
        expect(result).toBe(input.replace(/\s+/g, ' ').trim())
      })
    })

    it('NULL文字と制御文字を除去する', () => {
      const input = '物件名\x00\x01\x02\u200B\u200C\uFEFF'
      const result = sanitizeSimulatorInput(input)
      expect(result).toBe('物件名')
    })

    it('エスケープシーケンスを除去する', () => {
      const input = '物件名\\x3cscript\\x3e\\u0061lert(1)'
      const result = sanitizeSimulatorInput(input)
      // エスケープシーケンスは除去されるが、結果は異なる場合がある
      expect(result).not.toContain('\\x')
      expect(result).not.toContain('\\u')
      expect(result).toContain('物件名')
    })

    it('最大文字数を制限する', () => {
      const longInput = 'あ'.repeat(300)
      const result = sanitizeSimulatorInput(longInput)
      expect(result.length).toBe(200)
    })

    it('連続する空白を1つにする', () => {
      const input = '物件名    with    multiple    spaces'
      const result = sanitizeSimulatorInput(input)
      expect(result).toBe('物件名 with multiple spaces')
    })

    it('複雑な攻撃パターンを防御する', () => {
      const complexAttacks = [
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
        '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
        '<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>',
        '<<SCRIPT>alert("XSS");//<</SCRIPT>',
        '<META HTTP-EQUIV="refresh" CONTENT="0;url=javascript:alert(\'XSS\');">',
        '<STYLE>@import\'http://evil.com/xss.css\';</STYLE>'
      ]
      
      complexAttacks.forEach(attack => {
        const result = sanitizeSimulatorInput(attack)
        expect(result).not.toMatch(/<[^>]*>/);
        expect(result).not.toContain('script')
        expect(result).not.toContain('SCRIPT')
        expect(result).not.toContain('javascript')
        expect(result).not.toContain('alert')
      })
    })
  })

  describe('sanitizeMemoInput', () => {
    it('改行を保持する', () => {
      const input = '行1\n行2\n\n行3'
      const result = sanitizeMemoInput(input)
      expect(result).toBe('行1\n行2\n\n行3')
    })

    it('連続する改行を2つまでに制限する', () => {
      const input = '行1\n\n\n\n\n行2'
      const result = sanitizeMemoInput(input)
      expect(result).toBe('行1\n\n行2')
    })

    it('XSS攻撃を防御しつつ改行を保持する', () => {
      const input = '行1<script>alert(1)</script>\n行2\n<img src=x onerror=alert(2)>行3'
      const result = sanitizeMemoInput(input)
      expect(result).toBe('行1\n行2\n行3')
    })

    it('最大文字数を制限する', () => {
      const longInput = 'あ'.repeat(1500)
      const result = sanitizeMemoInput(longInput)
      expect(result.length).toBe(1000)
    })
  })

  describe('sanitizeUrlInput', () => {
    it('有効なURLを保持する', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://example.com/path?query=value',
        '/relative/path',
        '../relative/path'
      ]
      
      validUrls.forEach(url => {
        const result = sanitizeUrlInput(url)
        expect(result).toBe(url)
      })
    })

    it('危険なプロトコルを拒否する', () => {
      const dangerousUrls = [
        'javascript:alert(1)',
        'vbscript:msgbox("XSS")',
        'data:text/html,<script>alert(1)</script>',
        'file:///etc/passwd',
        'ftp://evil.com',
        'blob:http://example.com/uuid'
      ]
      
      dangerousUrls.forEach(url => {
        const result = sanitizeUrlInput(url)
        expect(result).toBe('')
      })
    })

    it('XSSを含むURLをサニタイズする', () => {
      const input = 'https://example.com/<script>alert(1)</script>'
      const result = sanitizeUrlInput(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
    })
  })

  describe('escapeHtmlForDisplay', () => {
    it('HTMLエンティティをエスケープする', () => {
      const input = '<div class="test">&copy; Test & "XSS" \'attempt\'</div>'
      const expected = '&lt;div class=&quot;test&quot;&gt;&amp;copy; Test &amp; &quot;XSS&quot; &#x27;attempt&#x27;&lt;&#x2F;div&gt;'
      expect(escapeHtmlForDisplay(input)).toBe(expected)
    })

    it('空文字列を適切に処理する', () => {
      expect(escapeHtmlForDisplay('')).toBe('')
      expect(escapeHtmlForDisplay(null as any)).toBe('')
      expect(escapeHtmlForDisplay(undefined as any)).toBe('')
    })
  })

  describe('sanitizeByContext', () => {
    it('コンテキストに応じて適切なサニタイザーを使用する', () => {
      const input = '<script>alert(1)</script>テスト'
      
      // property context
      const propertyResult = sanitizeByContext(input, 'property')
      expect(propertyResult).toBe('テスト')
      
      // memo context（改行のテスト）
      const memoInput = 'テスト\n<script>alert(1)</script>'
      const memoResult = sanitizeByContext(memoInput, 'memo')
      expect(memoResult).toBe('テスト')
      
      // url context
      const urlResult = sanitizeByContext('javascript:alert(1)', 'url')
      expect(urlResult).toBe('')
      
      // display context
      const displayResult = sanitizeByContext('<div>テスト</div>', 'display')
      expect(displayResult).toBe('&lt;div&gt;テスト&lt;&#x2F;div&gt;')
    })

    it('未知のコンテキストではデフォルトサニタイザーを使用する', () => {
      const input = '<script>alert(1)</script>テスト'
      const result = sanitizeByContext(input, 'unknown' as any)
      expect(result).toBe('テスト')
    })
  })

  describe('エッジケース', () => {
    it('非文字列入力を適切に処理する', () => {
      expect(sanitizeSimulatorInput(null as any)).toBe('')
      expect(sanitizeSimulatorInput(undefined as any)).toBe('')
      expect(sanitizeSimulatorInput(123 as any)).toBe('')
      expect(sanitizeSimulatorInput({} as any)).toBe('')
    })

    it('エンコードされた攻撃を防御する', () => {
      const encodedAttacks = [
        { input: '&lt;script&gt;alert(1)&lt;/script&gt;', shouldNotContain: ['<', '>'] },
        { input: '&#60;script&#62;alert(1)&#60;/script&#62;', shouldNotContain: ['<', '>'] },
        { input: '%3Cscript%3Ealert(1)%3C/script%3E', shouldNotContain: ['<', '>'] }
      ]
      
      encodedAttacks.forEach(({ input, shouldNotContain }) => {
        const result = sanitizeSimulatorInput(input)
        shouldNotContain.forEach(char => {
          expect(result).not.toContain(char)
        })
        // DOMPurifyがHTMLエンティティをそのまま残す場合があるため、
        // 危険な文字が実際のHTML要素として解釈されないことを確認
        expect(result).not.toMatch(/<script.*>/i)
      })
    })
  })
})