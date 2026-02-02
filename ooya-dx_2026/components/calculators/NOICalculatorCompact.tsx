'use client'

import { useState, useMemo, useEffect } from 'react'
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import { NumberInput } from '@/components/tools/NumberInput'
import { calculateNOI, getOpexRateByPropertyType, NOIResult } from '@/lib/calculators/noi'

interface NOICalculatorCompactProps {
  className?: string
  compact?: boolean
  showTitle?: boolean
  onResultChange?: (result: NOIResult | null) => void
}

// 物件タイプ選択肢
const propertyTypes = [
  { value: 'condo-new', label: '区分マンション（新築・築浅）' },
  { value: 'condo-used', label: '区分マンション（中古）' },
  { value: 'apartment-rc', label: '一棟マンション（RC造）' },
  { value: 'apartment-wood', label: '一棟アパート（木造）' },
  { value: 'commercial', label: '商業施設・ホテル' },
]

export function NOICalculatorCompact({
  className = '',
  compact = false,
  showTitle = true,
  onResultChange,
}: NOICalculatorCompactProps) {
  // 入力モード
  const [useSimpleMode, setUseSimpleMode] = useState(true)
  const [propertyType, setPropertyType] = useState('apartment-rc')
  const [showDetails, setShowDetails] = useState(true)

  // 収入入力
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)
  const [vacancyRate, setVacancyRate] = useState<number>(5)
  const [badDebtRate, setBadDebtRate] = useState<number>(1)
  const [otherIncomeInMan, setOtherIncomeInMan] = useState<number>(0)

  // 簡易モード用
  const opexRateDefault = getOpexRateByPropertyType(propertyType)
  const [opexRate, setOpexRate] = useState<number>(opexRateDefault.typical)

  // 詳細モード用
  const [pmFeeRate, setPmFeeRate] = useState<number>(5)
  const [bmFeeInMan, setBmFeeInMan] = useState<number>(0)
  const [propertyTaxInMan, setPropertyTaxInMan] = useState<number>(0)
  const [maintenanceRate, setMaintenanceRate] = useState<number>(2)
  const [insuranceInMan, setInsuranceInMan] = useState<number>(0)
  const [leasingCostInMan, setLeasingCostInMan] = useState<number>(0)
  const [otherExpenseInMan, setOtherExpenseInMan] = useState<number>(0)

  // NOI利回り計算用
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0)

  // 物件タイプ変更時に経費率を更新
  const handlePropertyTypeChange = (newType: string) => {
    setPropertyType(newType)
    const rate = getOpexRateByPropertyType(newType)
    setOpexRate(rate.typical)
  }

  // 入力があるか判定
  const hasInput = annualRentInMan > 0

  // 計算結果
  const result = useMemo(() => {
    if (!hasInput) return null
    return calculateNOI({
      annualRentInMan,
      vacancyRate,
      badDebtRate,
      otherIncomeInMan,
      pmFeeRate,
      bmFeeInMan,
      propertyTaxInMan,
      maintenanceRate,
      insuranceInMan,
      leasingCostInMan,
      otherExpenseInMan,
      useSimpleMode,
      opexRate,
    }, propertyPriceInMan > 0 ? propertyPriceInMan : undefined)
  }, [hasInput, annualRentInMan, vacancyRate, badDebtRate, otherIncomeInMan, pmFeeRate, bmFeeInMan, propertyTaxInMan, maintenanceRate, insuranceInMan, leasingCostInMan, otherExpenseInMan, useSimpleMode, opexRate, propertyPriceInMan])

  // 結果変更時のコールバック
  useEffect(() => {
    if (onResultChange) {
      onResultChange(result)
    }
  }, [result, onResultChange])

  return (
    <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            NOIを概算計算する
          </h2>
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
        {/* 入力モード切替 */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setUseSimpleMode(true)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              useSimpleMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            簡易モード
          </button>
          <button
            type="button"
            onClick={() => setUseSimpleMode(false)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              !useSimpleMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            詳細モード
          </button>
        </div>

        {/* 年間家賃収入（GPI） */}
        <NumberInput
          label="年間家賃収入（満室想定・GPI）"
          value={annualRentInMan}
          onChange={setAnnualRentInMan}
          unit="万円"
          placeholder="例：500"
        />

        {/* 空室率 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            想定空室率
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={vacancyRate}
              onChange={(e) => setVacancyRate(parseFloat(e.target.value) || 0)}
              step="1"
              min="0"
              max="100"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：5"
            />
            <span className="text-gray-600 font-medium">%</span>
          </div>
        </div>

        {/* 貸倒損失率 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            貸倒損失率（滞納リスク）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={badDebtRate}
              onChange={(e) => setBadDebtRate(parseFloat(e.target.value) || 0)}
              step="0.5"
              min="0"
              max="10"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：1"
            />
            <span className="text-gray-600 font-medium">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">目安：0.5%〜2%程度</p>
        </div>

        {/* その他収入 */}
        <NumberInput
          label="その他収入（駐車場・自販機等）"
          value={otherIncomeInMan}
          onChange={setOtherIncomeInMan}
          unit="万円/年"
          placeholder="例：20"
        />

        <hr className="border-gray-200" />

        {useSimpleMode ? (
          <>
            {/* 簡易モード：物件タイプと経費率 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                物件タイプ
              </label>
              <select
                value={propertyType}
                onChange={(e) => handlePropertyTypeChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                運営経費率（OPEX率）
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={opexRate}
                  onChange={(e) => setOpexRate(parseFloat(e.target.value) || 0)}
                  step="1"
                  min="0"
                  max="100"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-600 font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {propertyTypes.find(t => t.value === propertyType)?.label}の目安：{opexRateDefault.min}%〜{opexRateDefault.max}%
              </p>
            </div>
          </>
        ) : (
          <>
            {/* 詳細モード：各経費項目 */}
            <p className="text-sm font-medium text-gray-700 mb-2">運営経費（OPEX）詳細</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">PM管理費率</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pmFeeRate}
                    onChange={(e) => setPmFeeRate(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    min="0"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="例：5"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>

              <NumberInput
                label="BM管理費（清掃・点検等）"
                value={bmFeeInMan}
                onChange={setBmFeeInMan}
                unit="万円/年"
                placeholder="例：30"
              />

              <NumberInput
                label="固定資産税・都市計画税"
                value={propertyTaxInMan}
                onChange={setPropertyTaxInMan}
                unit="万円/年"
                placeholder="例：50"
              />

              <div>
                <label className="block text-xs text-gray-600 mb-1">修繕維持費率</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={maintenanceRate}
                    onChange={(e) => setMaintenanceRate(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    min="0"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="例：2"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>

              <NumberInput
                label="損害保険料"
                value={insuranceInMan}
                onChange={setInsuranceInMan}
                unit="万円/年"
                placeholder="例：5"
              />

              <NumberInput
                label="募集費用（AD等）"
                value={leasingCostInMan}
                onChange={setLeasingCostInMan}
                unit="万円/年"
                placeholder="例：20"
              />

              <NumberInput
                label="その他経費"
                value={otherExpenseInMan}
                onChange={setOtherExpenseInMan}
                unit="万円/年"
                placeholder="例：10"
              />
            </div>
          </>
        )}

        <hr className="border-gray-200" />

        {/* 物件価格（NOI利回り計算用） */}
        <NumberInput
          label="物件価格（NOI利回り計算用・任意）"
          value={propertyPriceInMan}
          onChange={setPropertyPriceInMan}
          unit="万円"
          placeholder="例：5000"
        />
      </div>

      {/* 結果エリア */}
      {result && (
        <div className="bg-white rounded-lg p-4">
          {/* メイン結果 */}
          <div className="grid grid-cols-2 gap-y-3 text-base">
            <span className="text-gray-600">GPI（潜在総収益）</span>
            <span className="text-right font-medium">{result.gpi.toLocaleString()}万円/年</span>

            <span className="text-gray-600">空室・貸倒損失</span>
            <span className="text-right font-medium text-red-600">
              -{(result.vacancyLoss + result.badDebtLoss).toLocaleString()}万円/年
            </span>

            <span className="text-gray-600">EGI（実効総収益）</span>
            <span className="text-right font-medium">{result.egi.toLocaleString()}万円/年</span>

            <span className="text-gray-600">OPEX合計（経費率{result.opexRatio}%）</span>
            <span className="text-right font-medium text-red-600">
              -{result.totalOpex.toLocaleString()}万円/年
            </span>

            {/* NOI（メイン結果） */}
            <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
              NOI（営業純収益）
            </span>
            <span className="text-right text-2xl font-bold text-blue-600 border-t-2 border-blue-300 pt-4 mt-2">
              {result.noi.toLocaleString()}万円/年
            </span>

            {/* NOI利回り */}
            {result.noiYield !== null && (
              <>
                <span className="text-gray-600 border-t pt-3">NOI利回り（キャップレート）</span>
                <span className="text-right font-bold border-t pt-3">
                  {result.noiYield.toFixed(2)}%
                </span>
              </>
            )}

            {/* 月額換算 */}
            <span className="text-gray-600 border-t pt-3">月額NOI</span>
            <span className="text-right font-medium border-t pt-3">
              約{Math.round(result.noi / 12 * 10) / 10}万円/月
            </span>
          </div>

          {/* キャッシュフローツリー詳細 */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? '詳細を閉じる' : 'キャッシュフローツリーを表示'}
          </button>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">キャッシュフローツリー</p>
              <div className="space-y-1 font-mono text-sm">
                {result.cashFlowTree.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between ${
                      item.type === 'result' ? 'font-bold text-blue-600 border-t pt-2 mt-2' :
                      item.type === 'subtotal' ? 'font-medium text-gray-800' :
                      'text-gray-600'
                    }`}
                    style={{ paddingLeft: `${item.indent * 16}px` }}
                  >
                    <span>{item.type === 'expense' || item.type === 'income' ? (item.indent > 0 ? '└ ' : '') : ''}{item.label}</span>
                    <span className={item.value < 0 ? 'text-red-600' : ''}>
                      {item.value >= 0 ? '' : ''}{item.value.toLocaleString()}万円
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 計算式表示 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">計算式</p>
            <div className="text-sm text-gray-700 font-mono space-y-1">
              <p>NOI = EGI - OPEX</p>
              <p>NOI = {result.egi.toLocaleString()} - {result.totalOpex.toLocaleString()} = {result.noi.toLocaleString()}万円</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
