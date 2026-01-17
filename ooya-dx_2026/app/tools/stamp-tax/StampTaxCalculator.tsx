'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Info, AlertTriangle, FileText, CheckCircle } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import {
  calculateStampTax,
  ContractType,
  ContractFormat,
  SellerType,
  REAL_ESTATE_SALE_QUICK_REFERENCE,
  CONSTRUCTION_WORK_QUICK_REFERENCE,
  RECEIPT_QUICK_REFERENCE,
  formatYen,
  formatTax,
} from '@/lib/calculators/stampTax'

// =================================================================
// 早見表データ
// =================================================================
const realEstateSaleQuickRef: QuickReferenceRow[] = REAL_ESTATE_SALE_QUICK_REFERENCE.map(row => ({
  label: formatYen(row.amount),
  value: formatTax(row.reduced),
  subValue: row.reduced !== row.standard ? `本則${formatTax(row.standard)}` : undefined,
}))

const constructionWorkQuickRef: QuickReferenceRow[] = CONSTRUCTION_WORK_QUICK_REFERENCE.map(row => ({
  label: formatYen(row.amount),
  value: formatTax(row.reduced),
  subValue: row.reduced !== row.standard ? `本則${formatTax(row.standard)}` : undefined,
}))

const receiptQuickRef: QuickReferenceRow[] = RECEIPT_QUICK_REFERENCE.map(row => ({
  label: formatYen(row.amount),
  value: formatTax(row.standard),
}))

// =================================================================
// 目次項目
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '印紙税とは', level: 2 },
  { id: 'documents', title: '不動産取引で必要な印紙', level: 3 },
  { id: 'reduction', title: '軽減措置について', level: 3 },
  { id: 'electronic', title: '電子契約と印紙税', level: 3 },
  { id: 'penalty', title: '貼り忘れのペナルティ', level: 3 },
]

// =================================================================
// メインコンポーネント
// =================================================================
export function StampTaxCalculator() {
  // 入力状態
  const [contractType, setContractType] = useState<ContractType>('real_estate_sale')
  const [contractAmountInMan, setContractAmountInMan] = useState<number>(0)
  const [contractFormat, setContractFormat] = useState<ContractFormat>('paper')
  const [sellerType, setSellerType] = useState<SellerType>('corporation')

  // 円に変換
  const contractAmountInYen = contractAmountInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    return calculateStampTax({
      contractType,
      contractAmount: contractAmountInYen,
      contractFormat,
      isTaxExcluded: true,
      sellerType: contractType === 'receipt' ? sellerType : undefined,
    })
  }, [contractType, contractAmountInYen, contractFormat, sellerType])

  // 電子契約との比較用
  const paperResult = useMemo(() => {
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
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              ホーム
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <Link href="/tools" className="hover:text-primary-600">
              計算ツール
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <span className="text-gray-900">印紙税シミュレーター</span>
          </nav>

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            不動産契約の印紙税を10秒で無料計算｜軽減措置・電子契約対応
          </h1>
          <p className="text-gray-600 mb-8">
            契約金額を入力するだけで、不動産売買契約書・建設工事請負契約書・領収書の印紙税額を概算計算します。
            2027年3月末までの軽減措置に対応。
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

              {/* 契約形態 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  契約形態
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contractFormat"
                      value="paper"
                      checked={contractFormat === 'paper'}
                      onChange={() => setContractFormat('paper')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">書面契約（紙）</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contractFormat"
                      value="electronic"
                      checked={contractFormat === 'electronic'}
                      onChange={() => setContractFormat('electronic')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">電子契約（PDF等）</span>
                  </label>
                </div>
              </div>

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

                {/* 電子契約で非課税の場合 */}
                {result.isElectronicExempt && (
                  <>
                    <span className="text-gray-700 font-medium border-t-2 border-green-300 pt-4 mt-2">印紙税額</span>
                    <span className="text-right text-2xl font-bold text-green-600 border-t-2 border-green-300 pt-4 mt-2 flex items-center justify-end gap-2">
                      <CheckCircle className="w-5 h-5" />
                      0円（非課税）
                    </span>
                  </>
                )}

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
                {!result.isElectronicExempt && !result.isNonBusinessExempt && (
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
              {contractAmountInMan > 0 && !result.isElectronicExempt && !result.isNonBusinessExempt && result.stampTaxAmount > 0 && (
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

              {/* 参考情報（書面契約の場合のみ） */}
              {contractFormat === 'paper' && paperResult.stampTaxAmount > 0 && !result.isNonBusinessExempt && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">
                        電子契約（PDF等）の場合、印紙税法上の課税文書に該当しないとされています。
                        詳細は税務署等にご確認ください。
                      </p>
                    </div>
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
              早見表（不動産売買契約書）
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="不動産売買契約書の印紙税額早見表"
              description="2027年3月31日までの軽減税率適用時の金額です。"
              headers={['契約金額', '印紙税額（軽減後）']}
              rows={realEstateSaleQuickRef}
              note="※概算値です。詳細は税務署等にご確認ください"
            />
          </section>

          {/* =================================================================
              早見表（建設工事請負契約書）
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="建設工事請負契約書の印紙税額早見表"
              description="2027年3月31日までの軽減税率適用時の金額です。100万円超から軽減措置が適用される場合があります。"
              headers={['契約金額', '印紙税額（軽減後）']}
              rows={constructionWorkQuickRef}
              note="※概算値です。詳細は税務署等にご確認ください"
            />
          </section>

          {/* =================================================================
              早見表（領収書）
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="領収書の印紙税額早見表"
              description="法人または個人事業者が発行する領収書の税額の目安です。"
              headers={['受取金額', '印紙税額']}
              rows={receiptQuickRef}
              note="※概算値です。詳細は税務署等にご確認ください"
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
              印紙税とは、契約書や領収書など特定の文書（課税文書）を作成した際に課される国税とされています。
              不動産取引においては、売買契約書、建設工事請負契約書、売却代金の領収書などが課税対象となる場合があります。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              税額は文書の種類と記載金額によって異なり、一般的に収入印紙を購入して文書に貼付し、消印することで納税するとされています。
            </p>

            <SectionHeading id="documents" items={tocItems} />
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">第1号文書：不動産売買契約書</h4>
                <p className="text-sm text-gray-700">
                  土地・建物の売買契約書が該当するとされています。2027年3月31日まで軽減措置が設けられており、
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
                  不動産売却代金の領収書が該当するとされています。一般的に受取金額5万円以上で課税対象となる場合があります。
                  ただし、個人がマイホーム（居住用財産）を売却した場合の領収書は「営業に関しない受取書」として非課税となる場合があるとされています。
                </p>
              </div>
            </div>

            <SectionHeading id="reduction" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              不動産売買契約書と建設工事請負契約書には、租税特別措置法による軽減措置が設けられているとされています。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">軽減措置の適用期間</p>
                  <p className="text-sm text-blue-700 mt-1">
                    2014年4月1日〜<strong>2027年3月31日</strong>まで
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>・不動産売買契約書：契約金額<strong>10万円超</strong>から適用</li>
                    <li>・建設工事請負契約書：契約金額<strong>100万円超</strong>から適用</li>
                  </ul>
                </div>
              </div>
            </div>

            <SectionHeading id="electronic" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              電子契約（PDF等の電磁的記録）で契約を締結した場合、印紙税法上の「課税文書の作成」に該当しないとされており、
              印紙税が課されない場合があります。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              これは2005年の国会答弁で政府見解として示されています。
              詳細な取扱いについては、税務署等にご確認ください。
            </p>

            <SectionHeading id="penalty" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              印紙の貼り忘れや金額不足があった場合、以下のようなペナルティが課される場合があるとされています。
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <ul className="text-sm text-red-700 space-y-2">
                <li>
                  <strong>税務調査で指摘された場合</strong><br />
                  本来の税額の約3倍程度（本来の税額＋2倍の過怠税）とされています
                </li>
                <li>
                  <strong>自主的に申し出た場合</strong><br />
                  本来の税額の約1.1倍程度とされています
                </li>
                <li>
                  <strong>消印漏れの場合</strong><br />
                  貼付した印紙と同額程度の過怠税が課される場合があるとされています
                </li>
              </ul>
            </div>
          </section>

          {/* =================================================================
              参考リンク
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">参考リンク</h3>
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
              <li>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/inshi/7131.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  → No.7131 印紙税を納めなかったとき（国税庁）
                </a>
              </li>
            </ul>
          </div>

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
