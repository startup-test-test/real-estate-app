'use client'

import { useState, useMemo, useEffect } from 'react'
import { NumberInput } from '@/components/tools/NumberInput'
import { calculateBrokerageFee, BrokerageResult } from '@/lib/calculators/brokerage'

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
  const [priceInMan, setPriceInMan] = useState(initialPrice)

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
      <div className="bg-white rounded-lg p-4 mb-4">
        <NumberInput
          label="売買価格を入力"
          value={priceInMan}
          onChange={setPriceInMan}
          unit="万円"
          placeholder="例：3000"
        />
        {priceInMan > 0 ? (
          <p className="text-sm text-gray-500 mt-1">
            = {priceInMan.toLocaleString('ja-JP')}万円（{priceInYen.toLocaleString('ja-JP')}円）
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-2">
            例：3000 → 3,000万円 → 仲介手数料 約105.6万円（税込）
          </p>
        )}
      </div>

      {/* 計算式の説明 */}
      {priceInMan > 0 && (
        <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">適用料率：</span>
            {result.rate}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {priceInYen <= 2000000 && '200万円以下のため5%を適用'}
            {priceInYen > 2000000 && priceInYen <= 4000000 && '200万円超〜400万円以下のため4%+2万円を適用'}
            {priceInYen > 4000000 && '400万円超のため3%+6万円（速算式）を適用'}
          </p>
        </div>
      )}

      {/* 結果エリア */}
      <div className="bg-white rounded-lg p-4">
        <div className="grid grid-cols-2 gap-y-3 text-base">
          <span className="text-gray-600">仲介手数料（税抜）</span>
          <span className="text-right text-lg font-medium">
            {(result.commission / 10000).toLocaleString('ja-JP')}万円
          </span>

          <span className="text-gray-600">消費税（10%）</span>
          <span className="text-right text-lg font-medium">
            {(result.tax / 10000).toLocaleString('ja-JP')}万円
          </span>

          {/* メイン結果 */}
          <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
            合計（税込）
          </span>
          <span className={`text-right font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2 ${compact ? 'text-xl' : 'text-2xl'}`}>
            {(result.total / 10000).toLocaleString('ja-JP')}万円
          </span>
        </div>

        {/* 計算式表示 */}
        {priceInMan > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">計算式</p>
            <p className="text-sm text-gray-700 font-mono">
              {priceInYen <= 2000000 && (
                <>{priceInMan.toLocaleString()}万円 × 5% = {(result.commission / 10000).toLocaleString()}万円</>
              )}
              {priceInYen > 2000000 && priceInYen <= 4000000 && (
                <>{priceInMan.toLocaleString()}万円 × 4% + 2万円 = {(result.commission / 10000).toLocaleString()}万円</>
              )}
              {priceInYen > 4000000 && (
                <>{priceInMan.toLocaleString()}万円 × 3% + 6万円 = {(result.commission / 10000).toLocaleString()}万円</>
              )}
            </p>
            <p className="text-sm text-gray-700 font-mono">
              {(result.commission / 10000).toLocaleString()}万円 × 10% = {(result.tax / 10000).toLocaleString()}万円（税）
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
