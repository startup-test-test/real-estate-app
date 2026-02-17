'use client'

import React, { useState, useMemo } from 'react'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { TableOfContents, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
// import { calculateXxx } from '@/lib/calculators/xxx'

// =================================================================
// 【変更箇所1】ページタイトル（パンくず・H1で共通使用）
// =================================================================
const PAGE_TITLE = '【ツール名】を10秒で無料計算｜早見表付き'

// =================================================================
// 【変更箇所2】目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '【ツール名】とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'example', title: '具体的な計算例', level: 3 },
]

// =================================================================
// 【変更箇所3】早見表データ
// =================================================================
const quickReferenceData: QuickReferenceRow[] = [
  { label: '例：1,000万円', value: '〇〇万円', subValue: '補足情報' },
  { label: '例：2,000万円', value: '〇〇万円', subValue: '補足情報' },
  // 必要に応じて追加
]

// =================================================================
// メインコンポーネント（ToolPageLayoutで2カラム構成）
// =================================================================
export function TemplateCalculator() {
  return (
    <ToolPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/template-demo"
      publishDate="2026年1月15日"
      lastUpdated="2026年1月15日"
      additionalContent={<TemplateAdditionalContent />}
    >
      <TemplateSimulator />
    </ToolPageLayout>
  )
}

// =================================================================
// 【変更箇所4】シミュレーター本体
// =================================================================
function TemplateSimulator() {
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

      {/* 【変更箇所5】入力エリア */}
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

      {/* 【変更箇所6】計算式の説明（オプション） */}
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

      {/* 【変更箇所7】結果エリア */}
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
  )
}

// =================================================================
// 【変更箇所8】追加コンテンツ（早見表・解説・FAQ等）
// ToolPageLayout の additionalContent に渡される
// =================================================================
function TemplateAdditionalContent() {
  return (
    <>
      {/* 早見表 */}
      <section className="mb-12">
        <QuickReferenceTable
          title="【ツール名】早見表"
          description="主要な〇〇に対する△△の目安です。"
          headers={['〇〇', '△△']}
          rows={quickReferenceData}
          note="※注意事項があればここに記載"
        />
      </section>

      {/* 目次 */}
      <TableOfContents items={tocItems} />

      {/* 解説セクション */}
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
    </>
  )
}
