'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Info, AlertTriangle } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { NumberInput } from '@/components/tools/NumberInput'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import {
  calculateInheritanceTax,
  INHERITANCE_TAX_QUICK_TABLE,
  INHERITANCE_TAX_QUICK_TABLE_NO_SPOUSE,
  formatManYen,
} from '@/lib/calculators/inheritanceTax'

// =================================================================
// 早見表データ（配偶者と子2人の場合）
// =================================================================
const quickReferenceDataWithSpouse: QuickReferenceRow[] = INHERITANCE_TAX_QUICK_TABLE.map(row => ({
  label: formatManYen(row.assets),
  value: formatManYen(row.tax),
  subValue: '配偶者+子2人',
}))

// 早見表データ（子2人のみの場合）
const quickReferenceDataNoSpouse: QuickReferenceRow[] = INHERITANCE_TAX_QUICK_TABLE_NO_SPOUSE.map(row => ({
  label: formatManYen(row.assets),
  value: formatManYen(row.tax),
  subValue: '子2人のみ',
}))

// =================================================================
// メインコンポーネント
// =================================================================
export function InheritanceTaxCalculator() {
  // 入力状態（万円単位で入力を受け付ける）
  const [totalAssetsInMan, setTotalAssetsInMan] = useState<number>(0)
  const [debtsInMan, setDebtsInMan] = useState<number>(0)
  const [hasSpouse, setHasSpouse] = useState<boolean>(true)
  const [childCount, setChildCount] = useState<number>(2)
  const [lifeInsuranceInMan, setLifeInsuranceInMan] = useState<number>(0)
  const [retirementBenefitInMan, setRetirementBenefitInMan] = useState<number>(0)

  // 円に変換
  const totalAssetsInYen = totalAssetsInMan * 10000
  const debtsInYen = debtsInMan * 10000
  const lifeInsuranceInYen = lifeInsuranceInMan * 10000
  const retirementBenefitInYen = retirementBenefitInMan * 10000

  // 計算結果
  const result = useMemo(() => {
    return calculateInheritanceTax({
      totalAssets: totalAssetsInYen,
      debts: debtsInYen,
      heirs: {
        hasSpouse,
        childCount,
      },
      lifeInsurance: lifeInsuranceInYen,
      retirementBenefit: retirementBenefitInYen,
    })
  }, [totalAssetsInYen, debtsInYen, hasSpouse, childCount, lifeInsuranceInYen, retirementBenefitInYen])

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
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              ホーム
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <Link href="/tools" className="hover:text-primary-600">
              計算ツール
            </Link>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <span className="text-gray-900">相続税シミュレーター</span>
          </nav>

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル・説明文 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            不動産の相続税を10秒で無料計算｜早見表・基礎控除対応
          </h1>
          <p className="text-gray-600 mb-8">
            遺産総額と相続人の人数を入力するだけで、相続税額の目安を概算計算します。
            基礎控除の自動計算、生命保険金・死亡退職金の非課税枠にも対応。
          </p>

          {/* =================================================================
              シミュレーター本体
          ================================================================= */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-12 shadow-sm">
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

              {/* 相続人の構成 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  相続人の構成
                </label>
                <div className="space-y-3">
                  {/* 配偶者 */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasSpouse"
                      checked={hasSpouse}
                      onChange={(e) => setHasSpouse(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasSpouse" className="text-sm text-gray-700">
                      配偶者あり
                    </label>
                  </div>

                  {/* 子の人数 */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700">子の人数：</label>
                    <select
                      value={childCount}
                      onChange={(e) => setChildCount(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}人</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ※法定相続人の数により基礎控除額が変動します
                </p>
              </div>

              {/* 詳細設定（折りたたみ） */}
              <details className="border border-gray-200 rounded-lg">
                <summary className="px-4 py-3 bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 rounded-lg">
                  詳細設定（生命保険金・退職金）
                </summary>
                <div className="p-4 space-y-4">
                  <NumberInput
                    label="生命保険金"
                    value={lifeInsuranceInMan}
                    onChange={setLifeInsuranceInMan}
                    unit="万円"
                    placeholder="例：1000"
                  />
                  <NumberInput
                    label="死亡退職金"
                    value={retirementBenefitInMan}
                    onChange={setRetirementBenefitInMan}
                    unit="万円"
                    placeholder="例：500"
                  />
                  <p className="text-xs text-gray-500">
                    ※生命保険金・死亡退職金には「500万円×法定相続人の数」の非課税枠があります
                  </p>
                </div>
              </details>
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

                {result.taxableInsurance > 0 && (
                  <>
                    <span className="text-gray-600">課税対象の保険金</span>
                    <span className="text-right text-lg font-medium">+{(result.taxableInsurance / 10000).toLocaleString('ja-JP')}万円</span>
                  </>
                )}

                {result.taxableRetirement > 0 && (
                  <>
                    <span className="text-gray-600">課税対象の退職金</span>
                    <span className="text-right text-lg font-medium">+{(result.taxableRetirement / 10000).toLocaleString('ja-JP')}万円</span>
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

            {/* 相続人別の詳細 */}
            {result.heirDetails.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">法定相続分に基づく算出税額（参考）</p>
                <div className="text-xs text-blue-700 space-y-1">
                  {result.heirDetails.map((detail, index) => (
                    <p key={index}>
                      {detail.heirType === 'spouse' ? '配偶者' : detail.heirType === 'child' ? '子' : detail.heirType === 'parent' ? '親' : '兄弟姉妹'}
                      （{detail.legalShare}）：{(detail.legalShareAmount / 10000).toLocaleString()}万円 → 税額{(detail.calculatedTax / 10000).toLocaleString()}万円
                    </p>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ※実際の分割割合によって各相続人の負担額は変動します
                </p>
              </div>
            )}

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

          {/* =================================================================
              早見表（シミュレーター直下）
          ================================================================= */}
          <section className="mb-12">
            <QuickReferenceTable
              title="相続税額早見表（配偶者と子2人の場合）"
              description="配偶者と子2人が相続人の場合の相続税額の目安です。配偶者の税額軽減を適用した後の税額を表示しています。"
              headers={['遺産総額', '相続税額（概算）']}
              rows={quickReferenceDataWithSpouse}
              note="※配偶者の税額軽減（法定相続分または1億6千万円まで非課税）を考慮した概算値です"
            />
          </section>

          <section className="mb-12">
            <QuickReferenceTable
              title="相続税額早見表（子2人のみの場合）"
              description="子2人のみが相続人の場合（配偶者がいない場合）の相続税額の目安です。"
              headers={['遺産総額', '相続税額（概算）']}
              rows={quickReferenceDataNoSpouse}
              note="※配偶者がいない場合は税額軽減がないため、税負担が重くなります"
            />
          </section>

          {/* =================================================================
              目次
          ================================================================= */}
          <nav className="bg-gray-50 rounded-lg p-5 mb-10">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              目次
            </h2>
            <ol className="space-y-1 text-sm">
              <li>
                <a href="#about" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  相続税とは
                </a>
              </li>
              <li className="ml-4">
                <a href="#basic-deduction" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  基礎控除の計算
                </a>
              </li>
              <li className="ml-4">
                <a href="#calculation" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  相続税の計算方法
                </a>
              </li>
              <li className="ml-4">
                <a href="#tax-rate" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  税率表
                </a>
              </li>
              <li>
                <a href="#special" className="block py-1 text-gray-600 hover:text-primary-600 transition-colors">
                  主な特例・控除制度
                </a>
              </li>
            </ol>
          </nav>

          {/* =================================================================
              解説セクション
          ================================================================= */}
          <section className="mb-12">
            <h2 id="about" className="text-xl font-bold text-gray-900 mb-4">
              相続税とは
            </h2>
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

            <h3 id="basic-deduction" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              基礎控除の計算
            </h3>
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
              <p className="text-sm text-gray-500 mt-2">
                → 遺産総額が4,800万円以下であれば、原則として相続税は課税されません
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">法定相続人の数に関する注意点</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>・養子は、実子がいる場合1人まで、いない場合2人までが法定相続人の数に算入されます</li>
                    <li>・相続放棄した人も法定相続人の数に含まれます</li>
                    <li>・代襲相続人（孫など）も法定相続人に含まれます</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 id="calculation" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              相続税の計算方法
            </h3>
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

            <h3 id="tax-rate" className="text-lg font-semibold text-gray-900 mt-8 mb-3">
              税率表（速算表）
            </h3>
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
          </section>

          {/* =================================================================
              主な特例・控除制度
          ================================================================= */}
          <section className="mb-12">
            <h2 id="special" className="text-xl font-bold text-gray-900 mb-4">
              主な特例・控除制度
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">配偶者の税額軽減</h3>
                <p className="text-sm text-gray-700 mb-2">
                  配偶者が取得した財産について、以下のいずれか多い金額まで相続税がかからない制度です。
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>・1億6千万円</li>
                  <li>・配偶者の法定相続分相当額</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  ※適用には申告が必要です
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">小規模宅地等の特例</h3>
                <p className="text-sm text-gray-700 mb-2">
                  被相続人の自宅敷地や事業用地について、評価額を最大80%減額できる特例です。
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>・特定居住用宅地等：330㎡まで80%減額</li>
                  <li>・特定事業用宅地等：400㎡まで80%減額</li>
                  <li>・貸付事業用宅地等：200㎡まで50%減額</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  ※適用には細かい要件があります。詳細は専門家にご相談ください
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">生命保険金・死亡退職金の非課税枠</h3>
                <p className="text-sm text-gray-700 mb-2">
                  生命保険金や死亡退職金には、以下の非課税枠が設けられています。
                </p>
                <div className="bg-gray-100 rounded-lg p-3 mt-2">
                  <p className="font-mono text-gray-800 text-center text-sm">
                    非課税枠 = 500万円 × 法定相続人の数
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ※生命保険金と死亡退職金は別々に非課税枠が適用されます
                </p>
              </div>
            </div>
          </section>

          {/* =================================================================
              参考リンク（エビデンス）
          ================================================================= */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">参考リンク</h3>
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
