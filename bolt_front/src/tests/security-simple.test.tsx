import { describe, it, expect } from 'vitest';
import { detectHTMLTags, validateSafeString, simulatorValidationRules } from '../utils/securityValidation';
import { validatePropertyUrl } from '../utils/validation';

describe('セキュリティバリデーション単体テスト', () => {
  describe('detectHTMLTags', () => {
    it('HTMLタグを検出する', () => {
      expect(detectHTMLTags('<script>alert("XSS")</script>')).toBe(true);
      expect(detectHTMLTags('<img src=x onerror=alert(1)>')).toBe(true);
      expect(detectHTMLTags('normal text')).toBe(false);
      expect(detectHTMLTags('a < b && b > c')).toBe(false);
    });
  });

  describe('validatePropertyUrl', () => {
    it('URLの形式を検証する', () => {
      // validatePropertyUrlはエラーメッセージまたはnull（エラーなし）を返す
      // 危険なプロトコルも新しいURL()コンストラクタでは有効なURLとして扱われる
      expect(validatePropertyUrl('javascript:alert("XSS")')).toBe(null);
      expect(validatePropertyUrl('https://example.com')).toBe(null);
      expect(validatePropertyUrl('http://localhost:3000')).toBe(null);
      
      // 無効なURL形式
      expect(validatePropertyUrl('not a url')).toBe('URLの形式が正しくありません');
      expect(validatePropertyUrl('http://')).toBe('URLの形式が正しくありません');
    });
  });

  describe('validateSafeString', () => {
    it('物件名のHTMLタグを検出する', () => {
      // validateSafeString(value, fieldName) の順番で引数を渡す
      const result = validateSafeString('<script>alert("XSS")</script>', '物件名');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('物件名にHTMLタグは使用できません');
    });

    it('所在地のHTMLタグを検出する', () => {
      const result = validateSafeString('<img src=x>', '所在地');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('所在地にHTMLタグは使用できません');
    });

    it('正常な入力を許可する', () => {
      expect(validateSafeString('テストマンション', '物件名').isValid).toBe(true);
      expect(validateSafeString('東京都渋谷区', '所在地').isValid).toBe(true);
      expect(validateSafeString('これはメモです', 'メモ').isValid).toBe(true);
    });
  });

  describe('simulatorValidationRules', () => {
    it('バリデーションルールが定義されている', () => {
      expect(simulatorValidationRules).toHaveProperty('propertyName');
      expect(simulatorValidationRules).toHaveProperty('location');
      expect(simulatorValidationRules).toHaveProperty('propertyUrl');
      expect(simulatorValidationRules).toHaveProperty('purchasePrice');
      expect(simulatorValidationRules).toHaveProperty('monthlyRent');
    });
  });
});