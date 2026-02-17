'use client'

import React, { useState, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ContentPageLayout } from '@/components/tools/ContentPageLayout'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable3Col } from '@/components/tools/QuickReferenceTable'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import {
  calculateGiftTax,
  DonorRelation,
  SPECIAL_RATE_TABLE,
  GENERAL_RATE_TABLE,
  formatManYen,
} from '@/lib/calculators/gift-tax'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産の贈与税 計算シミュレーション｜早見表・特例対応'

// =================================================================
// 目次データ
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '贈与税とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'tax-rate', title: '税率表（速算表）', level: 3 },
  { id: 'example', title: '具体的な計算例', level: 3 },
  { id: 'special', title: '主な特例・控除制度', level: 2 },
]

// =================================================================
// シミュレーター部分
// =================================================================
function GiftTaxSimulator() {
  // 入力状態（万円単位で入力を受け付ける）
  const [giftAmountInMan, setGiftAmountInMan] = useState<number>(0)
  const [donorRelation, setDonorRelation] = useState<DonorRelation>('lineal_ascendant_adult')

  // 円に変換
  const giftAmountInYen = giftAmountInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    return calculateGiftTax({
      giftAmount: giftAmountInYen,
      donorRelation,
      applyHousingExemption: false,
      housingType: 'none',
      applySpouseDeduction: false,
    })
  }, [giftAmountInYen, donorRelation])

  // 実効税率（贈与税額 ÷ 贈与金額 × 100）
  const effectiveRate = useMemo(() => {
    if (giftAmountInYen <= 0 || result.taxAmount <= 0) return 0
    return (result.taxAmount / giftAmountInYen) * 100
  }, [giftAmountInYen, result.taxAmount])

  return (
    <>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
        贈与金額を入力するだけで、贈与税額の目安を概算計算します。
        住宅取得資金贈与の非課税特例や配偶者控除（おしどり贈与）にも対応。
      </p>

      {/* シミュレーター本体 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            贈与税を概算計算する
          </h2>
        </div>

        {/* 入力エリア */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 space-y-4">
          {/* 贈与金額 */}
          <NumberInput
            label="贈与金額（不動産評価額など）"
            value={giftAmountInMan}
            onChange={setGiftAmountInMan}
            unit="万円"
            placeholder="例：3000"
          />
          <p className="text-xs text-gray-500">
            ※不動産の場合は「相続税評価額（路線価・固定資産税評価額）」を入力してください。市場価格より低くなります（土地は約8割、建物は約7割が目安）。
          </p>
          {giftAmountInMan > 0 && (
            <p className="text-xs sm:text-sm text-gray-500">
              = {giftAmountInMan.toLocaleString('ja-JP')}万円（{giftAmountInYen.toLocaleString('ja-JP')}円）
            </p>
          )}

          {/* 税率区分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              税率区分
            </label>
            <select
              value={donorRelation}
              onChange={(e) => setDonorRelation(e.target.value as DonorRelation)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
            >
              <option value="lineal_ascendant_adult">
                特例税率（父母・祖父母から18歳以上の子・孫へ）
              </option>
              <option value="other">
                一般税率（その他の贈与）
              </option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ※特例税率は贈与を受けた年の1月1日時点で18歳以上の場合に適用
            </p>
          </div>
        </div>

        {/* 結果エリア（グリッド表示） */}
        <div className="bg-white rounded-lg p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm sm:text-base">
            <span className="text-gray-600">贈与金額</span>
            <span className="text-right text-base sm:text-lg font-medium">{(result.giftAmount / 10000).toLocaleString('ja-JP')}万円</span>

            <span className="text-gray-600">基礎控除額</span>
            <span className="text-right text-base sm:text-lg font-medium text-red-600">-{(result.basicDeductionAmount / 10000).toLocaleString('ja-JP')}万円</span>

            <span className="text-gray-600 border-t pt-3">課税価格</span>
            <span className="text-right text-base sm:text-lg font-medium border-t pt-3">{(result.taxableAmount / 10000).toLocaleString('ja-JP')}万円</span>

            {/* メイン結果 */}
            <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4 mt-2">贈与税額（概算）</span>
            <span className="text-right text-xl sm:text-2xl font-bold text-blue-700 border-t-2 border-blue-300 pt-4 mt-2">
              {(result.taxAmount / 10000).toLocaleString('ja-JP')}万円
            </span>

            {result.taxAmount > 0 && (
              <>
                <span className="text-xs sm:text-sm text-gray-500">適用税率</span>
                <span className="text-right text-xs sm:text-sm text-gray-500">{result.appliedRate}</span>
                <span className="text-xs sm:text-sm text-gray-500">実効税率</span>
                <span className="text-right text-xs sm:text-sm text-gray-500">{effectiveRate.toFixed(1)}%</span>
              </>
            )}
          </div>

          {/* 計算式表示 */}
          {giftAmountInMan > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">計算式</p>
              <div className="text-xs sm:text-sm text-gray-700 font-mono space-y-1">
                <p>{giftAmountInMan.toLocaleString()}万円 - 110万円（基礎控除） = {(result.taxableAmount / 10000).toLocaleString()}万円</p>
                {result.taxAmount > 0 && (
                  <p>{(result.taxableAmount / 10000).toLocaleString()}万円 × {result.appliedRate} - {(result.quickDeduction / 10000).toLocaleString()}万円（控除額） = {(result.taxAmount / 10000).toLocaleString()}万円</p>
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
    </>
  )
}

// =================================================================
// 追加コンテンツ部分
// =================================================================
function GiftTaxAdditionalContent() {
  return (
    <>
      {/* 早見表（シミュレーター直下） */}
      <section className="mt-10 mb-12">
        <QuickReferenceTable3Col
          title="贈与税額早見表（暦年課税）"
          description="基礎控除110万円を差し引いた後の税額を表示しています。"
          headers={[
            '贈与金額',
            { title: '特例税率', sub: '父母・祖父母→子・孫' },
            { title: '一般税率', sub: 'その他の贈与' },
          ]}
          rows={SPECIAL_RATE_TABLE.map((row, index) => ({
            label: formatManYen(row.giftAmount),
            value1: formatManYen(row.taxAmount),
            value2: formatManYen(GENERAL_RATE_TABLE[index]?.taxAmount ?? 0),
          }))}
          note={`※特例税率は直系尊属（父母・祖父母）から18歳以上の子・孫への贈与に適用。\n※一般税率は兄弟間・夫婦間・未成年への贈与などに適用。`}
        />
      </section>

      {/* 目次 */}
      <TableOfContents items={tocItems} />

      {/* 解説セクション */}
      <section className="mb-12">
        <SectionHeading id="about" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          贈与税とは、個人から財産を無償で受け取った（贈与された）際に、
          受け取った人（受贈者）に課される税金です。
          不動産を贈与した場合は、その評価額（一般的に固定資産税評価額や路線価をもとに算出）
          に基づいて贈与税が計算されます。
        </p>
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          贈与税には、1年間（1月1日〜12月31日）の贈与額に対して課税される
          <strong>「暦年課税」</strong>と、相続時に精算する
          <strong>「相続時精算課税」</strong>の2つの方式があります。
          本シミュレーターでは、一般的な暦年課税方式での概算計算を行います。
        </p>


        <SectionHeading id="calculation" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          暦年課税における贈与税額は、以下の計算式で算出されます。
        </p>

        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-4">
          <p className="font-mono text-gray-800 text-center text-xs sm:text-sm">
            贈与税額 =（贈与額 − 基礎控除110万円）× 税率 − 控除額
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            ※各種特例を適用する場合は、先に非課税枠を差し引きます
          </p>
        </div>

        <SectionHeading id="tax-rate" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          贈与税の税率は、贈与者と受贈者の関係によって「特例税率」と「一般税率」の
          2種類があります。
        </p>

        {/* 特例税率表 */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <caption className="text-left font-medium text-gray-900 mb-2 text-sm sm:text-base">
              特例税率（直系尊属から18歳以上の子・孫への贈与）
            </caption>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left">基礎控除後の課税価格</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center">税率</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center">控除額</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">200万円以下</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">10%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">-</td></tr>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">400万円以下</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">15%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">10万円</td></tr>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">600万円以下</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">20%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">30万円</td></tr>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">1,000万円以下</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">30%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">90万円</td></tr>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">1,500万円以下</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">40%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">190万円</td></tr>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">3,000万円以下</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">45%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">265万円</td></tr>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">4,500万円以下</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">50%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">415万円</td></tr>
              <tr><td className="border border-gray-300 px-2 sm:px-3 py-2">4,500万円超</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">55%</td><td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">640万円</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">
            ※一般税率（兄弟間・夫婦間・未成年への贈与など）は、ページ上部の早見表で比較できます。
          </p>
        </div>

        <SectionHeading id="example" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">
          父から成人の子へ、評価額3,000万円の不動産を贈与した場合の概算例：
        </p>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <ul className="text-gray-700 space-y-2 text-xs sm:text-sm">
            <li>① 贈与金額：3,000万円</li>
            <li>② 基礎控除：110万円を控除</li>
            <li>③ 課税価格：3,000万円 − 110万円 = 2,890万円</li>
            <li>④ 税率・控除額：45%、265万円（特例税率表より）</li>
            <li>⑤ <span className="font-semibold">贈与税額（概算）：2,890万円 × 45% − 265万円 = 約1,035万円</span></li>
          </ul>
        </div>
      </section>

      {/* 主な特例・控除制度（国税庁リンクへ誘導） */}
      <section className="mb-12">
        <SectionHeading id="special" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          贈与税には、住宅取得資金の非課税特例や配偶者控除（おしどり贈与）など、
          様々な特例・控除制度があります。適用要件や最新情報は、下記の国税庁サイトをご確認ください。
        </p>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <ul className="text-xs sm:text-sm text-blue-700 space-y-2">
            <li>
              <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4508.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                → No.4508 住宅取得等資金の贈与を受けた場合の非課税（国税庁）
              </a>
            </li>
            <li>
              <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/zoyo/4452.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                → No.4452 夫婦の間で居住用の不動産を贈与したときの配偶者控除（国税庁）
              </a>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            ※具体的な適用判断は税理士等の専門家にご相談ください。
          </p>
        </div>
      </section>

      {/* 参考リンク（エビデンス） */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">参考リンク</p>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li>
            <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/zoyo/4408.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
              → No.4408 贈与税の計算と税率（国税庁）
            </a>
          </li>
          <li>
            <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4103.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
              → No.4103 相続時精算課税の選択（国税庁）
            </a>
          </li>
          <li>
            <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/sozoku/4508.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
              → No.4508 住宅取得資金贈与の非課税（国税庁）
            </a>
          </li>
          <li>
            <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/zoyo/4452.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">
              → No.4452 配偶者控除（国税庁）
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}

// =================================================================
// メインコンポーネント
// =================================================================
export function GiftTaxCalculator() {
  return (
    <ContentPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/gift-tax"
      additionalContent={<GiftTaxAdditionalContent />}
    >
      <GiftTaxSimulator />
    </ContentPageLayout>
  )
}
