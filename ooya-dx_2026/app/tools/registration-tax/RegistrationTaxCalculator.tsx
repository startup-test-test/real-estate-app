'use client'

import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { ShareButtons } from '@/components/tools/ShareButtons'
import { RegistrationTaxCalculatorCompact } from '@/components/calculators'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

interface GlossaryItem {
  slug: string
  title: string
}

interface RegistrationTaxCalculatorProps {
  relatedGlossary?: GlossaryItem[]
}

// 早見表データ（新築建売・自己居住・軽減適用の場合）
// 前提：土地建物比率5:5、土地評価70%、建物評価60%、ローン80%
const quickReferenceData: QuickReferenceRow[] = [
  { label: '1,000万円', value: '約6.5万円', subValue: '土地5.2万+建物0.5万+抵当0.8万' },
  { label: '2,000万円', value: '約13万円', subValue: '土地10.5万+建物0.9万+抵当1.6万' },
  { label: '3,000万円', value: '約19.5万円', subValue: '土地15.7万+建物1.4万+抵当2.4万' },
  { label: '4,000万円', value: '約26万円', subValue: '土地21万+建物1.8万+抵当3.2万' },
  { label: '5,000万円', value: '約33万円', subValue: '土地26.2万+建物2.3万+抵当4万' },
  { label: '6,000万円', value: '約39万円', subValue: '土地31.5万+建物2.7万+抵当4.8万' },
  { label: '7,000万円', value: '約46万円', subValue: '土地36.7万+建物3.2万+抵当5.6万' },
  { label: '8,000万円', value: '約52万円', subValue: '土地42万+建物3.6万+抵当6.4万' },
  { label: '9,000万円', value: '約59万円', subValue: '土地47.2万+建物4.1万+抵当7.2万' },
  { label: '1億円', value: '約65万円', subValue: '土地52.5万+建物4.5万+抵当8万' },
]

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産の登録免許税 計算シミュレーション｜軽減税率対応'

// 目次項目
const tocItems: TocItem[] = [
  { id: 'about', title: '登録免許税とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 2 },
  { id: 'reduction', title: '軽減税率について', level: 2 },
  { id: 'example', title: '具体的な計算例', level: 2 },
  { id: 'glossary', title: '関連用語', level: 2 },
]

export function RegistrationTaxCalculator({ relatedGlossary = [] }: RegistrationTaxCalculatorProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
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
              const toolInfo = getToolInfo('/tools/registration-tax')
              return toolInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(toolInfo.lastUpdated)}
                </time>
              ) : null
            })()}
          </div>

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>

          {/* シェアボタン */}
          <div className="mb-4">
            <ShareButtons title={PAGE_TITLE} />
          </div>

          <p className="text-gray-600 mb-8">
            土地・建物の固定資産税評価額または売買価格を入力するだけで、登録免許税の目安を概算できます。
          </p>

          {/* シミュレーター本体（コンパクト版コンポーネント） */}
          <RegistrationTaxCalculatorCompact showTitle={true} />

          {/* 計算結果の注記 */}
          <CalculatorNote />

          {/* 早見表 */}
          <section className="mb-12">
            <QuickReferenceTable
              title="登録免許税 早見表（新築の場合）"
              description="新築建売住宅購入時の目安です。自己居住用・軽減税率適用・ローン80%の場合。"
              headers={['物件価格', '登録免許税（税込）']}
              rows={quickReferenceData}
              note="※土地・建物を50:50、土地評価70%、建物評価60%で概算。中古住宅の場合は建物の税率が異なるため金額が変わります。"
            />
          </section>

          {/* 目次 */}
          <TableOfContents items={tocItems} />

          {/* 解説セクション */}
          <section className="mb-12">
            <SectionHeading id="about" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              登録免許税は、不動産を取得した際に法務局で行う「登記」に対して課される国税とされています。
              所有権の移転（売買）、新築建物の保存登記、住宅ローンの抵当権設定登記などが対象となるとされています。
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              納税のタイミングは登記申請時とされており、実務上は不動産の決済日（引き渡し日）に司法書士を通じて納付することが多いとされています。
              費用は買主が負担するケースが多いとされています。
            </p>

            <SectionHeading id="calculation" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              登録免許税は以下の計算式で算出されるとされています。
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-mono text-gray-800 text-center">
                登録免許税 = 課税標準額 × 税率
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                ※課税標準額は固定資産税評価額（売買価格ではありません）
              </p>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>課税標準額</strong>には「固定資産税評価額」が使用されるとされています。
              これは市場価格（売買価格）とは異なり、土地は時価の約70%、建物は約50〜60%程度が目安とされています。
              新築建物の場合は、法務局が定める認定価格（床面積×単価）が使用されるとされています。
            </p>

            <SectionHeading id="reduction" items={tocItems} />
            <p className="text-gray-700 mb-4 leading-relaxed">
              自己居住用の住宅には軽減税率が適用される場合があります。
              適用条件や税率の詳細は<a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/inshi/7191.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">国税庁のサイト</a>をご確認ください。
            </p>

            <SectionHeading id="example" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              例えば、4,000万円の新築建売住宅（土地2,000万円・建物2,000万円）をローン3,200万円で購入する場合の目安：
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>① <strong>土地移転登記</strong>：評価額1,400万円 × 1.5% = <strong>210,000円</strong></li>
                <li>② <strong>建物保存登記</strong>：100㎡ × 107,000円 × 0.15% = <strong>16,000円</strong></li>
                <li>③ <strong>抵当権設定</strong>：3,200万円 × 0.1% = <strong>32,000円</strong></li>
                <li className="pt-2 border-t border-gray-200">
                  <span className="font-semibold">合計：約258,000円</span>
                </li>
              </ul>
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

          {/* 免責事項 */}
          <ToolDisclaimer />

          {/* 関連シミュレーター */}
          <RelatedTools currentPath="/tools/registration-tax" />

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
