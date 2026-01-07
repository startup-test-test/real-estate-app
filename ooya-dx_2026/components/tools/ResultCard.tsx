'use client'

import React from 'react'

interface ResultCardProps {
  label: string
  value: number
  unit?: string
  highlight?: boolean
  subText?: string
}

export function ResultCard({
  label,
  value,
  unit = '円',
  highlight = false,
  subText
}: ResultCardProps) {
  const formattedValue = value.toLocaleString('ja-JP')

  return (
    <div
      className={`p-4 rounded-lg ${
        highlight
          ? 'bg-blue-50 border-2 border-blue-500'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div
        className={`text-2xl font-bold ${
          highlight ? 'text-blue-600' : 'text-gray-900'
        }`}
      >
        {formattedValue}
        <span className="text-base font-normal ml-1">{unit}</span>
      </div>
      {subText && (
        <div className="text-xs text-gray-500 mt-1">{subText}</div>
      )}
    </div>
  )
}
