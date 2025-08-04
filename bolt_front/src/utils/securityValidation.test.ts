import { describe, it, expect } from 'vitest';
import {
  validateNumberRange,
  validateStringLength,
  detectHTMLTags,
  validateSafeString,
  validateEmail,
  validateSimulatorInputs
} from './securityValidation';

describe('securityValidation', () => {
  describe('validateNumberRange', () => {
    it('有効な数値を受け入れる', () => {
      expect(validateNumberRange(50, 0, 100, 'テスト')).toEqual({ isValid: true });
      expect(validateNumberRange('50', 0, 100, 'テスト')).toEqual({ isValid: true });
      expect(validateNumberRange(0, 0, 100, 'テスト')).toEqual({ isValid: true });
      expect(validateNumberRange(100, 0, 100, 'テスト')).toEqual({ isValid: true });
    });

    it('範囲外の数値を拒否する', () => {
      expect(validateNumberRange(-1, 0, 100, 'テスト')).toEqual({
        isValid: false,
        error: 'テストは0以上で入力してください'
      });
      expect(validateNumberRange(101, 0, 100, 'テスト')).toEqual({
        isValid: false,
        error: 'テストは100以下で入力してください'
      });
    });

    it('数値以外を拒否する', () => {
      expect(validateNumberRange('abc', 0, 100, 'テスト')).toEqual({
        isValid: false,
        error: 'テストは数値で入力してください'
      });
      expect(validateNumberRange('', 0, 100, 'テスト')).toEqual({
        isValid: false,
        error: 'テストは数値で入力してください'
      });
    });
  });

  describe('validateStringLength', () => {
    it('有効な文字列長を受け入れる', () => {
      expect(validateStringLength('test', 10, 'テスト')).toEqual({ isValid: true });
      expect(validateStringLength('', 10, 'テスト', 0)).toEqual({ isValid: true });
      expect(validateStringLength('1234567890', 10, 'テスト')).toEqual({ isValid: true });
    });

    it('長すぎる文字列を拒否する', () => {
      expect(validateStringLength('12345678901', 10, 'テスト')).toEqual({
        isValid: false,
        error: 'テストは10文字以下で入力してください'
      });
    });

    it('短すぎる文字列を拒否する', () => {
      expect(validateStringLength('ab', 10, 'テスト', 3)).toEqual({
        isValid: false,
        error: 'テストは3文字以上で入力してください'
      });
    });

    it('必須項目の空文字を拒否する', () => {
      expect(validateStringLength('', 10, 'テスト', 1)).toEqual({
        isValid: false,
        error: 'テストは必須項目です'
      });
    });
  });

  describe('detectHTMLTags', () => {
    it('HTMLタグを検出する', () => {
      expect(detectHTMLTags('<script>alert("XSS")</script>')).toBe(true);
      expect(detectHTMLTags('<div>test</div>')).toBe(true);
      expect(detectHTMLTags('<img src="test.jpg">')).toBe(true);
      expect(detectHTMLTags('test<br/>test')).toBe(true);
    });

    it('通常のテキストではfalseを返す', () => {
      expect(detectHTMLTags('normal text')).toBe(false);
      expect(detectHTMLTags('1 < 2 and 3 > 2')).toBe(false);
      expect(detectHTMLTags('')).toBe(false);
    });
  });

  describe('validateSafeString', () => {
    it('安全な文字列を受け入れる', () => {
      expect(validateSafeString('普通のテキスト', 'テスト')).toEqual({ isValid: true });
      expect(validateSafeString('1 < 2 and 3 > 2', 'テスト')).toEqual({ isValid: true });
    });

    it('HTMLタグを含む文字列を拒否する', () => {
      expect(validateSafeString('<script>alert("XSS")</script>', 'テスト')).toEqual({
        isValid: false,
        error: 'テストにHTMLタグは使用できません'
      });
    });
  });

  describe('validateEmail', () => {
    it('有効なメールアドレスを受け入れる', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user.name@example.co.jp')).toEqual({ isValid: true });
      expect(validateEmail('user+tag@example.com')).toEqual({ isValid: true });
    });

    it('無効なメールアドレスを拒否する', () => {
      expect(validateEmail('invalid.email')).toEqual({
        isValid: false,
        error: 'メールアドレスの形式が正しくありません'
      });
      expect(validateEmail('@example.com')).toEqual({
        isValid: false,
        error: 'メールアドレスの形式が正しくありません'
      });
      expect(validateEmail('test@')).toEqual({
        isValid: false,
        error: 'メールアドレスの形式が正しくありません'
      });
    });

    it('空のメールアドレスを拒否する', () => {
      expect(validateEmail('')).toEqual({
        isValid: false,
        error: 'メールアドレスは必須項目です'
      });
    });
  });

  describe('validateSimulatorInputs', () => {
    it('有効な入力を受け入れる', () => {
      const validInputs = {
        propertyName: 'テスト物件',
        location: '東京都渋谷区',
        propertyUrl: 'https://example.com',
        propertyMemo: 'メモ',
        purchasePrice: 5000,
        monthlyRent: 20,
        managementFee: 5,
        propertyTax: 10,
        downPaymentRatio: 20,
        loanYears: 35,
        interestRate: 1.5,
        buildingArea: 100,
        landArea: 50,
        yearBuilt: 2020,
        holdingYears: 10,
        majorRepairCost: 100,
        buildingPriceForDepreciation: 3000,
        depreciationYears: 27
      };

      const result = validateSimulatorInputs(validInputs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('必須項目の欠落を検出する', () => {
      const invalidInputs = {
        propertyName: '',
        location: '',
        purchasePrice: 0
      };

      const result = validateSimulatorInputs(invalidInputs);
      expect(result.isValid).toBe(false);
      expect(result.errors.propertyName).toBe('物件名は必須項目です');
      expect(result.errors.location).toBe('住所は必須項目です');
    });

    it('数値範囲エラーを検出する', () => {
      const invalidInputs = {
        propertyName: 'テスト',
        location: 'テスト',
        purchasePrice: 200000, // 最大値超過
        monthlyRent: -5, // 負の値
        loanYears: 100 // 最大値超過
      };

      const result = validateSimulatorInputs(invalidInputs);
      expect(result.isValid).toBe(false);
      expect(result.errors.purchasePrice).toContain('100000以下');
      expect(result.errors.monthlyRent).toContain('0以上');
      expect(result.errors.loanYears).toContain('50以下');
    });

    it('文字列長エラーを検出する', () => {
      const invalidInputs = {
        propertyName: 'あ'.repeat(101), // 100文字超過
        location: 'あ'.repeat(201), // 200文字超過
        propertyMemo: 'あ'.repeat(1001) // 1000文字超過
      };

      const result = validateSimulatorInputs(invalidInputs);
      expect(result.isValid).toBe(false);
      expect(result.errors.propertyName).toContain('100文字以下');
      expect(result.errors.location).toContain('200文字以下');
      expect(result.errors.propertyMemo).toContain('1000文字以下');
    });

    it('HTMLタグを検出する', () => {
      const invalidInputs = {
        propertyName: 'テスト<script>alert("XSS")</script>',
        location: '東京都<div>渋谷区</div>',
        propertyMemo: '<img src="x" onerror="alert(1)">'
      };

      const result = validateSimulatorInputs(invalidInputs);
      expect(result.isValid).toBe(false);
      expect(result.errors.propertyName).toContain('HTMLタグは使用できません');
      expect(result.errors.location).toContain('HTMLタグは使用できません');
      expect(result.errors.propertyMemo).toContain('HTMLタグは使用できません');
    });

    it('境界値テスト - 最小値', () => {
      const minInputs = {
        propertyName: 'テスト',
        location: 'テスト',
        purchasePrice: 1,
        monthlyRent: 0,
        loanYears: 1,
        holdingYears: 1
      };

      const result = validateSimulatorInputs(minInputs);
      expect(result.isValid).toBe(true);
    });

    it('境界値テスト - 最大値', () => {
      const maxInputs = {
        propertyName: 'あ'.repeat(100),
        location: 'あ'.repeat(200),
        propertyMemo: 'あ'.repeat(1000),
        purchasePrice: 100000,
        monthlyRent: 10000,
        loanYears: 50,
        holdingYears: 50
      };

      const result = validateSimulatorInputs(maxInputs);
      expect(result.isValid).toBe(true);
    });
  });
});