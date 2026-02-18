'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Copy, Check, ArrowRight } from 'lucide-react'
import { calculateBrokerageFee, BrokerageResult } from '@/lib/calculators/brokerage'

// 印紙税の計算（売買契約書）
function calculateStampDuty(priceInYen: number): number {
  if (priceInYen <= 0) return 0
  if (priceInYen <= 500000) return 200
  if (priceInYen <= 1000000) return 500
  if (priceInYen <= 5000000) return 1000
  if (priceInYen <= 10000000) return 5000
  if (priceInYen <= 50000000) return 10000
  if (priceInYen <= 100000000) return 30000
  if (priceInYen <= 500000000) return 60000
  if (priceInYen <= 1000000000) return 160000
  return 320000
}

// 登録免許税の概算（売買価格×70%を評価額とし、税率2%で計算）
function calculateRegistrationTaxEstimate(priceInYen: number): number {
  if (priceInYen <= 0) return 0
  const assessedValue = priceInYen * 0.7 // 評価額は売買価格の約70%
  return Math.floor(assessedValue * 0.02) // 所有権移転: 2%
}

// 不動産取得税の概算（売買価格×70%を評価額とし、税率3%で計算）
function calculateAcquisitionTaxEstimate(priceInYen: number): number {
  if (priceInYen <= 0) return 0
  const assessedValue = priceInYen * 0.7 // 評価額は売買価格の約70%
  return Math.floor(assessedValue * 0.03) // 住宅: 3%
}

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
    <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm ${compact ? 'p-4' : 'p-3 sm:p-6'} ${className}`}>
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
      <div className="mb-3 sm:mb-4">
        <label className="flex items-center gap-2 text-base sm:text-xl font-bold text-gray-900 mb-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-4 bg-orange-50 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xl sm:text-4xl font-bold text-gray-900"
          />
          <span className="text-base sm:text-xl text-gray-700 font-medium">万円</span>
        </div>
        {priceInMan === 0 && (
          <p className="text-sm sm:text-base text-gray-900 mt-2">
            💡 数字だけ入力してください（例：3000万円の場合 →「3000」と入力）
          </p>
        )}
      </div>

      {/* 結果エリア */}
      <div className="bg-white rounded-xl p-3 sm:p-5 border-2 border-blue-300 relative mt-6 sm:mt-8">
        {/* 吹き出し風ラベル */}
        <div className="absolute -top-4 left-4">
          <span className="inline-block bg-blue-600 text-white text-sm sm:text-lg font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md">
            シミュレーション結果
          </span>
        </div>
        <div className="mt-4"></div>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-xl font-bold text-gray-700">仲介手数料（税抜）</span>
            <div className="text-right">
              <span className="text-xl sm:text-3xl font-bold text-gray-900">
                {(result.commission / 10000).toLocaleString('ja-JP')}万円
              </span>
              <span className="block text-xs sm:text-base text-gray-700">
                （{result.commission.toLocaleString('ja-JP')}円）
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-xl font-bold text-gray-700">消費税（10%）</span>
            <div className="text-right">
              <span className="text-xl sm:text-3xl font-bold text-gray-900">
                {(result.tax / 10000).toLocaleString('ja-JP')}万円
              </span>
              <span className="block text-xs sm:text-base text-gray-700">
                （{result.tax.toLocaleString('ja-JP')}円）
              </span>
            </div>
          </div>

          {/* メイン結果 */}
          <div className="flex justify-between items-center border-t-2 border-blue-400 pt-3 sm:pt-4 mt-2">
            <span className="text-base sm:text-2xl font-bold text-gray-900">
              合計（税込）
            </span>
            <div className="text-right">
              <span className="text-2xl sm:text-5xl font-bold text-blue-700 whitespace-nowrap">
                {(result.total / 10000).toLocaleString('ja-JP')}万円
              </span>
              <span className="block text-xs sm:text-lg text-gray-700">
                （{result.total.toLocaleString('ja-JP')}円）
              </span>
            </div>
          </div>

          {/* 結果を共有ボタン */}
          {priceInMan > 0 && (
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
          )}
        </div>
      </div>

      {/* 計算式表示（結果ボックスの外） */}
      <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-3 sm:p-4">
        <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
          📊 仲介手数料の計算式
        </p>
        <p className="text-sm sm:text-lg text-gray-800 mb-2">
          <span className="font-bold text-gray-700">仲介手数料：</span>
          <span className="font-mono">
            {priceInMan > 0 ? (
              <>
                {priceInYen <= 2000000 && (
                  <>{priceInMan.toLocaleString()}万円 × 5% = {(result.commission / 10000).toLocaleString()}万円</>
                )}
                {priceInYen > 2000000 && priceInYen <= 4000000 && (
                  <>{priceInMan.toLocaleString()}万円 × 4% + 2万円 = {(result.commission / 10000).toLocaleString()}万円</>
                )}
                {priceInYen > 4000000 && (
                  <>{priceInMan.toLocaleString()}万円 × 3% + 6万円 = {(result.commission / 10000).toLocaleString()}万円</>
                )}
              </>
            ) : (
              <span className="text-gray-400">売買価格 × 3% + 6万円 = ___万円</span>
            )}
          </span>
        </p>
        <p className="text-sm sm:text-lg text-gray-800">
          <span className="font-bold text-gray-700">消費税：</span>
          <span className="font-mono">
            {priceInMan > 0 ? (
              <>{(result.commission / 10000).toLocaleString()}万円 × 10% = {(result.tax / 10000).toLocaleString()}万円</>
            ) : (
              <span className="text-gray-400">___万円 × 10% = ___万円</span>
            )}
          </span>
        </p>
      </div>

      {/* その他の費用（概算） */}
      <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-3 sm:p-4">
        <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
          📋 その他の費用（概算）
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            href="/tools/stamp-tax"
            className="flex items-center justify-between px-2 py-2 sm:px-3 sm:py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group border border-blue-200 hover:border-blue-300"
          >
            <span className="text-sm sm:text-base text-blue-800 group-hover:text-blue-900">印紙税：<span className="font-bold text-base sm:text-lg">{priceInMan > 0 ? `${(calculateStampDuty(priceInYen) / 10000).toLocaleString('ja-JP')}万円` : '___万円'}</span></span>
            <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 flex-shrink-0" />
          </Link>
          <Link
            href="/tools/registration-tax"
            className="flex items-center justify-between px-2 py-2 sm:px-3 sm:py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group border border-blue-200 hover:border-blue-300"
          >
            <span className="text-sm sm:text-base text-blue-800 group-hover:text-blue-900">登録免許税：<span className="font-bold text-base sm:text-lg">{priceInMan > 0 ? `約${(calculateRegistrationTaxEstimate(priceInYen) / 10000).toLocaleString('ja-JP')}万円` : '___万円'}</span></span>
            <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 flex-shrink-0" />
          </Link>
          <Link
            href="/tools/acquisition-tax"
            className="flex items-center justify-between px-2 py-2 sm:px-3 sm:py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group border border-blue-200 hover:border-blue-300"
          >
            <span className="text-sm sm:text-base text-blue-800 group-hover:text-blue-900">不動産取得税：<span className="font-bold text-base sm:text-lg">{priceInMan > 0 ? `約${(calculateAcquisitionTaxEstimate(priceInYen) / 10000).toLocaleString('ja-JP')}万円` : '___万円'}</span></span>
            <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* 2024年7月法改正特例の情報（800万円以下の場合のみ表示） */}
      {priceInMan > 0 && priceInYen <= SPECIAL_PROVISION_THRESHOLD && (
        <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 text-sm">
                2024年7月法改正による特例
              </p>
              <p className="text-sm text-amber-700 mt-1">
                800万円以下の物件は、売主・買主それぞれ
                <span className="font-bold">最大33万円（税込）</span>
                が仲介手数料の上限となる場合があります。
              </p>
              <p className="text-xs text-amber-600 mt-2">
                詳しくは<a href="https://www.mlit.go.jp/totikensangyo/const/1_6_bf_000013.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-800">国土交通省のページ</a>をご確認ください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
