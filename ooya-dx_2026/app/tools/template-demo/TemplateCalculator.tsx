'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
// import { calculateXxx } from '@/lib/calculators/xxx'

// =================================================================
// 【変更箇所1】早見表データ
// =================================================================
const quickReferenceData: QuickReferenceRow[] = [
  { label: '例：1,000万円', value: '〇〇万円', subValue: '補足情報' },
  { label: '例：2,000万円', value: '〇〇万円', subValue: '補足情報' },
  // 必要に応じて追加
]

// =================================================================
// 【変更箇所2】関連ツール（ツールが増えたら有効化）
// =================================================================
const relatedTools = [
  { name: '関連ツール1', href: '/tools/xxx', description: '説明文' },
  { name: '関連ツール2', href: '/tools/yyy', description: '説明文' },
]

// =================================================================
// 【変更箇所3】コンポーネント名・入力・計算ロジック
// =================================================================
export function TemplateCalculator() {
  // 入力状態（ツールに応じて追加・変更）
  const [inputValue, setInputValue] = useState<number>(0)

  // 計算結果（useMemoで自動計算）
  const result = useMemo(() => {
    // 計算ロジックをここに実装、または lib/calculators からimport
    // return calculateXxx(inputValue)
    return {
      mainResult: 0,
      tax: 0,
      total: 0,
    }
  }, [inputValue])

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <div className="h-[72px] sm:h-[88px]"></div>

        <main className="flex-1">
          <article className="max-w-2xl mx-auto px-5 py-12">
            {/* =================================================================
                【変更箇所5】パンくず
            ================================================================= */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-primary-600">
                ホーム
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <Link href="/tools" className="hover:text-primary-600">
                計算ツール
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <span className="text-gray-900">【ツール名】</span>
            </nav>

            {/* カテゴリー */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                計算ツール
              </span>
            </div>

            {/* =================================================================
                【変更箇所6】タイトル・説明文
            ================================================================= */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              【ツール名】を10秒で無料計算｜早見表付き
            </h1>
            <p className="text-gray-600 mb-8">
              〇〇を入力するだけで、△△を瞬時に計算します。
            </p>

            {/* =================================================================
                シミュレーター本体
            ================================================================= */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-12 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  今すぐ計算する
                </h2>
              </div>

              {/* =================================================================
                  【変更箇所7】入力エリア
              ================================================================= */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <NumberInput
                  label="〇〇を入力"
                  value={inputValue}
                  onChange={setInputValue}
                  unit="円"
                  placeholder="30,000,000"
                />
                {inputValue > 0 ? (
                  <p className="text-sm text-gray-500 mt-1">
                    = {(inputValue / 10000).toLocaleString('ja-JP')} 万円
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">
                    例：3,000万円 → 結果 約〇〇万円
                  </p>
                )}
              </div>

              {/* =================================================================
                  【変更箇所8】計算式の説明（オプション）
              ================================================================= */}
              {inputValue > 0 && (
                <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">適用条件：</span>
                    〇〇の場合
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    計算式の補足説明
                  </p>
                </div>
              )}

              {/* =================================================================
                  【変更箇所9】結果エリア
              ================================================================= */}
              <div className="space-y-3">
                <ResultCard
                  label="計算結果1"
                  value={result.mainResult}
                  unit="円"
                />
                <ResultCard
                  label="消費税等"
                  value={result.tax}
                  unit="円"
                />
                <ResultCard
                  label="合計"
                  value={result.total}
                  unit="円"
                  highlight={true}
                  subText={
                    result.total > 0
                      ? `= ${(result.total / 10000).toLocaleString('ja-JP')} 万円`
                      : undefined
                  }
                />
              </div>
            </div>

            {/* =================================================================
                【変更箇所10】早見表（シミュレーター直下）
            ================================================================= */}
            <section className="mb-12">
              <QuickReferenceTable
                title="【ツール名】早見表"
                description="主要な〇〇に対する△△の目安です。"
                headers={['〇〇', '△△']}
                rows={quickReferenceData}
                note="※注意事項があればここに記載"
              />
            </section>

            {/* =================================================================
                【変更箇所11】目次
            ================================================================= */}
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
                    【ツール名】とは
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#calculation" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    計算方法
                  </a>
                </li>
                <li className="ml-4">
                  <a href="#example" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                    具体的な計算例
                  </a>
                </li>
              </ol>
            </nav>

            {/* =================================================================
                【変更箇所12】解説セクション
            ================================================================= */}
            <section className="mb-12">
              <h2 id="about" className="text-xl font-bold text-gray-900 mb-4">
                【ツール名】とは
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                〇〇とは、△△の際に発生する費用のことです。
                詳しい説明をここに記載します。
              </p>

              <h3 id="calculation" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                計算方法
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                計算方法の説明をここに記載します。
              </p>

              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="font-mono text-gray-800 text-center">
                  計算式をここに記載
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  ※条件等があれば補足
                </p>
              </div>

              <h3 id="example" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
                具体的な計算例
              </h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                具体例を用いて計算してみましょう。
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>① 条件：〇〇</li>
                  <li>② 計算：△△</li>
                  <li>③ <span className="font-semibold">結果：◇◇</span></li>
                </ul>
              </div>
            </section>

            {/* =================================================================
                関連ツール（ツールが増えたら表示）
            ================================================================= */}
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

            {/* =================================================================
                免責事項（基本変更不要）
            ================================================================= */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">免責事項</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>・本シミュレーターの計算結果は概算値であり、実際の金額は異なる場合があります。</li>
                <li>・本サイトの情報により生じた損害について、当サイト運営者は一切の責任を負いません。</li>
                <li>・最終的な判断は専門家（税理士・宅建業者・司法書士等）にご相談ください。</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                最終更新日: 2026年1月XX日
              </p>
            </div>

            {/* =================================================================
                CTA（基本変更不要）
            ================================================================= */}
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
