/**
 * SEC-018: 借入額と購入価格の論理検証のテスト
 */

import { describe, it, expect } from 'vitest';
import { 
  validateLoanToPurchaseRatio,
  validatePercentage,
  validateAmount,
  validateYears,
  validateAndSanitizeNumber
} from '../numberValidation';

describe('numberValidation', () => {
  describe('validateAndSanitizeNumber', () => {
    it('有効な数値を正しく処理する', () => {
      expect(validateAndSanitizeNumber(100, { min: 0, max: 1000 })).toBe(100);
      expect(validateAndSanitizeNumber('50.5', { min: 0, max: 100, allowDecimal: true })).toBe(50.5);
      expect(validateAndSanitizeNumber(0, { min: 0, max: 100 })).toBe(0);
    });

    it('無効な値を正しく拒否する', () => {
      expect(validateAndSanitizeNumber(null, { min: 0, max: 100 })).toBe(null);
      expect(validateAndSanitizeNumber(undefined, { min: 0, max: 100 })).toBe(null);
      expect(validateAndSanitizeNumber('', { min: 0, max: 100 })).toBe(null);
      expect(validateAndSanitizeNumber(NaN, { min: 0, max: 100 })).toBe(null);
      expect(validateAndSanitizeNumber(Infinity, { min: 0, max: 100 })).toBe(null);
      expect(validateAndSanitizeNumber(-Infinity, { min: 0, max: 100 })).toBe(null);
    });

    it('範囲外の値を拒否する', () => {
      expect(validateAndSanitizeNumber(150, { min: 0, max: 100 })).toBe(null);
      expect(validateAndSanitizeNumber(-10, { min: 0, max: 100 })).toBe(null);
    });
  });

  describe('validatePercentage', () => {
    it('有効なパーセンテージを受け入れる', () => {
      expect(validatePercentage(0)).toBe(0);
      expect(validatePercentage(50)).toBe(50);
      expect(validatePercentage(100)).toBe(100);
      expect(validatePercentage('75.5')).toBe(75.5);
    });

    it('無効なパーセンテージを拒否する', () => {
      expect(validatePercentage(-1)).toBe(null);
      expect(validatePercentage(101)).toBe(null);
      expect(validatePercentage(150)).toBe(null);
    });
  });

  describe('validateLoanToPurchaseRatio（SEC-018）', () => {
    describe('基本的な検証', () => {
      it('正常な値を受け入れる', () => {
        const result = validateLoanToPurchaseRatio(5000, 7000, 300, 200);
        expect(result.isValid).toBe(true);
        expect(result.ltv).toBeCloseTo(71.4, 1);
      });

      it('null値の場合は検証をスキップ', () => {
        expect(validateLoanToPurchaseRatio(null, 7000).isValid).toBe(true);
        expect(validateLoanToPurchaseRatio(5000, null).isValid).toBe(true);
      });
    });

    describe('購入価格と借入額の妥当性', () => {
      it('購入価格が0以下の場合はエラー', () => {
        const result = validateLoanToPurchaseRatio(5000, 0);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('0より大きい値');
      });

      it('借入額が負の場合はエラー', () => {
        const result = validateLoanToPurchaseRatio(-1000, 7000);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('0以上の値');
      });

      it('借入額が購入価格を超える場合はエラー', () => {
        const result = validateLoanToPurchaseRatio(8000, 7000);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('借入額（8,000万円）が購入価格（7,000万円）を超えています');
      });
    });

    describe('LTV（借入比率）の検証', () => {
      it('LTVが90%以下の場合は正常', () => {
        const result = validateLoanToPurchaseRatio(6300, 7000); // LTV 90%
        expect(result.isValid).toBe(true);
        expect(result.ltv).toBe(90);
      });

      it('LTVが90%を超える場合はエラー', () => {
        const result = validateLoanToPurchaseRatio(6500, 7000); // LTV 92.9%
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('LTV（借入比率）が92.9%');
        expect(result.message).toContain('90%以下が推奨');
      });
    });

    describe('諸経費を含めた総取得価格の検証', () => {
      it('借入額が総取得価格を超える場合はエラー', () => {
        const result = validateLoanToPurchaseRatio(7600, 7000, 300, 200); // 総取得価格7500万円
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('借入額（7,600万円）が総取得価格（7,500万円）を超えています');
      });

      it('自己資金比率が10%未満の場合はエラー', () => {
        // 総取得価格7500万円、借入額6800万円 => 自己資金700万円（9.3%）
        const result = validateLoanToPurchaseRatio(6800, 7000, 300, 200);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('自己資金比率が9.3%');
        expect(result.message).toContain('10%以上の自己資金');
      });

      it('自己資金比率が10%以上の場合は正常', () => {
        // 総取得価格7500万円、借入額6750万円 => 自己資金750万円（10%）
        const result = validateLoanToPurchaseRatio(6750, 7000, 300, 200);
        expect(result.isValid).toBe(true);
      });
    });

    describe('実際のユースケース', () => {
      it('一般的な不動産投資のケース', () => {
        // 購入価格6980万円、諸経費300万円、改装費200万円、借入額6000万円
        const result = validateLoanToPurchaseRatio(6000, 6980, 300, 200);
        expect(result.isValid).toBe(true);
        expect(result.ltv).toBeCloseTo(86.0, 1);
      });

      it('フルローンに近いケース', () => {
        // 購入価格7000万円、諸経費300万円、改装費0万円、借入額6300万円（LTV90%）
        const result = validateLoanToPurchaseRatio(6300, 7000, 300, 0);
        expect(result.isValid).toBe(true);
        expect(result.ltv).toBe(90);
      });

      it('自己資金不足のケース', () => {
        // 購入価格7000万円、諸経費500万円、改装費300万円、借入額7300万円
        const result = validateLoanToPurchaseRatio(7300, 7000, 500, 300);
        expect(result.isValid).toBe(false);
      });
    });
  });
});