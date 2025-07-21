/**
 * SEC-050: 暗号学的に安全な一時パスワード生成
 * Web Crypto APIを使用して予測不可能なパスワードを生成
 */

/**
 * 暗号学的に安全な乱数でランダム文字列を生成
 * @param length 生成する文字列の長さ
 * @param charset 使用する文字セット
 * @returns 暗号学的に安全なランダム文字列
 */
export function generateCryptoRandomString(
  length: number = 32, 
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
): string {
  // Web Crypto APIで暗号学的に安全な乱数を生成
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    // Uint8Array の値（0-255）を文字セットのインデックスにマッピング
    result += charset[randomValues[i] % charset.length];
  }
  
  return result;
}

/**
 * 招待用の一時パスワードを生成
 * 要件：
 * - 最低32文字
 * - 大文字・小文字・数字・記号を含む
 * - 暗号学的に安全な乱数使用
 * - 予測不可能
 */
export function generateInvitationTempPassword(): string {
  // SEC-050: Date.now()は予測可能なため使用しない
  const password = generateCryptoRandomString(32);
  
  // エントロピーを追加するために複数の乱数源を組み合わせ
  const additionalEntropy = generateCryptoRandomString(16, '0123456789ABCDEF');
  
  return `temp-inv-${password}-${additionalEntropy}`;
}

/**
 * パスワード強度を検証
 * @param password 検証するパスワード
 * @returns 強度スコア（0-100）
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;
  
  // 長さによる加点
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;
  
  // 文字種類による加点
  if (/[a-z]/.test(password)) score += 10; // 小文字
  if (/[A-Z]/.test(password)) score += 10; // 大文字
  if (/[0-9]/.test(password)) score += 10; // 数字
  if (/[^a-zA-Z0-9]/.test(password)) score += 20; // 記号
  
  // パターンによる減点
  if (/(.)\1{2,}/.test(password)) score -= 10; // 3文字以上の連続
  if (/123|abc|qwe/i.test(password)) score -= 10; // 一般的なパターン
  
  return Math.max(0, Math.min(100, score));
}

/**
 * パスワードのエントロピーを計算（ビット）
 * @param password 計算するパスワード
 * @returns エントロピー（ビット）
 */
export function calculatePasswordEntropy(password: string): number {
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // 概算
  
  return password.length * Math.log2(charsetSize);
}

/**
 * 一時パスワードの安全性を検証
 * @param password 検証するパスワード
 * @returns 検証結果
 */
export function validateTempPasswordSecurity(password: string): {
  isSecure: boolean;
  strength: number;
  entropy: number;
  issues: string[];
} {
  const issues: string[] = [];
  const strength = calculatePasswordStrength(password);
  const entropy = calculatePasswordEntropy(password);
  
  // 最低要件チェック
  if (password.length < 16) {
    issues.push('パスワードが短すぎます（最低16文字）');
  }
  
  if (strength < 70) {
    issues.push('パスワード強度が不十分です');
  }
  
  if (entropy < 60) {
    issues.push('パスワードのエントロピーが不十分です');
  }
  
  // 予測可能なパターンチェック
  if (/\d{4,}/.test(password)) {
    issues.push('4桁以上の数字の連続は避けてください');
  }
  
  if (Date.now().toString().includes(password.replace(/\D/g, ''))) {
    issues.push('現在時刻に基づくパスワードは使用しないでください');
  }
  
  return {
    isSecure: issues.length === 0 && strength >= 70 && entropy >= 60,
    strength,
    entropy,
    issues
  };
}