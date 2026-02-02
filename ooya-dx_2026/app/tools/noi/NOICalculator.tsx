'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { NOICalculatorCompact } from '@/components/calculators'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産のNOI（営業純収益） 計算シミュレーション'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: 'NOI（営業純収益）とは', level: 2 },
  { id: 'formula', title: 'NOIの計算式', level: 3 },
  { id: 'cashflow-tree', title: 'キャッシュフローツリー', level: 3 },
  { id: 'opex', title: '運営経費（OPEX）の内訳', level: 2 },
  { id: 'caution', title: '計算上の注意点', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

interface GlossaryItem {
  slug: string
  title: string
}

interface NOICalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// メインコンポーネント
// =================================================================
export function NOICalculator({ relatedGlossary = [] }: NOICalculatorProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
            {(() => {
              const toolInfo = getToolInfo('/tools/noi')
              return toolInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(toolInfo.lastUpdated)}
                </time>
              ) : null
            })()}
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>

          {/* シェアボタン */}
          <div className="mb-4">
            <ShareButtons title={PAGE_TITLE} />
          </div>

          <p className="text-gray-600 mb-8">
            不動産のNOI（営業純収益）を概算計算します。
            GPI・EGI・OPEXの詳細内訳を表示し、キャッシュフローツリーで収益構造を可視化できます。
          </p>

          {/* シミュレーター本体（コンパクト版コンポーネント） */}
          <NOICalculatorCompact showTitle={true} />

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表
          ================================================================= */}
          <section className="mt-12 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">物件タイプ別 経費率（OPEX率）の目安</h2>
            <p className="text-sm text-gray-600 mb-4">GPI（満室想定家賃）に対する運営経費の割合</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700">物件タイプ</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">経費率目安</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700">備考</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">区分マンション（新築・築浅）</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">15%〜20%</td>
                    <td className="border border-gray-300 px-2 py-2 text-gray-600 text-xs">管理費・修繕積立金込み</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">一棟マンション（RC造）</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-blue-600 font-medium">20%〜25%</td>
                    <td className="border border-gray-300 px-2 py-2 text-gray-600 text-xs">EV保守・共用部管理含む</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">一棟アパート（木造・地方）</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-amber-600 font-medium">25%〜30%</td>
                    <td className="border border-gray-300 px-2 py-2 text-gray-600 text-xs">賃料単価が低いため比率高め</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-gray-900">商業施設・ホテル</td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-orange-600 font-medium">30%〜40%</td>
                    <td className="border border-gray-300 px-2 py-2 text-gray-600 text-xs">運営コスト高め</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※上記は一般的な目安です。実際の経費は物件の状態・立地・管理体制により異なります。
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
              NOI（Net Operating Income：営業純収益）は、不動産の収益性を測る基本的な指標の一つとされています。
              物件から得られる収入から、運営に必要な経費を差し引いた「事業としての実力」を示す数値です。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              物件価格の妥当性を判断する際にも参照される指標です。
              NOIを物件価格で割った「NOI利回り（キャップレート）」は、不動産の収益性比較に使用される場合があります。
            </p>

            <SectionHeading id="formula" items={tocItems} />
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-800 mb-2">NOIの計算式</p>
              <div className="font-mono text-sm text-gray-700 space-y-1">
                <p><strong>NOI = EGI - OPEX</strong></p>
                <p className="text-xs text-gray-500 mt-2">EGI = GPI - 空室損失 - 貸倒損失 + その他収入</p>
                <p className="text-xs text-gray-500">GPI = 年間満室想定賃料</p>
              </div>
            </div>

            <SectionHeading id="cashflow-tree" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産の収益構造を理解するには、「キャッシュフローツリー」と呼ばれる階層構造で把握することが有用とされています。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">キャッシュフローの階層</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1 font-mono">
                    <li>GPI（潜在総収益）</li>
                    <li>　↓ 空室損失・貸倒損失を控除</li>
                    <li>EGI（実効総収益）</li>
                    <li>　↓ 運営経費（OPEX）を控除</li>
                    <li><strong>NOI（営業純収益）</strong> ← ここまで計算</li>
                    <li>　↓ 資本的支出（CAPEX）を控除</li>
                    <li>NCF（純キャッシュフロー）</li>
                    <li>　↓ ローン返済を控除</li>
                    <li>BTCF（税引前キャッシュフロー）</li>
                  </ul>
                </div>
              </div>
            </div>

            <SectionHeading id="opex" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              運営経費（OPEX）には、以下の項目が含まれる場合があります。
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">経費項目</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">目安</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">PM管理費（賃貸管理）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">家賃の3%〜5%程度</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">BM管理費（建物管理）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">規模・設備による</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">固定資産税・都市計画税</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">評価額の約1.7%程度</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">修繕維持費</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">家賃の1%〜3%程度</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">損害保険料</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">構造・規模による</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">募集費用（AD等）</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">退去率×賃料1〜2ヶ月</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <SectionHeading id="caution" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              NOIの計算にあたっては、以下の点にご注意ください。
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>・<strong>NOIには減価償却費は含まれません</strong></li>
                <li>・<strong>NOIにはローン返済は含まれません</strong>：借入の有無に関係なく算出される指標です</li>
                <li>・<strong>大規模修繕費（CAPEX）は含まれません</strong>：NOIからCAPEXを引いたものがNCFです</li>
                <li>・<strong>空室率・経費は変動します</strong>：将来の数値は保証されるものではありません</li>
              </ul>
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
          <RelatedTools currentPath="/tools/noi" />

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
