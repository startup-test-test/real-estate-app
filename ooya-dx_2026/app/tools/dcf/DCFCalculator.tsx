'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
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
import { ShareButtons } from '@/components/tools/ShareButtons'
import {
  calculateDCF,
  getTerminalCapRateGuideline,
} from '@/lib/calculators/dcf'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産のDCF法（割引キャッシュフロー法） 計算シミュレーション'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'DCF法とは', level: 2 },
  { id: 'formula', title: 'DCF法の計算式', level: 3 },
  { id: 'parameters', title: '主要パラメーター', level: 3 },
  { id: 'vs-direct', title: '直接還元法との違い', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

interface GlossaryItem {
  slug: string
  title: string
}

interface DCFCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// メインコンポーネント
// =================================================================
export function DCFCalculator({ relatedGlossary = [] }: DCFCalculatorProps) {
  // 入力状態
  const [initialNoiInMan, setInitialNoiInMan] = useState<number>(0)
  const [discountRate, setDiscountRate] = useState<number>(4.0)
  const [terminalCapRate, setTerminalCapRate] = useState<number>(4.5)
  const [holdingPeriod, setHoldingPeriod] = useState<number>(10)

  // 固定値（詳細設定を削除）
  const growthRate = 0
  const saleCostRate = 4.0

  // 円に変換
  const initialNoiInYen = initialNoiInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    if (initialNoiInMan <= 0 || discountRate <= 0 || terminalCapRate <= 0 || holdingPeriod <= 0) {
      return null
    }
    return calculateDCF({
      initialNOI: initialNoiInYen,
      discountRate,
      terminalCapRate,
      holdingPeriod,
      growthRate,
      saleCostRate,
    })
  }, [initialNoiInYen, discountRate, terminalCapRate, holdingPeriod, growthRate, saleCostRate])

  // 最終還元利回りの目安を計算
  const terminalCapGuideline = useMemo(() => {
    return getTerminalCapRateGuideline(discountRate)
  }, [discountRate])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[52px] sm:h-[72px] md:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-4 sm:px-5 py-4 sm:py-8 md:py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
              収益分析
            </span>
            {(() => {
              const toolInfo = getToolInfo('/tools/dcf')
              return toolInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(toolInfo.lastUpdated)}
                </time>
              ) : null
            })()}
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>

          {/* シェアボタン */}
          <div className="mb-4">
            <ShareButtons title={PAGE_TITLE} />
          </div>

          <p className="text-gray-600 mb-8">
            DCF法（割引キャッシュフロー法）による不動産の収益価格を概算計算します。
            年間NOI・割引率・保有期間を入力すると、将来キャッシュフローの現在価値と売却時の復帰価格から評価額を算出します。
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
                DCF法で評価額を概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 年間NOI */}
              <NumberInput
                label="年間NOI（純営業収益）"
                value={initialNoiInMan}
                onChange={setInitialNoiInMan}
                unit="万円"
                placeholder="例：500"
              />
              <p className="text-xs text-gray-500 -mt-2">
                ※NOI = 実効総収益 - 運営費用（減価償却費は含まない）
                <a href="/tools/noi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  NOIはこちらで計算してください
                </a>
              </p>

              {/* 割引率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  割引率（Discount Rate）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    max="20"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：4.0"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※期待収益率。リスクに応じて設定します。
                </p>
              </div>

              {/* 最終還元利回り */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最終還元利回り（Terminal Cap Rate）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={terminalCapRate}
                    onChange={(e) => setTerminalCapRate(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    max="20"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例：4.5"
                  />
                  <span className="text-gray-600 font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※復帰価格算定用。目安: {terminalCapGuideline.min.toFixed(1)}〜{terminalCapGuideline.max.toFixed(1)}%（割引率+0.1〜0.5%）
                </p>
              </div>

              {/* 保有期間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保有期間
                </label>
                <select
                  value={holdingPeriod}
                  onChange={(e) => setHoldingPeriod(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {[3, 5, 7, 10, 15, 20].map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>

            </div>

            {/* 結果エリア */}
            {result && (
              <div className="bg-white rounded-lg p-4">
                {/* メイン結果 */}
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-1">DCF評価額（収益価格）</p>
                  <p className="text-3xl font-bold text-blue-700">
                    約{Math.round(result.dcfValue / 10000).toLocaleString()}万円
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    インプライドNOI利回り: {result.impliedNoiYield.toFixed(2)}%
                  </p>
                </div>

                {/* 内訳 */}
                <div className="grid grid-cols-2 gap-y-3 text-base border-t pt-4">
                  <span className="text-gray-600">初年度NOI</span>
                  <span className="text-right font-medium">{initialNoiInMan.toLocaleString()}万円</span>

                  <span className="text-gray-600">保有期間</span>
                  <span className="text-right font-medium">{holdingPeriod}年</span>

                  <span className="text-gray-600">割引率</span>
                  <span className="text-right font-medium">{discountRate}%</span>

                  <span className="text-gray-600">最終還元利回り</span>
                  <span className="text-right font-medium">{terminalCapRate}%</span>

                  {growthRate !== 0 && (
                    <>
                      <span className="text-gray-600">収益成長率</span>
                      <span className="text-right font-medium">{growthRate > 0 ? '+' : ''}{growthRate}%/年</span>
                    </>
                  )}

                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                    NOI現在価値合計
                  </span>
                  <span className="text-right font-bold text-blue-600 border-t-2 border-blue-300 pt-4 mt-2">
                    約{Math.round(result.totalNoiPV / 10000).toLocaleString()}万円
                  </span>

                  <span className="text-gray-600">復帰価格（売却想定額）</span>
                  <span className="text-right font-medium">
                    約{Math.round(result.terminalValueGross / 10000).toLocaleString()}万円
                  </span>

                  <span className="text-gray-700 font-medium">復帰価格の現在価値</span>
                  <span className="text-right font-bold text-blue-600">
                    約{Math.round(result.terminalValuePV / 10000).toLocaleString()}万円
                  </span>
                </div>

                {/* 計算式表示 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>【DCF評価額】 = NOI現在価値合計 + 復帰価格の現在価値</p>
                    <p className="pl-4">
                      = {Math.round(result.totalNoiPV / 10000).toLocaleString()}万円 + {Math.round(result.terminalValuePV / 10000).toLocaleString()}万円
                    </p>
                    <p className="pl-4">
                      = 約{Math.round(result.dcfValue / 10000).toLocaleString()}万円
                    </p>
                  </div>
                </div>

                {/* 年度別詳細 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">年度別キャッシュフロー詳細</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-2 py-1 text-center">年度</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">NOI</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">割引係数</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">現在価値</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearlyDetails.map((detail, index) => (
                          <tr key={detail.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-2 py-1 text-center">{detail.year}年目</td>
                            <td className="border border-gray-300 px-2 py-1 text-right">
                              {Math.round(detail.noi / 10000).toLocaleString()}万円
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right">
                              {detail.discountFactor.toFixed(4)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right text-blue-600">
                              {Math.round(detail.presentValue / 10000).toLocaleString()}万円
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-blue-50 font-medium">
                          <td className="border border-gray-300 px-2 py-1 text-center">合計</td>
                          <td className="border border-gray-300 px-2 py-1 text-right">-</td>
                          <td className="border border-gray-300 px-2 py-1 text-right">-</td>
                          <td className="border border-gray-300 px-2 py-1 text-right text-blue-700">
                            {Math.round(result.totalNoiPV / 10000).toLocaleString()}万円
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表
          ================================================================= */}
          <section className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">DCF評価額の早見表</h2>
            <p className="text-sm text-gray-600 mb-4">
              保有期間10年・収益成長率0%・売却費用率4%の場合（単位: 万円）
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700">NOI＼割引率</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">3%</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">4%</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">5%</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">6%</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { noi: 100, values: ['約2,230', '約1,840', '約1,560', '約1,350'] },
                    { noi: 200, values: ['約4,460', '約3,690', '約3,120', '約2,700'] },
                    { noi: 300, values: ['約6,690', '約5,530', '約4,690', '約4,050'] },
                    { noi: 500, values: ['約1億1,150', '約9,220', '約7,810', '約6,750'] },
                    { noi: 1000, values: ['約2億2,300', '約1億8,440', '約1億5,620', '約1億3,510'] },
                  ].map((row, index) => (
                    <tr key={row.noi} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-2 py-2 text-gray-900">{row.noi}万円</td>
                      {row.values.map((val, i) => (
                        <td key={i} className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">
                          {val}万円
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※最終還元利回りは割引率+0.5%で計算。実際の評価は物件条件により異なります。
            </p>
          </section>

          {/* =================================================================
              目次
          ================================================================= */}
          <TableOfContents items={tocItems} />

          {/* =================================================================
              解説セクション
          ================================================================= */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              DCF法（Discounted Cash Flow法、割引キャッシュフロー法）は、不動産の収益価格を算定する手法の一つです。
              将来の純収益（キャッシュフロー）と、保有期間終了時の売却価格（復帰価格）を、
              それぞれの発生時期に応じた現在価値に割り引いて合計することで評価額を求めます。
            </p>
            <SectionHeading id="formula" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              DCF法の基本公式は以下の通りです。
            </p>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 font-mono text-sm">
              <p className="mb-2">収益価格 = Σ(各期のNCF ÷ (1+r)^t) + (復帰価格 ÷ (1+r)^n)</p>
              <ul className="text-xs text-gray-600 mt-3 space-y-1">
                <li>NCF: 純収益（Net Cash Flow）</li>
                <li>r: 割引率（Discount Rate）</li>
                <li>t: 年度（1〜n）</li>
                <li>n: 保有期間</li>
              </ul>
            </div>

            <SectionHeading id="parameters" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              DCF法の計算において重要なパラメーターは以下の通りです。
            </p>
            <div className="space-y-3 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-800 mb-1">割引率（Discount Rate）</p>
                <p className="text-sm text-gray-600">
                  期待収益率であり、リスクに応じて設定されます。
                  リスクフリーレート（国債利回り等）にリスクプレミアムを加算して算出する方法が一般的です。
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-800 mb-1">最終還元利回り（Terminal Cap Rate）</p>
                <p className="text-sm text-gray-600">
                  保有期間終了時の売却価格（復帰価格）を算出するための還元利回りです。
                  建物老朽化や将来の不確実性を考慮し、割引率より0.1〜0.5%程度高く設定することが一般的です。
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-800 mb-1">保有期間</p>
                <p className="text-sm text-gray-600">
                  物件の保有予定期間です。実務では5年または10年が用いられることが多いです。
                </p>
              </div>
            </div>

            <SectionHeading id="vs-direct" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              収益還元法には「直接還元法」と「DCF法」の2種類があります。
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">比較項目</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">直接還元法</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">DCF法</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">計算構造</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">NOI ÷ 還元利回り</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">各期PV + 復帰価格PV</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">前提</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">収益が安定的</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">収益変動を織り込む</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">適した物件</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">安定稼働物件</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">開発案件、空室あり物件</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {relatedGlossary.length > 0 && (
              <>
                <SectionHeading id="glossary" items={tocItems} />
                <ul className="space-y-2">
                  {relatedGlossary.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/glossary/${item.slug}`}
                        className="text-gray-700 hover:text-gray-900 hover:underline text-sm"
                      >
                        <span className="text-gray-400 mr-1">›</span>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer
            infoDate="2026年1月"
            lastUpdated="2026年1月20日"
          />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/dcf" />

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
