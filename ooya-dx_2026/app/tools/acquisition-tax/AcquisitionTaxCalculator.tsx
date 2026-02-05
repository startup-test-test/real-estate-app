'use client'

import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { AcquisitionTaxCalculatorCompact } from '@/components/calculators'

// =================================================================
// 早見表データ（3パターン比較）
// =================================================================
const quickReferenceData = [
  { label: '建物1,000万円 + 土地1,000万円', newHousing: '約0万円', usedSelf: '約0万円', usedInvest: '約45万円' },
  { label: '建物1,500万円 + 土地1,500万円', newHousing: '約9万円', usedSelf: '約9万円', usedInvest: '約68万円' },
  { label: '建物2,000万円 + 土地2,000万円', newHousing: '約24万円', usedSelf: '約24万円', usedInvest: '約90万円' },
  { label: '建物2,500万円 + 土地2,500万円', newHousing: '約39万円', usedSelf: '約39万円', usedInvest: '約113万円' },
  { label: '建物3,000万円 + 土地3,000万円', newHousing: '約54万円', usedSelf: '約54万円', usedInvest: '約135万円' },
  { label: '建物3,500万円 + 土地3,500万円', newHousing: '約69万円', usedSelf: '約69万円', usedInvest: '約158万円' },
  { label: '建物4,000万円 + 土地4,000万円', newHousing: '約84万円', usedSelf: '約84万円', usedInvest: '約180万円' },
  { label: '建物4,500万円 + 土地4,500万円', newHousing: '約99万円', usedSelf: '約99万円', usedInvest: '約203万円' },
  { label: '建物5,000万円 + 土地5,000万円', newHousing: '約114万円', usedSelf: '約114万円', usedInvest: '約225万円' },
]

// =================================================================
// 中古住宅の築年数別控除額テーブル（表示用）
// =================================================================
const usedHousingDeductionTable = [
  { period: '1997年4月1日以降', deduction: '1,200万円' },
  { period: '1989年4月1日〜1997年3月31日', deduction: '1,000万円' },
  { period: '1985年7月1日〜1989年3月31日', deduction: '450万円' },
  { period: '1981年7月1日〜1985年6月30日', deduction: '420万円' },
  { period: '1976年1月1日〜1981年6月30日', deduction: '350万円' },
  { period: '1973年1月1日〜1975年12月31日', deduction: '230万円' },
  { period: '1964年1月1日〜1972年12月31日', deduction: '150万円' },
  { period: '1954年7月1日〜1963年12月31日', deduction: '100万円' },
]

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '不動産取得税 計算シミュレーション｜軽減措置対応'

// =================================================================
// 目次データ
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '不動産取得税とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 2 },
  { id: 'reduction', title: '軽減措置', level: 2 },
  { id: 'used', title: '中古住宅の築年数別控除額', level: 2 },
]

// =================================================================
// シミュレーター部分
// =================================================================
function AcquisitionTaxSimulator() {
  return (
    <>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
        建物・土地の評価額と床面積を入力するだけで、不動産取得税を概算計算します。
        新築・中古住宅の軽減措置にも対応。
      </p>

      {/* シミュレーター本体（コンパクト版コンポーネント） */}
      <AcquisitionTaxCalculatorCompact showTitle={true} />

      {/* 注意事項 */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">
          ※本計算は2027年3月31日までの特例税率（土地・住宅3%）を前提として計算しています。
          実際の適用可否は専門家にご確認ください。
        </p>
      </div>
    </>
  )
}

// =================================================================
// 追加コンテンツ部分
// =================================================================
function AcquisitionTaxAdditionalContent() {
  return (
    <>
      {/* =================================================================
          早見表（3パターン比較）
      ================================================================= */}
      <section className="mt-10 mb-12">
        <div className="bg-primary-50 rounded-xl p-4 sm:p-5 border border-primary-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">不動産取得税 早見表</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            床面積80m²、土地100m²を想定した概算値です。中古（自己居住）は1997年以降新築の場合。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-left font-medium">物件評価額</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-center font-medium">新築</th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-center font-medium">中古・自己居住<br/><span className="text-xs font-normal">（1997年以降）</span></th>
                  <th className="border border-gray-200 px-2 sm:px-3 py-2 text-center font-medium">中古・投資用</th>
                </tr>
              </thead>
              <tbody>
                {quickReferenceData.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 px-2 sm:px-3 py-2 text-gray-700">{row.label}</td>
                    <td className="border border-gray-200 px-2 sm:px-3 py-2 text-center text-blue-700 font-medium">{row.newHousing}</td>
                    <td className="border border-gray-200 px-2 sm:px-3 py-2 text-center text-blue-700 font-medium">{row.usedSelf}</td>
                    <td className="border border-gray-200 px-2 sm:px-3 py-2 text-center text-red-600 font-medium">{row.usedInvest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ※1997年より前に新築された中古住宅は控除額が少なくなり、税額が高くなる場合があります。詳細は上記シミュレーターでご確認ください。
          </p>
        </div>
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
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          不動産取得税とは、土地や建物を取得した際に都道府県に納める地方税です。
          売買、贈与、新築、増築など、取得の原因を問わず課税されるのが原則です。
          ただし、相続による取得は非課税となる場合があります。
        </p>
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          「忘れた頃にやってくる税金」とも言われ、取得後3〜6ヶ月後に納税通知書が届くため、
          資金計画に含めておくことが重要です。
        </p>

        <SectionHeading id="calculation" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          不動産取得税は、建物と土地それぞれについて以下の計算式で算出されるのが一般的です。
        </p>

        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-4">
          <p className="font-mono text-gray-800 text-center text-xs sm:text-sm mb-2">
            【建物】（評価額 − 控除額）× 税率
          </p>
          <p className="font-mono text-gray-800 text-center text-xs sm:text-sm">
            【土地】（評価額 × 1/2）× 税率 − 控除額
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            ※税率：住宅3%、非住宅4%（2027年3月31日まで）
          </p>
        </div>

        <SectionHeading id="reduction" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          新築住宅・中古住宅ともに、一定の要件を満たす場合は控除が適用される場合があります。
          床面積や用途などの条件は各都道府県により異なる場合がありますので、詳細は下記参考リンクをご確認ください。
        </p>
      </section>

      {/* =================================================================
          中古住宅の控除額テーブル
      ================================================================= */}
      <section className="mb-12">
        <SectionHeading id="used" items={tocItems} />
        <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
          中古住宅の場合、新築された年によって控除額が異なる場合があります。
          なお、<strong>自己居住用のみ</strong>が対象となり、投資用（賃貸用）には適用されない場合があります。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left">新築年月日</th>
                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center">控除額</th>
              </tr>
            </thead>
            <tbody>
              {usedHousingDeductionTable.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 sm:px-3 py-2">{row.period}</td>
                  <td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">{row.deduction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ※1981年以前の建物は耐震基準適合証明書等が必要な場合があります
        </p>
      </section>

      {/* =================================================================
          参考リンク
      ================================================================= */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">参考リンク</p>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li>
            <a href="https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/150790_17.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              → 地方税制度｜不動産取得税（総務省）
            </a>
          </li>
          <li>
            <a href="https://www.tax.metro.tokyo.lg.jp/shisan/fudosan.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              → 不動産取得税（東京都主税局）
            </a>
          </li>
          <li>
            <a href="https://www.home4u.jp/sell/juku/course/basic/sell-340-29676" target="_blank" rel="noopener noreferrer" className="hover:underline">
              → 不動産取得税とは？計算方法、軽減措置を全解説（HOME4U）
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
export function AcquisitionTaxCalculator() {
  return (
    <ToolPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/acquisition-tax"
      additionalContent={<AcquisitionTaxAdditionalContent />}
    >
      <AcquisitionTaxSimulator />
    </ToolPageLayout>
  )
}
