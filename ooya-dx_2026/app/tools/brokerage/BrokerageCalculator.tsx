'use client'

import Link from 'next/link'
import { ArrowRight, Calculator, TrendingUp } from 'lucide-react'
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
const relatedCalculators = [
  {
    href: '/tools/stamp-duty',
    title: '印紙税計算',
    description: '売買契約書の印紙代'
  },
  {
    href: '/tools/registration-tax',
    title: '登録免許税計算',
    description: '所有権移転登記の税額'
  },
  {
    href: '/tools/acquisition-tax',
    title: '不動産取得税計算',
    description: '取得時にかかる税金'
  },
  {
    href: '/tools/transfer-income-tax',
    title: '譲渡所得税計算',
    description: '売却時の税金'
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

              {/* カテゴリー & 日付 */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                  計算ツール
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>公開日：2026年1月15日</span>
                  {(() => {
                    const toolInfo = getToolInfo('/tools/brokerage')
                    return toolInfo?.lastUpdated ? (
                      <span>更新日：{formatToolDate(toolInfo.lastUpdated)}</span>
                    ) : null
                  })()}
                </div>
              </div>

              {/* タイトル */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {PAGE_TITLE}
              </h1>

              {/* シェアボタン */}
              <div className="mb-6">
                <ShareButtons title={PAGE_TITLE} />
              </div>

              {/* シミュレーター本体（コンパクト版コンポーネント） */}
              <BrokerageCalculatorCompact showTitle={false} />

              {/* 計算結果の注記 */}
              <CalculatorNote />

              {/* 早見表（4列テーブル） */}
              <section className="mb-8 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">仲介手数料 早見表</h2>
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
                {/* 賃貸経営シミュレーターCTA */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                    <span className="text-xs font-medium text-primary-600 bg-white px-2 py-0.5 rounded">
                      無料
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    賃貸経営シミュレーター
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。
                    物件購入の意思決定をデータで支援します。
                  </p>
                  <Link
                    href="/simulator"
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    無料でシミュレーションをする
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>

                {/* 関連計算ツール */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">関連計算ツール</h3>
                  <div className="space-y-2">
                    {relatedCalculators.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            {tool.title}
                          </p>
                          <p className="text-xs text-gray-500">{tool.description}</p>
                        </div>
                        <Calculator className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                      </Link>
                    ))}
                  </div>
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
                {/* 賃貸経営シミュレーターCTA */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-5 border border-primary-100">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                    <span className="text-xs font-medium text-primary-600 bg-white px-2 py-0.5 rounded">
                      無料
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    賃貸経営シミュレーター
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。物件購入の意思決定をデータで支援します。
                  </p>
                  <Link
                    href="/simulator"
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    無料でシミュレーションをする
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>

                {/* 関連計算ツール */}
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">関連計算ツール</h3>
                  <div className="space-y-2">
                    {relatedCalculators.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            {tool.title}
                          </p>
                          <p className="text-xs text-gray-500">{tool.description}</p>
                        </div>
                        <Calculator className="h-4 w-4 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                      </Link>
                    ))}
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

                {/* 解説へのリンク */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">仲介手数料について</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    計算方法・2024年法改正・支払いタイミングなど
                  </p>
                  <Link
                    href="/tools/brokerage/guide"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    詳しく見る
                    <ArrowRight className="h-3 w-3 ml-1" />
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
