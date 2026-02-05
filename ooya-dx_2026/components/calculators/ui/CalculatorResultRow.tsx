'use client'

interface CalculatorResultRowProps {
  /** ラベルテキスト */
  label: string
  /** 値（万円の場合は万円単位、%の場合はそのまま） */
  value: number
  /** 単位（万円、%など） */
  unit: string
  /** 円単位でも表示するか（万円の場合） */
  showYen?: boolean
  /** 小数点以下の桁数 */
  decimalPlaces?: number
}

/**
 * シミュレーター結果行
 * ラベルと値を横並びで表示
 */
export function CalculatorResultRow({
  label,
  value,
  unit,
  showYen = true,
  decimalPlaces = 0,
}: CalculatorResultRowProps) {
  const formatValue = (val: number): string => {
    if (decimalPlaces > 0) {
      return val.toFixed(decimalPlaces)
    }
    return val.toLocaleString('ja-JP')
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm sm:text-xl font-bold text-gray-700">{label}</span>
      <div className="text-right">
        <span className="text-xl sm:text-3xl font-bold text-gray-900">
          {formatValue(value)}{unit}
        </span>
        {showYen && unit === '万円' && (
          <span className="block text-xs sm:text-base text-gray-700">
            （{(value * 10000).toLocaleString('ja-JP')}円）
          </span>
        )}
      </div>
    </div>
  )
}
