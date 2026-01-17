'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Info } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { calculateAcquisitionTax } from '@/lib/calculators/acquisitionTax'

// =================================================================
// 早見表データ（新築住宅の場合）
// =================================================================
const quickReferenceData: QuickReferenceRow[] = [
  { label: '建物1,000万円 + 土地1,000万円', value: '約0万円', subValue: '控除適用後' },
  { label: '建物1,500万円 + 土地1,500万円', value: '約13.5万円', subValue: '控除適用後' },
  { label: '建物2,000万円 + 土地2,000万円', value: '約24万円', subValue: '控除適用後' },
  { label: '建物2,500万円 + 土地2,500万円', value: '約39万円', subValue: '控除適用後' },
  { label: '建物3,000万円 + 土地3,000万円', value: '約54万円', subValue: '控除適用後' },
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

// =================================================================
// 目次データ
// =================================================================
const tocItems: TocItem[] = [
  { id: 'about', title: '不動産取得税とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'reduction', title: '軽減措置', level: 3 },
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
      landEvaluation: landEvalInYen,
      landArea,
    })
  }, [buildingEvalInYen, landEvalInYen, floorArea, landArea, isNewBuilding, isResidential, builtYear, isLongTermQuality])

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <div className="h-[72px] sm:h-[88px]"></div>

        <main className="flex-1">
          <article className="max-w-2xl mx-auto px-5 py-12">
            {/* パンくず */}
            <ToolsBreadcrumb currentPage="不動産取得税シミュレーター" />

            {/* カテゴリー */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                計算ツール
              </span>
            </div>

            {/* タイトル・説明文 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              不動産取得税を10秒で無料計算｜軽減措置対応
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

                {/* 中古の場合：築年 */}
                {!isNewBuilding && (
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
                  ※本計算は2027年3月31日までの特例税率（土地・住宅3%）を適用しています。
                  評価額は固定資産税評価証明書でご確認ください。
                </p>
              </div>
            </div>

            {/* 計算結果の注記 */}
            <CalculatorNote />

            {/* =================================================================
                早見表
            ================================================================= */}
            <section className="mb-12">
              <QuickReferenceTable
                title="不動産取得税 早見表（新築住宅の場合）"
                description="新築住宅（床面積80m²）で軽減措置を適用した場合の目安です。建物評価額から1,200万円を控除、土地は1/2評価を適用。"
                headers={['物件評価額（建物+土地）', '不動産取得税（概算）']}
                rows={quickReferenceData}
                note="※実際の税額は評価額や床面積により異なります"
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
                不動産取得税とは、土地や建物を取得した際に都道府県に納める地方税です。
                売買、贈与、新築、増築など、取得の原因を問わず課税されます。
                ただし、相続による取得は非課税となります。
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                「忘れた頃にやってくる税金」とも言われ、取得後3〜6ヶ月後に納税通知書が届くため、
                資金計画に含めておくことが重要です。
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">特例措置の期限</p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>・土地・住宅の税率3%：2027年3月31日まで（本則4%）</li>
                      <li>・宅地の課税標準1/2：2027年3月31日まで</li>
                      <li>・認定長期優良住宅の1,300万円控除：2026年3月31日まで</li>
                    </ul>
                  </div>
                </div>
              </div>

              <SectionHeading id="calculation" items={tocItems} />
              <p className="text-gray-700 mb-4 leading-relaxed">
                不動産取得税は、建物と土地それぞれについて以下の計算式で算出されます。
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

              {/* 新築住宅の軽減 */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">新築住宅の控除</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>・控除額：1,200万円（認定長期優良住宅は1,300万円）</li>
                  <li>・床面積要件：50m²〜240m²（共同住宅は40m²〜）</li>
                  <li>・住宅用途であること（自己居住・賃貸どちらも可）</li>
                </ul>
              </div>

              {/* 土地の軽減 */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">住宅用土地の軽減</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>・課税標準が1/2に軽減</li>
                  <li>・さらに以下のいずれか多い方を税額から控除：</li>
                  <li className="ml-4">A) 45,000円</li>
                  <li className="ml-4">B)（土地1m²あたり評価額÷2）×（床面積×2、上限200m²）× 3%</li>
                </ul>
              </div>
            </section>

            {/* =================================================================
                中古住宅の控除額テーブル
            ================================================================= */}
            <section className="mb-12">
              <SectionHeading id="used" items={tocItems} />
              <p className="text-gray-700 mb-4 leading-relaxed">
                中古住宅の場合、新築された年によって控除額が異なります。
                なお、<strong>自己居住用のみ</strong>が対象となり、投資用（賃貸用）には適用されません。
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
