/**
 * SEC-017: 数値フィールド範囲外入力対策のテスト
 */

import {
  validateAndSanitizeNumber,
  validatePercentage,
  validateAmount,
  validateYears,
  validateBuildingAge,
  validateInterestRate,
  validateArea,
  validateRoadPrice,
  validateBuildingYear,
  validateLoanToPurchaseRatio
} from '../numberValidation';

describe('validateAndSanitizeNumber', () => {
  test('有効な数値を返す', () => {
    expect(validateAndSanitizeNumber(123, { min: 0, max: 1000 })).toBe(123);
    expect(validateAndSanitizeNumber('456', { min: 0, max: 1000 })).toBe(456);
  });

  test('NaN、Infinity、-Infinityを拒否', () => {
    expect(validateAndSanitizeNumber(NaN, { min: 0 })).toBeNull();
    expect(validateAndSanitizeNumber(Infinity, { min: 0 })).toBeNull();
    expect(validateAndSanitizeNumber(-Infinity, { min: 0 })).toBeNull();
    expect(validateAndSanitizeNumber('NaN', { min: 0 })).toBeNull();
  });

  test('範囲外の値を拒否', () => {
    expect(validateAndSanitizeNumber(-1, { min: 0 })).toBeNull();
    expect(validateAndSanitizeNumber(101, { max: 100 })).toBeNull();
    expect(validateAndSanitizeNumber(50, { min: 60, max: 100 })).toBeNull();
  });

  test('小数点の処理', () => {
    expect(validateAndSanitizeNumber(123.456, { allowDecimal: false })).toBeNull();
    expect(validateAndSanitizeNumber(123.456, { allowDecimal: true, decimalPlaces: 2 })).toBe(123.46);
    expect(validateAndSanitizeNumber(123.454, { allowDecimal: true, decimalPlaces: 2 })).toBe(123.45);
  });

  test('空値の処理', () => {
    expect(validateAndSanitizeNumber(null, { min: 0 })).toBeNull();
    expect(validateAndSanitizeNumber(undefined, { min: 0 })).toBeNull();
    expect(validateAndSanitizeNumber('', { min: 0 })).toBeNull();
  });
});

describe('validatePercentage', () => {
  test('0-100の範囲内の値を受け入れる', () => {
    expect(validatePercentage(0)).toBe(0);
    expect(validatePercentage(50)).toBe(50);
    expect(validatePercentage(100)).toBe(100);
    expect(validatePercentage(99.99)).toBe(99.99);
  });

  test('範囲外の値を拒否', () => {
    expect(validatePercentage(-1)).toBeNull();
    expect(validatePercentage(101)).toBeNull();
    expect(validatePercentage(150)).toBeNull();
  });

  test('小数点以下2桁まで', () => {
    expect(validatePercentage(50.12345)).toBe(50.12);
  });
});

describe('validateAmount', () => {
  test('0以上の整数を受け入れる', () => {
    expect(validateAmount(0)).toBe(0);
    expect(validateAmount(1000000)).toBe(1000000);
    expect(validateAmount('5000')).toBe(5000);
  });

  test('負数と小数を拒否', () => {
    expect(validateAmount(-100)).toBeNull();
    expect(validateAmount(100.5)).toBeNull();
  });

  test('最大値を超える値を拒否', () => {
    expect(validateAmount(1000000000000)).toBeNull(); // 1兆円超
  });
});

describe('validateYears', () => {
  test('1以上の整数を受け入れる', () => {
    expect(validateYears(1)).toBe(1);
    expect(validateYears(30)).toBe(30);
    expect(validateYears(100)).toBe(100);
  });

  test('無効な値を拒否', () => {
    expect(validateYears(0)).toBeNull();
    expect(validateYears(-1)).toBeNull();
    expect(validateYears(101)).toBeNull();
    expect(validateYears(1.5)).toBeNull();
  });

  test('カスタム最大値', () => {
    expect(validateYears(30, 25)).toBeNull();
    expect(validateYears(25, 25)).toBe(25);
  });
});

describe('validateBuildingAge', () => {
  test('0以上の整数を受け入れる', () => {
    expect(validateBuildingAge(0)).toBe(0);
    expect(validateBuildingAge(50)).toBe(50);
    expect(validateBuildingAge(200)).toBe(200);
  });

  test('無効な値を拒否', () => {
    expect(validateBuildingAge(-1)).toBeNull();
    expect(validateBuildingAge(201)).toBeNull();
    expect(validateBuildingAge(10.5)).toBeNull();
  });
});

describe('validateInterestRate', () => {
  test('0-50%の範囲内の値を受け入れる', () => {
    expect(validateInterestRate(0)).toBe(0);
    expect(validateInterestRate(2.875)).toBe(2.88);
    expect(validateInterestRate(50)).toBe(50);
  });

  test('範囲外の値を拒否', () => {
    expect(validateInterestRate(-1)).toBeNull();
    expect(validateInterestRate(51)).toBeNull();
  });
});

describe('validateArea', () => {
  test('0より大きい値を受け入れる', () => {
    expect(validateArea(0.01)).toBe(0.01);
    expect(validateArea(100)).toBe(100);
    expect(validateArea(999999)).toBe(999999);
  });

  test('無効な値を拒否', () => {
    expect(validateArea(0)).toBeNull();
    expect(validateArea(-10)).toBeNull();
    expect(validateArea(1000000)).toBeNull();
  });

  test('小数点以下2桁まで', () => {
    expect(validateArea(123.456)).toBe(123.46);
  });
});

describe('validateRoadPrice', () => {
  test('0以上の整数を受け入れる', () => {
    expect(validateRoadPrice(0)).toBe(0);
    expect(validateRoadPrice(120000)).toBe(120000);
    expect(validateRoadPrice(99999999)).toBe(99999999);
  });

  test('無効な値を拒否', () => {
    expect(validateRoadPrice(-1)).toBeNull();
    expect(validateRoadPrice(100000000)).toBeNull();
    expect(validateRoadPrice(1000.5)).toBeNull();
  });
});

describe('validateBuildingYear', () => {
  const currentYear = new Date().getFullYear();

  test('1900年以降、今年までの値を受け入れる', () => {
    expect(validateBuildingYear(1900)).toBe(1900);
    expect(validateBuildingYear(2000)).toBe(2000);
    expect(validateBuildingYear(currentYear)).toBe(currentYear);
  });

  test('範囲外の値を拒否', () => {
    expect(validateBuildingYear(1899)).toBeNull();
    expect(validateBuildingYear(currentYear + 1)).toBeNull();
    expect(validateBuildingYear(2020.5)).toBeNull();
  });
});

describe('validateLoanToPurchaseRatio', () => {
  test('借入額が購入価格以下の場合は有効', () => {
    expect(validateLoanToPurchaseRatio(8000, 10000)).toEqual({ isValid: true });
    expect(validateLoanToPurchaseRatio(10000, 10000)).toEqual({ isValid: true });
  });

  test('借入額が購入価格を超える場合は無効', () => {
    const result = validateLoanToPurchaseRatio(12000, 10000);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('借入額は購入価格を超えることはできません');
  });

  test('LTVが120%を超える場合は無効', () => {
    const result = validateLoanToPurchaseRatio(13000, 10000);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('LTV（借入比率）が120%を超えています');
  });

  test('null値の場合は有効', () => {
    expect(validateLoanToPurchaseRatio(null, 10000)).toEqual({ isValid: true });
    expect(validateLoanToPurchaseRatio(8000, null)).toEqual({ isValid: true });
    expect(validateLoanToPurchaseRatio(null, null)).toEqual({ isValid: true });
  });

  test('実際のシミュレーションケース', () => {
    // 正常なケース（借入額1億円、購入価格1.2億円）
    expect(validateLoanToPurchaseRatio(10000, 12000)).toEqual({ isValid: true });
    
    // 異常なケース（借入額1.5億円、購入価格1.2億円）
    const result = validateLoanToPurchaseRatio(15000, 12000);
    expect(result.isValid).toBe(false);
  });
});