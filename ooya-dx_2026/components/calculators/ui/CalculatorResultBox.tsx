'use client'

import { ReactNode } from 'react'

interface CalculatorResultBoxProps {
  children: ReactNode
  /** バッジテキスト */
  badge?: string
}

/**
 * シミュレーター結果ボックス
 * 白背景・青ボーダー・バッジ付き
 */
export function CalculatorResultBox({
  children,
  badge = 'シミュレーション結果',
}: CalculatorResultBoxProps) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-5 border-2 border-blue-300 relative mt-6 sm:mt-8">
      {/* バッジ */}
      <div className="absolute -top-4 left-4">
        <span className="inline-block bg-blue-600 text-white text-sm sm:text-lg font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md">
          {badge}
        </span>
      </div>
      <div className="mt-4" />
      <div className="space-y-3 sm:space-y-4">
        {children}
      </div>
    </div>
  )
}
