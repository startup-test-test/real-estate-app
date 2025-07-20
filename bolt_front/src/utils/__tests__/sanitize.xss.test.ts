import { describe, it, expect } from 'vitest'
import { sanitizePropertyInput, escapeHtml, sanitizeLongText, displaySafeText } from '../sanitize'

describe('sanitize.ts - SEC-012 XSS対策強化テスト', () => {
  describe('sanitizePropertyInput - シミュレーター入力フィールドXSS対策', () => {
    it('基本的なスクリプトタグを除去する', () => {
      const inputs = [
        '<script>alert("XSS")</script>物件名',
        '物件名<script>alert("XSS")</script>',
        '<SCRIPT>alert("XSS")</SCRIPT>物件名',
        '< script >alert("XSS")</ script >物件名'
      ]
      
      inputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).not.toContain('<script')
        expect(result).not.toContain('</script')
        expect(result).not.toContain('alert')
        expect(result).toBe('物件名')
      })
    })

    it('イベントハンドラを除去する', () => {
      const inputs = [
        '<div onclick="alert(\'XSS\')">物件名</div>',
        '<img src=x onerror="alert(\'XSS\')">物件名',
        '<input onmouseover="alert(\'XSS\')">物件名',
        'カーサ<span onload="alert(\'XSS\')">マンション</span>',
        '<p on click = "alert(\'XSS\')">物件名</p>'
      ]
      
      inputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).not.toContain('onclick')
        expect(result).not.toContain('onerror')
        expect(result).not.toContain('onmouseover')
        expect(result).not.toContain('onload')
        expect(result).not.toContain('alert')
      })
    })

    it('危険なプロトコルを除去する', () => {
      const inputs = [
        'javascript:alert("XSS")物件名',
        'vbscript:msgbox("XSS")物件名',
        'data:text/html,<script>alert("XSS")</script>物件名',
        'file:///etc/passwd物件名',
        'ftp://evil.com物件名',
        'blob:http://example.com/uuid物件名'
      ]
      
      inputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).not.toContain('javascript:')
        expect(result).not.toContain('vbscript:')
        expect(result).not.toContain('data:')
        expect(result).not.toContain('file:')
        expect(result).not.toContain('ftp:')
        expect(result).not.toContain('blob:')
        expect(result).toBe('物件名')
      })
    })

    it('危険なHTMLタグを除去する', () => {
      const inputs = [
        '<iframe src="evil.com">物件名</iframe>',
        '<object data="evil.swf">物件名</object>',
        '<embed src="evil.swf">物件名</embed>',
        '<link rel="stylesheet" href="evil.css">物件名',
        '<style>body{display:none}</style>物件名',
        '<base href="evil.com">物件名',
        '<form action="evil.com">物件名</form>',
        '<meta http-equiv="refresh" content="0;url=evil.com">物件名',
        '<img src="x" onerror="alert(1)">物件名',
        '<svg onload="alert(1)">物件名</svg>',
        '<math>物件名</math>'
      ]
      
      inputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).not.toContain('<iframe')
        expect(result).not.toContain('<object')
        expect(result).not.toContain('<embed')
        expect(result).not.toContain('<link')
        expect(result).not.toContain('<style')
        expect(result).not.toContain('<base')
        expect(result).not.toContain('<form')
        expect(result).not.toContain('<meta')
        expect(result).not.toContain('<img')
        expect(result).not.toContain('<svg')
        expect(result).not.toContain('<math')
        expect(result).toBe('物件名')
      })
    })

    it('エンコードされたスクリプトタグを除去する', () => {
      const inputs = [
        '&lt;script&gt;alert("XSS")&lt;/script&gt;物件名',
        '&lt; script &gt;alert("XSS")&lt;/ script &gt;物件名',
        '&#60;script&#62;alert("XSS")&#60;/script&#62;物件名'
      ]
      
      inputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).not.toContain('&lt;')
        expect(result).not.toContain('&gt;')
        expect(result).not.toContain('&#60;')
        expect(result).not.toContain('&#62;')
        expect(result).not.toContain('script')
        expect(result).toBe('物件名')
      })
    })

    it('NULL文字とUnicode制御文字を除去する', () => {
      const inputs = [
        '物件名\0\0\0',
        '物件名\x00\x01\x02',
        '物件名\u200B\u200C\u200D',
        '物件名\uFEFF',
        '物件名\\x00\\x01',
        '物件名\\u0000\\u0001'
      ]
      
      inputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).toBe('物件名')
        expect(result).not.toContain('\0')
        expect(result).not.toContain('\u200B')
        expect(result).not.toContain('\uFEFF')
        expect(result).not.toContain('\\x')
        expect(result).not.toContain('\\u')
      })
    })

    it('複雑な攻撃パターンを防御する', () => {
      const inputs = [
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
        '<<SCRIPT>alert("XSS");//<</SCRIPT>',
        '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
        '<IMG SRC=/ onerror="alert(String.fromCharCode(88,83,83))"></img>',
        '<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>',
        '<IMG SRC=&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041>',
        '<IMG SRC=&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29>'
      ]
      
      inputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
        expect(result).not.toContain('script')
        expect(result).not.toContain('SCRIPT')
        expect(result).not.toContain('alert')
        expect(result).not.toContain('&#')
        expect(result).not.toContain('javascript')
      })
    })

    it('最大文字数を制限する', () => {
      const longInput = 'あ'.repeat(300)
      const result = sanitizePropertyInput(longInput)
      expect(result.length).toBe(200)
    })

    it('正常な入力はそのまま保持する', () => {
      const normalInputs = [
        'カーサ○○マンション',
        '東京都渋谷区1-2-3',
        'Casa Blanca 201号室',
        'ザ・タワー 高層階',
        '物件名（築10年）'
      ]
      
      normalInputs.forEach(input => {
        const result = sanitizePropertyInput(input)
        expect(result).toBe(input)
      })
    })

    it('連続する空白を1つにする', () => {
      const input = '物件名    with    spaces'
      const result = sanitizePropertyInput(input)
      expect(result).toBe('物件名 with spaces')
    })
  })

  describe('エッジケーステスト', () => {
    it('空文字列を適切に処理する', () => {
      expect(sanitizePropertyInput('')).toBe('')
      expect(sanitizePropertyInput(null as any)).toBe('')
      expect(sanitizePropertyInput(undefined as any)).toBe('')
    })

    it('HTMLコメントを除去する', () => {
      const input = '物件名<!-- evil comment -->です'
      const result = sanitizePropertyInput(input)
      expect(result).toBe('物件名です')
    })

    it('複数の攻撃ベクトルを組み合わせた入力を防御する', () => {
      const input = '<script>alert(1)</script><img src=x onerror=alert(2)>物件名<iframe src=evil.com></iframe>'
      const result = sanitizePropertyInput(input)
      expect(result).toBe('物件名')
    })
  })

  describe('他のサニタイズ関数のテスト', () => {
    it('escapeHtmlが正しく動作する', () => {
      const input = '<div>"Test" & \'XSS\' attempt</div>'
      const result = escapeHtml(input)
      expect(result).toBe('&lt;div&gt;&quot;Test&quot; &amp; &#x27;XSS&#x27; attempt&lt;&#x2F;div&gt;')
    })

    it('displaySafeTextがescapeHtmlを使用する', () => {
      const input = '<script>alert("XSS")</script>'
      const result = displaySafeText(input)
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
    })

    it('sanitizeLongTextが改行を保持する', () => {
      const input = '行1\n行2\n\n\n\n行3'
      const result = sanitizeLongText(input)
      expect(result).toBe('行1\n行2\n\n行3')
    })
  })
})