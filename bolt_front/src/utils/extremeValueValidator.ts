/**
 * SEC-013: 数値入力フィールドの範囲検証（極端な値対策）
 * JavaScriptの数値限界値や特殊な入力パターンに対する追加検証
 */

import { validateAndSanitizeNumber, NumberValidationRule } from './numberValidation';

/**
 * 極端な値のパターン定義
 */
const EXTREME_PATTERNS = {
  // JavaScript数値限界値
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,        // 9007199254740991
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,        // -9007199254740991
  MAX_VALUE: Number.MAX_VALUE,                      // 1.7976931348623157e+308
  MIN_VALUE: Number.MIN_VALUE,                      // 5e-324
  
  // 実用的な不動産取引の限界値
  MAX_PROPERTY_PRICE: 10000000000,                  // 100億円
  MIN_PROPERTY_PRICE: 100000,                       // 10万円
  MAX_PERCENTAGE: 100,                              // 100%
  MIN_PERCENTAGE: 0,                                // 0%
  MAX_YEARS: 100,                                   // 100年
  MIN_YEARS: 1,                                     // 1年
  MAX_AREA: 1000000,                               // 100万㎡
  MIN_AREA: 0.01,                                  // 0.01㎡
};

/**
 * 極端な値の検出パターン
 */
export interface ExtremeValuePattern {
  name: string;
  test: (value: any) => boolean;
  message: string;
}

/**
 * 極端な値のパターンチェッカー
 */
const EXTREME_VALUE_CHECKERS: ExtremeValuePattern[] = [
  {
    name: 'scientific_notation',
    test: (value: any) => {
      const str = String(value);
      return /[eE][+-]?\d+/.test(str) && Math.abs(parseFloat(str)) > 1e10;
    },
    message: '科学記法での極端に大きな値は入力できません'
  },
  {
    name: 'unsafe_integer',
    test: (value: any) => {
      const num = Number(value);
      return !Number.isSafeInteger(num) && Number.isInteger(num);
    },
    message: '安全でない整数値は入力できません'
  },
  {
    name: 'hex_octal_binary',
    test: (value: any) => {
      const str = String(value).toLowerCase();
      return /^0x[0-9a-f]+$/.test(str) || /^0b[01]+$/.test(str) || /^0o[0-7]+$/.test(str);
    },
    message: '16進数、8進数、2進数での入力はサポートされていません'
  },
  {
    name: 'repeated_digits',
    test: (value: any) => {
      const str = String(value);
      // 同じ数字が10桁以上連続する場合
      return /(\d)\1{9,}/.test(str);
    },
    message: '同じ数字の連続入力は無効です'
  },
  {
    name: 'mathematical_constants',
    test: (value: any) => {
      const num = Number(value);
      const constants = [Math.PI, Math.E, Math.SQRT2, Math.LN2, Math.LN10];
      return constants.some(c => Math.abs(num - c) < 1e-10);
    },
    message: '数学定数の直接入力は無効です'
  }
];

/**
 * 極端な値の検証
 * @param value 検証する値
 * @param fieldType フィールドの種類
 * @returns 検証結果
 */
export function validateExtremeValue(
  value: string | number | undefined | null,
  fieldType: 'price' | 'percentage' | 'years' | 'area' | 'general'
): { isValid: boolean; message?: string; sanitizedValue?: number | null } {
  // nullや空値はOK
  if (value === null || value === undefined || value === '') {
    return { isValid: true, sanitizedValue: null };
  }

  // 文字列として極端な値のパターンをチェック
  const strValue = String(value);
  
  // 極端に長い入力を拒否
  if (strValue.length > 20) {
    return { isValid: false, message: '入力値が長すぎます' };
  }

  // 特殊な値の文字列表現をチェック
  const specialValues = ['infinity', '-infinity', 'nan', 'null', 'undefined'];
  if (specialValues.includes(strValue.toLowerCase())) {
    return { isValid: false, message: '無効な値です' };
  }

  // 極端な値のパターンチェック
  for (const checker of EXTREME_VALUE_CHECKERS) {
    if (checker.test(value)) {
      return { isValid: false, message: checker.message };
    }
  }

  // 数値に変換
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // NaN、Infinity、-Infinityチェック
  if (!isFinite(numValue)) {
    return { isValid: false, message: '有効な数値を入力してください' };
  }

  // JavaScriptの数値限界チェック
  if (Math.abs(numValue) > EXTREME_PATTERNS.MAX_SAFE_INTEGER) {
    return { isValid: false, message: '数値が大きすぎます' };
  }

  // フィールドタイプ別の範囲チェック
  let rule: NumberValidationRule;
  let fieldSpecificMessage: string;

  switch (fieldType) {
    case 'price':
      rule = {
        min: EXTREME_PATTERNS.MIN_PROPERTY_PRICE,
        max: EXTREME_PATTERNS.MAX_PROPERTY_PRICE,
        allowDecimal: false
      };
      fieldSpecificMessage = `${EXTREME_PATTERNS.MIN_PROPERTY_PRICE.toLocaleString()}円から${EXTREME_PATTERNS.MAX_PROPERTY_PRICE.toLocaleString()}円の範囲で入力してください`;
      break;

    case 'percentage':
      rule = {
        min: EXTREME_PATTERNS.MIN_PERCENTAGE,
        max: EXTREME_PATTERNS.MAX_PERCENTAGE,
        allowDecimal: true,
        decimalPlaces: 2
      };
      fieldSpecificMessage = '0%から100%の範囲で入力してください';
      break;

    case 'years':
      rule = {
        min: EXTREME_PATTERNS.MIN_YEARS,
        max: EXTREME_PATTERNS.MAX_YEARS,
        allowDecimal: false
      };
      fieldSpecificMessage = '1年から100年の範囲で入力してください';
      break;

    case 'area':
      rule = {
        min: EXTREME_PATTERNS.MIN_AREA,
        max: EXTREME_PATTERNS.MAX_AREA,
        allowDecimal: true,
        decimalPlaces: 2
      };
      fieldSpecificMessage = `${EXTREME_PATTERNS.MIN_AREA}㎡から${EXTREME_PATTERNS.MAX_AREA.toLocaleString()}㎡の範囲で入力してください`;
      break;

    default:
      rule = {
        min: -EXTREME_PATTERNS.MAX_SAFE_INTEGER,
        max: EXTREME_PATTERNS.MAX_SAFE_INTEGER,
        allowDecimal: true
      };
      fieldSpecificMessage = '有効な範囲の数値を入力してください';
  }

  // 既存の数値検証を使用
  const sanitizedValue = validateAndSanitizeNumber(value, rule);

  if (sanitizedValue === null) {
    return { isValid: false, message: fieldSpecificMessage };
  }

  // 追加の極端な値チェック
  if (fieldType === 'price' && sanitizedValue < 10000) {
    return { isValid: false, message: '物件価格は1万円以上で入力してください' };
  }

  if (fieldType === 'area' && sanitizedValue > 100000) {
    return { isValid: false, message: '面積は10万㎡以下で入力してください' };
  }

  return { isValid: true, sanitizedValue };
}

/**
 * 複数フィールド間の論理的整合性チェック（極端な値の組み合わせ）
 */
export function validateFieldCombinations(fields: {
  purchasePrice?: number | null;
  monthlyRent?: number | null;
  landArea?: number | null;
  buildingArea?: number | null;
  loanAmount?: number | null;
}): { isValid: boolean; messages: string[] } {
  const messages: string[] = [];

  // 購入価格と月額賃料の妥当性（利回りが極端でないか）
  if (fields.purchasePrice && fields.monthlyRent) {
    const annualRent = fields.monthlyRent * 12;
    const grossReturn = (annualRent / fields.purchasePrice) * 100;
    
    if (grossReturn > 50) {
      messages.push('利回りが50%を超えています。入力値を確認してください');
    }
    if (grossReturn < 0.1 && grossReturn > 0) {
      messages.push('利回りが0.1%未満です。入力値を確認してください');
    }
  }

  // 土地面積と建物面積の妥当性
  if (fields.landArea && fields.buildingArea) {
    const floorAreaRatio = fields.buildingArea / fields.landArea;
    
    if (floorAreaRatio > 20) {
      messages.push('容積率が2000%を超えています。入力値を確認してください');
    }
  }

  // 借入額と購入価格の妥当性（LTV）
  if (fields.loanAmount && fields.purchasePrice) {
    const ltv = (fields.loanAmount / fields.purchasePrice) * 100;
    
    if (ltv > 100) {
      messages.push('借入額が購入価格を超えています');
    }
  }

  // 購入価格と面積の妥当性（㎡単価）
  if (fields.purchasePrice && fields.landArea && fields.landArea > 0) {
    const pricePerSqm = fields.purchasePrice / fields.landArea;
    
    if (pricePerSqm > 50000000) { // 5000万円/㎡以上
      messages.push('㎡単価が極端に高い値になっています');
    }
    if (pricePerSqm < 1000) { // 1000円/㎡未満
      messages.push('㎡単価が極端に低い値になっています');
    }
  }

  return {
    isValid: messages.length === 0,
    messages
  };
}

/**
 * 入力値の前処理（極端な値の事前フィルタリング）
 */
export function preprocessExtremeInput(input: string): string {
  // 全角数字を半角に変換
  let processed = input.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  
  // カンマを除去
  processed = processed.replace(/,/g, '');
  
  // 余分な空白を除去
  processed = processed.trim();
  
  // 複数の小数点がある場合は最初の1つだけ残す
  const parts = processed.split('.');
  if (parts.length > 2) {
    processed = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // 先頭の0を除去（ただし0.xxxの場合は除く）
  processed = processed.replace(/^0+(?=\d)/, '');
  
  return processed;
}