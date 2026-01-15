'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { calculateBrokerageFee } from '@/lib/calculators/brokerage'

// 早見表データ（主要価格帯）
const quickReferenceData: QuickReferenceRow[] = [
  { label: '500万円', value: '23.1万円', subValue: '税抜21万円' },
  { label: '1,000万円', value: '39.6万円', subValue: '税抜36万円' },
  { label: '2,000万円', value: '72.6万円', subValue: '税抜66万円' },
  { label: '3,000万円', value: '105.6万円', subValue: '税抜96万円' },
  { label: '4,000万円', value: '138.6万円', subValue: '税抜126万円' },
  { label: '5,000万円', value: '171.6万円', subValue: '税抜156万円' },
  { label: '6,000万円', value: '204.6万円', subValue: '税抜186万円' },
  { label: '7,000万円', value: '237.6万円', subValue: '税抜216万円' },
  { label: '8,000万円', value: '270.6万円', subValue: '税抜246万円' },
  { label: '9,000万円', value: '303.6万円', subValue: '税抜276万円' },
  { label: '1億円', value: '336.6万円', subValue: '税抜306万円' }
]

// 関連ツール
const relatedTools = [
  { name: '譲渡所得税シミュレーター', href: '/tools/capital-gains-tax', description: '売却時の税金を計算' },
  { name: '不動産取得税シミュレーター', href: '/tools/acquisition-tax', description: '購入時の税金を計算' },
  { name: '登録免許税シミュレーター', href: '/tools/registration-tax', description: '登記にかかる税金を計算' }
]

export function BrokerageCalculator() {
  // 万円単位で入力を受け付ける
  const [priceInMan, setPriceInMan] = useState<number>(0)

  // 円に変換して計算
  const priceInYen = priceInMan * 10000

  // 価格が変わるたびに自動計算
  const result = useMemo(() => {
    return calculateBrokerageFee(priceInYen)
  }, [priceInYen])

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
              <span className="text-gray-900">仲介手数料</span>
            </nav>

            {/* カテゴリー */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                計算ツール
              </span>
            </div>

            {/* タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              不動産売買の仲介手数料を10秒で無料計算｜早見表付き
            </h1>
            <p className="text-gray-600 mb-8">
              売買価格を入力するだけで、仲介手数料の上限額を瞬時に計算します。
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
                  仲介手数料を概算計算する
                </h2>
              </div>

              {/* 入力エリア */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <NumberInput
                  label="売買価格を入力"
                  value={priceInMan}
                  onChange={setPriceInMan}
                  unit="万円"
                  placeholder="例：3000"
                />
                {priceInMan > 0 ? (
                  <p className="text-sm text-gray-500 mt-1">
                    = {priceInMan.toLocaleString('ja-JP')}万円（{priceInYen.toLocaleString('ja-JP')}円）
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">
                    例：3000 → 3,000万円 → 仲介手数料 約105.6万円（税込）
                  </p>
                )}
              </div>

              {/* 計算式の説明 */}
              {priceInMan > 0 && (
                <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">適用料率：</span>
                    {result.rate}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {priceInYen <= 2000000 && '200万円以下のため5%を適用'}
                    {priceInYen > 2000000 &&
                      priceInYen <= 4000000 &&
                      '200万円超〜400万円以下のため4%+2万円を適用'}
                    {priceInYen > 4000000 && '400万円超のため3%+6万円（速算式）を適用'}
                  </p>
                </div>
              )}

              {/* 結果エリア（グリッド表示） */}
              <div className="bg-white rounded-lg p-4">
                <div className="grid grid-cols-2 gap-y-3 text-base">
                  <span className="text-gray-600">仲介手数料（税抜）</span>
                  <span className="text-right text-lg font-medium">{(result.commission / 10000).toLocaleString('ja-JP')}万円</span>

                  <span className="text-gray-600">消費税（10%）</span>
                  <span className="text-right text-lg font-medium">{(result.tax / 10000).toLocaleString('ja-JP')}万円</span>

                  {/* メイン結果 */}
                  <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">合計（税込）</span>
                  <span className="text-right text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
                    {(result.total / 10000).toLocaleString('ja-JP')}万円
                  </span>
                </div>

                {/* 計算式表示 */}
                {priceInMan > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">計算式</p>
                    <p className="text-sm text-gray-700 font-mono">
                      {priceInYen <= 2000000 && (
                        <>{priceInMan.toLocaleString()}万円 × 5% = {(result.commission / 10000).toLocaleString()}万円</>
                      )}
                      {priceInYen > 2000000 && priceInYen <= 4000000 && (
                        <>{priceInMan.toLocaleString()}万円 × 4% + 2万円 = {(result.commission / 10000).toLocaleString()}万円</>
                      )}
                      {priceInYen > 4000000 && (
                        <>{priceInMan.toLocaleString()}万円 × 3% + 6万円 = {(result.commission / 10000).toLocaleString()}万円</>
                      )}
                    </p>
                    <p className="text-sm text-gray-700 font-mono">
                      {(result.commission / 10000).toLocaleString()}万円 × 10% = {(result.tax / 10000).toLocaleString()}万円（税）
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 早見表（シミュレーター直下） */}
            <section className="mb-12">
              <QuickReferenceTable
                title="仲介手数料 早見表"
                description="主要な売買価格に対する仲介手数料の目安です。"
                headers={['売買価格', '仲介手数料（税込）']}
                rows={quickReferenceData}
                note="※上記は上限額です。実際の手数料は不動産会社との契約内容により異なる場合があります。"
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
                    仲介手数料とは
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#calculation" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    計算方法（速算式）
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#rate" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    正式な料率
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#revision2024" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    2024年法改正について
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#example" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    具体的な計算例
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#timing" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    支払いのタイミング
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#type" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    両手仲介と片手仲介
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#free" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    仲介手数料がかからないケース
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#difference" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    売買と賃貸の違い
                  </a>
                </li>
                <li>
                  <a href="#points" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    仲介手数料の知っておきたいポイント
                  </a>
                </li>
              </ol>
            </nav>

            {/* 解説セクション */}
            <section className="mb-12">
              <h2 id="about" className="text-xl font-bold text-gray-900 mb-4">
                仲介手数料とは
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                仲介手数料とは、不動産売買の際に、売主・買主と不動産会社との間で仲介契約を結び、取引が成立した場合に不動産会社に支払う報酬のことです。
                不動産会社は物件の紹介、内見の手配、契約書類の作成、価格交渉のサポートなど、取引全体をサポートする対価として仲介手数料を受け取ります。
              </p>

              <h3 id="calculation" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                計算方法（速算式）
              </h3>
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

              <h3 id="rate" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                正式な料率
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>200万円以下の部分：5%</li>
                <li>200万円超〜400万円以下の部分：4%</li>
                <li>400万円超の部分：3%</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                速算式「3%+6万円」は、上記の料率を一括で計算できる便利な公式です。
              </p>

              <h3 id="revision2024" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                2024年法改正について
              </h3>
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
                この特例は、依頼者への事前説明と合意が必要です。本シミュレーターでは通常の計算式で算出していますので、800万円以下の物件については不動産会社にご確認ください。
              </p>
              <p className="text-xs text-gray-500">
                参照：
                <a
                  href="https://biz.homes.jp/column/topics-00146"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  LIFULL HOME'S「800万円以下の不動産契約で仲介手数料見直し」
                </a>
              </p>

              <h3 id="example" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                具体的な計算例
              </h3>
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

              <h3 id="timing" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                支払いのタイミング
              </h3>
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

              <h3 id="type" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                両手仲介と片手仲介
              </h3>
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

              <h3 id="free" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                仲介手数料がかからないケース
              </h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                以下のケースでは仲介手数料が発生しません。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>売主から直接購入する場合（売主物件）</li>
                <li>不動産会社が売主の場合（自社物件）</li>
                <li>個人間で直接取引する場合</li>
              </ul>

              <h3 id="difference" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                売買と賃貸の違い
              </h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                仲介手数料は売買と賃貸で計算方法が異なります。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><span className="font-medium">売買</span>：売買価格に応じた料率（本ページの計算式）</li>
                <li><span className="font-medium">賃貸</span>：家賃の1ヶ月分が上限（貸主・借主合わせて）</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                本シミュレーターは売買の仲介手数料を計算するためのツールです。
              </p>
            </section>

            {/* 関連ツール - ツールが増えたら表示 */}
            {/*
            <section id="related" className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">関連ツール</h2>
              <div className="space-y-3">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-700">
                        {tool.name}
                      </p>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                  </Link>
                ))}
              </div>
            </section>
            */}

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
