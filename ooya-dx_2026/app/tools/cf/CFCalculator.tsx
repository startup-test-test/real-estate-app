'use client'

import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { ContentPageLayout } from '@/components/tools/ContentPageLayout'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { calculateCF } from '@/lib/calculators/cf'

// ページタイトル（パンくず・h1で共通使用）
const PAGE_TITLE = '賃貸経営のキャッシュフロー 計算シミュレーション'

// 目次項目
const tocItems: TocItem[] = [
  { id: 'about', title: 'キャッシュフロー（CF）とは', level: 2 },
  { id: 'formula', title: 'キャッシュフローの計算式', level: 3 },
  { id: 'cf-tree', title: 'キャッシュフローツリー', level: 2 },
]

/**
 * キャッシュフローシミュレーター
 * ContentPageLayoutを使用した2カラムレイアウト
 */
export function CFCalculator() {
  return (
    <ContentPageLayout
      title={PAGE_TITLE}
      toolPath="/tools/cf"
      additionalContent={<CFAdditionalContent />}
    >
      <CFSimulator />
    </ContentPageLayout>
  )
}

/**
 * CFシミュレーター本体
 */
function CFSimulator() {
  const [annualGPIInMan, setAnnualGPIInMan] = useState<number>(0)
  const [vacancyRate, setVacancyRate] = useState<number>(5)
  const [annualOpexInMan, setAnnualOpexInMan] = useState<number>(0)
  const [annualADSInMan, setAnnualADSInMan] = useState<number>(0)

  const result = useMemo(() => {
    if (annualGPIInMan <= 0) return null
    return calculateCF({
      annualGPIInMan,
      vacancyRate,
      annualOpexInMan,
      annualADSInMan,
    })
  }, [annualGPIInMan, vacancyRate, annualOpexInMan, annualADSInMan])

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-500 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          キャッシュフローを概算計算する
        </h2>
      </div>

      <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 space-y-4">
        <NumberInput
          label="年間満室想定収入（GPI）"
          value={annualGPIInMan}
          onChange={setAnnualGPIInMan}
          unit="万円"
          placeholder="例：600"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            空室率
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={vacancyRate}
              onChange={(e) => setVacancyRate(parseFloat(e.target.value) || 0)}
              step="1"
              min="0"
              max="100"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：5"
            />
            <span className="text-gray-600 font-medium">%</span>
          </div>
        </div>

        <NumberInput
          label="年間運営経費（OPEX）"
          value={annualOpexInMan}
          onChange={setAnnualOpexInMan}
          unit="万円"
          placeholder="例：100"
        />
        <p className="text-xs text-gray-500 -mt-2">
          ※管理費、修繕費、固定資産税、保険料等の合計
        </p>

        <hr className="border-gray-200" />

        <NumberInput
          label="年間ローン返済額（ADS）"
          value={annualADSInMan}
          onChange={setAnnualADSInMan}
          unit="万円"
          placeholder="例：300"
        />
        <p className="text-xs text-gray-500 -mt-2">
          ※元金＋利息の合計
        </p>
      </div>

      {result && (
        <div className="bg-white rounded-lg p-3 sm:p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">キャッシュフローツリー</p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">GPI（満室年収）</span>
                <span className="font-medium">{result.gpi.toLocaleString()}万円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
                <span className="text-gray-500">- 空室損（{vacancyRate}%）</span>
                <span className="text-red-500">-{result.vacancyLoss.toLocaleString()}万円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">= EGI（有効総収入）</span>
                <span className="font-medium">{result.egi.toLocaleString()}万円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
                <span className="text-gray-500">- OPEX（運営経費）</span>
                <span className="text-red-500">-{result.opex.toLocaleString()}万円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-blue-50 px-2 rounded">
                <span className="text-gray-700 font-medium">= NOI（営業純収益）</span>
                <span className="font-bold text-blue-700">{result.noi.toLocaleString()}万円</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 pl-4">
                <span className="text-gray-500">- ADS（ローン返済）</span>
                <span className="text-red-500">-{result.ads.toLocaleString()}万円</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-sm sm:text-base">
            <span className="text-gray-700 font-medium border-t-2 border-blue-300 pt-4">
              税引前CF（BTCF）
            </span>
            <span className={`text-right text-xl sm:text-2xl font-bold border-t-2 border-blue-300 pt-4 ${result.btcf >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
              {result.btcf >= 0 ? '+' : ''}{result.btcf.toLocaleString()}万円/年
            </span>

            <span className="text-gray-600">月間BTCF</span>
            <span className={`text-right font-medium ${result.monthlyBTCF >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result.monthlyBTCF >= 0 ? '+' : ''}{result.monthlyBTCF.toLocaleString()}万円/月
            </span>

            {result.dscr !== null && (
              <>
                <span className="text-gray-600 border-t pt-3">DSCR</span>
                <span className={`text-right font-medium border-t pt-3 ${result.dscr >= 1.2 ? 'text-green-600' : result.dscr >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {result.dscr.toFixed(2)}
                </span>
              </>
            )}

            <span className="text-gray-600">経費率</span>
            <span className="text-right font-medium">
              {result.opexRatio.toFixed(1)}%
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">計算式</p>
            <div className="text-xs sm:text-sm text-gray-700 font-mono space-y-1">
              <p>BTCF = NOI - ADS</p>
              <p className="text-xs text-gray-500 mt-2">
                = {result.noi.toLocaleString()}万円 - {result.ads.toLocaleString()}万円
              </p>
              <p className="text-xs text-gray-500">
                = {result.btcf.toLocaleString()}万円/年
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * CFページ固有の追加コンテンツ
 */
function CFAdditionalContent() {
  return (
    <>
      <TableOfContents items={tocItems} />

      <section className="mb-12">
        <SectionHeading id="about" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          キャッシュフロー（CF: Cash Flow）は、賃貸経営において実際に手元に残る現金の流れを表します。
          収入から経費やローン返済を差し引いた後、最終的にいくら手元に残るかを把握するための指標です。
        </p>
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          キャッシュフローがプラスであれば収入が支出を上回っている状態、マイナスであれば持ち出しが発生している状態を意味します。
        </p>

        <SectionHeading id="formula" items={tocItems} />
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="font-mono text-gray-800 text-center text-xs sm:text-sm">
            BTCF（税引前CF）= NOI - ADS
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            NOI: 営業純収益、ADS: 年間ローン返済額
          </p>
        </div>
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          税引後のキャッシュフローは、所得状況や適用される税率により異なります。
          詳細な税金計算については税理士にご相談ください。
        </p>

        <SectionHeading id="cf-tree" items={tocItems} />
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          キャッシュフローツリーは、収入から最終的な手取りまでの流れを可視化したものです。
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <ul className="text-xs sm:text-sm text-gray-700 space-y-2">
            <li><strong>GPI</strong>：総潜在収入（満室時の年間収入）</li>
            <li><strong>EGI</strong>：有効総収入（GPIから空室損を差し引いた額）</li>
            <li><strong>NOI</strong>：営業純収益（EGIから運営経費を差し引いた額）</li>
            <li><strong>BTCF</strong>：税引前キャッシュフロー（NOIからローン返済を差し引いた額）</li>
            <li><strong>ATCF</strong>：税引後キャッシュフロー（BTCFから税金を差し引いた額）</li>
          </ul>
        </div>
      </section>
    </>
  )
}
