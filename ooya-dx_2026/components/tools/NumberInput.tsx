'use client'

import React from 'react'

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  unit?: string
  placeholder?: string
  min?: number
  max?: number
}

// 数値をカンマ区切りでフォーマット
function formatNumber(num: number): string {
  if (num === 0) return ''
  return num.toLocaleString('ja-JP')
}

// カンマ区切り文字列を数値にパース
function parseNumber(str: string): number {
  const cleaned = str.replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}

export function NumberInput({
  label,
  value,
  onChange,
  unit = '円',
  placeholder = '0',
  min = 0,
  max = 999999999999
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumber(e.target.value)
    if (parsed >= min && parsed <= max) {
      onChange(parsed)
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex w-full">
        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={handleChange}
          className="flex-1 min-w-0 border-2 border-yellow-400 bg-yellow-50 rounded-l-lg px-3 sm:px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:bg-white outline-none"
          placeholder={placeholder}
        />
        <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 sm:px-4 py-3 text-gray-600 flex items-center whitespace-nowrap">
          {unit}
        </span>
      </div>
    </div>
  )
}
