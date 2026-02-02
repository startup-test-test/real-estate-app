'use client'

import { useState, useMemo, useEffect } from 'react'
import { NumberInput } from '@/components/tools/NumberInput'
import { calculateYieldRate, estimateAnnualExpenses, estimatePurchaseCosts, YieldRateResult } from '@/lib/calculators/yieldRate'

interface YieldRateCalculatorCompactProps {
  className?: string
  compact?: boolean
  showTitle?: boolean
  onResultChange?: (result: YieldRateResult) => void
}

export function YieldRateCalculatorCompact({
  className = '',
  compact = false,
  showTitle = true,
  onResultChange,
}: YieldRateCalculatorCompactProps) {
  // 入力値（万円単位）
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0)
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)
  const [annualExpensesInMan, setAnnualExpensesInMan] = useState<number>(0)
  const [purchaseCostsInMan, setPurchaseCostsInMan] = useState<number>(0)

  // 計算結果
  const result = useMemo(() => {
    return calculateYieldRate({
      propertyPriceInMan,
      annualRentInMan,
      annualExpensesInMan,
      purchaseCostsInMan,
    })
  }, [propertyPriceInMan, annualRentInMan, annualExpensesInMan, purchaseCostsInMan])

  // 経費の推計値（参考表示用）
  const estimatedExpenses = useMemo(() => {
    return estimateAnnualExpenses(annualRentInMan, 20)
  }, [annualRentInMan])

  // 購入諸経費の推計値（参考表示用）
  const estimatedPurchaseCosts = useMemo(() => {
    return estimatePurchaseCosts(propertyPriceInMan, 7)
  }, [propertyPriceInMan])

  // 結果変更時のコールバック
  useEffect(() => {
    if (onResultChange) {
      onResultChange(result)
    }
  }, [result, onResultChange])

  const hasInput = propertyPriceInMan > 0 && annualRentInMan > 0

  return (
    <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            利回りを概算計算する
          </h2>
        </div>
      )}

      {/* 基本入力エリア */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
        <NumberInput
          label="物件価格"
          value={propertyPriceInMan}
          onChange={setPropertyPriceInMan}
          unit="万円"
          placeholder="例：3000"
        />

        <NumberInput
          label="年間想定賃料（満室時）"
          value={annualRentInMan}
          onChange={setAnnualRentInMan}
          unit="万円"
          placeholder="例：240"
        />

        {annualRentInMan > 0 && (
          <p className="text-sm text-gray-500">
            月額換算：約{(annualRentInMan / 12).toFixed(1)}万円
          </p>
        )}
      </div>

      {/* 実質利回り用入力エリア */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-4 border border-blue-100">
        <p className="text-sm text-gray-600 mb-2">
          年間経費と購入諸経費を入力すると、実質利回りを計算します。
        </p>

        <NumberInput
          label="年間経費（管理費・修繕積立金・固都税など）"
          value={annualExpensesInMan}
          onChange={setAnnualExpensesInMan}
          unit="万円"
          placeholder={`例：${estimatedExpenses}（賃料の約20%が目安）`}
        />

        <NumberInput
          label="購入諸経費（登記・仲介手数料など）"
          value={purchaseCostsInMan}
          onChange={setPurchaseCostsInMan}
          unit="万円"
          placeholder={`例：${estimatedPurchaseCosts}（物件価格の約7%が目安）`}
        />

        {propertyPriceInMan > 0 && (
          <p className="text-xs text-gray-500">
            目安：経費は賃料の約15〜25%、購入諸経費は物件価格の約7〜10%程度
          </p>
        )}
      </div>

      {/* 結果エリア */}
      <div className="bg-white rounded-lg p-4">
        {/* 表面利回り（メイン結果） */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">表面利回り（グロス）</span>
            <span className="text-3xl font-bold text-blue-700">
              {hasInput ? `${result.grossYield.toFixed(2)}%` : '-%'}
            </span>
          </div>
          {hasInput && (
            <p className="text-xs text-gray-500 mt-1 text-right">
              年間{annualRentInMan}万円 / 物件{propertyPriceInMan}万円
            </p>
          )}
        </div>

        {/* 実質利回り */}
        {result.netYield !== null && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">実質利回り（ネット）</span>
              <span className="text-3xl font-bold text-green-700">
                {result.netYield.toFixed(2)}%
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-2 text-right">
              NOI {result.annualNOI}万円 / 取得総額{result.totalInvestment}万円
            </p>

            <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3">
              <span className="text-sm text-amber-800">表面と実質の差</span>
              <span className="text-lg font-semibold text-amber-700">
                -{result.yieldDifference?.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* 計算式表示 */}
        {hasInput && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">計算式</p>
            <div className="text-sm text-gray-700 font-mono space-y-1">
              <p>
                【表面利回り】{annualRentInMan}万円 / {propertyPriceInMan}万円 × 100 = {result.grossYield.toFixed(2)}%
              </p>
              {result.netYield !== null && (
                <>
                  <p>
                    【NOI】{annualRentInMan}万円 - {annualExpensesInMan}万円 = {result.annualNOI}万円
                  </p>
                  <p>
                    【実質利回り】{result.annualNOI}万円 / {result.totalInvestment}万円 × 100 = {result.netYield.toFixed(2)}%
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
