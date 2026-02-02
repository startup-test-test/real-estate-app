'use client'

import { useState, useMemo, useEffect } from 'react'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { calculateRegistrationTax, RegistrationTaxInput, RegistrationTaxResult } from '@/lib/calculators/registrationTax'

interface RegistrationTaxCalculatorCompactProps {
  className?: string
  compact?: boolean
  showTitle?: boolean
  onResultChange?: (result: RegistrationTaxResult) => void
}

export function RegistrationTaxCalculatorCompact({
  className = '',
  compact = false,
  showTitle = true,
  onResultChange,
}: RegistrationTaxCalculatorCompactProps) {
  // 取引種別
  const [transactionType, setTransactionType] = useState<'newPurchase' | 'usedPurchase' | 'landOnly'>('newPurchase')

  // 土地
  const [hasLand, setHasLand] = useState(true)
  const [landAssessedValueInMan, setLandAssessedValueInMan] = useState<number>(0)

  // 建物
  const [hasBuilding, setHasBuilding] = useState(true)
  const [buildingAssessedValueInMan, setBuildingAssessedValueInMan] = useState<number>(0)

  // ローン
  const [hasLoan, setHasLoan] = useState(true)
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0)

  // 取引種別変更時の処理
  const handleTransactionTypeChange = (type: 'newPurchase' | 'usedPurchase' | 'landOnly') => {
    setTransactionType(type)
    if (type === 'landOnly') {
      setHasBuilding(false)
    } else {
      setHasBuilding(true)
    }
  }

  // 万円→円に変換
  const landAssessedValue = landAssessedValueInMan * 10000
  const buildingAssessedValue = buildingAssessedValueInMan * 10000
  const loanAmount = loanAmountInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    const input: RegistrationTaxInput = {
      transactionType,
      hasLand,
      landAssessedValue,
      hasBuilding: transactionType !== 'landOnly' && hasBuilding,
      buildingType: transactionType === 'newPurchase' ? 'new' : 'used',
      buildingAssessedValue,
      prefecture: 'default',
      structure: 'wood',
      floorArea: 0,
      isSelfResidential: true, // 軽減税率を自動適用
      isLongTermQuality: false,
      isLowCarbon: false,
      isResale: false,
      hasLoan,
      loanAmount,
    }

    return calculateRegistrationTax(input)
  }, [
    transactionType, hasLand, landAssessedValue,
    hasBuilding, buildingAssessedValue,
    hasLoan, loanAmount
  ])

  // 結果変更時のコールバック
  useEffect(() => {
    if (onResultChange) {
      onResultChange(result)
    }
  }, [result, onResultChange])

  // 入力があるか判定
  const hasInput = (hasLand && landAssessedValueInMan > 0) ||
    (hasBuilding && transactionType !== 'landOnly' && buildingAssessedValueInMan > 0) ||
    (hasLoan && loanAmountInMan > 0)

  return (
    <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            登録免許税を概算計算する
          </h2>
        </div>
      )}

      {/* 取引種別選択 */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          取引の種類
        </label>
        <select
          value={transactionType}
          onChange={(e) => handleTransactionTypeChange(e.target.value as 'newPurchase' | 'usedPurchase' | 'landOnly')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="newPurchase">新築購入</option>
          <option value="usedPurchase">中古購入</option>
          <option value="landOnly">土地のみ</option>
        </select>
      </div>

      {/* 土地・建物入力（2列） */}
      <div className={`grid gap-4 mb-4 ${transactionType !== 'landOnly' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {/* 土地入力 */}
        {hasLand && (
          <div className="bg-white rounded-lg p-4">
            <NumberInput
              label="土地の固定資産税評価額"
              value={landAssessedValueInMan}
              onChange={setLandAssessedValueInMan}
              unit="万円"
              placeholder="1050"
            />
            <p className="text-xs text-gray-500 mt-1">
              ※売買価格の約70%が目安です
            </p>
          </div>
        )}

        {/* 建物入力 */}
        {hasBuilding && transactionType !== 'landOnly' && (
          <div className="bg-white rounded-lg p-4">
            <NumberInput
              label={`建物の固定資産税評価額${transactionType === 'newPurchase' ? '（新築）' : '（中古）'}`}
              value={buildingAssessedValueInMan}
              onChange={setBuildingAssessedValueInMan}
              unit="万円"
              placeholder="600"
            />
            <p className="text-xs text-gray-500 mt-1">
              ※売買価格の約50〜60%が目安です
            </p>
          </div>
        )}
      </div>

      {/* 住宅ローン */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="hasLoan"
            checked={hasLoan}
            onChange={(e) => setHasLoan(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded border border-gray-300"
          />
          <label htmlFor="hasLoan" className="text-sm font-medium text-gray-700">
            住宅ローンを利用する
          </label>
        </div>
        {hasLoan && (
          <NumberInput
            label="借入金額"
            value={loanAmountInMan}
            onChange={setLoanAmountInMan}
            unit="万円"
            placeholder="3000"
          />
        )}
      </div>

      {/* 適用税率の説明 */}
      {hasInput && (
        <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-1">適用税率</p>
          <div className="text-xs text-blue-700 space-y-0.5">
            {hasLand && result.landTaxBase > 0 && (
              <p>土地移転: {result.appliedRates.land}（軽減税率適用）</p>
            )}
            {hasBuilding && transactionType !== 'landOnly' && result.buildingTaxBase > 0 && (
              <p>
                建物{transactionType === 'newPurchase' ? '保存' : '移転'}: {result.appliedRates.building}
                {result.reductionApplied.building && '（軽減税率適用）'}
              </p>
            )}
            {hasLoan && result.mortgageTaxBase > 0 && (
              <p>
                抵当権設定: {result.appliedRates.mortgage}
                {result.reductionApplied.mortgage && '（軽減税率適用）'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 結果表示 */}
      <div className="space-y-3">
        {hasLand && (
          <ResultCard
            label="土地の移転登記"
            value={result.landTax}
            unit="円"
            subText={result.landTaxBase > 0 ? `課税標準: ${result.landTaxBase.toLocaleString()}円` : undefined}
          />
        )}
        {hasBuilding && transactionType !== 'landOnly' && (
          <ResultCard
            label={`建物の${transactionType === 'newPurchase' ? '保存' : '移転'}登記`}
            value={result.buildingTax}
            unit="円"
            subText={result.buildingTaxBase > 0 ? `課税標準: ${result.buildingTaxBase.toLocaleString()}円` : undefined}
          />
        )}
        {hasLoan && (
          <ResultCard
            label="抵当権設定登記"
            value={result.mortgageTax}
            unit="円"
            subText={result.mortgageTaxBase > 0 ? `課税標準: ${result.mortgageTaxBase.toLocaleString()}円` : undefined}
          />
        )}
        <ResultCard
          label="登録免許税 合計"
          value={result.totalTax}
          unit="円"
          highlight={true}
          subText={
            result.totalTax > 0
              ? `= ${(result.totalTax / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })} 万円`
              : undefined
          }
        />

        {/* 計算式表示 */}
        {hasInput && result.totalTax > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 bg-white rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">計算式</p>
            <div className="text-sm text-gray-700 font-mono space-y-2">
              {hasLand && result.landTax > 0 && (
                <div>
                  <p className="text-xs text-gray-500">【土地移転登記】</p>
                  <p>{result.landTaxBase.toLocaleString()}円 × {result.appliedRates.land} = {result.landTax.toLocaleString()}円</p>
                </div>
              )}
              {hasBuilding && transactionType !== 'landOnly' && result.buildingTax > 0 && (
                <div>
                  <p className="text-xs text-gray-500">【建物{transactionType === 'newPurchase' ? '保存' : '移転'}登記】</p>
                  <p>{result.buildingTaxBase.toLocaleString()}円 × {result.appliedRates.building} = {result.buildingTax.toLocaleString()}円</p>
                </div>
              )}
              {hasLoan && result.mortgageTax > 0 && (
                <div>
                  <p className="text-xs text-gray-500">【抵当権設定登記】</p>
                  <p>{result.mortgageTaxBase.toLocaleString()}円 × {result.appliedRates.mortgage} = {result.mortgageTax.toLocaleString()}円</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">【合計】</p>
                <p>
                  {[
                    result.landTax > 0 ? `${result.landTax.toLocaleString()}円` : null,
                    result.buildingTax > 0 ? `${result.buildingTax.toLocaleString()}円` : null,
                    result.mortgageTax > 0 ? `${result.mortgageTax.toLocaleString()}円` : null,
                  ].filter(Boolean).join(' + ')} = {result.totalTax.toLocaleString()}円
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
