'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Info } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { TableOfContents, SectionHeading, TocItem } from '@/components/tools/TableOfContents'
import { NumberInput } from '@/components/tools/NumberInput'
import { ResultCard } from '@/components/tools/ResultCard'
import { QuickReferenceTable, QuickReferenceRow } from '@/components/tools/QuickReferenceTable'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'
import { CalculatorNote } from '@/components/tools/CalculatorNote'
import { ToolsBreadcrumb } from '@/components/tools/ToolsBreadcrumb'
import { calculateRegistrationTax, RegistrationTaxInput } from '@/lib/calculators/registrationTax'

// 早見表データ（新築建売・自己居住・軽減適用の場合）
const quickReferenceData: QuickReferenceRow[] = [
  { label: '2,000万円', value: '約13万円', subValue: '土地10.5万+建物1.6万+抵当1.6万' },
  { label: '3,000万円', value: '約20万円', subValue: '土地15.7万+建物1.6万+抵当2.4万' },
  { label: '4,000万円', value: '約27万円', subValue: '土地21万+建物1.6万+抵当3.2万' },
  { label: '5,000万円', value: '約34万円', subValue: '土地26.2万+建物1.6万+抵当4万' },
  { label: '6,000万円', value: '約40万円', subValue: '土地31.5万+建物1.6万+抵当4.8万' },
]

// 目次項目
const tocItems: TocItem[] = [
  { id: 'about', title: '登録免許税とは', level: 2 },
  { id: 'calculation', title: '計算方法', level: 3 },
  { id: 'reduction', title: '軽減税率の条件', level: 3 },
  { id: 'example', title: '具体的な計算例', level: 3 },
]

// 構造の選択肢
const structureOptions = [
  { value: 'wood', label: '木造' },
  { value: 'steel', label: '鉄骨造' },
  { value: 'rc', label: 'RC造（鉄筋コンクリート）' },
]

export function RegistrationTaxCalculator() {
  // 取引種別
  const [transactionType, setTransactionType] = useState<'newPurchase' | 'usedPurchase' | 'landOnly'>('newPurchase')

  // 土地
  const [hasLand, setHasLand] = useState(true)
  const [landInputMode, setLandInputMode] = useState<'assessed' | 'market'>('market')
  const [landAssessedValue, setLandAssessedValue] = useState<number>(0)
  const [landMarketPrice, setLandMarketPrice] = useState<number>(0)

  // 建物
  const [hasBuilding, setHasBuilding] = useState(true)
  const [buildingInputMode, setBuildingInputMode] = useState<'assessed' | 'market'>('market')
  const [buildingAssessedValue, setBuildingAssessedValue] = useState<number>(0)
  const [buildingMarketPrice, setBuildingMarketPrice] = useState<number>(0)

  // 新築建物の詳細
  const [prefecture, setPrefecture] = useState('その他')
  const [structure, setStructure] = useState<'wood' | 'steel' | 'rc'>('wood')
  const [floorArea, setFloorArea] = useState<number>(0)

  // 軽減条件
  const [isSelfResidential, setIsSelfResidential] = useState(true)
  const [isLongTermQuality, setIsLongTermQuality] = useState(false)
  const [isLowCarbon, setIsLowCarbon] = useState(false)
  const [isResale, setIsResale] = useState(false)

  // ローン
  const [hasLoan, setHasLoan] = useState(true)
  const [loanAmount, setLoanAmount] = useState<number>(0)

  // 取引種別変更時の処理
  const handleTransactionTypeChange = (type: 'newPurchase' | 'usedPurchase' | 'landOnly') => {
    setTransactionType(type)
    if (type === 'landOnly') {
      setHasBuilding(false)
    } else {
      setHasBuilding(true)
    }
  }

  // 計算結果
  const result = useMemo(() => {
    const input: RegistrationTaxInput = {
      transactionType,
      hasLand,
      landAssessedValue: landInputMode === 'assessed' ? landAssessedValue : undefined,
      landMarketPrice: landInputMode === 'market' ? landMarketPrice : undefined,
      hasBuilding: transactionType !== 'landOnly' && hasBuilding,
      buildingType: transactionType === 'newPurchase' ? 'new' : 'used',
      buildingAssessedValue: buildingInputMode === 'assessed' ? buildingAssessedValue : undefined,
      buildingMarketPrice: buildingInputMode === 'market' ? buildingMarketPrice : undefined,
      prefecture: prefecture === '東京都' ? '東京都' : 'default',
      structure,
      floorArea,
      isSelfResidential,
      isLongTermQuality,
      isLowCarbon,
      isResale,
      hasLoan,
      loanAmount,
    }

    return calculateRegistrationTax(input)
  }, [
    transactionType, hasLand, landInputMode, landAssessedValue, landMarketPrice,
    hasBuilding, buildingInputMode, buildingAssessedValue, buildingMarketPrice,
    prefecture, structure, floorArea,
    isSelfResidential, isLongTermQuality, isLowCarbon, isResale,
    hasLoan, loanAmount
  ])

  // 入力があるか判定
  const hasInput = (hasLand && (landAssessedValue > 0 || landMarketPrice > 0)) ||
    (hasBuilding && transactionType === 'newPurchase' && floorArea > 0) ||
    (hasBuilding && transactionType === 'usedPurchase' && (buildingAssessedValue > 0 || buildingMarketPrice > 0)) ||
    (hasLoan && loanAmount > 0)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <ToolsBreadcrumb currentPage="登録免許税シミュレーター" />

          {/* カテゴリー */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              計算ツール
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            不動産の登録免許税を自動計算｜軽減税率対応
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
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'newPurchase', label: '新築購入' },
                  { value: 'usedPurchase', label: '中古購入' },
                  { value: 'landOnly', label: '土地のみ' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTransactionTypeChange(option.value as 'newPurchase' | 'usedPurchase' | 'landOnly')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      transactionType === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 土地入力 */}
            {hasLand && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">土地</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLandInputMode('market')}
                      className={`text-xs px-2 py-1 rounded ${
                        landInputMode === 'market' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      売買価格から推定
                    </button>
                    <button
                      onClick={() => setLandInputMode('assessed')}
                      className={`text-xs px-2 py-1 rounded ${
                        landInputMode === 'assessed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      評価額を入力
                    </button>
                  </div>
                </div>
                {landInputMode === 'market' ? (
                  <>
                    <NumberInput
                      label="土地の売買価格"
                      value={landMarketPrice}
                      onChange={setLandMarketPrice}
                      unit="円"
                      placeholder="15,000,000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ※売買価格の約70%で固定資産税評価額を推定します
                    </p>
                  </>
                ) : (
                  <NumberInput
                    label="土地の固定資産税評価額"
                    value={landAssessedValue}
                    onChange={setLandAssessedValue}
                    unit="円"
                    placeholder="10,500,000"
                  />
                )}
              </div>
            )}

            {/* 建物入力 */}
            {hasBuilding && transactionType !== 'landOnly' && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  建物 {transactionType === 'newPurchase' ? '（新築）' : '（中古）'}
                </label>

                {transactionType === 'newPurchase' ? (
                  // 新築の場合：構造と床面積から計算
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">都道府県</label>
                        <select
                          value={prefecture}
                          onChange={(e) => setPrefecture(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="東京都">東京都</option>
                          <option value="その他">その他の地域</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">建物構造</label>
                        <select
                          value={structure}
                          onChange={(e) => setStructure(e.target.value as 'wood' | 'steel' | 'rc')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {structureOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <NumberInput
                      label="延床面積"
                      value={floorArea}
                      onChange={setFloorArea}
                      unit="㎡"
                      placeholder="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ※法務局の認定価格で課税標準を計算します
                    </p>
                  </>
                ) : (
                  // 中古の場合：評価額または売買価格
                  <>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setBuildingInputMode('market')}
                        className={`text-xs px-2 py-1 rounded ${
                          buildingInputMode === 'market' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        売買価格から推定
                      </button>
                      <button
                        onClick={() => setBuildingInputMode('assessed')}
                        className={`text-xs px-2 py-1 rounded ${
                          buildingInputMode === 'assessed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        評価額を入力
                      </button>
                    </div>
                    {buildingInputMode === 'market' ? (
                      <>
                        <NumberInput
                          label="建物の売買価格"
                          value={buildingMarketPrice}
                          onChange={setBuildingMarketPrice}
                          unit="円"
                          placeholder="10,000,000"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ※売買価格の約60%で固定資産税評価額を推定します
                        </p>
                      </>
                    ) : (
                      <NumberInput
                        label="建物の固定資産税評価額"
                        value={buildingAssessedValue}
                        onChange={setBuildingAssessedValue}
                        unit="円"
                        placeholder="6,000,000"
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* 軽減条件 */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                軽減税率の適用条件
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelfResidential}
                    onChange={(e) => setIsSelfResidential(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500"
                  />
                  <span className="text-sm text-gray-700">自己居住用（マイホーム）</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isLongTermQuality}
                    onChange={(e) => {
                      setIsLongTermQuality(e.target.checked)
                      if (e.target.checked) setIsLowCarbon(false)
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500"
                  />
                  <span className="text-sm text-gray-700">長期優良住宅の認定あり</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isLowCarbon}
                    onChange={(e) => {
                      setIsLowCarbon(e.target.checked)
                      if (e.target.checked) setIsLongTermQuality(false)
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500"
                  />
                  <span className="text-sm text-gray-700">低炭素住宅の認定あり</span>
                </label>
                {transactionType === 'usedPurchase' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isResale}
                      onChange={(e) => setIsResale(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-500"
                    />
                    <span className="text-sm text-gray-700">買取再販住宅（リノベ済み物件）</span>
                  </label>
                )}
              </div>
              {isSelfResidential && (
                <p className="text-xs text-blue-600 mt-2 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  床面積50㎡以上・取得後1年以内の登記が条件とされています
                </p>
              )}
            </div>

            {/* 住宅ローン */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={hasLoan}
                  onChange={(e) => setHasLoan(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">住宅ローンを利用する</span>
              </label>
              {hasLoan && (
                <NumberInput
                  label="借入金額"
                  value={loanAmount}
                  onChange={setLoanAmount}
                  unit="円"
                  placeholder="30,000,000"
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
              title="登録免許税 早見表"
              description="新築建売住宅（土地+建物）購入時の目安です。自己居住用・軽減税率適用・ローン80%の場合。"
              headers={['物件価格', '登録免許税（税込）']}
              rows={quickReferenceData}
              note="※土地・建物を50:50、建物100㎡・木造で概算。実際の金額は評価額により異なります。"
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
              納税のタイミングは登記申請時とされており、実務上は不動産の決済日（引き渡し日）に司法書士を通じて納付することが一般的です。
              費用は買主が負担することが多いとされています。
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
              これは市場価格（売買価格）とは異なり、一般的に土地は時価の約70%、建物は約50〜60%程度といわれています。
              新築建物の場合は、法務局が定める認定価格（床面積×単価）が使用されるとされています。
            </p>

            <SectionHeading id="reduction" items={tocItems} />
            <p className="text-gray-700 mb-3 leading-relaxed">
              以下の条件を満たす場合、住宅用家屋の軽減税率が適用されるとされています。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>・<strong>自己居住用</strong>であること（投資用は対象外とされています）</li>
                <li>・<strong>床面積50㎡以上</strong>であること</li>
                <li>・取得後<strong>1年以内</strong>に登記を行うこと</li>
                <li>・中古住宅の場合、<strong>新耐震基準</strong>（1982年以降築）を満たすこと</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              土地の売買による移転登記については、住宅用に限らず軽減税率1.5%が適用されるとされています（令和11年3月末まで）。
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
          </section>

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
