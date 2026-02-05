'use client'

import { ComponentType } from 'react'

interface CalculatorInputFieldProps {
  /** ラベルテキスト */
  label: string
  /** 入力値 */
  value: number
  /** 値変更時のコールバック */
  onChange: (value: number) => void
  /** 単位（万円、%など） */
  unit: string
  /** プレースホルダー */
  placeholder?: string
  /** アイコン */
  icon?: ComponentType<{ className?: string }>
  /** 入力タイプ（numeric, decimal） */
  inputMode?: 'numeric' | 'decimal'
  /** ヒントテキスト */
  hint?: string
  /** 小数点を許可するか */
  allowDecimal?: boolean
}

/**
 * シミュレーター入力欄
 * ラベル・入力フィールド・単位をまとめたコンポーネント
 */
export function CalculatorInputField({
  label,
  value,
  onChange,
  unit,
  placeholder = '',
  icon: Icon,
  inputMode = 'numeric',
  hint,
  allowDecimal = false,
}: CalculatorInputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pattern = allowDecimal ? /[^0-9.]/g : /[^0-9]/g
    const cleanValue = e.target.value.replace(pattern, '')
    onChange(cleanValue === '' ? 0 : Number(cleanValue))
  }

  const formatValue = (val: number): string => {
    if (val === 0) return ''
    if (allowDecimal) {
      return val.toString()
    }
    return val.toLocaleString('ja-JP')
  }

  return (
    <div className="mb-3 sm:mb-4">
      <label className="flex items-center gap-2 text-base sm:text-xl font-bold text-gray-900 mb-3">
        {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode={inputMode}
          value={formatValue(value)}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-4 bg-orange-50 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xl sm:text-4xl font-bold text-gray-900"
        />
        <span className="text-base sm:text-xl text-gray-700 font-medium">{unit}</span>
      </div>
      {hint && (
        <p className="text-sm sm:text-base text-gray-900 mt-2">{hint}</p>
      )}
    </div>
  )
}
