'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp, Percent, BarChart3, Building2, Receipt, Wallet, Calendar } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
// 早見表は3列カスタムテーブルを使用
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { BrokerageCalculatorCompact } from '@/components/calculators'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '【2026年最新】仲介手数料シミュレーター｜早見表・800万円特例対応'

// 早見表データ（主要価格帯）- 適用料率・計算式を列として表示
// 800万円以下は2024年法改正特例（最大33万円）の対象
const quickReferenceData = [
  { price: '100万円', rate: '5%', formula: '100万×5%=5万', fee: '5.5万円', hasSpecialProvision: true },
  { price: '300万円', rate: '4%+2万円', formula: '300万×4%+2万=14万', fee: '15.4万円', hasSpecialProvision: true },
  { price: '500万円', rate: '3%+6万円', formula: '500万×3%+6万=21万', fee: '23.1万円', hasSpecialProvision: true },
  { price: '800万円', rate: '3%+6万円', formula: '800万×3%+6万=30万', fee: '33万円', hasSpecialProvision: true },
  { price: '1,000万円', rate: '3%+6万円', formula: '1,000万×3%+6万=36万', fee: '39.6万円', hasSpecialProvision: false },
  { price: '2,000万円', rate: '3%+6万円', formula: '2,000万×3%+6万=66万', fee: '72.6万円', hasSpecialProvision: false },
  { price: '3,000万円', rate: '3%+6万円', formula: '3,000万×3%+6万=96万', fee: '105.6万円', hasSpecialProvision: false },
  { price: '5,000万円', rate: '3%+6万円', formula: '5,000万×3%+6万=156万', fee: '171.6万円', hasSpecialProvision: false },
  { price: '7,000万円', rate: '3%+6万円', formula: '7,000万×3%+6万=216万', fee: '237.6万円', hasSpecialProvision: false },
  { price: '1億円', rate: '3%+6万円', formula: '1億×3%+6万=306万', fee: '336.6万円', hasSpecialProvision: false }
]

// 関連ツールデータ
// カテゴリ別の全ツールデータ（アイコン付き）
const toolCategories = [
  {
    category: '利回りを計算したい',
    icon: Percent,
    tools: [
      { href: '/tools/yield', title: '表面利回り・実質利回り' },
      { href: '/tools/cap-rate', title: 'キャップレート' },
      { href: '/tools/income-approach', title: '収益還元（直接還元法）' },
      { href: '/tools/cost-approach', title: '積算評価' },
      { href: '/tools/replacement-cost', title: '再調達価格' },
    ]
  },
  {
    category: '収益性を分析したい',
    icon: BarChart3,
    tools: [
      { href: '/tools/noi', title: 'NOI（営業純収益）' },
      { href: '/tools/ccr', title: 'CCR（自己資金配当率）' },
      { href: '/tools/dscr', title: 'DSCR（返済余力）' },
      { href: '/tools/npv', title: 'NPV（正味現在価値）' },
      { href: '/tools/roi', title: 'ROI（投資利益率）' },
    ]
  },
  {
    category: 'ローンを計算したい',
    icon: Building2,
    tools: [
      { href: '/tools/loan', title: '住宅ローン返済額' },
      { href: '/tools/ltv', title: 'LTV（借入比率）' },
      { href: '/tools/cashflow', title: 'CF（キャッシュフロー）' },
    ]
  },
  {
    category: '税金・費用を計算したい',
    icon: Receipt,
    tools: [
      { href: '/tools/acquisition-tax', title: '不動産取得税' },
      { href: '/tools/registration-tax', title: '登録免許税' },
      { href: '/tools/stamp-duty', title: '印紙税' },
      { href: '/tools/brokerage', title: '仲介手数料' },
      { href: '/tools/corporate-tax', title: '法人税' },
    ]
  },
  {
    category: '売却時の手取りを知りたい',
    icon: Wallet,
    tools: [
      { href: '/tools/sale-proceeds', title: '売却手取り' },
      { href: '/tools/transfer-income-tax', title: '譲渡所得税' },
      { href: '/tools/depreciation', title: '減価償却' },
    ]
  },
  {
    category: '長期収支を把握したい',
    icon: Calendar,
    tools: [
      { href: '/tools/irr', title: 'IRR（内部収益率）' },
      { href: '/tools/dcf', title: 'DCF法' },
      { href: '/tools/dead-cross', title: 'デッドクロス' },
    ]
  },
]

export function BrokerageCalculator() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        {/* 2カラムレイアウト */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
            {/* 左カラム（メインコンテンツ） */}
            <article>
              {/* パンくず */}
              <ToolsBreadcrumb currentPage={PAGE_TITLE} />

              {/* 日付 & シェアボタン */}
              <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4">
                <div className="flex items-center gap-3 text-xs text-gray-900">
                  <span>公開日：2026年1月15日</span>
                  {(() => {
                    const toolInfo = getToolInfo('/tools/brokerage')
                    return toolInfo?.lastUpdated ? (
                      <span>更新日：{formatToolDate(toolInfo.lastUpdated)}</span>
                    ) : null
                  })()}
                </div>
                <ShareButtons title={PAGE_TITLE} />
              </div>

              {/* タイトル */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-6">
                {PAGE_TITLE}
              </h1>

              {/* シミュレーター本体（h1で目的が明確なためh2不要） */}
              <Suspense fallback={<div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 animate-pulse"><div className="h-8 bg-blue-100 rounded w-1/2 mb-4"></div><div className="h-12 bg-blue-100 rounded mb-4"></div></div>}>
                <BrokerageCalculatorCompact showTitle={false} />
              </Suspense>

              {/* 計算結果の注記 */}
              <CalculatorNote />

              {/* 早見表（4列テーブル） */}
              <section className="mb-8 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">仲介手数料の早見表（売買価格別の相場一覧）</h2>
                <p className="text-sm text-gray-600 mb-4">主要な売買価格に対する仲介手数料の目安です。</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">売買価格</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">適用料率</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">計算式（税抜）</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">税込</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickReferenceData.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-2 text-left text-gray-900">{row.price}</td>
                          <td className="border border-gray-300 px-3 py-2 text-left text-gray-900 text-sm">{row.rate}</td>
                          <td className="border border-gray-300 px-3 py-2 text-left text-gray-900 text-sm font-mono">{row.formula}</td>
                          <td className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900">{row.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-2">※上記は上限額です。実際の手数料は不動産会社との契約内容により異なる場合があります。</p>
                <p className="text-sm text-gray-600 mt-1">※特例：2024年7月法改正により、800万円以下の物件は最大33万円（税込）が請求される場合があります。</p>
              </section>

              {/* 仲介手数料の説明 */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">仲介手数料の上限額と計算方法</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 mb-3">
                    不動産売買における仲介手数料は、宅地建物取引業法で<span className="font-bold">上限額</span>が定められています。
                  </p>
                  <div className="overflow-x-auto mb-3">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">売買価格</th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">上限額（税抜）</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 px-3 py-2 text-gray-900">200万円以下</td>
                          <td className="border border-gray-300 px-3 py-2 text-gray-900 font-medium">売買価格 × 5%</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 text-gray-900">200万円超〜400万円以下</td>
                          <td className="border border-gray-300 px-3 py-2 text-gray-900 font-medium">売買価格 × 4% + 2万円</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 px-3 py-2 text-gray-900">400万円超</td>
                          <td className="border border-gray-300 px-3 py-2 text-gray-900 font-medium">売買価格 × 3% + 6万円</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">※上記金額に消費税（10%）が加算されます。</p>
                  <p className="text-sm text-gray-600 mb-1">※2024年7月の法改正により、800万円以下の空家等については、売主・買主それぞれから最大33万円（税込）を受領可能となりました。</p>
                  <p className="text-sm text-gray-600">
                    参照：
                    <a href="https://www.mlit.go.jp/totikensangyo/const/1_6_bf_000013.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">国土交通省「不動産取引に関するお知らせ」</a>
                  </p>
                </div>
              </section>

              {/* よくある質問（FAQスキーマ対応） */}
              <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">よくある質問</h2>
                <div className="space-y-4">
                  {/* Q1 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Q. 「3%+6万円」の計算式とは？</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      売買価格が400万円を超える場合、仲介手数料の上限は「売買価格×3%+6万円（税抜）」で計算できます。
                      これは宅地建物取引業法で定められた上限額を、一つの式で簡単に求められるようにした計算式です。
                      正式には価格帯ごとに5%・4%・3%の料率が適用されますが、この式を使えば同じ結果が得られます。
                      なぜ6万円を足すのか？それは200万円までの2%分（4万円）と、400万円までの1%分（2万円）の差額を調整するためです。
                    </p>
                  </div>
                  {/* Q2 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Q. 2024年法改正（800万円特例）とは？</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      2024年7月の宅建業法改正により、売買価格800万円以下の物件については、
                      売主・買主それぞれから最大33万円（税込）を仲介手数料の上限として受け取れるようになりました。
                      低額物件の流通促進を目的とした特例で、適用には媒介契約時の合意が必要です。
                      詳しくは<a href="https://www.mlit.go.jp/totikensangyo/const/1_6_bf_000013.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">国土交通省「不動産取引に関するお知らせ」</a>をご確認ください。
                    </p>
                  </div>
                  {/* Q3 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Q. 仲介手数料に消費税はかかりますか？</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      はい、仲介手数料には消費税（10%）がかかります。
                      「3%+6万円」などの計算式で求めた金額は税抜価格のため、
                      実際に支払う金額は消費税を加算した税込価格となります。
                      また、売買価格に建物の消費税が含まれている場合は、消費税を差し引いた本体価格で仲介手数料を計算します。
                      本シミュレーターでは税込金額を自動計算して表示しています。
                    </p>
                  </div>
                </div>
              </section>

              {/* 解説ページへのリンク */}
              <section className="mb-12">
                <Link
                  href="/tools/brokerage/guide"
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-700">
                      仲介手数料の仕組みを詳しく見る
                    </p>
                    <p className="text-sm text-gray-600">
                      計算方法・2024年法改正・支払いタイミングなど
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                </Link>
              </section>

              {/* 免責事項 */}
              <ToolDisclaimer />

              {/* モバイル用：関連ツール・CTA（PCでは右カラムに表示） */}
              <div className="lg:hidden mt-12 space-y-8">
                {/* 全計算ツール（カテゴリ別） */}
                <div>
                  <p className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-dashed border-gray-900">
                    無料で使える計算ツール<span className="text-sm font-medium text-white bg-primary-600 px-2 py-0.5 rounded ml-2">全24種類</span>
                  </p>
                  <div className="space-y-4">
                    {toolCategories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <div key={category.category}>
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="h-5 w-5 text-primary-600" />
                            <p className="text-base font-bold text-gray-900">{category.category}</p>
                          </div>
                          <div className="space-y-1 ml-6">
                            {category.tools.map((tool) => (
                              <Link
                                key={tool.href}
                                href={tool.href}
                                className="block py-2 px-3 text-sm text-gray-700 hover:text-primary-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                {tool.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 不動産投資シミュレーターCTA */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
                  <p className="text-xl font-bold text-gray-900 mb-4 text-center">
                    <span className="block text-sm font-normal text-gray-600 mb-1">現役大家さんが開発した、</span>
                    不動産投資シミュレーター
                  </p>
                  <Image
                    src="/img/kakushin_img01.png"
                    alt="不動産投資シミュレーター"
                    width={400}
                    height={200}
                    className="w-[90%] h-auto rounded-lg mb-4 mx-auto"
                  />
                  <p className="text-sm text-gray-600 mb-4">
                    IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。
                    物件購入の意思決定をデータで支援します。
                  </p>
                  <Link
                    href="/simulator"
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                  >
                    無料でシミュレーションをする
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>

              {/* 会社概要・運営者 */}
              <div className="mt-16">
                <CompanyProfileCompact />
              </div>
            </article>

            {/* 右カラム（サイドバー）- PCのみ表示 */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                {/* 全計算ツール（カテゴリ別） */}
                <div>
                  <p className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-dashed border-gray-900">
                    無料で使える計算ツール<span className="text-sm font-medium text-white bg-primary-600 px-2 py-0.5 rounded ml-2">全24種類</span>
                  </p>
                  <div className="space-y-4">
                    {toolCategories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <div key={category.category}>
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="h-5 w-5 text-primary-600" />
                            <p className="text-base font-bold text-gray-900">{category.category}</p>
                          </div>
                          <div className="space-y-1 ml-6">
                            {category.tools.map((tool) => (
                              <Link
                                key={tool.href}
                                href={tool.href}
                                className="block py-1.5 px-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded transition-colors"
                              >
                                {tool.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href="/tools"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      すべての計算ツールを見る
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* 不動産投資シミュレーターCTA */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-5 border border-primary-100">
                  <p className="text-xl font-bold text-gray-900 mb-4 text-center">
                    <span className="block text-sm font-normal text-gray-600 mb-1">現役大家さんが開発した、</span>
                    不動産投資シミュレーター
                  </p>
                  <Image
                    src="/img/kakushin_img01.png"
                    alt="不動産投資シミュレーター"
                    width={300}
                    height={150}
                    className="w-[90%] h-auto rounded-lg mb-4 mx-auto"
                  />
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    物件情報を入力するだけで、利回り・キャッシュフロー・投資指標を自動計算。投資判断の参考にできます。
                  </p>
                  <Link
                    href="/simulator"
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    無料でシミュレーションをする
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
