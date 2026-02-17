'use client'

import { useState, useMemo } from 'react'
import { Calculator, AlertTriangle } from 'lucide-react'
import { ContentPageLayout } from '@/components/tools/ContentPageLayout'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { calculateCapRate, calculateYieldGap } from '@/lib/calculators/cap-rate'

const PAGE_TITLE = 'キャップレート（還元利回り） 計算シミュレーション'

const tocItems: TocItem[] = [
  { id: 'about', title: 'キャップレート（還元利回り）とは', level: 2 },
  { id: 'formula', title: '計算式', level: 3 },
  { id: 'difference', title: '表面利回りとの違い', level: 3 },
  { id: 'factors', title: 'キャップレートの決定要因', level: 2 },
  { id: 'market', title: '地域別・物件タイプ別の相場', level: 2 },
  { id: 'yield-gap', title: 'イールドギャップとは', level: 2 },
]

/**
 * キャップレート（還元利回り）シミュレーター
 * ContentPageLayoutを使用した2カラムレイアウト
 */
export function CapRateCalculator() {
  return (
    <ContentPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/cap-rate"
      additionalContent={<CapRateAdditionalContent />}
    >
      <CapRateSimulator />
    </ContentPageLayout>
  )
}

/**
 * キャップレートシミュレーター本体
 */
function CapRateSimulator() {
  const [noiInMan, setNoiInMan] = useState<number>(0)
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0)
  const [interestRate, setInterestRate] = useState<number>(0)

  const result = useMemo(() => {
    if (noiInMan <= 0 || propertyPriceInMan <= 0) return null
    return calculateCapRate(noiInMan, propertyPriceInMan)
  }, [noiInMan, propertyPriceInMan])

  const yieldGapResult = useMemo(() => {
    if (result && result.capRate > 0 && interestRate > 0) {
      return calculateYieldGap(result.capRate, interestRate)
    }
    return null
  }, [result, interestRate])

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-500 p-2 rounded-lg">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          キャップレートを概算計算する
        </h2>
      </div>

      <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 space-y-4">
        <NumberInput
          label="NOI（年間営業純収益）"
          value={noiInMan}
          onChange={setNoiInMan}
          unit="万円/年"
          placeholder="例：300"
        />
        <p className="text-xs text-gray-500 -mt-2">
          ※NOI = 年間家賃収入 - 空室損失 - 運営経費
        </p>
        <NumberInput
          label="物件価格（購入価格）"
          value={propertyPriceInMan}
          onChange={setPropertyPriceInMan}
          unit="万円"
          placeholder="例：5000"
        />

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            借入金利（イールドギャップ計算用・任意）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={interestRate || ''}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
              max="10"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：2.0"
            />
            <span className="text-gray-600 font-medium">%</span>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm sm:text-base">
            <span className="text-gray-600">NOI（年間）</span>
            <span className="text-right font-medium">{result.noiInMan.toLocaleString()}万円</span>
            <span className="text-gray-600">物件価格</span>
            <span className="text-right font-medium">{result.propertyPriceInMan.toLocaleString()}万円</span>
            <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">キャップレート</span>
            <span className="text-right text-xl sm:text-2xl font-bold text-blue-600 border-t-2 border-blue-300 pt-4 mt-2">
              {result.capRate.toFixed(2)}%
            </span>
            <span className="text-gray-600 border-t pt-3">月額NOI</span>
            <span className="text-right font-medium border-t pt-3">
              約{result.monthlyNoiInMan}万円/月
            </span>
          </div>

          {yieldGapResult && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">イールドギャップ分析</p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-600">借入金利</span>
                <span className="text-right font-medium">{interestRate}%</span>
                <span className="text-gray-600">イールドギャップ</span>
                <span className={`text-right font-bold ${
                  yieldGapResult.riskLevel === 'warning' ? 'text-red-600' :
                  yieldGapResult.riskLevel === 'caution' ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  {yieldGapResult.yieldGap > 0 ? '+' : ''}{yieldGapResult.yieldGap}%
                </span>
              </div>

              {yieldGapResult.isNegativeLeverage && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    逆レバレッジ状態です。借入によって自己資本利回り（CCR）が悪化する可能性があります。
                  </p>
                </div>
              )}

              {!yieldGapResult.isNegativeLeverage && yieldGapResult.riskLevel === 'caution' && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    イールドギャップが1.5%未満です。金利上昇リスクに注意が必要とされています。
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">計算式</p>
            <div className="text-xs sm:text-sm text-gray-700 font-mono space-y-1">
              <p>キャップレート = NOI ÷ 物件価格 × 100</p>
              <p>= {noiInMan} ÷ {propertyPriceInMan} × 100 = {result.capRate.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * キャップレートページ固有の追加コンテンツ
 */
function CapRateAdditionalContent() {
  return (
    <>
      <TableOfContents items={tocItems} />

      <section className="mb-12">
        <SectionHeading id="about" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          キャップレート（Capitalization Rate、還元利回り）は、不動産の収益性を測る指標の一つです。
          NOI（純営業収益）を物件価格で割って算出されます。
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          日本語では「還元利回り」「NOI利回り」とも呼ばれ、収益還元法（直接還元法）における重要なパラメーターとして使用されています。
        </p>

        <SectionHeading id="formula" items={tocItems} />
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-gray-800 mb-2">キャップレートの計算式</p>
          <div className="font-mono text-xs sm:text-sm text-gray-700">
            <p className="font-bold">キャップレート = NOI ÷ 物件価格 × 100</p>
          </div>
        </div>
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          例えば、NOIが年間300万円、物件価格が5,000万円の場合：<br />
          キャップレート = 300 ÷ 5,000 × 100 = <strong>6.0%</strong>
        </p>

        <SectionHeading id="difference" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          キャップレート（NOI利回り）と表面利回りは異なる指標です。
        </p>
        <div className="overflow-x-auto scrollbar-hide mb-4">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left whitespace-nowrap">指標</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left whitespace-nowrap">計算式</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left">特徴</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border border-gray-300 px-2 sm:px-3 py-2 font-medium whitespace-nowrap">表面利回り</td>
                <td className="border border-gray-300 px-2 sm:px-3 py-2 font-mono text-xs whitespace-nowrap">満室家賃 ÷ 物件価格</td>
                <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">経費・空室を考慮しない簡易指標</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-2 sm:px-3 py-2 font-medium whitespace-nowrap">キャップレート</td>
                <td className="border border-gray-300 px-2 sm:px-3 py-2 font-mono text-xs whitespace-nowrap">NOI ÷ 物件価格</td>
                <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">経費・空室を控除した収益力指標</td>
              </tr>
            </tbody>
          </table>
        </div>

        <SectionHeading id="factors" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          キャップレートは以下の要因により変動するとされています。
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <ul className="text-xs sm:text-sm text-gray-700 space-y-2">
            <li><strong>立地</strong>：都心部ほど低く（価格が高い）、郊外・地方ほど高い傾向</li>
            <li><strong>物件タイプ</strong>：オフィス、住宅、商業施設で異なる水準</li>
            <li><strong>築年数・グレード</strong>：新築・築浅・ハイグレードほど低い傾向</li>
            <li><strong>テナント信用力</strong>：優良テナントほどリスクが低く、利回りも低め</li>
            <li><strong>市場金利</strong>：金利上昇局面ではキャップレートも上昇圧力</li>
          </ul>
        </div>

        <SectionHeading id="market" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          キャップレートは地域・物件タイプにより異なります。
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
            <li>• 都心部ほどキャップレートは低く（物件価格が高く）、郊外・地方ほど高い傾向</li>
            <li>• オフィス・商業施設・物流施設など物件タイプによって水準が異なる</li>
          </ul>
        </div>

        <SectionHeading id="yield-gap" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          イールドギャップとは、キャップレートと借入金利の差のことです。
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="font-mono text-xs sm:text-sm text-gray-700 mb-2">
            <strong>イールドギャップ = キャップレート - 借入金利</strong>
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            イールドギャップがプラスの場合、借入を活用することでレバレッジ効果が期待できるとされています。
            一方、マイナスの場合は「逆レバレッジ」状態となり、借入によって自己資本利回り（CCR）が悪化する可能性があります。
          </p>
        </div>
      </section>
    </>
  )
}
