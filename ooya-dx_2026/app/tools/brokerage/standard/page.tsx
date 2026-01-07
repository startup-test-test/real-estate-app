'use client'

import React, { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { calculateBrokerageFee } from '@/lib/calculators/brokerage'

export default function BrokerageStandardPage() {
  const [price, setPrice] = useState<number>(0)

  // 価格が変わるたびに自動計算
  const result = useMemo(() => {
    return calculateBrokerageFee(price)
  }, [price])

  // 万円単位に変換
  const priceInMan = price / 10000

  return (
    <ToolLayout
      title="仲介手数料計算（速算式）"
      description="売買価格を入力するだけで、仲介手数料を即座に計算します。宅建業法に基づく上限額を表示。"
      category="brokerage"
      categoryName="仲介手数料"
    >
      {/* 入力エリア */}
      <div className="mb-6">
        <NumberInput
          label="売買価格"
          value={price}
          onChange={setPrice}
          unit="円"
          placeholder="30,000,000"
        />
        {price > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            = {priceInMan.toLocaleString('ja-JP')} 万円
          </p>
        )}
      </div>

      {/* 計算式の説明 */}
      {price > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">適用料率：</span>{result.rate}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {price <= 2000000 && '200万円以下のため5%を適用'}
            {price > 2000000 && price <= 4000000 && '200万円超〜400万円以下のため4%+2万円を適用'}
            {price > 4000000 && '400万円超のため3%+6万円を適用'}
          </p>
        </div>
      )}

      {/* 結果エリア */}
      <div className="space-y-3">
        <ResultCard
          label="仲介手数料（税抜）"
          value={result.commission}
          unit="円"
        />
        <ResultCard
          label="消費税（10%）"
          value={result.tax}
          unit="円"
        />
        <ResultCard
          label="合計（税込）"
          value={result.total}
          unit="円"
          highlight={true}
          subText={result.total > 0 ? `= ${(result.total / 10000).toLocaleString('ja-JP')} 万円` : undefined}
        />
      </div>

      {/* 補足情報 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">仲介手数料の計算方法</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>宅建業法で定められた上限額の計算式：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>200万円以下の部分：5%</li>
            <li>200万円超〜400万円以下の部分：4%</li>
            <li>400万円超の部分：3%</li>
          </ul>
          <p className="mt-2">
            400万円超の場合は速算式「売買価格 × 3% + 6万円」で計算できます。
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
