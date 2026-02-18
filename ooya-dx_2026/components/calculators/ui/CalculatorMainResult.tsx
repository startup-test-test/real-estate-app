'use client'

interface CalculatorMainResultProps {
  /** ラベルテキスト */
  label: string
  /** 値 */
  value: number
  /** 単位（万円、%など） */
  unit: string
  /** 円単位でも表示するか */
  showYen?: boolean
  /** 小数点以下の桁数 */
  decimalPlaces?: number
}

/**
 * シミュレーターメイン結果（強調表示）
 * 最も重要な結果を大きく表示
 */
export function CalculatorMainResult({
  label,
  value,
  unit,
  showYen = true,
  decimalPlaces = 0,
}: CalculatorMainResultProps) {
  const formatValue = (val: number): string => {
    if (decimalPlaces > 0) {
      return val.toFixed(decimalPlaces)
    }
    return val.toLocaleString('ja-JP')
  }

  return (
    <div className="flex justify-between items-center border-t-2 border-blue-400 pt-3 sm:pt-4 mt-2">
      <span className="text-base sm:text-2xl font-bold text-gray-900">
        {label}
      </span>
      <div className="text-right">
        <span className="text-2xl sm:text-5xl font-bold text-blue-700 whitespace-nowrap">
          {formatValue(value)}{unit}
        </span>
        {showYen && unit === '万円' && (
          <span className="block text-xs sm:text-lg text-gray-700">
            （{(value * 10000).toLocaleString('ja-JP')}円）
          </span>
        )}
      </div>
    </div>
  )
}
