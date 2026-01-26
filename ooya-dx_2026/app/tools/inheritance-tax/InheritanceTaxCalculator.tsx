'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable3Col, QuickReferenceRow3Col } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import {
  calculateInheritanceTax,
  INHERITANCE_TAX_QUICK_TABLE,
  INHERITANCE_TAX_QUICK_TABLE_NO_SPOUSE,
  formatManYen,
} from '@/lib/calculators/inheritanceTax'

interface GlossaryItem {
  slug: string
  title: string
}

interface InheritanceTaxCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// 早見表データ（3列：遺産総額・配偶者あり・配偶者なし）
// =================================================================
const quickReferenceData: QuickReferenceRow3Col[] = INHERITANCE_TAX_QUICK_TABLE.map((row, index) => ({
  label: formatManYen(row.assets),
  value1: formatManYen(row.tax),
  value2: formatManYen(INHERITANCE_TAX_QUICK_TABLE_NO_SPOUSE[index].tax),
}))

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '相続税 計算シミュレーション｜早見表・基礎控除対応'

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: '相続税とは', level: 2 },
  { id: 'basic-deduction', title: '基礎控除の計算', level: 3 },
  { id: 'calculation', title: '相続税の計算方法', level: 3 },
  { id: 'tax-rate', title: '税率表（速算表）', level: 3 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function InheritanceTaxCalculator({ relatedGlossary = [] }: InheritanceTaxCalculatorProps) {
  // 入力状態（万円単位で入力を受け付ける）
  const [totalAssetsInMan, setTotalAssetsInMan] = useState<number>(0)
  const [debtsInMan, setDebtsInMan] = useState<number>(0)
  const [hasSpouse, setHasSpouse] = useState<boolean>(true)
  const [childCount, setChildCount] = useState<number>(2)

  // 円に変換
  const totalAssetsInYen = totalAssetsInMan * 10000
  const debtsInYen = debtsInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    return calculateInheritanceTax({
      totalAssets: totalAssetsInYen,
      debts: debtsInYen,
      heirs: {
        hasSpouse,
        childCount,
      },
      lifeInsurance: 0,
      retirementBenefit: 0,
    })
  }, [totalAssetsInYen, debtsInYen, hasSpouse, childCount])

  // 入力があるかどうか
  const hasInput = totalAssetsInMan > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage={PAGE_TITLE} />

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>
          <p className="text-gray-600 mb-8">
            遺産総額と相続人の人数を入力するだけで、相続税額の目安を概算計算します。
            基礎控除の自動計算に対応しています。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                相続税を概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 遺産総額 */}
              <NumberInput
                label="遺産総額（不動産・預貯金・株式等）"
                value={totalAssetsInMan}
                onChange={setTotalAssetsInMan}
                unit="万円"
                placeholder="例：10000"
              />
              {totalAssetsInMan > 0 && (
                <p className="text-sm text-gray-500">
                  = {totalAssetsInMan.toLocaleString('ja-JP')}万円（{totalAssetsInYen.toLocaleString('ja-JP')}円）
                </p>
              )}

              {/* 債務・葬式費用 */}
              <NumberInput
                label="債務・葬式費用（控除）"
                value={debtsInMan}
                onChange={setDebtsInMan}
                unit="万円"
                placeholder="例：500"
              />

              {/* 配偶者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配偶者
                </label>
                <select
                  value={hasSpouse ? 'yes' : 'no'}
                  onChange={(e) => setHasSpouse(e.target.value === 'yes')}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="yes">あり</option>
                  <option value="no">なし</option>
                </select>
              </div>

              {/* 子の人数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  子の人数
                </label>
                <select
                  value={childCount}
                  onChange={(e) => setChildCount(Number(e.target.value))}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}人</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ※法定相続人の数により基礎控除額が変動します
                </p>
              </div>

            </div>

            {/* 結果エリア */}
            <div className="bg-white rounded-lg p-4">
              <div className="grid grid-cols-2 gap-y-3 text-base">
                <span className="text-gray-600">遺産総額</span>
                <span className="text-right text-lg font-medium">{(result.totalAssets / 10000).toLocaleString('ja-JP')}万円</span>

                {result.debts > 0 && (
                  <>
                    <span className="text-gray-600">債務・葬式費用</span>
                    <span className="text-right text-lg font-medium text-red-600">-{(result.debts / 10000).toLocaleString('ja-JP')}万円</span>
                  </>
                )}


                <span className="text-gray-600 border-t pt-3">正味の遺産額</span>
                <span className="text-right text-lg font-medium border-t pt-3">{(result.netAssets / 10000).toLocaleString('ja-JP')}万円</span>

                <span className="text-gray-600">法定相続人</span>
                <span className="text-right text-lg font-medium">{result.legalHeirCount}人</span>

                <span className="text-gray-600">基礎控除額</span>
                <span className="text-right text-lg font-medium text-red-600">-{(result.basicDeduction / 10000).toLocaleString('ja-JP')}万円</span>

                <span className="text-gray-600 border-t pt-3">課税遺産総額</span>
                <span className="text-right text-lg font-medium border-t pt-3">{(result.taxableEstate / 10000).toLocaleString('ja-JP')}万円</span>

                {/* メイン結果 */}
                <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">相続税の総額（概算）</span>
                <span className="text-right text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
                  {(result.totalTax / 10000).toLocaleString('ja-JP')}万円
                </span>

                {result.appliedRates.length > 0 && (
                  <>
                    <span className="text-sm text-gray-500">適用税率</span>
                    <span className="text-right text-sm text-gray-500">{result.appliedRates.join('、')}</span>
                  </>
                )}
              </div>

              {/* 計算式表示 */}
              {hasInput && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>【基礎控除】3,000万円 + 600万円 × {result.legalHeirCount}人 = {(result.basicDeduction / 10000).toLocaleString()}万円</p>
                    <p>【課税遺産総額】{(result.netAssets / 10000).toLocaleString()}万円 - {(result.basicDeduction / 10000).toLocaleString()}万円 = {(result.taxableEstate / 10000).toLocaleString()}万円</p>
                    {result.totalTax > 0 && (
                      <p>【相続税の総額】法定相続分で按分して税額計算 → {(result.totalTax / 10000).toLocaleString()}万円</p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              早見表（シミュレーター直下）
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable3Col
              title="相続税額の早見表"
              description="相続人が配偶者+子2人、または子2人のみの場合の相続税額の目安です。"
              headers={[
                '遺産総額',
                { title: '配偶者あり', sub: '配偶者+子2人' },
                { title: '配偶者なし', sub: '子2人のみ' },
              ]}
              rows={quickReferenceData}
              note="※配偶者ありは税額軽減（法定相続分または1億6千万円まで非課税）適用後の概算値です"
            />
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
              相続税とは、亡くなった方（被相続人）から財産を相続した際に、
              相続人に課される税金です。不動産、預貯金、株式、生命保険金など、
              相続によって取得した財産の合計額に基づいて計算されます。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              相続税には<strong>基礎控除</strong>があり、遺産総額が基礎控除額以下の場合は
              原則として申告も納税も不要とされています。
              2015年の税制改正により基礎控除額が引き下げられ、相続税の課税対象者が増加しています。
            </p>

            <SectionHeading id="basic-deduction" items={tocItems} />
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center">
                基礎控除額 = 3,000万円 + 600万円 × 法定相続人の数
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              例えば、配偶者と子2人の合計3人が法定相続人の場合：
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                3,000万円 + 600万円 × 3人 = <strong>4,800万円</strong>
              </p>
            </div>

            <SectionHeading id="calculation" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              相続税は、以下の手順で計算されます。
            </p>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
              <li>遺産総額を算出（不動産評価額 + 預貯金 + 株式等）</li>
              <li>債務・葬式費用を控除し、正味の遺産額を算出</li>
              <li>基礎控除額を差し引き、課税遺産総額を算出</li>
              <li>法定相続分で按分し、各相続人の取得金額を仮計算</li>
              <li>各相続人の取得金額に税率を適用し、税額を合計</li>
              <li>実際の分割割合に応じて税額を按分</li>
            </ol>
            <p className="text-sm text-gray-500 mb-4">
              ※本シミュレーターは上記のうち1～5までの概算計算を行います
            </p>

            <SectionHeading id="tax-rate" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              相続税の税率は、法定相続分に応ずる取得金額に応じて10%から55%の累進税率が適用されます。
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-collapse">
                <caption className="text-left font-medium text-gray-900 mb-2">
                  相続税の速算表
                </caption>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">法定相続分に応ずる取得金額</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">税率</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">控除額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-3 py-2">1,000万円以下</td><td className="border border-gray-300 px-3 py-2 text-center">10%</td><td className="border border-gray-300 px-3 py-2 text-center">-</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">3,000万円以下</td><td className="border border-gray-300 px-3 py-2 text-center">15%</td><td className="border border-gray-300 px-3 py-2 text-center">50万円</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">5,000万円以下</td><td className="border border-gray-300 px-3 py-2 text-center">20%</td><td className="border border-gray-300 px-3 py-2 text-center">200万円</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">1億円以下</td><td className="border border-gray-300 px-3 py-2 text-center">30%</td><td className="border border-gray-300 px-3 py-2 text-center">700万円</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">2億円以下</td><td className="border border-gray-300 px-3 py-2 text-center">40%</td><td className="border border-gray-300 px-3 py-2 text-center">1,700万円</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">3億円以下</td><td className="border border-gray-300 px-3 py-2 text-center">45%</td><td className="border border-gray-300 px-3 py-2 text-center">2,700万円</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">6億円以下</td><td className="border border-gray-300 px-3 py-2 text-center">50%</td><td className="border border-gray-300 px-3 py-2 text-center">4,200万円</td></tr>
                  <tr><td className="border border-gray-300 px-3 py-2">6億円超</td><td className="border border-gray-300 px-3 py-2 text-center">55%</td><td className="border border-gray-300 px-3 py-2 text-center">7,200万円</td></tr>
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

          {/* =================================================================
              参考リンク（エビデンス）
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">参考リンク</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4152.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.4152 相続税の計算（国税庁）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4155.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.4155 相続税の税率（国税庁）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4158.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.4158 配偶者の税額の軽減（国税庁）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4124.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.4124 小規模宅地等の特例（国税庁）
                </a>
              </li>
            </ul>
          </div>

          {/* 免責事項 */}
          <ToolDisclaimer infoDate="2026年1月" lastUpdated="2026年1月18日" />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/inheritance-tax" />

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
