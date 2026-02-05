'use client'

import { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface CalculatorWarningProps {
  /** 警告タイトル */
  title: string
  /** 警告内容 */
  children: ReactNode
  /** 表示するかどうか */
  show?: boolean
}

/**
 * 警告・注意表示ボックス
 * アンバー（黄色系）の背景で注意を促す
 */
export function CalculatorWarning({
  title,
  children,
  show = true,
}: CalculatorWarningProps) {
  if (!show) return null

  return (
    <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 text-sm">{title}</p>
          <div className="text-sm text-amber-700 mt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
