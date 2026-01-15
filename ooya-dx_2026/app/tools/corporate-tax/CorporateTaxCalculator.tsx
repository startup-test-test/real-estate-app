'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { calculateCorporateTaxTotal, compareCorporateVsIndividual } from '@/lib/calculators/corporate-tax'

// 早見表データ
const quickReferenceData: QuickReferenceRow[] = [
  { label: '400万円', value: '約97万円', subValue: '実効税率 約24%' },
  { label: '600万円', value: '約148万円', subValue: '実効税率 約25%' },
  { label: '800万円', value: '約200万円', subValue: '実効税率 約25%' },
  { label: '1,000万円', value: '約273万円', subValue: '実効税率 約27%' },
  { label: '1,500万円', value: '約457万円', subValue: '実効税率 約30%' },
  { label: '2,000万円', value: '約641万円', subValue: '実効税率 約32%' },
  { label: '3,000万円', value: '約1,009万円', subValue: '実効税率 約34%' },
  { label: '5,000万円', value: '約1,745万円', subValue: '実効税率 約35%' },
]

// 関連ツール
const relatedTools = [
  { name: '譲渡所得税シミュレーター', href: '/tools/capital-gains-tax', description: '売却時の税金を計算' },
  { name: '不動産取得税シミュレーター', href: '/tools/acquisition-tax', description: '購入時の税金を計算' },
  { name: '贈与税シミュレーター', href: '/tools/gift-tax', description: '贈与時の税金を計算' },
]

export function CorporateTaxCalculator() {
  // 万円単位で入力
  const [incomeInMan, setIncomeInMan] = useState<number>(0)
  const [isTokyo23, setIsTokyo23] = useState<boolean>(true)
  const [showComparison, setShowComparison] = useState<boolean>(false)

  // 円に変換
  const incomeInYen = incomeInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    return calculateCorporateTaxTotal(incomeInYen, { isTokyo23 })
  }, [incomeInYen, isTokyo23])

  // 個人との比較
  const comparison = useMemo(() => {
    return compareCorporateVsIndividual(incomeInYen, { isTokyo23 })
  }, [incomeInYen, isTokyo23])

  // 入力があるかどうか
  const hasInput = incomeInMan > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              ホーム
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <Link href="/tools" className="hover:text-primary-600">
              計算ツール
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <span className="text-gray-900">法人税</span>
          </nav>

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            不動産法人の法人税等を10秒で無料計算｜早見表付き
          </h1>
          <p className="text-gray-600 mb-8">
            課税所得を入力するだけで、法人税・住民税・事業税等の概算額と実効税率を瞬時に計算します。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-12 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                法人税等を概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <NumberInput
                label="年間課税所得を入力"
                value={incomeInMan}
                onChange={setIncomeInMan}
                unit="万円"
                placeholder="例：1000"
              />
              {hasInput ? (
                <p className="text-sm text-gray-500 mt-1">
                  = {incomeInMan.toLocaleString('ja-JP')}万円（{incomeInYen.toLocaleString('ja-JP')}円）
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-2">
                  例：1000 → 1,000万円 → 法人税等 約273万円
                </p>
              )}

              {/* 地域選択 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">本店所在地</p>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      checked={isTokyo23}
                      onChange={() => setIsTokyo23(true)}
                      className="mr-2"
                    />
                    <span className="text-sm">東京23区</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      checked={!isTokyo23}
                      onChange={() => setIsTokyo23(false)}
                      className="mr-2"
                    />
                    <span className="text-sm">その他（標準税率）</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 適用税率の説明 */}
            {hasInput && (
              <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">適用税率：</span>
                  法人税 {result.breakdown.corporateTaxRate}、
                  住民税割 {result.breakdown.residentTaxRate}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {incomeInYen <= 8000000
                    ? '800万円以下のため軽減税率（15%）を適用'
                    : '800万円超のため、800万円まで15%・超過分23.2%を適用'}
                </p>
              </div>
            )}

            {/* 結果エリア（詳細表示） */}
            <div className="bg-white rounded-lg p-4">
              <div className="space-y-2">
                {/* 法人税 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">法人税（国税）</span>
                  <span className="font-medium">
                    {hasInput ? `${Math.round(result.corporateTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
                  </span>
                </div>

                {/* 地方法人税 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">地方法人税（10.3%）</span>
                  <span className="font-medium">
                    {hasInput ? `${Math.round(result.localCorporateTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
                  </span>
                </div>

                {/* 法人住民税（法人税割） */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">法人住民税（法人税割）</span>
                  <span className="font-medium">
                    {hasInput ? `${Math.round(result.residentTaxPortion / 10000).toLocaleString('ja-JP')}万円` : '-'}
                  </span>
                </div>

                {/* 法人住民税（均等割） */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">法人住民税（均等割）</span>
                  <span className="font-medium">{(result.equalLevy / 10000).toLocaleString('ja-JP')}万円</span>
                </div>

                {/* 法人事業税 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">法人事業税</span>
                  <span className="font-medium">
                    {hasInput ? `${Math.round(result.businessTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
                  </span>
                </div>

                {/* 特別法人事業税 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">特別法人事業税（37%）</span>
                  <span className="font-medium">
                    {hasInput ? `${Math.round(result.specialBusinessTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
                  </span>
                </div>

                {/* 合計 */}
                <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-blue-300">
                  <span className="text-gray-700 font-medium">法人税等 合計</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {hasInput ? `約${Math.round(result.totalTax / 10000).toLocaleString('ja-JP')}万円` : '-'}
                  </span>
                </div>

                {/* 実効税率 */}
                {hasInput && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600 text-sm">実効税率</span>
                    <span className="text-lg font-semibold text-blue-600">
                      約{result.effectiveRate.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* 計算式表示 */}
              {hasInput && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>【法人税】{incomeInMan <= 800 ? `${incomeInMan.toLocaleString()}万円 × 15%` : `800万円 × 15% + ${(incomeInMan - 800).toLocaleString()}万円 × 23.2%`} = {Math.round(result.corporateTax / 10000).toLocaleString()}万円</p>
                    <p>【地方法人税】{Math.round(result.corporateTax / 10000).toLocaleString()}万円 × 10.3% = {Math.round(result.localCorporateTax / 10000).toLocaleString()}万円</p>
                    <p>【住民税割】{Math.round(result.corporateTax / 10000).toLocaleString()}万円 × {result.breakdown.residentTaxRate} = {Math.round(result.residentTaxPortion / 10000).toLocaleString()}万円</p>
                    <p>【合計】約{Math.round(result.totalTax / 10000).toLocaleString()}万円</p>
                  </div>
                </div>
              )}
            </div>

            {/* 個人との比較ボタン */}
            {hasInput && (
              <div className="mt-4">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full py-3 bg-white border border-blue-300 rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors"
                >
                  {showComparison ? '比較を閉じる' : '個人との税額を比較する'}
                </button>
              </div>
            )}

            {/* 個人との比較表示 */}
            {hasInput && showComparison && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">法人 vs 個人 税額比較</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">法人の税額</p>
                    <p className="text-xl font-bold text-blue-700">
                      約{Math.round(comparison.corporate.totalTax / 10000).toLocaleString()}万円
                    </p>
                    <p className="text-xs text-gray-500">実効税率 約{comparison.corporate.effectiveRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">個人の税額</p>
                    <p className="text-xl font-bold text-gray-700">
                      約{Math.round(comparison.individual.total / 10000).toLocaleString()}万円
                    </p>
                    <p className="text-xs text-gray-500">実効税率 約{comparison.individual.effectiveRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">法人化による税額差</p>
                  <p className={`text-lg font-bold ${comparison.meritAmount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {comparison.meritAmount > 0 ? '法人が有利：' : '個人が有利：'}
                    約{Math.abs(Math.round(comparison.meritAmount / 10000)).toLocaleString()}万円
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ※社会保険料や役員報酬は考慮していません。実際の比較には専門家への相談をおすすめします。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 早見表 */}
          <section className="mb-12">
            <QuickReferenceTable
              title="法人税等 早見表"
              description="課税所得に対する法人税等の目安です（中小法人・東京都の場合）。"
              headers={['課税所得', '法人税等（概算）']}
              rows={quickReferenceData}
              note="※上記は概算値です。実際の税額は個別の状況により異なります。"
            />
          </section>

          {/* 目次 */}
          <nav className="bg-gray-50 rounded-lg p-5 mb-10">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              目次
            </h2>
            <ol className="space-y-1 text-sm">
              <li>
                <a href="#about" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  不動産法人にかかる税金とは
                </a>
              </li>
              <li className="ml-4">
                <a href="#structure" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  法人税等の構成
                </a>
              </li>
              <li className="ml-4">
                <a href="#effective-rate" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  実効税率について
                </a>
              </li>
              <li className="ml-4">
                <a href="#comparison" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  個人との比較
                </a>
              </li>
              <li className="ml-4">
                <a href="#breakeven" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  法人化の目安
                </a>
              </li>
              <li className="ml-4">
                <a href="#costs" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  法人の維持コスト
                </a>
              </li>
            </ol>
          </nav>

          {/* 解説セクション */}
          <section className="mb-12">
            <h2 id="about" className="text-xl font-bold text-gray-900 mb-4">
              不動産法人にかかる税金とは
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産賃貸業を法人で行う場合、法人が負担する主な税金は「法人税等」と総称されます。これは複数の税金で構成されており、国税と地方税が含まれます。
            </p>

            <h3 id="structure" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              法人税等の構成
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li><span className="font-medium">法人税（国税）</span>：課税所得に対して課税。800万円以下15%、超過分23.2%</li>
                <li><span className="font-medium">地方法人税（国税）</span>：法人税額の10.3%</li>
                <li><span className="font-medium">法人住民税（地方税）</span>：法人税割（法人税額の7%〜10.4%）+ 均等割（年間約7万円）</li>
                <li><span className="font-medium">法人事業税（地方税）</span>：課税所得に対して3.5%〜7%の3段階税率</li>
                <li><span className="font-medium">特別法人事業税（国税）</span>：法人事業税額の37%</li>
              </ul>
            </div>

            <h3 id="effective-rate" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              実効税率について
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              実効税率とは、事業税が翌年度に損金算入されることを考慮した実質的な税負担率です。中小法人の場合、一般的な目安は以下の通りです。
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>課税所得800万円以下：約21%〜25%</li>
                <li>課税所得800万円超：約33%〜35%</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                ※地域や個別の条件により異なります
              </p>
            </div>

            <h3 id="comparison" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              個人との比較
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              個人の所得税・住民税は累進課税で最高税率は約55%に達しますが、法人は約34%で頭打ちとなります。また、法人には以下のようなメリットがあるとされています。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>土地取得の借入金利子も全額経費（個人は損益通算制限あり）</li>
              <li>赤字の繰越期間が10年（個人は3年）</li>
              <li>家族への給与による所得分散が可能</li>
            </ul>

            <h3 id="breakeven" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              法人化の目安
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              一般的に、課税所得が900万円〜1,000万円を超えると法人化のメリットが出始めるとされています。ただし、社会保険料の負担増を考慮すると、実質的なメリットは課税所得1,000万円〜1,200万円程度からとなるケースが多いです。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-900">
                法人化の判断には、税金だけでなく社会保険料、法人維持コスト、将来の事業計画なども考慮する必要があります。具体的な検討には税理士等の専門家への相談をおすすめします。
              </p>
            </div>

            <h3 id="costs" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              法人の維持コスト
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              法人を設立・維持するには、税金以外にもコストがかかります。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li><span className="font-medium">法人住民税均等割</span>：年間約7万円（赤字でも発生）</li>
                <li><span className="font-medium">税理士報酬</span>：年間15万円〜60万円程度</li>
                <li><span className="font-medium">社会保険料</span>：役員報酬の約30%（法人・個人折半）</li>
              </ul>
            </div>
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer />

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4 text-center">
              物件の収益性をシミュレーションしてみませんか？
            </p>
            <div className="text-center">
              <Link
                href="/simulator"
                className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                収益シミュレーターを試す
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <LandingFooter />
    </div>
  )
}
