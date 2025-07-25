/**
 * 金額を千円単位で表示するヘルパー関数
 * @param amount 金額（円）
 * @returns 千円単位の文字列（例：940000 → "94.0"）
 */
export const formatAmountInThousands = (amount: number): string => {
  const thousands = amount / 10000; // 万円単位
  return thousands.toFixed(1);
};

/**
 * 金額を千円単位で表示（0の場合は0.0を返す）
 * @param amount 金額（円）
 * @returns 千円単位の文字列
 */
export const formatCurrencyNoSymbol = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) {
    return '0.0';
  }
  return formatAmountInThousands(amount);
};