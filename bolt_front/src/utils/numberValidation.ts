/**
 * SEC-017: 数値フィールド範囲外入力対策
 * 数値入力の検証とサニタイゼーション関数
 */

export interface NumberValidationRule {
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  decimalPlaces?: number;
}

/**
 * 数値入力の検証とサニタイゼーション
 * @param value - 検証する値
 * @param rule - 検証ルール
 * @returns サニタイズされた値（無効な場合はnull）
 */
export function validateAndSanitizeNumber(
  value: string | number | undefined | null,
  rule: NumberValidationRule
): number | null {
  // 空値の処理
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // 文字列を数値に変換
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // NaN, Infinity, -Infinityのチェック
  if (!isFinite(numValue)) {
    return null;
  }

  // 最小値チェック
  if (rule.min !== undefined && numValue < rule.min) {
    return null;
  }

  // 最大値チェック
  if (rule.max !== undefined && numValue > rule.max) {
    return null;
  }

  // 小数点の処理
  if (!rule.allowDecimal && !Number.isInteger(numValue)) {
    return null;
  }

  // 小数点以下の桁数制限
  if (rule.allowDecimal && rule.decimalPlaces !== undefined) {
    const factor = Math.pow(10, rule.decimalPlaces);
    return Math.round(numValue * factor) / factor;
  }

  return numValue;
}

/**
 * パーセンテージ値の検証（0-100%）
 */
export function validatePercentage(value: string | number | undefined | null): number | null {
  return validateAndSanitizeNumber(value, {
    min: 0,
    max: 100,
    allowDecimal: true,
    decimalPlaces: 2
  });
}

/**
 * 金額の検証（0以上の整数）
 */
export function validateAmount(value: string | number | undefined | null): number | null {
  return validateAndSanitizeNumber(value, {
    min: 0,
    max: 999999999999, // 最大9999億円
    allowDecimal: false
  });
}

/**
 * 年数の検証（1以上の整数）
 */
export function validateYears(value: string | number | undefined | null, maxYears: number = 100): number | null {
  return validateAndSanitizeNumber(value, {
    min: 1,
    max: maxYears,
    allowDecimal: false
  });
}

/**
 * 築年数の検証（0以上の整数）
 */
export function validateBuildingAge(value: string | number | undefined | null): number | null {
  return validateAndSanitizeNumber(value, {
    min: 0,
    max: 200, // 最大200年
    allowDecimal: false
  });
}

/**
 * 利率の検証（0-50%）
 */
export function validateInterestRate(value: string | number | undefined | null): number | null {
  return validateAndSanitizeNumber(value, {
    min: 0,
    max: 50,
    allowDecimal: true,
    decimalPlaces: 2
  });
}

/**
 * 面積の検証（0より大きい値）
 */
export function validateArea(value: string | number | undefined | null): number | null {
  return validateAndSanitizeNumber(value, {
    min: 0.01,
    max: 999999, // 最大999,999㎡
    allowDecimal: true,
    decimalPlaces: 2
  });
}

/**
 * 路線価の検証（0以上の整数）
 */
export function validateRoadPrice(value: string | number | undefined | null): number | null {
  return validateAndSanitizeNumber(value, {
    min: 0,
    max: 99999999, // 最大9999万円/㎡
    allowDecimal: false
  });
}

/**
 * 建築年の検証（1900年以降、今年まで）
 */
export function validateBuildingYear(value: string | number | undefined | null): number | null {
  const currentYear = new Date().getFullYear();
  return validateAndSanitizeNumber(value, {
    min: 1900,
    max: currentYear,
    allowDecimal: false
  });
}

/**
 * 借入額と購入価格の論理検証
 * @param loanAmount - 借入額
 * @param purchasePrice - 購入価格
 * @returns 検証結果
 */
export function validateLoanToPurchaseRatio(
  loanAmount: number | null,
  purchasePrice: number | null
): { isValid: boolean; message?: string } {
  if (loanAmount === null || purchasePrice === null) {
    return { isValid: true }; // 値が入力されていない場合はOK
  }

  // LTV（Loan to Value）の計算
  const ltv = (loanAmount / purchasePrice) * 100;

  // LTVが120%を超える場合はエラー
  if (ltv > 120) {
    return {
      isValid: false,
      message: 'LTV（借入比率）が120%を超えています'
    };
  }

  // 借入額が購入価格を超える場合（100%超120%以下）は別メッセージ
  if (loanAmount > purchasePrice) {
    return {
      isValid: false,
      message: '借入額は購入価格を超えることはできません'
    };
  }

  return { isValid: true };
}