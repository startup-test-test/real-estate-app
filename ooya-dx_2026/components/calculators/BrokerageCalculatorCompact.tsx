'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, Share2, Check } from 'lucide-react'
import { calculateBrokerageFee, BrokerageResult } from '@/lib/calculators/brokerage'

// 2024年7月法改正の特例上限（税込）
const SPECIAL_PROVISION_LIMIT = 330000 // 33万円
const SPECIAL_PROVISION_THRESHOLD = 8000000 // 800万円

interface BrokerageCalculatorCompactProps {
  /** 親コンポーネントからのクラス名追加 */
  className?: string
  /** コンパクト表示モード（trueでより小さく） */
  compact?: boolean
  /** タイトル表示の有無 */
  showTitle?: boolean
  /** 初期の売買価格（万円） */
  initialPrice?: number
  /** 計算結果が変わった時のコールバック */
  onResultChange?: (result: BrokerageResult) => void
}

export function BrokerageCalculatorCompact({
  className = '',
  compact = false,
  showTitle = true,
  initialPrice = 0,
  onResultChange,
}: BrokerageCalculatorCompactProps) {
  const searchParams = useSearchParams()
  const [priceInMan, setPriceInMan] = useState(initialPrice)
  const [copied, setCopied] = useState(false)

  // URLパラメータから初期値を読み取り（?price=3000 形式）
  useEffect(() => {
    const priceParam = searchParams.get('price')
    if (priceParam) {
      const parsed = Number(priceParam)
      if (!isNaN(parsed) && parsed > 0) {
        setPriceInMan(parsed)
      }
    }
  }, [searchParams])

  // 円に変換して計算
  const priceInYen = priceInMan * 10000

  // 計算実行
  const result = useMemo(() => {
    return calculateBrokerageFee(priceInYen)
  }, [priceInYen])

  // 結果が変わったら親に通知
  useEffect(() => {
    onResultChange?.(result)
  }, [result, onResultChange])

  // 親から初期値が変わった場合に同期
  useEffect(() => {
    setPriceInMan(initialPrice)
  }, [initialPrice])

  // 結果テキストを生成（分かりやすい形式 + URLパラメータ付き）
  const getResultText = useCallback(() => {
    if (priceInMan <= 0) return ''
    return `【売買価格${priceInMan.toLocaleString('ja-JP')}万円】仲介手数料：${(result.total / 10000).toLocaleString('ja-JP')}万円（税込）
https://ooya.tech/tools/brokerage?price=${priceInMan}`
  }, [priceInMan, result])

  // クリップボードにコピー
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

  return (
    <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm ${compact ? 'p-4' : 'p-6'} ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-xl'}`}>
            仲介手数料を概算計算する
          </h3>
        </div>
      )}

      {/* 入力エリア */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-3">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          売買価格を入力してください
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={priceInMan === 0 ? '' : priceInMan.toLocaleString('ja-JP')}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              setPriceInMan(value === '' ? 0 : Number(value))
            }}
            placeholder="例：3000"
            className="flex-1 px-4 py-4 bg-orange-50 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-4xl font-bold text-gray-900"
          />
          <span className="text-xl text-gray-700 font-medium">万円</span>
        </div>
        {priceInMan === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            例：3000 → 3,000万円 → 仲介手数料 約105.6万円（税込）
          </p>
        )}
      </div>

      {/* 結果エリア */}
      <div className="bg-white rounded-xl p-5 border-2 border-blue-300 relative mt-8">
        {/* 吹き出し風ラベル */}
        <div className="absolute -top-4 left-4">
          <span className="inline-block bg-blue-600 text-white text-lg font-bold px-4 py-1.5 rounded-full shadow-md">
            シミュレーション結果
          </span>
        </div>
        <div className="mt-4"></div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-700">仲介手数料（税抜）</span>
            <span className="text-3xl font-bold text-gray-900">
              {(result.commission / 10000).toLocaleString('ja-JP')}万円
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-700">消費税（10%）</span>
            <span className="text-3xl font-bold text-gray-900">
              {(result.tax / 10000).toLocaleString('ja-JP')}万円
            </span>
          </div>

          {/* メイン結果 */}
          <div className="flex justify-between items-center border-t-2 border-blue-400 pt-4 mt-2">
            <span className="text-2xl font-bold text-gray-900">
              合計（税込）
            </span>
            <span className="text-4xl font-extrabold text-blue-600">
              {(result.total / 10000).toLocaleString('ja-JP')}万円
            </span>
          </div>

          {/* 結果を共有ボタン */}
          {priceInMan > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium ${
                  copied
                    ? 'bg-green-100 text-green-700 border-2 border-green-400'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-300 hover:border-blue-400'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>コピーしました！</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" />
                    <span>結果をコピーしてLINEやメールで共有</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 計算式表示（結果ボックスの外） */}
      {priceInMan > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <p className="text-base font-bold text-gray-900 mb-3">
            計算式（適用料率：{result.rate}）
          </p>
          <p className="text-lg text-gray-800 mb-2">
            <span className="font-bold text-gray-700">仲介手数料：</span>
            <span className="font-mono">
              {priceInYen <= 2000000 && (
                <>{priceInMan.toLocaleString()}万円 × 5% = {(result.commission / 10000).toLocaleString()}万円</>
              )}
              {priceInYen > 2000000 && priceInYen <= 4000000 && (
                <>{priceInMan.toLocaleString()}万円 × 4% + 2万円 = {(result.commission / 10000).toLocaleString()}万円</>
              )}
              {priceInYen > 4000000 && (
                <>{priceInMan.toLocaleString()}万円 × 3% + 6万円 = {(result.commission / 10000).toLocaleString()}万円</>
              )}
            </span>
          </p>
          <p className="text-lg text-gray-800">
            <span className="font-bold text-gray-700">消費税：</span>
            <span className="font-mono">{(result.commission / 10000).toLocaleString()}万円 × 10% = {(result.tax / 10000).toLocaleString()}万円</span>
          </p>
        </div>
      )}

      {/* 2024年7月法改正特例の警告（800万円以下の場合） */}
      {priceInMan > 0 && priceInYen <= SPECIAL_PROVISION_THRESHOLD && (
        <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 text-sm">
                2024年7月法改正による特例
              </p>
              <p className="text-sm text-amber-700 mt-1">
                800万円以下の物件は、売主・買主それぞれから
                <span className="font-bold">最大33万円（税込）</span>
                が請求される可能性があります。
              </p>
              <p className="text-xs text-amber-600 mt-2">
                ※低廉な空家等の流通促進を目的とした特例です。適用には仲介会社からの事前説明と合意が必要です。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
