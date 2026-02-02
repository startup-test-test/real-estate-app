'use client'

import { useState, useMemo, useEffect } from 'react'
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { NumberInput } from '@/components/tools/NumberInput'
import {
  calculateStampTax,
  ContractType,
  SellerType,
  formatYen,
  formatTax,
  StampTaxResult,
} from '@/lib/calculators/stampTax'

interface StampTaxCalculatorCompactProps {
  className?: string
  compact?: boolean
  showTitle?: boolean
  onResultChange?: (result: StampTaxResult) => void
}

export function StampTaxCalculatorCompact({
  className = '',
  compact = false,
  showTitle = true,
  onResultChange,
}: StampTaxCalculatorCompactProps) {
  // 入力状態
  const [contractType, setContractType] = useState<ContractType>('real_estate_sale')
  const [contractAmountInMan, setContractAmountInMan] = useState<number>(0)
  const [sellerType, setSellerType] = useState<SellerType>('corporation')

  // 円に変換
  const contractAmountInYen = contractAmountInMan * 10000

  // 計算結果（書面契約前提）
  const result = useMemo(() => {
    return calculateStampTax({
      contractType,
      contractAmount: contractAmountInYen,
      contractFormat: 'paper',
      isTaxExcluded: true,
      sellerType: contractType === 'receipt' ? sellerType : undefined,
    })
  }, [contractType, contractAmountInYen, sellerType])

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
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            印紙税を概算計算する
          </h2>
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
        {/* 契約の種類 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            契約の種類
          </label>
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value as ContractType)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="real_estate_sale">不動産売買契約書（第1号文書）</option>
            <option value="construction_work">建設工事請負契約書（第2号文書）</option>
            <option value="receipt">領収書（第17号文書）</option>
          </select>
        </div>

        {/* 契約金額 */}
        <NumberInput
          label={contractType === 'receipt' ? '受取金額' : '契約金額'}
          value={contractAmountInMan}
          onChange={setContractAmountInMan}
          unit="万円"
          placeholder="例：3000"
        />
        {contractAmountInMan > 0 && (
          <p className="text-sm text-gray-500">
            = {contractAmountInMan.toLocaleString('ja-JP')}万円（{contractAmountInYen.toLocaleString('ja-JP')}円）
          </p>
        )}

        {/* 売主属性（領収書の場合のみ） */}
        {contractType === 'receipt' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              領収書発行者
            </label>
            <select
              value={sellerType}
              onChange={(e) => setSellerType(e.target.value as SellerType)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="corporation">法人</option>
              <option value="individual_business">個人（投資用・事業用不動産の売却）</option>
              <option value="individual_home">個人（マイホームの売却）</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ※個人のマイホーム売却は「営業に関しない受取書」として非課税となる場合があります
            </p>
          </div>
        )}
      </div>

      {/* 結果エリア */}
      <div className="bg-white rounded-lg p-4">
        <div className="grid grid-cols-2 gap-y-3 text-base">
          <span className="text-gray-600">契約の種類</span>
          <span className="text-right text-sm font-medium">{result.contractTypeName}</span>

          <span className="text-gray-600">{contractType === 'receipt' ? '受取金額' : '契約金額'}</span>
          <span className="text-right text-lg font-medium">{formatYen(result.contractAmount)}</span>

          {/* 営業に関しない受取書で非課税の場合 */}
          {result.isNonBusinessExempt && (
            <>
              <span className="text-gray-700 font-medium border-t-2 border-green-300 pt-4 mt-2">印紙税額</span>
              <span className="text-right text-2xl font-bold text-green-600 border-t-2 border-green-300 pt-4 mt-2 flex items-center justify-end gap-2">
                <CheckCircle className="w-5 h-5" />
                0円（非課税）
              </span>
            </>
          )}

          {/* 通常の課税の場合 */}
          {!result.isNonBusinessExempt && (
            <>
              {result.isReduced && (
                <>
                  <span className="text-gray-600 border-t pt-3">本則税額</span>
                  <span className="text-right text-sm text-gray-500 line-through border-t pt-3">
                    {formatTax(result.standardTaxAmount)}
                  </span>

                  <span className="text-gray-600">軽減額</span>
                  <span className="text-right text-sm text-green-600">
                    -{result.reductionAmount.toLocaleString('ja-JP')}円
                  </span>
                </>
              )}

              <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                印紙税額{result.isReduced ? '（軽減後）' : ''}
              </span>
              <span className="text-right text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
                {result.stampTaxAmount === 0 ? '非課税' : `${result.stampTaxAmount.toLocaleString('ja-JP')}円`}
              </span>
            </>
          )}
        </div>

        {/* 計算式表示 */}
        {contractAmountInMan > 0 && !result.isNonBusinessExempt && result.stampTaxAmount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">適用区分</p>
            <div className="text-sm text-gray-700 font-mono space-y-1">
              <p>【契約金額】{formatYen(result.contractAmount)}</p>
              <p>【文書種類】{result.contractTypeName}</p>
              {result.isReduced ? (
                <p>【税額】本則{formatTax(result.standardTaxAmount)} → 軽減{formatTax(result.stampTaxAmount)}</p>
              ) : (
                <p>【税額】{formatTax(result.stampTaxAmount)}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 注意事項 */}
      {result.notes.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">ご確認ください</p>
              <ul className="text-xs text-amber-700 space-y-1">
                {result.notes.map((note, index) => (
                  <li key={index}>・{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
