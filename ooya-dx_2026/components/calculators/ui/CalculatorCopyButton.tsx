'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

interface CalculatorCopyButtonProps {
  /** コピーするテキストを生成する関数 */
  getResultText: () => string
  /** ボタンが無効かどうか */
  disabled?: boolean
}

/**
 * 結果コピーボタン
 * クリックで結果をクリップボードにコピー
 */
export function CalculatorCopyButton({ getResultText, disabled = false }: CalculatorCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const text = getResultText()
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [getResultText])

  if (disabled) return null

  return (
    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex justify-end">
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 text-xs sm:text-base font-medium ${
          copied
            ? 'bg-green-100 text-green-700 border-2 border-green-400'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-300 hover:border-blue-400'
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>コピーしました！</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">結果をコピーしてLINEやメールで共有</span>
            <span className="sm:hidden">結果をコピーして送る</span>
          </>
        )}
      </button>
    </div>
  )
}
