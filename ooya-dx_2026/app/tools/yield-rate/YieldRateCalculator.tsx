'use client'

import React, { useState, useMemo } from 'react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { calculateYieldRate, estimateAnnualExpenses, estimatePurchaseCosts } from '@/lib/calculators/yieldRate'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '表面利回り・実質利回り 計算シミュレーション｜早見表付き'

// 目次データ（見出しの一元管理）
const tocItems: TocItem[] = [
  { id: 'about', title: '利回りとは', level: 2 },
  { id: 'gross-yield', title: '表面利回り（グロス利回り）', level: 3 },
  { id: 'net-yield', title: '実質利回り（ネット利回り）', level: 3 },
  { id: 'difference', title: '表面利回りと実質利回りの違い', level: 2 },
  { id: 'expenses', title: '経費に含まれる項目', level: 2 },
  { id: 'benchmark', title: '利回りの目安', level: 2 },
  { id: 'caution', title: '利回りを見る際の注意点', level: 2 },
]

// 早見表データ（物件価格1,000万円の場合の利回り別年間賃料）
const quickReferenceData: QuickReferenceRow[] = [
  { label: '4%', value: '40万円', subValue: '月額約3.3万円' },
  { label: '5%', value: '50万円', subValue: '月額約4.2万円' },
  { label: '6%', value: '60万円', subValue: '月額約5.0万円' },
  { label: '7%', value: '70万円', subValue: '月額約5.8万円' },
  { label: '8%', value: '80万円', subValue: '月額約6.7万円' },
  { label: '9%', value: '90万円', subValue: '月額約7.5万円' },
  { label: '10%', value: '100万円', subValue: '月額約8.3万円' },
  { label: '12%', value: '120万円', subValue: '月額約10.0万円' },
  { label: '15%', value: '150万円', subValue: '月額約12.5万円' },
]

export function YieldRateCalculator() {
  // 入力値（万円単位）
  const [propertyPriceInMan, setPropertyPriceInMan] = useState<number>(0)
  const [annualRentInMan, setAnnualRentInMan] = useState<number>(0)
  const [annualExpensesInMan, setAnnualExpensesInMan] = useState<number>(0)
  const [purchaseCostsInMan, setPurchaseCostsInMan] = useState<number>(0)

  // 詳細入力モード
  const [showDetailedInput, setShowDetailedInput] = useState<boolean>(false)

  // 計算結果
  const result = useMemo(() => {
    return calculateYieldRate({
      propertyPriceInMan,
      annualRentInMan,
      annualExpensesInMan: showDetailedInput ? annualExpensesInMan : 0,
      purchaseCostsInMan: showDetailedInput ? purchaseCostsInMan : 0,
    })
  }, [propertyPriceInMan, annualRentInMan, annualExpensesInMan, purchaseCostsInMan, showDetailedInput])

  // 経費の推計値（参考表示用）
  const estimatedExpenses = useMemo(() => {
    return estimateAnnualExpenses(annualRentInMan, 20)
  }, [annualRentInMan])

  // 購入諸経費の推計値（参考表示用）
  const estimatedPurchaseCosts = useMemo(() => {
    return estimatePurchaseCosts(propertyPriceInMan, 7)
  }, [propertyPriceInMan])

  const hasInput = propertyPriceInMan > 0 && annualRentInMan > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>
          <p className="text-gray-600 mb-8">
            物件価格と年間賃料を入力するだけで、表面利回り・実質利回りを瞬時に計算します。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
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

            {/* 詳細入力トグル */}
            <button
              onClick={() => setShowDetailedInput(!showDetailedInput)}
              className="w-full mb-4 py-2 px-4 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showDetailedInput ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showDetailedInput ? '詳細入力を閉じる' : '実質利回りを計算する（詳細入力）'}
            </button>

            {/* 詳細入力エリア */}
            {showDetailedInput && (
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
                    目安：経費は賃料の約15〜25%、購入諸経費は物件価格の約7〜10%程度とされています。
                  </p>
                )}
              </div>
            )}

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

              {/* 実質利回り（詳細入力時） */}
              {showDetailedInput && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">実質利回り（ネット）</span>
                    <span className="text-3xl font-bold text-green-700">
                      {result.netYield !== null ? `${result.netYield.toFixed(2)}%` : '-%'}
                    </span>
                  </div>

                  {result.netYield !== null && (
                    <>
                      <p className="text-xs text-gray-500 mb-2 text-right">
                        NOI {result.annualNOI}万円 / 総投資{result.totalInvestment}万円
                      </p>

                      <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3">
                        <span className="text-sm text-amber-800">表面と実質の差</span>
                        <span className="text-lg font-semibold text-amber-700">
                          -{result.yieldDifference?.toFixed(2)}%
                        </span>
                      </div>
                    </>
                  )}
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
                    {showDetailedInput && result.netYield !== null && (
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

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 早見表 */}
          <section className="mb-12">
            <QuickReferenceTable
              title="利回り早見表（物件価格1,000万円の場合）"
              description="物件価格1,000万円の場合、各利回りに必要な年間賃料の目安です。"
              headers={['表面利回り', '必要年間賃料']}
              rows={quickReferenceData}
              note="※実質利回りは経費を考慮するため、表面利回りより1〜3%程度低くなる場合があります。"
            />
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産投資における「利回り」とは、投資した金額に対してどれだけの収益を得られるかを示す指標です。
              物件の収益性を比較検討する際の基準として広く使われています。
            </p>

            <SectionHeading id="gross-yield" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              表面利回り（グロス利回り）は、物件価格に対する年間想定賃料の割合です。
              経費を考慮しない最もシンプルな指標で、物件の一次スクリーニングに使われます。
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center">
                表面利回り(%) = 年間想定賃料 / 物件価格 × 100
              </p>
            </div>

            <SectionHeading id="net-yield" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              実質利回り（ネット利回り）は、経費を差し引いた実際の手取り収益（NOI）をベースに計算します。
              より実態に即した収益性を把握できます。
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-sm">
                実質利回り(%) = (年間賃料 - 年間経費) / (物件価格 + 購入諸経費) × 100
              </p>
            </div>

            <SectionHeading id="difference" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              表面利回りと実質利回りには通常1〜3%程度の差があります。
              この差は物件の経費率や購入諸経費によって変動します。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-amber-900 mb-2">注意点</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
                <li>表面利回りが高くても、経費が多ければ実質利回りは低くなります</li>
                <li>物件広告では表面利回りが記載されていることが多いため、経費を確認することが重要です</li>
                <li>築古物件は修繕費がかさむため、表面と実質の差が大きくなる傾向があります</li>
              </ul>
            </div>

            <SectionHeading id="expenses" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              実質利回りの計算で考慮すべき主な経費項目は以下の通りです。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>管理委託費（家賃の3〜8%程度）</li>
              <li>修繕積立金・修繕費（家賃の5〜15%程度）</li>
              <li>固定資産税・都市計画税</li>
              <li>火災保険・地震保険料</li>
              <li>入居者募集時の広告費（AD）</li>
              <li>共用部の水道光熱費</li>
            </ul>
            <p className="text-sm text-gray-600">
              目安として、年間経費は賃料収入の15〜25%程度とされています。
            </p>

            <SectionHeading id="benchmark" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              利回りの目安は物件の立地やタイプによって大きく異なります。
              2025年時点での一般的な傾向は以下の通りです。
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">エリア・タイプ</th>
                    <th className="px-4 py-2 text-left">表面利回り目安</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2">東京都心ワンルーム</td>
                    <td className="px-4 py-2">3.5〜4.5%程度</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">首都圏郊外一棟アパート</td>
                    <td className="px-4 py-2">6〜8%程度</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">地方主要都市</td>
                    <td className="px-4 py-2">7〜10%程度</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">地方郊外</td>
                    <td className="px-4 py-2">10%以上</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ※上記は目安であり、実際の利回りは個別物件により異なります。
            </p>

            <SectionHeading id="caution" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              利回りだけで物件の良し悪しを判断することには注意が必要とされています。以下の点も考慮することが推奨されます。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>高利回り物件は空室リスクや修繕リスクが高い場合があります</li>
              <li>満室想定賃料が相場より高く設定されていないか確認することが推奨されます</li>
              <li>将来の賃料下落や大規模修繕も考慮した収支計画が重要とされています</li>
              <li>出口（売却）戦略も含めたトータルリターン（IRR）で判断することが推奨されます</li>
            </ul>
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/yield-rate" />

          {/* CTA */}
          <div className="mt-16">
            <SimulatorCTA />
          </div>

          {/* 会社概要・運営者 */}
          <div className="mt-16">
            <CompanyProfileCompact />
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  )
}
