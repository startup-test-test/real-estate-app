'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { BrokerageCalculatorCompact } from '@/components/calculators'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '仲介手数料を自動計算【2026最新】不動産・800万円以下特例対応'

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

export function BrokerageCalculator() {
  return (
    <ToolPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/brokerage"
      publishDate="2026年1月15日"
      additionalContent={<BrokerageAdditionalContent />}
    >
      <BrokerageCalculatorCompact showTitle={false} />
    </ToolPageLayout>
  )
}

/**
 * 仲介手数料ページ固有のコンテンツ
 * 早見表・説明・FAQ・ガイドリンク
 */
function BrokerageAdditionalContent() {
  return (
    <>
      {/* 早見表（4列テーブル） */}
      <section className="mb-6 sm:mb-8 mt-6 sm:mt-8">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-2">仲介手数料の早見表（売買価格別の相場一覧）</h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">主要な売買価格に対する仲介手数料の目安です。</p>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700 whitespace-nowrap">売買価格</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700 whitespace-nowrap">適用料率</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">計算式（税抜）</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-700 whitespace-nowrap">税込</th>
              </tr>
            </thead>
            <tbody>
              {quickReferenceData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left text-gray-900 whitespace-nowrap">{row.price}</td>
                  <td className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left text-gray-900 whitespace-nowrap">{row.rate}</td>
                  <td className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left text-gray-900 font-mono whitespace-nowrap hidden sm:table-cell">{row.formula}</td>
                  <td className="border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-gray-900 whitespace-nowrap">{row.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">※上記は上限額です。実際の手数料は不動産会社との契約内容により異なる場合があります。</p>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">※特例：2024年7月法改正により、800万円以下の物件は最大33万円（税込）が請求される場合があります。</p>
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
    </>
  )
}
