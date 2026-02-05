'use client'

import { ComponentType } from 'react'

interface CalculatorTitleProps {
  /** アイコンコンポーネント */
  icon?: ComponentType<{ className?: string }>
  /** タイトルテキスト */
  title: string
}

/**
 * シミュレータータイトル（アイコン付き）
 */
export function CalculatorTitle({ icon: Icon, title }: CalculatorTitleProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon ? (
        <div className="bg-blue-500 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
      ) : (
        <div className="bg-blue-500 p-2 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <h3 className="text-base sm:text-xl font-bold text-gray-900">
        {title}
      </h3>
    </div>
  )
}
