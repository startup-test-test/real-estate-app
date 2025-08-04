/**
 * セキュリティバリデーション関数
 * フロントエンドでの入力値検証を行う
 */

/**
 * 数値の範囲チェック
 */
export const validateNumberRange = (
  value: number | string,
  min: number,
  max: number,
  fieldName: string
): { isValid: boolean; error?: string } => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName}は数値で入力してください` };
  }
  
  if (num < min) {
    return { isValid: false, error: `${fieldName}は${min}以上で入力してください` };
  }
  
  if (num > max) {
    return { isValid: false, error: `${fieldName}は${max}以下で入力してください` };
  }
  
  return { isValid: true };
};

/**
 * 文字列長のチェック
 */
export const validateStringLength = (
  value: string,
  maxLength: number,
  fieldName: string,
  minLength: number = 0
): { isValid: boolean; error?: string } => {
  if (!value && minLength > 0) {
    return { isValid: false, error: `${fieldName}は必須項目です` };
  }
  
  const length = value ? value.length : 0;
  
  if (length < minLength) {
    return { isValid: false, error: `${fieldName}は${minLength}文字以上で入力してください` };
  }
  
  if (length > maxLength) {
    return { isValid: false, error: `${fieldName}は${maxLength}文字以下で入力してください` };
  }
  
  return { isValid: true };
};

/**
 * HTMLタグの検出
 */
export const detectHTMLTags = (value: string): boolean => {
  // より厳密なHTMLタグパターン（< と > の組み合わせでタグを形成するもの）
  const htmlPattern = /<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>/;
  return htmlPattern.test(value);
};

/**
 * 安全な文字列かチェック（HTMLタグが含まれていないか）
 */
export const validateSafeString = (
  value: string,
  fieldName: string
): { isValid: boolean; error?: string } => {
  if (detectHTMLTags(value)) {
    return { isValid: false, error: `${fieldName}にHTMLタグは使用できません` };
  }
  
  return { isValid: true };
};

/**
 * メールアドレスの形式チェック
 */
export const validateEmail = (
  email: string
): { isValid: boolean; error?: string } => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'メールアドレスは必須項目です' };
  }
  
  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'メールアドレスの形式が正しくありません' };
  }
  
  return { isValid: true };
};

/**
 * シミュレーター入力値の検証ルール
 */
export const simulatorValidationRules: {
  [key: string]: {
    maxLength?: number;
    required?: boolean;
    min?: number;
    max?: number;
    unit?: string;
  };
} = {
  // 物件情報
  propertyName: { maxLength: 100, required: true },
  location: { maxLength: 200, required: true },
  propertyUrl: { maxLength: 500 },
  propertyMemo: { maxLength: 1000 },
  
  // 数値項目の範囲
  purchasePrice: { min: 1, max: 100000, unit: '万円' }, // 1万円〜10億円
  monthlyRent: { min: 0, max: 100000000, unit: '円' }, // 0〜1億円/月
  managementFee: { min: 0, max: 10000000, unit: '円' }, // 0〜1000万円/月
  propertyTax: { min: 0, max: 5000, unit: '万円' }, // 0〜500万円/年
  downPaymentRatio: { min: 0, max: 100, unit: '%' },
  loanYears: { min: 1, max: 50, unit: '年' },
  interestRate: { min: 0, max: 20, unit: '%' },
  
  // その他の数値
  buildingArea: { min: 1, max: 100000, unit: '㎡' },
  landArea: { min: 0, max: 100000, unit: '㎡' },
  yearBuilt: { min: 1900, max: new Date().getFullYear() + 10, unit: '年' },
  
  // 保有期間
  holdingYears: { min: 1, max: 50, unit: '年' },
  
  // 修繕・更新費用
  majorRepairCost: { min: 0, max: 50000, unit: '万円' },
  
  // 減価償却
  buildingPriceForDepreciation: { min: 0, max: 100000, unit: '万円' },
  depreciationYears: { min: 1, max: 50, unit: '年' },
};

/**
 * シミュレーター入力値の一括検証
 */
export const validateSimulatorInputs = (inputs: any): {
  isValid: boolean;
  errors: { [key: string]: string };
} => {
  const errors: { [key: string]: string } = {};
  
  // 文字列項目の検証
  const stringFields = ['propertyName', 'location', 'propertyUrl', 'propertyMemo'];
  stringFields.forEach(field => {
    const rule = simulatorValidationRules[field as keyof typeof simulatorValidationRules];
    const value = inputs[field] || '';
    
    if (rule) {
      // 必須チェック
      if (rule.required && !value) {
        errors[field] = `${getFieldDisplayName(field)}は必須項目です`;
        return;
      }
      
      // 文字数チェック
      if (rule.maxLength) {
        const lengthCheck = validateStringLength(value, rule.maxLength, getFieldDisplayName(field));
        if (!lengthCheck.isValid && lengthCheck.error) {
          errors[field] = lengthCheck.error;
          return;
        }
      }
      
      // HTMLタグチェック
      const safeCheck = validateSafeString(value, getFieldDisplayName(field));
      if (!safeCheck.isValid && safeCheck.error) {
        errors[field] = safeCheck.error;
      }
    }
  });
  
  // 数値項目の検証
  const numberFields = [
    'purchasePrice', 'monthlyRent', 'managementFee', 'propertyTax',
    'downPaymentRatio', 'loanYears', 'interestRate', 'buildingArea',
    'landArea', 'yearBuilt', 'holdingYears', 'majorRepairCost',
    'buildingPriceForDepreciation', 'depreciationYears'
  ];
  
  numberFields.forEach(field => {
    const rule = simulatorValidationRules[field as keyof typeof simulatorValidationRules];
    const value = inputs[field];
    
    if (rule && rule.min !== undefined && rule.max !== undefined && value !== undefined && value !== '') {
      const rangeCheck = validateNumberRange(
        value,
        rule.min,
        rule.max,
        `${getFieldDisplayName(field)}（${rule.unit || ''}）`
      );
      
      if (!rangeCheck.isValid && rangeCheck.error) {
        errors[field] = rangeCheck.error;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * フィールド名の表示用名称を取得
 */
const getFieldDisplayName = (field: string): string => {
  const displayNames: { [key: string]: string } = {
    propertyName: '物件名',
    location: '住所',
    propertyUrl: '物件URL',
    propertyMemo: 'メモ',
    purchasePrice: '購入価格',
    monthlyRent: '月額賃料',
    managementFee: '管理費・修繕積立金',
    propertyTax: '年間固定資産税',
    downPaymentRatio: '頭金比率',
    loanYears: 'ローン期間',
    interestRate: '借入金利',
    buildingArea: '建物面積',
    landArea: '土地面積',
    yearBuilt: '築年',
    holdingYears: '保有年数',
    majorRepairCost: '大規模修繕費用',
    buildingPriceForDepreciation: '建物価格（減価償却用）',
    depreciationYears: '減価償却年数'
  };
  
  return displayNames[field] || field;
};