'use client'

import { ContentPageLayout } from '@/components/tools/ContentPageLayout'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { YieldRateCalculatorCompact } from '@/components/calculators'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産の表面利回り・実質利回り 計算シミュレーション｜早見表付き'

// 目次データ
const tocItems: TocItem[] = [
  { id: 'about', title: '利回りとは', level: 2 },
  { id: 'gross-yield', title: '表面利回り（グロス利回り）', level: 3 },
  { id: 'net-yield', title: '実質利回り（ネット利回り）', level: 3 },
  { id: 'difference', title: '表面利回りと実質利回りの違い', level: 2 },
  { id: 'expenses', title: '経費に含まれる項目', level: 2 },
  { id: 'caution', title: '利回りを見る際の注意点', level: 2 },
]

// 早見表データ
const quickReferenceData: QuickReferenceRow[] = [
  { label: '4%', value: '40万円', subValue: '月額約3.3万円' },
  { label: '5%', value: '50万円', subValue: '月額約4.2万円' },
  { label: '6%', value: '60万円', subValue: '月額約5.0万円' },
  { label: '7%', value: '70万円', subValue: '月額約5.8万円' },
  { label: '8%', value: '80万円', subValue: '月額約6.7万円' },
  { label: '9%', value: '90万円', subValue: '月額約7.5万円' },
  { label: '10%', value: '100万円', subValue: '月額約8.3万円' },
  { label: '12%', value: '120万円', subValue: '月額約10.0万円' },
  { label: '15%', value: '150万円', subValue: '月額約12.5万円' },
]

/**
 * 利回りシミュレーター
 * ContentPageLayoutを使用した2カラムレイアウト
 */
export function YieldRateCalculator() {
  return (
    <ContentPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/yield-rate"
      additionalContent={<YieldRateAdditionalContent />}
    >
      <YieldRateCalculatorCompact showTitle={true} />
    </ContentPageLayout>
  )
}

/**
 * 利回りページ固有の追加コンテンツ
 */
function YieldRateAdditionalContent() {
  return (
    <>
      {/* 早見表 */}
      <section className="mb-12">
        <QuickReferenceTable
          title="利回り早見表（物件価格1,000万円の場合）"
          description="物件価格1,000万円の場合、各利回りに必要な年間賃料の目安です。"
          headers={['表面利回り', '必要年間賃料']}
          rows={quickReferenceData}
          note="※実質利回りは経費を考慮するため、表面利回りより1〜3%程度低くなる場合があります。"
        />
      </section>

      {/* 目次 */}
      <TableOfContents items={tocItems} />

      {/* 解説セクション */}
      <section className="mb-12">
        <SectionHeading id="about" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          賃貸経営における「利回り」とは、物件価格に対してどれだけの収益を得られるかを示す指標です。
          物件の収益性を比較検討する際の基準として広く使われています。
        </p>

        <SectionHeading id="gross-yield" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          表面利回り（グロス利回り）は、物件価格に対する年間想定賃料の割合です。
          経費を考慮しない最もシンプルな指標で、物件の一次スクリーニングに使われます。
        </p>
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="font-mono text-gray-800 text-center text-xs sm:text-sm">
            表面利回り(%) = 年間想定賃料 / 物件価格 × 100
          </p>
        </div>

        <SectionHeading id="net-yield" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          実質利回り（ネット利回り）は、経費を差し引いた実際の手取り収益（NOI）をベースに計算します。
          より実態に即した収益性を把握できます。
        </p>
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="font-mono text-gray-800 text-center text-xs sm:text-sm">
            実質利回り(%) = (年間賃料 - 年間経費) / (物件価格 + 購入諸経費) × 100
          </p>
        </div>

        <SectionHeading id="difference" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          表面利回りと実質利回りには通常1〜3%程度の差があります。
          この差は物件の経費率や購入諸経費によって変動します。
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-amber-900 mb-2">注意点</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-xs sm:text-sm">
            <li>表面利回りが高くても、経費が多ければ実質利回りは低くなります</li>
            <li>物件広告では表面利回りが記載されていることが多いため、経費を確認することが重要です</li>
            <li>築古物件は修繕費がかさむため、表面と実質の差が大きくなる傾向があります</li>
          </ul>
        </div>

        <SectionHeading id="expenses" items={tocItems} />
        <p className="text-gray-700 mb-3 leading-relaxed text-sm sm:text-base">
          実質利回りの計算で考慮すべき主な経費項目は以下の通りです。
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 text-sm sm:text-base">
          <li>管理委託費（家賃の3〜8%程度）</li>
          <li>修繕積立金・修繕費（家賃の5〜15%程度）</li>
          <li>固定資産税・都市計画税</li>
          <li>火災保険・地震保険料</li>
          <li>入居者募集時の広告費（AD）</li>
          <li>共用部の水道光熱費</li>
        </ul>
        <p className="text-xs sm:text-sm text-gray-600">
          目安として、年間経費は賃料収入の15〜25%程度です。
        </p>

        <SectionHeading id="caution" items={tocItems} />
        <p className="text-gray-700 mb-3 leading-relaxed text-sm sm:text-base">
          利回りだけで物件の良し悪しを判断することには注意が必要です。以下の点も考慮しましょう。
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
          <li>高利回り物件は空室リスクや修繕リスクが高い場合があります</li>
          <li>満室想定賃料が相場より高く設定されていないか確認しましょう</li>
          <li>将来の賃料下落や大規模修繕も考慮した収支計画が重要です</li>
          <li>出口（売却）戦略も含めたトータルリターン（IRR）での判断も有効です</li>
        </ul>
      </section>
    </>
  )
}
