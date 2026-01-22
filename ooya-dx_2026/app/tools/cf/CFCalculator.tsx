'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { calculateCF } from '@/lib/calculators/cf'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '賃貸経営のキャッシュフロー 計算シミュレーション'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'キャッシュフロー（CF）とは', level: 2 },
  { id: 'formula', title: 'キャッシュフローの計算式', level: 3 },
  { id: 'cf-tree', title: 'キャッシュフローツリー', level: 2 },
  { id: 'btcf-atcf', title: '税引前CFと税引後CF', level: 2 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function CFCalculator() {
  // 基本入力
  const [annualGPIInMan, setAnnualGPIInMan] = useState<number>(0) // 満室年収（万円）
  const [vacancyRate, setVacancyRate] = useState<number>(5) // 空室率（%）
  const [annualOpexInMan, setAnnualOpexInMan] = useState<number>(0) // 運営経費（万円）
  const [annualADSInMan, setAnnualADSInMan] = useState<number>(0) // ローン返済額（万円）

  // 税金計算用（詳細入力）
  const [showTaxDetails, setShowTaxDetails] = useState<boolean>(false)
  const [annualDepreciationInMan, setAnnualDepreciationInMan] = useState<number>(0) // 減価償却費
  const [annualInterestInMan, setAnnualInterestInMan] = useState<number>(0) // 支払利息
  const [taxRate, setTaxRate] = useState<number>(30) // 税率

  // 入力があるか判定
  const hasInput = annualGPIInMan > 0

  // 計算結果
  const result = useMemo(() => {
    if (annualGPIInMan <= 0) {
      return null
    }
    return calculateCF({
      annualGPIInMan,
      vacancyRate,
      annualOpexInMan,
      annualADSInMan,
      annualDepreciationInMan: showTaxDetails ? annualDepreciationInMan : 0,
      annualInterestInMan: showTaxDetails ? annualInterestInMan : 0,
      taxRate: showTaxDetails ? taxRate : 30,
    })
  }, [annualGPIInMan, vacancyRate, annualOpexInMan, annualADSInMan, showTaxDetails, annualDepreciationInMan, annualInterestInMan, taxRate])

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

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>
          <p className="text-gray-600 mb-8">
            賃貸経営のキャッシュフロー（CF）を概算計算します。
            税引前CF（BTCF）・税引後CF（ATCF）を同時に算出し、キャッシュフローツリーで収支を可視化できます。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                キャッシュフローを概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 満室年収 */}
              <NumberInput
                label="年間満室想定収入（GPI）"
                value={annualGPIInMan}
                onChange={setAnnualGPIInMan}
                unit="万円"
                placeholder="例：600"
              />

              {/* 空室率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  空室率
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

              {/* 運営経費 */}
              <NumberInput
                label="年間運営経費（OPEX）"
                value={annualOpexInMan}
                onChange={setAnnualOpexInMan}
                unit="万円"
                placeholder="例：100"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※管理費、修繕費、固定資産税、保険料等の合計
              </p>

              <hr className="border-gray-200" />

              {/* ローン返済額 */}
              <NumberInput
                label="年間ローン返済額（ADS）"
                value={annualADSInMan}
                onChange={setAnnualADSInMan}
                unit="万円"
                placeholder="例：300"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※元金＋利息の合計
              </p>

              {/* 税金計算用の詳細入力（折りたたみ） */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaxDetails(!showTaxDetails)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {showTaxDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  税引後CF（ATCF）を計算する場合
                </button>

                {showTaxDetails && (
                  <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
                    <NumberInput
                      label="年間減価償却費"
                      value={annualDepreciationInMan}
                      onChange={setAnnualDepreciationInMan}
                      unit="万円"
                      placeholder="例：150"
                    />
                    <NumberInput
                      label="年間支払利息"
                      value={annualInterestInMan}
                      onChange={setAnnualInterestInMan}
                      unit="万円"
                      placeholder="例：80"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        所得税・住民税率
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          step="1"
                          min="0"
                          max="60"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例：30"
                        />
                        <span className="text-gray-600 font-medium">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ※所得水準により異なります（15%〜55%程度）
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 結果エリア */}
            {result && (
              <div className="bg-white rounded-lg p-4">
                {/* キャッシュフローツリー */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">キャッシュフローツリー</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">GPI（満室年収）</span>
                      <span className="font-medium">{result.gpi.toLocaleString()}万円</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
                      <span className="text-gray-500">- 空室損（{vacancyRate}%）</span>
                      <span className="text-red-500">-{result.vacancyLoss.toLocaleString()}万円</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">= EGI（有効総収入）</span>
                      <span className="font-medium">{result.egi.toLocaleString()}万円</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
                      <span className="text-gray-500">- OPEX（運営経費）</span>
                      <span className="text-red-500">-{result.opex.toLocaleString()}万円</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-blue-50 px-2 rounded">
                      <span className="text-gray-700 font-medium">= NOI（営業純収益）</span>
                      <span className="font-bold text-blue-700">{result.noi.toLocaleString()}万円</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
                      <span className="text-gray-500">- ADS（ローン返済）</span>
                      <span className="text-red-500">-{result.ads.toLocaleString()}万円</span>
                    </div>
                  </div>
                </div>

                {/* メイン結果 */}
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  {/* BTCF（メイン結果） */}
                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4">
                    税引前CF（BTCF）
                  </span>
                  <span className={`text-right text-2xl font-bold border-t-2 border-blue-300 pt-4 ${result.btcf >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {result.btcf >= 0 ? '+' : ''}{result.btcf.toLocaleString()}万円/年
                  </span>

                  <span className="text-gray-600">月間BTCF</span>
                  <span className={`text-right font-medium ${result.monthlyBTCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.monthlyBTCF >= 0 ? '+' : ''}{result.monthlyBTCF.toLocaleString()}万円/月
                  </span>

                  {result.atcf !== null && (
                    <>
                      <span className="text-gray-700 font-medium border-t pt-3">
                        税引後CF（ATCF）
                      </span>
                      <span className={`text-right text-xl font-bold border-t pt-3 ${result.atcf >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {result.atcf >= 0 ? '+' : ''}{result.atcf.toLocaleString()}万円/年
                      </span>

                      <span className="text-gray-600">月間ATCF</span>
                      <span className={`text-right font-medium ${result.monthlyATCF !== null && result.monthlyATCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.monthlyATCF !== null ? (result.monthlyATCF >= 0 ? '+' : '') + result.monthlyATCF.toLocaleString() : '-'}万円/月
                      </span>

                      <span className="text-gray-600 border-t pt-3">課税所得</span>
                      <span className="text-right font-medium border-t pt-3">
                        {result.taxableIncome !== null ? result.taxableIncome.toLocaleString() : '-'}万円
                      </span>

                      <span className="text-gray-600">所得税・住民税</span>
                      <span className="text-right font-medium text-red-500">
                        {result.incomeTax !== null ? result.incomeTax.toLocaleString() : '-'}万円
                      </span>
                    </>
                  )}

                  {result.dscr !== null && (
                    <>
                      <span className="text-gray-600 border-t pt-3">DSCR</span>
                      <span className={`text-right font-medium border-t pt-3 ${result.dscr >= 1.2 ? 'text-green-600' : result.dscr >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {result.dscr.toFixed(2)}
                      </span>
                    </>
                  )}

                  <span className="text-gray-600">経費率</span>
                  <span className="text-right font-medium">
                    {result.opexRatio.toFixed(1)}%
                  </span>
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>BTCF = NOI - ADS</p>
                    <p className="text-xs text-gray-500 mt-2">
                      = {result.noi.toLocaleString()}万円 - {result.ads.toLocaleString()}万円
                    </p>
                    <p className="text-xs text-gray-500">
                      = {result.btcf.toLocaleString()}万円/年
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* =================================================================
              解説セクション
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              キャッシュフロー（CF: Cash Flow）は、賃貸経営において実際に手元に残る現金の流れを表します。
              収入から経費やローン返済を差し引いた後、最終的にいくら手元に残るかを把握するための指標です。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              キャッシュフローがプラスであれば収入が支出を上回っている状態、マイナスであれば持ち出しが発生している状態を意味します。
            </p>

            <SectionHeading id="formula" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center text-sm">
                BTCF（税引前CF）= NOI - ADS
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                NOI: 営業純収益、ADS: 年間ローン返済額
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              税引後キャッシュフロー（ATCF）を計算する場合は、さらに所得税・住民税を差し引きます。
              課税所得は「NOI - 支払利息 - 減価償却費」で計算されるため、帳簿上の利益とキャッシュフローは異なる場合があります。
            </p>

            <SectionHeading id="cf-tree" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              キャッシュフローツリーは、収入から最終的な手取りまでの流れを可視化したものです。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>GPI</strong>：総潜在収入（満室時の年間収入）</li>
                <li><strong>EGI</strong>：有効総収入（GPIから空室損を差し引いた額）</li>
                <li><strong>NOI</strong>：営業純収益（EGIから運営経費を差し引いた額）</li>
                <li><strong>BTCF</strong>：税引前キャッシュフロー（NOIからローン返済を差し引いた額）</li>
                <li><strong>ATCF</strong>：税引後キャッシュフロー（BTCFから税金を差し引いた額）</li>
              </ul>
            </div>

            <SectionHeading id="btcf-atcf" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              税引前CF（BTCF）は税金を考慮する前の手取り額、税引後CF（ATCF）は税金を支払った後の最終的な手取り額です。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>BTCF</strong>：ローン返済後に手元に残る金額。物件の収益力とレバレッジ効果を反映します。</li>
                <li><strong>ATCF</strong>：最終的な手取り額。税金の影響を含めた実質的なリターンを表します。</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              減価償却費は現金支出を伴わない経費のため、税金計算上の所得を下げる効果がありますが、
              キャッシュフロー自体には直接影響しません。
            </p>

          </section>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月22日"
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/cf" />

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
