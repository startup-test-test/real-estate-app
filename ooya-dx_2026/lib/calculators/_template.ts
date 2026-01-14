/**
 * 【ツール名】計算ロジック
 *
 * このファイルをコピーして、各計算ツールのロジックを実装してください。
 * ファイル名は xxx.ts（例：registration-tax.ts, acquisition-tax.ts）
 */

// =================================================================
// 【変更箇所1】計算結果の型定義
// =================================================================
export interface ToolNameResult {
  mainResult: number      // メインの計算結果
  tax: number            // 消費税等（必要な場合）
  total: number          // 合計
  rate?: string          // 適用料率等（表示用、オプション）
  note?: string          // 補足情報（オプション）
}

// =================================================================
// 【変更箇所2】メイン計算関数
// =================================================================

/**
 * 【ツール名】を計算
 * @param inputValue 入力値（例：売買価格、面積など）
 * @param options オプションパラメータ（必要に応じて追加）
 * @returns 計算結果
 */
export function calculateToolName(
  inputValue: number,
  options?: {
    // オプションパラメータ（例）
    isNewConstruction?: boolean  // 新築かどうか
    isResidential?: boolean      // 住宅用かどうか
    taxRate?: number             // 税率
  }
): ToolNameResult {
  // 入力値チェック
  if (inputValue <= 0) {
    return {
      mainResult: 0,
      tax: 0,
      total: 0,
      rate: '-'
    }
  }

  // =================================================================
  // 計算ロジックを実装
  // =================================================================

  let mainResult = 0
  let rate = ''

  // 例：段階的な料率計算
  if (inputValue <= 1000000) {
    mainResult = inputValue * 0.01
    rate = '1%'
  } else if (inputValue <= 5000000) {
    mainResult = inputValue * 0.02
    rate = '2%'
  } else {
    mainResult = inputValue * 0.03
    rate = '3%'
  }

  // 消費税計算（必要な場合）
  const taxRate = options?.taxRate ?? 0.1
  const tax = mainResult * taxRate
  const total = mainResult + tax

  return {
    mainResult: Math.floor(mainResult),
    tax: Math.floor(tax),
    total: Math.floor(total),
    rate
  }
}

// =================================================================
// 【オプション】追加の計算関数
// =================================================================

/**
 * 早見表用のデータを生成
 * @param priceList 価格リスト
 * @returns 早見表データ
 */
export function generateQuickReference(
  priceList: number[]
): Array<{ label: string; value: string; subValue?: string }> {
  return priceList.map(price => {
    const result = calculateToolName(price)
    return {
      label: formatPrice(price),
      value: formatPrice(result.total) + '（税込）',
      subValue: `税抜${formatPrice(result.mainResult)}`
    }
  })
}

/**
 * 価格をフォーマット（万円単位）
 */
function formatPrice(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toLocaleString('ja-JP')}億円`
  }
  if (value >= 10000) {
    return `${(value / 10000).toLocaleString('ja-JP')}万円`
  }
  return `${value.toLocaleString('ja-JP')}円`
}
