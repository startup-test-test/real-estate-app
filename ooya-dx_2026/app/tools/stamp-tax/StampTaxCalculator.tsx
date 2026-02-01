'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Info, AlertTriangle, FileText, CheckCircle } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import {
  calculateStampTax,
  ContractType,
  SellerType,
  formatYen,
  formatTax,
} from '@/lib/calculators/stampTax'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

interface GlossaryItem {
  slug: string
  title: string
}

interface StampTaxCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// =================================================================
// 統合早見表データ
// =================================================================
interface CombinedQuickRefRow {
  amount: number
  label: string
  realEstate: string
  construction: string
  receipt: string
}

// 統合早見表の金額リスト（共通で使用する金額）
const combinedQuickRefData: CombinedQuickRefRow[] = [
  { amount: 1000000, label: '100万円', realEstate: '500円', construction: '200円', receipt: '200円' },
  { amount: 3000000, label: '300万円', realEstate: '1,000円', construction: '500円', receipt: '600円' },
  { amount: 5000000, label: '500万円', realEstate: '1,000円', construction: '1,000円', receipt: '1,000円' },
  { amount: 10000000, label: '1,000万円', realEstate: '5,000円', construction: '5,000円', receipt: '2,000円' },
  { amount: 20000000, label: '2,000万円', realEstate: '1万円', construction: '1万円', receipt: '4,000円' },
  { amount: 30000000, label: '3,000万円', realEstate: '1万円', construction: '1万円', receipt: '6,000円' },
  { amount: 50000000, label: '5,000万円', realEstate: '1万円', construction: '1万円', receipt: '1万円' },
  { amount: 100000000, label: '1億円', realEstate: '3万円', construction: '3万円', receipt: '2万円' },
]

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産契約の印紙税 計算シミュレーション｜軽減措置・電子契約対応'

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '印紙税とは', level: 2 },
  { id: 'documents', title: '不動産取引で必要な印紙', level: 3 },
  { id: 'reduction', title: '軽減措置について', level: 3 },
  { id: 'electronic', title: '電子契約と印紙税', level: 3 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function StampTaxCalculator({ relatedGlossary = [] }: StampTaxCalculatorProps) {
  // 入力状態
  const [contractType, setContractType] = useState<ContractType>('real_estate_sale')
  const [contractAmountInMan, setContractAmountInMan] = useState<number>(0)
  const [sellerType, setSellerType] = useState<SellerType>('corporation')

  // 円に変換
  const contractAmountInYen = contractAmountInMan * 10000

  // 計算結果（書面契約前提）
  const result = useMemo(() => {
    return calculateStampTax({
      contractType,
      contractAmount: contractAmountInYen,
      contractFormat: 'paper',
      isTaxExcluded: true,
      sellerType: contractType === 'receipt' ? sellerType : undefined,
    })
  }, [contractType, contractAmountInYen, sellerType])

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
              const toolInfo = getToolInfo('/tools/stamp-tax')
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
            契約金額を入力するだけで、不動産売買契約書・建設工事請負契約書・領収書の印紙税額を概算計算します。
            軽減措置に対応しています。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                印紙税を概算計算する
              </h2>
            </div>

            {/* 入力エリア */}
            <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
              {/* 契約の種類 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  契約の種類
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as ContractType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="real_estate_sale">不動産売買契約書（第1号文書）</option>
                  <option value="construction_work">建設工事請負契約書（第2号文書）</option>
                  <option value="receipt">領収書（第17号文書）</option>
                </select>
              </div>

              {/* 契約金額 */}
              <NumberInput
                label={contractType === 'receipt' ? '受取金額' : '契約金額'}
                value={contractAmountInMan}
                onChange={setContractAmountInMan}
                unit="万円"
                placeholder="例：3000"
              />
              {contractAmountInMan > 0 && (
                <p className="text-sm text-gray-500">
                  = {contractAmountInMan.toLocaleString('ja-JP')}万円（{contractAmountInYen.toLocaleString('ja-JP')}円）
                </p>
              )}

              {/* 売主属性（領収書の場合のみ） */}
              {contractType === 'receipt' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    領収書発行者
                  </label>
                  <select
                    value={sellerType}
                    onChange={(e) => setSellerType(e.target.value as SellerType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="corporation">法人</option>
                    <option value="individual_business">個人（投資用・事業用不動産の売却）</option>
                    <option value="individual_home">個人（マイホームの売却）</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    ※個人のマイホーム売却は「営業に関しない受取書」として非課税となる場合があります
                  </p>
                </div>
              )}
            </div>

            {/* 結果エリア */}
            <div className="bg-white rounded-lg p-4">
              <div className="grid grid-cols-2 gap-y-3 text-base">
                <span className="text-gray-600">契約の種類</span>
                <span className="text-right text-sm font-medium">{result.contractTypeName}</span>

                <span className="text-gray-600">{contractType === 'receipt' ? '受取金額' : '契約金額'}</span>
                <span className="text-right text-lg font-medium">{formatYen(result.contractAmount)}</span>

                {/* 営業に関しない受取書で非課税の場合 */}
                {result.isNonBusinessExempt && (
                  <>
                    <span className="text-gray-700 font-medium border-t-2 border-green-300 pt-4 mt-2">印紙税額</span>
                    <span className="text-right text-2xl font-bold text-green-600 border-t-2 border-green-300 pt-4 mt-2 flex items-center justify-end gap-2">
                      <CheckCircle className="w-5 h-5" />
                      0円（非課税）
                    </span>
                  </>
                )}

                {/* 通常の課税の場合 */}
                {!result.isNonBusinessExempt && (
                  <>
                    {result.isReduced && (
                      <>
                        <span className="text-gray-600 border-t pt-3">本則税額</span>
                        <span className="text-right text-sm text-gray-500 line-through border-t pt-3">
                          {formatTax(result.standardTaxAmount)}
                        </span>

                        <span className="text-gray-600">軽減額</span>
                        <span className="text-right text-sm text-green-600">
                          -{result.reductionAmount.toLocaleString('ja-JP')}円
                        </span>
                      </>
                    )}

                    <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">
                      印紙税額{result.isReduced ? '（軽減後）' : ''}
                    </span>
                    <span className="text-right text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
                      {result.stampTaxAmount === 0 ? '非課税' : `${result.stampTaxAmount.toLocaleString('ja-JP')}円`}
                    </span>
                  </>
                )}
              </div>

              {/* 計算式表示 */}
              {contractAmountInMan > 0 && !result.isNonBusinessExempt && result.stampTaxAmount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">適用区分</p>
                  <div className="text-sm text-gray-700 font-mono space-y-1">
                    <p>【契約金額】{formatYen(result.contractAmount)}</p>
                    <p>【文書種類】{result.contractTypeName}</p>
                    {result.isReduced ? (
                      <p>【税額】本則{formatTax(result.standardTaxAmount)} → 軽減{formatTax(result.stampTaxAmount)}</p>
                    ) : (
                      <p>【税額】{formatTax(result.stampTaxAmount)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 注意事項 */}
            {result.notes.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">ご確認ください</p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      {result.notes.map((note, index) => (
                        <li key={index}>・{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* =================================================================
              統合早見表
          ================================================================= */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              印紙税額 早見表
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              軽減税率適用時の金額の目安です。詳細は<a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/inshi/7140.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">国税庁サイト</a>をご確認ください。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">金額</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">売買契約書</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">工事請負</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">領収書</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedQuickRefData.map((row, index) => (
                    <tr key={row.amount} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 text-gray-900">{row.label}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-600">{row.realEstate}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-600">{row.construction}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-600">{row.receipt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※概算値です。詳細は税務署等にご確認ください
            </p>
          </div>

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
              印紙税とは、契約書や領収書など特定の文書（課税文書）を作成した際に課される国税とされています。
              不動産取引においては、売買契約書、建設工事請負契約書、売却代金の領収書などが課税対象となる場合があります。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              税額は文書の種類と記載金額によって異なり、収入印紙を購入して文書に貼付し、消印することで納税する方法が多いとされています。
            </p>

            <SectionHeading id="documents" items={tocItems} />
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">第1号文書：不動産売買契約書</h4>
                <p className="text-sm text-gray-700">
                  土地・建物の売買契約書が該当するとされています。軽減措置が設けられており、
                  契約金額10万円超から軽減税率が適用される場合があります。
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">第2号文書：建設工事請負契約書</h4>
                <p className="text-sm text-gray-700">
                  住宅の建築やリフォーム工事の契約書が該当するとされています。軽減措置は契約金額100万円超から適用される場合があります。
                  設計契約が含まれる場合でも、工事契約と一体であれば建設工事請負として扱われることがあります。
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">第17号文書：領収書</h4>
                <p className="text-sm text-gray-700">
                  不動産売却代金の領収書が該当するとされています。受取金額5万円以上で課税対象となる場合があります。
                  ただし、個人がマイホーム（居住用財産）を売却した場合の領収書は「営業に関しない受取書」として非課税となる場合があるとされています。
                </p>
              </div>
            </div>

            <SectionHeading id="reduction" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産売買契約書と建設工事請負契約書には、租税特別措置法による軽減措置が設けられているとされています。
              適用期間や条件の詳細は<a href="https://www.nta.go.jp/publication/pamph/inshi/pdf/0020003-096.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">国税庁のサイト</a>をご確認ください。
            </p>

            <SectionHeading id="electronic" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              電子契約（PDF等の電磁的記録）で契約を締結した場合、印紙税法上の「課税文書の作成」に該当しないとされており、
              印紙税が課されない場合があります。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              これは2005年の国会答弁で政府見解として示されています。
              詳細な取扱いについては、税務署等にご確認ください。
            </p>

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
              参考リンク
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">参考リンク</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/inshi/7140.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.7140 印紙税額の一覧表（国税庁）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/publication/pamph/inshi/pdf/0020003-096.pdf" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → 印紙税の軽減措置について（国税庁パンフレット）
                </a>
              </li>
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/inshi/7105.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.7105 金銭又は有価証券の受取書、領収書（国税庁）
                </a>
              </li>
            </ul>
          </div>

          {/* 免責事項 */}
          <ToolDisclaimer />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/stamp-tax" />

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
