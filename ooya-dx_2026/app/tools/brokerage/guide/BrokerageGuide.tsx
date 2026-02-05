'use client'

import Link from 'next/link'
import { Calculator, ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { TOOLS_CATEGORY_NAME } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'


// ページタイトル
const PAGE_TITLE = '仲介手数料とは？計算方法・2024年法改正・支払いの仕組みを解説'

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: '仲介手数料とは', level: 2 },
  { id: 'calculation', title: '計算方法（速算式）', level: 2 },
  { id: 'rate', title: '正式な料率', level: 3 },
  { id: 'example', title: '具体的な計算例', level: 3 },
  { id: 'revision2024', title: '2024年法改正について', level: 2 },
  { id: 'payment', title: '支払いと仕組み', level: 2 },
  { id: 'timing', title: '支払いのタイミング', level: 3 },
  { id: 'type', title: '両手仲介と片手仲介', level: 3 },
  { id: 'free', title: '仲介手数料がかからないケース', level: 2 },
  { id: 'difference', title: '売買と賃貸の違い', level: 2 },
]

export function BrokerageGuide() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <nav className="flex flex-wrap items-center text-sm text-gray-500 mb-6" aria-label="パンくずリスト">
            <Link href="/" className="hover:text-primary-600">
              ホーム
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
            <Link href="/tools" className="hover:text-primary-600">
              {TOOLS_CATEGORY_NAME}
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
            <Link href="/tools/brokerage" className="hover:text-primary-600">
              仲介手数料シミュレーター
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
            <span className="text-gray-900">解説</span>
          </nav>

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              解説
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>

          {/* シェアボタン */}
          <div className="mb-6">
            <ShareButtons title={PAGE_TITLE} />
          </div>

          {/* 計算機ページへのリンク */}
          <section className="mb-8">
            <Link
              href="/tools/brokerage"
              className="flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group border border-primary-200"
            >
              <Calculator className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-700 group-hover:text-primary-800">
                  今すぐ仲介手数料を計算する
                </p>
                <p className="text-sm text-primary-600">
                  売買価格を入力するだけで瞬時に計算
                </p>
              </div>
            </Link>
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              仲介手数料とは、不動産売買の際に、売主・買主と不動産会社との間で仲介契約を結び、取引が成立した場合に不動産会社に支払う報酬のことです。
              不動産会社は物件の紹介、内見の手配、契約書類の作成、価格交渉のサポートなど、取引全体をサポートする対価として仲介手数料を受け取ります。
            </p>

            <SectionHeading id="calculation" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              仲介手数料の上限額は法律で定められており、以下の計算式で求められます。
            </p>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center">
                売買価格 × 3% + 6万円 + 消費税
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                ※400万円を超える取引の場合
              </p>
            </div>

            <SectionHeading id="rate" items={tocItems} />
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>200万円以下の部分：5%</li>
              <li>200万円超〜400万円以下の部分：4%</li>
              <li>400万円超の部分：3%</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              速算式「3%+6万円」は、上記の料率を一括で計算できる便利な公式です。
            </p>

            <SectionHeading id="example" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              3,000万円の物件を購入する場合の仲介手数料を計算してみましょう。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>① 売買価格：3,000万円</li>
                <li>② 速算式：3,000万円 × 3% + 6万円 = 96万円（税抜）</li>
                <li>③ 消費税：96万円 × 10% = 9.6万円</li>
                <li>④ <span className="font-semibold">合計：105.6万円（税込）</span></li>
              </ul>
            </div>

            <SectionHeading id="revision2024" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              2024年7月1日に国土交通省の告示が改正され、<span className="font-medium">800万円以下の物件</span>について仲介手数料の特例が設けられました。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-amber-900 mb-2">改正のポイント</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
                <li>対象：売買価格800万円以下の宅地・建物</li>
                <li>上限：売主・買主それぞれから最大<span className="font-medium">33万円（税込）</span></li>
                <li>目的：空き家等の流通促進</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              この特例は、依頼者への事前説明と合意が必要です。800万円以下の物件については不動産会社にご確認ください。
            </p>
            <p className="text-xs text-gray-500">
              参照：
              <a
                href="https://www.mlit.go.jp/totikensangyo/const/1_6_bf_000013.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                国土交通省「不動産取引に関するお知らせ」
              </a>
              <span className="mx-1">|</span>
              <a
                href="https://biz.homes.jp/column/topics-00146"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LIFULL HOME&apos;S「800万円以下の不動産契約で仲介手数料見直し」
              </a>
            </p>

            <SectionHeading id="payment" items={tocItems} />

            <SectionHeading id="timing" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              仲介手数料の支払いタイミングは不動産会社によって異なりますが、一般的には以下のパターンが多いです。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>売買契約時に50%、決済・引き渡し時に50%</li>
              <li>決済・引き渡し時に全額</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              契約前に不動産会社へ確認しておくことをおすすめします。
            </p>

            <SectionHeading id="type" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              不動産取引には「両手仲介」と「片手仲介」の2つのパターンがあります。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><span className="font-medium">両手仲介</span>：1社の不動産会社が売主・買主の両方を仲介。双方から手数料を受け取る</li>
              <li><span className="font-medium">片手仲介</span>：売主側と買主側で別々の不動産会社が仲介。それぞれの会社が片方から手数料を受け取る</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              どちらの場合でも、買主・売主が支払う手数料の上限額は同じです。
            </p>

            <SectionHeading id="free" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              仲介手数料は「仲介（媒介）」に対する報酬です。そのため、仲介がない以下のケースでは仲介手数料が発生しません。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>売主から直接購入する場合（売主物件）</li>
              <li>不動産会社が売主の場合（自社物件）</li>
              <li>個人間で直接取引する場合</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              参照：
              <a
                href="https://www.homes.co.jp/cont/money/money_00356/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                LIFULL HOME&apos;S「不動産における仲介手数料について」
              </a>
            </p>

            <SectionHeading id="difference" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              仲介手数料は売買と賃貸で計算方法が異なります。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><span className="font-medium">売買</span>：売買価格に応じた料率（本ページの計算式）</li>
              <li><span className="font-medium">賃貸</span>：家賃の1ヶ月分が上限（貸主・借主合わせて）</li>
            </ul>

          </section>

          {/* 計算機ページへのリンク（再掲） */}
          <section className="mb-12">
            <Link
              href="/tools/brokerage"
              className="flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group border border-primary-200"
            >
              <Calculator className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-700 group-hover:text-primary-800">
                  仲介手数料を計算する
                </p>
                <p className="text-sm text-primary-600">
                  シミュレーターで今すぐ計算
                </p>
              </div>
            </Link>
          </section>

          {/* 免責事項 */}
          <ToolDisclaimer />


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
