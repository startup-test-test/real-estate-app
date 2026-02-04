'use client'

import { useState } from 'react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow, QuickReferenceTable3Col } from '@/components/tools/QuickReferenceTable'
import { ResultCard } from '@/components/tools/ResultCard'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'

// サンプルデータ
const sampleQuickRef: QuickReferenceRow[] = [
  { label: '1,000万円', value: '39.6万円', subValue: '税抜36万円' },
  { label: '2,000万円', value: '72.6万円', subValue: '税抜66万円' },
  { label: '3,000万円', value: '105.6万円', subValue: '税抜96万円' },
]

const sampleTocItems: TocItem[] = [
  { id: 'about', title: '仲介手数料とは', level: 2 },
  { id: 'calculation', title: '計算方法（速算式）', level: 3 },
  { id: 'rate', title: '正式な料率', level: 3 },
  { id: 'payment', title: '支払いと仕組み', level: 2 },
  { id: 'timing', title: '支払いのタイミング', level: 3 },
]

// 3列早見表のサンプルデータ
const sample3ColData = [
  { label: '100万円', value1: '0万円', value2: '0万円' },
  { label: '200万円', value1: '9万円', value2: '9万円' },
  { label: '300万円', value1: '19万円', value2: '19万円' },
  { label: '500万円', value1: '48.5万円', value2: '53万円' },
]

export function ComponentShowcase() {
  const [sampleValue, setSampleValue] = useState<number>(3000)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
      <div className="h-[52px] sm:h-[64px] md:h-[80px]"></div>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            コンポーネント一覧
          </h1>
          <p className="text-gray-600 mb-8">
            シミュレーター用の共通コンポーネント（開発者用・noindex）
          </p>

          {/* ToolsBreadcrumb */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">1. ToolsBreadcrumb</h2>
            <p className="text-sm text-gray-600 mb-4">パンくずリスト</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <ToolsBreadcrumb currentPage="贈与税シミュレーター" />
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<ToolsBreadcrumb currentPage="贈与税シミュレーター" />`}
            </pre>
          </section>

          {/* NumberInput */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">2. NumberInput</h2>
            <p className="text-sm text-gray-600 mb-4">数値入力フィールド（カンマ区切り対応）</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-w-md">
              <NumberInput
                label="売買価格"
                value={sampleValue}
                onChange={setSampleValue}
                unit="万円"
                placeholder="0"
              />
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<NumberInput
  label="売買価格"
  value={priceInMan}
  onChange={setPriceInMan}
  unit="万円"
/>`}
            </pre>
          </section>

          {/* ResultCard */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">3. ResultCard</h2>
            <p className="text-sm text-gray-600 mb-4">計算結果カード</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <ResultCard
                  label="仲介手数料（税抜）"
                  value={960000}
                  unit="円"
                />
                <ResultCard
                  label="仲介手数料（税込）"
                  value={1056000}
                  unit="円"
                  highlight={true}
                  subText="消費税: 96,000円"
                />
              </div>
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<ResultCard
  label="仲介手数料（税込）"
  value={1056000}
  unit="円"
  highlight={true}
  subText="消費税: 96,000円"
/>`}
            </pre>
          </section>

          {/* QuickReferenceTable */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">4. QuickReferenceTable</h2>
            <p className="text-sm text-gray-600 mb-4">早見表</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <QuickReferenceTable
                title="仲介手数料早見表"
                description="売買価格別の仲介手数料上限（税込）"
                headers={['売買価格', '仲介手数料（税込）']}
                rows={sampleQuickRef}
                note="※上記は法定上限額です"
              />
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<QuickReferenceTable
  title="仲介手数料早見表"
  headers={['売買価格', '仲介手数料（税込）']}
  rows={data}
  note="※上記は法定上限額です"
/>`}
            </pre>
          </section>

          {/* QuickReferenceTable3Col */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">4-2. QuickReferenceTable3Col</h2>
            <p className="text-sm text-gray-600 mb-4">早見表（3列・比較用）</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <QuickReferenceTable3Col
                title="贈与税額早見表（暦年課税）"
                description="基礎控除110万円を差し引いた後の税額"
                headers={[
                  '贈与金額',
                  { title: '特例税率', sub: '父母・祖父母→子・孫' },
                  { title: '一般税率', sub: 'その他の贈与' },
                ]}
                rows={sample3ColData}
                note="※特例税率は贈与を受けた年の1月1日時点で18歳以上の場合に適用"
              />
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<QuickReferenceTable3Col
  title="贈与税額早見表"
  headers={[
    '贈与金額',
    { title: '特例税率', sub: '父母・祖父母→子・孫' },
    { title: '一般税率', sub: 'その他の贈与' },
  ]}
  rows={[
    { label: '100万円', value1: '0万円', value2: '0万円' },
    ...
  ]}
/>`}
            </pre>
          </section>

          {/* TableOfContents */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">5. TableOfContents</h2>
            <p className="text-sm text-gray-600 mb-4">目次（連番自動付与）</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-w-lg">
              <TableOfContents items={sampleTocItems} />
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`const tocItems: TocItem[] = [
  { id: 'about', title: '仲介手数料とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
]

<TableOfContents items={tocItems} />`}
            </pre>
          </section>

          {/* SectionHeading */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">6. SectionHeading</h2>
            <p className="text-sm text-gray-600 mb-4">セクション見出し（連番自動付与）</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <SectionHeading id="about" items={sampleTocItems} />
                  <p className="text-gray-600 text-sm mt-2">h2として出力（1. 仲介手数料とは）</p>
                </div>
                <div className="border-b pb-2">
                  <SectionHeading id="calculation" items={sampleTocItems} />
                  <p className="text-gray-600 text-sm mt-2">h3として出力（1-1. 計算方法（速算式））</p>
                </div>
                <div>
                  <SectionHeading id="payment" items={sampleTocItems} />
                  <p className="text-gray-600 text-sm mt-2">h2として出力（2. 支払いと仕組み）</p>
                </div>
              </div>
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<SectionHeading id="about" items={tocItems} />
// → <h2>1. 仲介手数料とは</h2>

<SectionHeading id="calculation" items={tocItems} />
// → <h3>1-1. 計算方法（速算式）</h3>`}
            </pre>
          </section>

          {/* CalculatorNote */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">7. CalculatorNote</h2>
            <p className="text-sm text-gray-600 mb-4">シミュレーター直下の注記</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-w-lg">
              <CalculatorNote />
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<CalculatorNote />`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">配置: シミュレーターボックスの直後</p>
          </section>

          {/* ToolDisclaimer */}
          <section className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">8. ToolDisclaimer</h2>
            <p className="text-sm text-gray-600 mb-4">記事末尾の免責事項</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-w-lg">
              <ToolDisclaimer
                lastUpdated="2026年1月17日"
                infoDate="2025年1月"
                additionalItems={['金利は金融機関により異なります']}
              />
            </div>
            <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`<ToolDisclaimer
  lastUpdated="2026年1月17日"
  infoDate="2025年1月"
  additionalItems={['金利は金融機関により異なります']}
/>`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">配置: 記事末尾、CTAの直前</p>
          </section>

          {/* 関連リンク */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">関連ドキュメント</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-600">コンポーネント一覧:</span>{' '}
                <code className="bg-white px-2 py-0.5 rounded text-xs">docs/07_SEO_シミュレーター/コンポーネント一覧.md</code>
              </li>
              <li>
                <span className="text-gray-600">作成手順:</span>{' '}
                <code className="bg-white px-2 py-0.5 rounded text-xs">docs/07_SEO_シミュレーター/シミュレーター作成手順.md</code>
              </li>
              <li>
                <span className="text-gray-600">見出しルール:</span>{' '}
                <code className="bg-white px-2 py-0.5 rounded text-xs">docs/07_SEO_シミュレーター/見出し構造ルール.md</code>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
