'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { calculateAcquisitionTax } from '@/lib/calculators/acquisitionTax'

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
// メインコンポーネント
// =================================================================
export function AcquisitionTaxCalculator() {
  // 入力状態（万円単位）
  const [buildingEvalInMan, setBuildingEvalInMan] = useState<number>(0)
  const [landEvalInMan, setLandEvalInMan] = useState<number>(0)
  const [floorArea, setFloorArea] = useState<number>(80)
  const [landArea, setLandArea] = useState<number>(100)
  const [isNewBuilding, setIsNewBuilding] = useState<boolean>(true)
  const [isResidential, setIsResidential] = useState<boolean>(true)
  const [builtYear, setBuiltYear] = useState<number>(2020)
  const [isLongTermQuality, setIsLongTermQuality] = useState<boolean>(false)
  const [isForSelfResidence, setIsForSelfResidence] = useState<boolean>(true)

  // 円に変換
  const buildingEvalInYen = buildingEvalInMan * 10000
  const landEvalInYen = landEvalInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    const builtDate = isNewBuilding ? undefined : new Date(builtYear, 3, 1) // 4月1日で仮定
    return calculateAcquisitionTax({
      buildingEvaluation: buildingEvalInYen,
      isNewBuilding,
      floorArea,
      builtDate,
      isResidential,
      isLongTermQuality: isNewBuilding ? isLongTermQuality : false,
      isForSelfResidence: isNewBuilding ? true : isForSelfResidence, // 中古のみ影響
      landEvaluation: landEvalInYen,
      landArea,
    })
  }, [buildingEvalInYen, landEvalInYen, floorArea, landArea, isNewBuilding, isResidential, builtYear, isLongTermQuality, isForSelfResidence])

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
              建物・土地の評価額と床面積を入力するだけで、不動産取得税を概算計算します。
              新築・中古住宅の軽減措置にも対応。
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
                  不動産取得税を概算計算する
                </h2>
              </div>

              {/* 入力エリア */}
              <div className="bg-white rounded-lg p-4 mb-4 space-y-4">
                {/* 物件種別 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      新築 / 中古
                    </label>
                    <select
                      value={isNewBuilding ? 'new' : 'used'}
                      onChange={(e) => setIsNewBuilding(e.target.value === 'new')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="new">新築</option>
                      <option value="used">中古</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用途
                    </label>
                    <select
                      value={isResidential ? 'residential' : 'commercial'}
                      onChange={(e) => setIsResidential(e.target.value === 'residential')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="residential">住宅</option>
                      <option value="commercial">非住宅（店舗・事務所等）</option>
                    </select>
                  </div>
                </div>

                {/* 中古の場合：築年と用途 */}
                {!isNewBuilding && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        新築年（西暦）
                      </label>
                      <input
                        type="number"
                        value={builtYear}
                        onChange={(e) => setBuiltYear(parseInt(e.target.value) || 2000)}
                        min={1950}
                        max={2025}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ※1981年以前の場合は耐震基準適合証明が必要な場合があります
                      </p>
                    </div>
                    {isResidential && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          取得目的
                        </label>
                        <select
                          value={isForSelfResidence ? 'self' : 'investment'}
                          onChange={(e) => setIsForSelfResidence(e.target.value === 'self')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="self">自己居住用</option>
                          <option value="investment">投資用（賃貸）</option>
                        </select>
                        {!isForSelfResidence && (
                          <p className="text-xs text-amber-600 mt-1">
                            ※投資用の場合、中古住宅の建物控除は適用されない場合があります
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 新築の場合：認定長期優良住宅 */}
                {isNewBuilding && isResidential && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="longTermQuality"
                      checked={isLongTermQuality}
                      onChange={(e) => setIsLongTermQuality(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="longTermQuality" className="text-sm text-gray-700">
                      認定長期優良住宅（控除額1,300万円）
                    </label>
                  </div>
                )}

                {/* 建物評価額 */}
                <NumberInput
                  label="建物の固定資産税評価額"
                  value={buildingEvalInMan}
                  onChange={setBuildingEvalInMan}
                  unit="万円"
                  placeholder="例：1500"
                />
                <p className="text-xs text-gray-500 -mt-2">
                  ※新築の場合は建築費の約50〜60%が目安です
                </p>

                {/* 土地評価額 */}
                <NumberInput
                  label="土地の固定資産税評価額"
                  value={landEvalInMan}
                  onChange={setLandEvalInMan}
                  unit="万円"
                  placeholder="例：2000"
                />
                <p className="text-xs text-gray-500 -mt-2">
                  ※実勢価格（売買価格）の約70%が目安です
                </p>

                {/* 床面積・土地面積 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      建物床面積
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={floorArea}
                        onChange={(e) => setFloorArea(parseFloat(e.target.value) || 0)}
                        className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 py-3 text-gray-600">
                        m²
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      土地面積
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={landArea}
                        onChange={(e) => setLandArea(parseFloat(e.target.value) || 0)}
                        className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="flex-shrink-0 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 py-3 text-gray-600">
                        m²
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  ※床面積は50〜240m²で軽減措置が適用されます
                </p>
              </div>

              {/* 結果エリア */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">計算結果</h3>

                {/* 建物の税額 */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">【建物】</p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-gray-600">課税標準額</span>
                    <span className="text-right">{(result.buildingTaxBase / 10000).toLocaleString('ja-JP')}万円</span>

                    <span className="text-gray-600">控除額</span>
                    <span className="text-right text-red-600">-{(result.buildingDeduction / 10000).toLocaleString('ja-JP')}万円</span>

                    <span className="text-gray-600">課税対象額</span>
                    <span className="text-right">{(result.buildingTaxableAmount / 10000).toLocaleString('ja-JP')}万円</span>

                    <span className="text-gray-600">税率</span>
                    <span className="text-right">{(result.buildingTaxRate * 100).toFixed(0)}%</span>

                    <span className="text-gray-700 font-medium">建物の税額</span>
                    <span className="text-right font-medium">{(result.buildingTax / 10000).toLocaleString('ja-JP')}万円</span>
                  </div>
                  {result.buildingDeductionType !== 'なし' && (
                    <p className="text-xs text-blue-600 mt-2">
                      適用控除：{result.buildingDeductionType}
                    </p>
                  )}
                </div>

                {/* 土地の税額 */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">【土地】</p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-gray-600">課税標準額（1/2後）</span>
                    <span className="text-right">{(result.landTaxBase / 10000).toLocaleString('ja-JP')}万円</span>

                    <span className="text-gray-600">控除前税額</span>
                    <span className="text-right">{(result.landInitialTax / 10000).toLocaleString('ja-JP')}万円</span>

                    <span className="text-gray-600">控除額</span>
                    <span className="text-right text-red-600">-{(result.landDeduction / 10000).toLocaleString('ja-JP')}万円</span>

                    <span className="text-gray-700 font-medium">土地の税額</span>
                    <span className="text-right font-medium">{(result.landTax / 10000).toLocaleString('ja-JP')}万円</span>
                  </div>
                  {result.isLandDeductionApplied && (
                    <p className="text-xs text-blue-600 mt-2">
                      ※住宅用土地の軽減措置を適用
                    </p>
                  )}
                </div>

                {/* 合計 */}
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-gray-700 font-bold text-lg">不動産取得税（概算）</span>
                  <span className="text-right text-2xl font-bold text-blue-700">
                    {(result.totalTax / 10000).toLocaleString('ja-JP')}万円
                  </span>
                  <span className="text-gray-500 text-sm"></span>
                  <span className="text-right text-sm text-gray-500">
                    = {result.totalTax.toLocaleString('ja-JP')}円
                  </span>
                </div>

                {/* 計算式表示 */}
                {(buildingEvalInMan > 0 || landEvalInMan > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">計算式</p>
                    <div className="text-sm text-gray-700 font-mono space-y-2">
                      {buildingEvalInMan > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">【建物】</p>
                          <p>({buildingEvalInMan.toLocaleString()}万円 - {(result.buildingDeduction / 10000).toLocaleString()}万円) × {(result.buildingTaxRate * 100).toFixed(0)}% = {(result.buildingTax / 10000).toLocaleString()}万円</p>
                        </div>
                      )}
                      {landEvalInMan > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">【土地】</p>
                          <p>{landEvalInMan.toLocaleString()}万円 × 1/2 × 3% - {(result.landDeduction / 10000).toLocaleString()}万円 = {(result.landTax / 10000).toLocaleString()}万円</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">【合計】</p>
                        <p>{(result.buildingTax / 10000).toLocaleString()}万円 + {(result.landTax / 10000).toLocaleString()}万円 = {(result.totalTax / 10000).toLocaleString()}万円</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 注意事項 */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  ※本計算は2027年3月31日までの特例税率（土地・住宅3%）を前提として計算しています。
                  実際の適用可否は専門家にご確認ください。
                </p>
              </div>
            </div>

            {/* 計算結果の注記 */}
            <CalculatorNote />

            {/* =================================================================
                早見表（3パターン比較）
            ================================================================= */}
            <section className="mt-10 mb-12">
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h2 className="text-lg font-bold text-gray-900 mb-2">不動産取得税 早見表</h2>
                <p className="text-sm text-gray-600 mb-4">
                  床面積80m²、土地100m²を想定した概算値です。中古（自己居住）は1997年以降新築の場合。
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-200 px-3 py-2 text-left font-medium">物件評価額</th>
                        <th className="border border-gray-200 px-3 py-2 text-center font-medium">新築</th>
                        <th className="border border-gray-200 px-3 py-2 text-center font-medium">中古・自己居住<br/><span className="text-xs font-normal">（1997年以降）</span></th>
                        <th className="border border-gray-200 px-3 py-2 text-center font-medium">中古・投資用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickReferenceData.map((row, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-3 py-2 text-gray-700">{row.label}</td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-blue-700 font-medium">{row.newHousing}</td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-blue-700 font-medium">{row.usedSelf}</td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-red-600 font-medium">{row.usedInvest}</td>
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
              <p className="text-gray-700 mb-4 leading-relaxed">
                不動産取得税とは、土地や建物を取得した際に都道府県に納める地方税です。
                売買、贈与、新築、増築など、取得の原因を問わず課税されるのが原則です。
                ただし、相続による取得は非課税となる場合があります。
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                「忘れた頃にやってくる税金」とも言われ、取得後3〜6ヶ月後に納税通知書が届くため、
                資金計画に含めておくことが重要です。
              </p>

              <SectionHeading id="calculation" items={tocItems} />
              <p className="text-gray-700 mb-4 leading-relaxed">
                不動産取得税は、建物と土地それぞれについて以下の計算式で算出されるのが一般的です。
              </p>

              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="font-mono text-gray-800 text-center text-sm mb-2">
                  【建物】（評価額 − 控除額）× 税率
                </p>
                <p className="font-mono text-gray-800 text-center text-sm">
                  【土地】（評価額 × 1/2）× 税率 − 控除額
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  ※税率：住宅3%、非住宅4%（2027年3月31日まで）
                </p>
              </div>

              <SectionHeading id="reduction" items={tocItems} />
              <p className="text-gray-700 mb-4 leading-relaxed">
                新築住宅・中古住宅ともに、一定の要件を満たす場合は控除が適用される場合があります。
                床面積や用途などの条件は各都道府県により異なる場合がありますので、詳細は下記参考リンクをご確認ください。
              </p>
            </section>

            {/* =================================================================
                中古住宅の控除額テーブル
            ================================================================= */}
            <section className="mb-12">
              <SectionHeading id="used" items={tocItems} />
              <p className="text-gray-700 mb-4 leading-relaxed">
                中古住宅の場合、新築された年によって控除額が異なる場合があります。
                なお、<strong>自己居住用のみ</strong>が対象となり、投資用（賃貸用）には適用されない場合があります。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left">新築年月日</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">控除額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usedHousingDeductionTable.map((row, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-3 py-2">{row.period}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{row.deduction}</td>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-gray-800 mb-2">参考リンク</p>
              <ul className="text-sm text-blue-700 space-y-1">
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

            {/* 免責事項 */}
            <ToolDisclaimer />

            {/* 関連シミュレーター */}
            <RelatedTools currentPath="/tools/acquisition-tax" />

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
