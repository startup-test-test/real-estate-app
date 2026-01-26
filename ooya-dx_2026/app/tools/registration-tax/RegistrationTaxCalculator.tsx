'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { calculateRegistrationTax, RegistrationTaxInput } from '@/lib/calculators/registrationTax'

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
  // 取引種別
  const [transactionType, setTransactionType] = useState<'newPurchase' | 'usedPurchase' | 'landOnly'>('newPurchase')

  // 土地
  const [hasLand, setHasLand] = useState(true)
  const [landAssessedValueInMan, setLandAssessedValueInMan] = useState<number>(0)

  // 建物
  const [hasBuilding, setHasBuilding] = useState(true)
  const [buildingAssessedValueInMan, setBuildingAssessedValueInMan] = useState<number>(0)

  // ローン
  const [hasLoan, setHasLoan] = useState(true)
  const [loanAmountInMan, setLoanAmountInMan] = useState<number>(0)

  // 取引種別変更時の処理
  const handleTransactionTypeChange = (type: 'newPurchase' | 'usedPurchase' | 'landOnly') => {
    setTransactionType(type)
    if (type === 'landOnly') {
      setHasBuilding(false)
    } else {
      setHasBuilding(true)
    }
  }

  // 万円→円に変換
  const landAssessedValue = landAssessedValueInMan * 10000
  const buildingAssessedValue = buildingAssessedValueInMan * 10000
  const loanAmount = loanAmountInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    const input: RegistrationTaxInput = {
      transactionType,
      hasLand,
      landAssessedValue,
      hasBuilding: transactionType !== 'landOnly' && hasBuilding,
      buildingType: transactionType === 'newPurchase' ? 'new' : 'used',
      buildingAssessedValue,
      prefecture: 'default',
      structure: 'wood',
      floorArea: 0,
      isSelfResidential: true, // 軽減税率を自動適用
      isLongTermQuality: false,
      isLowCarbon: false,
      isResale: false,
      hasLoan,
      loanAmount,
    }

    return calculateRegistrationTax(input)
  }, [
    transactionType, hasLand, landAssessedValue,
    hasBuilding, buildingAssessedValue,
    hasLoan, loanAmount
  ])

  // 入力があるか判定
  const hasInput = (hasLand && landAssessedValueInMan > 0) ||
    (hasBuilding && transactionType !== 'landOnly' && buildingAssessedValueInMan > 0) ||
    (hasLoan && loanAmountInMan > 0)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
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

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {PAGE_TITLE}
          </h1>
          <p className="text-gray-600 mb-8">
            土地・建物の固定資産税評価額または売買価格を入力するだけで、登録免許税の目安を概算できます。
          </p>

          {/* シミュレーター本体 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                登録免許税を概算計算する
              </h2>
            </div>

            {/* 取引種別選択 */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                取引の種類
              </label>
              <select
                value={transactionType}
                onChange={(e) => handleTransactionTypeChange(e.target.value as 'newPurchase' | 'usedPurchase' | 'landOnly')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="newPurchase">新築購入</option>
                <option value="usedPurchase">中古購入</option>
                <option value="landOnly">土地のみ</option>
              </select>
            </div>

            {/* 土地入力 */}
            {hasLand && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <NumberInput
                  label="土地の固定資産税評価額"
                  value={landAssessedValueInMan}
                  onChange={setLandAssessedValueInMan}
                  unit="万円"
                  placeholder="1050"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※売買価格の約70%が目安です
                </p>
              </div>
            )}

            {/* 建物入力 */}
            {hasBuilding && transactionType !== 'landOnly' && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <NumberInput
                  label={`建物の固定資産税評価額${transactionType === 'newPurchase' ? '（新築）' : '（中古）'}`}
                  value={buildingAssessedValueInMan}
                  onChange={setBuildingAssessedValueInMan}
                  unit="万円"
                  placeholder="600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※売買価格の約50〜60%が目安です
                </p>
              </div>
            )}

            {/* 住宅ローン */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="hasLoan"
                  checked={hasLoan}
                  onChange={(e) => setHasLoan(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded border border-gray-300"
                />
                <label htmlFor="hasLoan" className="text-sm font-medium text-gray-700">
                  住宅ローンを利用する
                </label>
              </div>
              {hasLoan && (
                <NumberInput
                  label="借入金額"
                  value={loanAmountInMan}
                  onChange={setLoanAmountInMan}
                  unit="万円"
                  placeholder="3000"
                />
              )}
            </div>

            {/* 適用税率の説明 */}
            {hasInput && (
              <div className="mb-4 p-3 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">適用税率</p>
                <div className="text-xs text-blue-700 space-y-0.5">
                  {hasLand && result.landTaxBase > 0 && (
                    <p>土地移転: {result.appliedRates.land}（軽減税率適用）</p>
                  )}
                  {hasBuilding && transactionType !== 'landOnly' && result.buildingTaxBase > 0 && (
                    <p>
                      建物{transactionType === 'newPurchase' ? '保存' : '移転'}: {result.appliedRates.building}
                      {result.reductionApplied.building && '（軽減税率適用）'}
                    </p>
                  )}
                  {hasLoan && result.mortgageTaxBase > 0 && (
                    <p>
                      抵当権設定: {result.appliedRates.mortgage}
                      {result.reductionApplied.mortgage && '（軽減税率適用）'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 結果表示 */}
            <div className="space-y-3">
              {hasLand && (
                <ResultCard
                  label="土地の移転登記"
                  value={result.landTax}
                  unit="円"
                  subText={result.landTaxBase > 0 ? `課税標準: ${result.landTaxBase.toLocaleString()}円` : undefined}
                />
              )}
              {hasBuilding && transactionType !== 'landOnly' && (
                <ResultCard
                  label={`建物の${transactionType === 'newPurchase' ? '保存' : '移転'}登記`}
                  value={result.buildingTax}
                  unit="円"
                  subText={result.buildingTaxBase > 0 ? `課税標準: ${result.buildingTaxBase.toLocaleString()}円` : undefined}
                />
              )}
              {hasLoan && (
                <ResultCard
                  label="抵当権設定登記"
                  value={result.mortgageTax}
                  unit="円"
                  subText={result.mortgageTaxBase > 0 ? `課税標準: ${result.mortgageTaxBase.toLocaleString()}円` : undefined}
                />
              )}
              <ResultCard
                label="登録免許税 合計"
                value={result.totalTax}
                unit="円"
                highlight={true}
                subText={
                  result.totalTax > 0
                    ? `= ${(result.totalTax / 10000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })} 万円`
                    : undefined
                }
              />

              {/* 計算式表示 */}
              {hasInput && result.totalTax > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-white rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">計算式</p>
                  <div className="text-sm text-gray-700 font-mono space-y-2">
                    {hasLand && result.landTax > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">【土地移転登記】</p>
                        <p>{result.landTaxBase.toLocaleString()}円 × {result.appliedRates.land} = {result.landTax.toLocaleString()}円</p>
                      </div>
                    )}
                    {hasBuilding && transactionType !== 'landOnly' && result.buildingTax > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">【建物{transactionType === 'newPurchase' ? '保存' : '移転'}登記】</p>
                        <p>{result.buildingTaxBase.toLocaleString()}円 × {result.appliedRates.building} = {result.buildingTax.toLocaleString()}円</p>
                      </div>
                    )}
                    {hasLoan && result.mortgageTax > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">【抵当権設定登記】</p>
                        <p>{result.mortgageTaxBase.toLocaleString()}円 × {result.appliedRates.mortgage} = {result.mortgageTax.toLocaleString()}円</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">【合計】</p>
                      <p>
                        {[
                          result.landTax > 0 ? `${result.landTax.toLocaleString()}円` : null,
                          result.buildingTax > 0 ? `${result.buildingTax.toLocaleString()}円` : null,
                          result.mortgageTax > 0 ? `${result.mortgageTax.toLocaleString()}円` : null,
                        ].filter(Boolean).join(' + ')} = {result.totalTax.toLocaleString()}円
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

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
