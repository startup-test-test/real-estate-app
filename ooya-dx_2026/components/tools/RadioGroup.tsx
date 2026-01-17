'use client'

// =================================================================
// カスタムラジオボタングループ
// =================================================================

export interface RadioOption<T extends string> {
  value: T
  label: string
}

interface RadioGroupProps<T extends string> {
  /** ラベル */
  label: string
  /** ラジオボタン名（HTML name属性） */
  name: string
  /** 選択肢 */
  options: RadioOption<T>[]
  /** 現在の値 */
  value: T
  /** 値変更時のコールバック */
  onChange: (value: T) => void
  /** 補足テキスト（オプション） */
  hint?: string
}

export function RadioGroup<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
  hint,
}: RadioGroupProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                value === option.value
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-400 bg-white'
              }`}
            >
              {value === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {hint && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
    </div>
  )
}
