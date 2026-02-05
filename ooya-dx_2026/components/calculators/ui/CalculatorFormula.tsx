'use client'

import { ReactNode } from 'react'

interface CalculatorFormulaProps {
  /** タイトル */
  title?: string
  /** 計算式の内容 */
  children: ReactNode
}

/**
 * 計算式表示エリア
 * グレー背景で計算式を表示
 */
export function CalculatorFormula({
  title = '計算式',
  children,
}: CalculatorFormulaProps) {
  return (
    <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-3 sm:p-4">
      <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
        📊 {title}
      </p>
      <div className="text-sm sm:text-lg text-gray-800 space-y-2">
        {children}
      </div>
    </div>
  )
}
