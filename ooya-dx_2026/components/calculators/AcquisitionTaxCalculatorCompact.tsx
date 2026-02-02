'use client'

import { useState, useMemo, useEffect } from 'react'
import { NumberInput } from '@/components/tools/NumberInput'
import { calculateAcquisitionTax, AcquisitionTaxResult } from '@/lib/calculators/acquisitionTax'

interface AcquisitionTaxCalculatorCompactProps {
  className?: string
  compact?: boolean
  showTitle?: boolean
  initialBuildingEval?: number
  initialLandEval?: number
  onResultChange?: (result: AcquisitionTaxResult) => void
}

export function AcquisitionTaxCalculatorCompact({
  className = '',
  compact = false,
  showTitle = true,
  initialBuildingEval = 0,
  initialLandEval = 0,
  onResultChange,
}: AcquisitionTaxCalculatorCompactProps) {
  const [buildingEvalInMan, setBuildingEvalInMan] = useState(initialBuildingEval)
  const [landEvalInMan, setLandEvalInMan] = useState(initialLandEval)
  const [floorArea, setFloorArea] = useState(80)
  const [landArea, setLandArea] = useState(100)
  const [isNewBuilding, setIsNewBuilding] = useState(true)
  const [isResidential, setIsResidential] = useState(true)
  const [builtYear, setBuiltYear] = useState(2020)
  const [isLongTermQuality, setIsLongTermQuality] = useState(false)
  const [isForSelfResidence, setIsForSelfResidence] = useState(true)

  const buildingEvalInYen = buildingEvalInMan * 10000
  const landEvalInYen = landEvalInMan * 10000

  const result = useMemo(() => {
    const builtDate = isNewBuilding ? undefined : new Date(builtYear, 3, 1)
    return calculateAcquisitionTax({
      buildingEvaluation: buildingEvalInYen,
      isNewBuilding,
      floorArea,
      builtDate,
      isResidential,
      isLongTermQuality: isNewBuilding ? isLongTermQuality : false,
      isForSelfResidence: isNewBuilding ? true : isForSelfResidence,
      landEvaluation: landEvalInYen,
      landArea,
    })
  }, [buildingEvalInYen, landEvalInYen, floorArea, landArea, isNewBuilding, isResidential, builtYear, isLongTermQuality, isForSelfResidence])

  useEffect(() => {
    onResultChange?.(result)
  }, [result, onResultChange])

  useEffect(() => {
    setBuildingEvalInMan(initialBuildingEval)
  }, [initialBuildingEval])

  useEffect(() => {
    setLandEvalInMan(initialLandEval)
  }, [initialLandEval])

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
            不動産取得税を概算計算する
          </h3>
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
        {/* 物件種別 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新築/中古</label>
            <select
              value={isNewBuilding ? 'new' : 'used'}
              onChange={(e) => setIsNewBuilding(e.target.value === 'new')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="new">新築</option>
              <option value="used">中古</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用途</label>
            <select
              value={isResidential ? 'residential' : 'commercial'}
              onChange={(e) => setIsResidential(e.target.value === 'residential')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="residential">住宅</option>
              <option value="commercial">非住宅</option>
            </select>
          </div>
        </div>

        {/* 中古の場合 */}
        {!isNewBuilding && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新築年</label>
              <input
                type="number"
                value={builtYear}
                onChange={(e) => setBuiltYear(parseInt(e.target.value) || 2000)}
                min={1950}
                max={2025}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            {isResidential && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">取得目的</label>
                <select
                  value={isForSelfResidence ? 'self' : 'investment'}
                  onChange={(e) => setIsForSelfResidence(e.target.value === 'self')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                >
                  <option value="self">自己居住用</option>
                  <option value="investment">投資用</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* 新築・住宅の場合 */}
        {isNewBuilding && isResidential && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="longTermQuality"
              checked={isLongTermQuality}
              onChange={(e) => setIsLongTermQuality(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="longTermQuality" className="text-sm text-gray-700">
              認定長期優良住宅（控除1,300万円）
            </label>
          </div>
        )}

        {/* 評価額 */}
        <NumberInput
          label="建物の固定資産税評価額"
          value={buildingEvalInMan}
          onChange={setBuildingEvalInMan}
          unit="万円"
          placeholder="例：1500"
        />

        <NumberInput
          label="土地の固定資産税評価額"
          value={landEvalInMan}
          onChange={setLandEvalInMan}
          unit="万円"
          placeholder="例：2000"
        />

        {/* 面積 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">床面積</label>
            <div className="flex">
              <input
                type="number"
                value={floorArea}
                onChange={(e) => setFloorArea(parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-2 py-2 text-gray-600 text-sm">m²</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">土地面積</label>
            <div className="flex">
              <input
                type="number"
                value={landArea}
                onChange={(e) => setLandArea(parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-2 py-2 text-gray-600 text-sm">m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* 結果エリア */}
      <div className="bg-white rounded-lg p-4">
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <span className="text-gray-600">建物の税額</span>
          <span className="text-right font-medium">{(result.buildingTax / 10000).toLocaleString('ja-JP')}万円</span>

          <span className="text-gray-600">土地の税額</span>
          <span className="text-right font-medium">{(result.landTax / 10000).toLocaleString('ja-JP')}万円</span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 border-t-2 border-blue-300 pt-4">
          <span className="text-gray-700 font-bold">不動産取得税（概算）</span>
          <span className={`text-right font-bold text-blue-700 ${compact ? 'text-xl' : 'text-2xl'}`}>
            {(result.totalTax / 10000).toLocaleString('ja-JP')}万円
          </span>
        </div>

        {result.buildingDeductionType !== 'なし' && (
          <p className="text-xs text-blue-600 mt-2">
            適用控除：{result.buildingDeductionType}
          </p>
        )}
      </div>
    </div>
  )
}
