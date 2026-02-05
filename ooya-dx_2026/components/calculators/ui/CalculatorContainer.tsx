'use client'

import { ReactNode } from 'react'

interface CalculatorContainerProps {
  children: ReactNode
  className?: string
}

/**
 * シミュレーター外枠コンテナ
 * 青背景・ボーダー・角丸のデザイン
 */
export function CalculatorContainer({ children, className = '' }: CalculatorContainerProps) {
  return (
    <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm p-3 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}
