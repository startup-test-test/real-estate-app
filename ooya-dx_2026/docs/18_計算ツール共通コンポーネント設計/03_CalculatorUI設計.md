# CalculatorUI コンポーネント設計詳細

## 概要

シミュレーター（計算機）のUI部品を共通化し、全ツールで統一されたデザインを提供する。

---

## デザイン基準（BrokerageCalculatorCompact準拠）

### カラー

| 要素 | 色 |
|------|-----|
| コンテナ背景 | `bg-blue-50` |
| コンテナボーダー | `border-blue-200` |
| 入力欄背景 | `bg-orange-50` |
| 入力欄ボーダー | `border-orange-300` |
| 結果ボックス背景 | `bg-white` |
| 結果ボックスボーダー | `border-blue-300` |
| バッジ | `bg-blue-600 text-white` |
| メイン結果テキスト | `text-blue-700` |
| 計算式背景 | `bg-gray-50` |
| 警告背景 | `bg-amber-50` |

### フォントサイズ（レスポンシブ）

| 要素 | SP | PC |
|------|-----|-----|
| ラベル | `text-base` | `text-xl` |
| 入力値 | `text-xl` | `text-4xl` |
| 結果ラベル | `text-sm` | `text-xl` |
| 結果値 | `text-xl` | `text-3xl` |
| メイン結果値 | `text-2xl` | `text-5xl` |
| 補足テキスト | `text-xs` | `text-base` |

---

## コンポーネント詳細

### CalculatorContainer.tsx

外枠コンテナ。

```tsx
interface CalculatorContainerProps {
  children: React.ReactNode
  className?: string
}

export function CalculatorContainer({ children, className = '' }: CalculatorContainerProps) {
  return (
    <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm p-3 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}
```

---

### CalculatorTitle.tsx

タイトル表示（アイコン付き）。

```tsx
interface CalculatorTitleProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
}

export function CalculatorTitle({ icon: Icon, title }: CalculatorTitleProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && (
        <div className="bg-blue-500 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <h3 className="text-base sm:text-xl font-bold text-gray-900">
        {title}
      </h3>
    </div>
  )
}
```

---

### CalculatorInputField.tsx

入力欄。

```tsx
interface CalculatorInputFieldProps {
  /** ラベルテキスト */
  label: string
  /** 入力値 */
  value: number
  /** 値変更時のコールバック */
  onChange: (value: number) => void
  /** 単位（万円、%など） */
  unit: string
  /** プレースホルダー */
  placeholder?: string
  /** アイコン */
  icon?: React.ComponentType<{ className?: string }>
  /** 入力タイプ（numeric, decimal） */
  inputMode?: 'numeric' | 'decimal'
  /** ヒントテキスト */
  hint?: string
}

export function CalculatorInputField({
  label,
  value,
  onChange,
  unit,
  placeholder = '',
  icon: Icon,
  inputMode = 'numeric',
  hint,
}: CalculatorInputFieldProps) {
  return (
    <div className="mb-3 sm:mb-4">
      <label className="flex items-center gap-2 text-base sm:text-xl font-bold text-gray-900 mb-3">
        {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode={inputMode}
          value={value === 0 ? '' : value.toLocaleString('ja-JP')}
          onChange={(e) => {
            const cleanValue = e.target.value.replace(/[^0-9.]/g, '')
            onChange(cleanValue === '' ? 0 : Number(cleanValue))
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-4 bg-orange-50 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xl sm:text-4xl font-bold text-gray-900"
        />
        <span className="text-base sm:text-xl text-gray-700 font-medium">{unit}</span>
      </div>
      {hint && (
        <p className="text-sm sm:text-base text-gray-900 mt-2">{hint}</p>
      )}
    </div>
  )
}
```

---

### CalculatorResultBox.tsx

結果表示ボックス。

```tsx
interface CalculatorResultBoxProps {
  children: React.ReactNode
  badge?: string
}

export function CalculatorResultBox({
  children,
  badge = 'シミュレーション結果',
}: CalculatorResultBoxProps) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-5 border-2 border-blue-300 relative mt-6 sm:mt-8">
      {/* バッジ */}
      <div className="absolute -top-4 left-4">
        <span className="inline-block bg-blue-600 text-white text-sm sm:text-lg font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md">
          {badge}
        </span>
      </div>
      <div className="mt-4" />
      <div className="space-y-3 sm:space-y-4">
        {children}
      </div>
    </div>
  )
}
```

---

### CalculatorResultRow.tsx

結果行（ラベル + 値）。

```tsx
interface CalculatorResultRowProps {
  label: string
  value: number
  unit: string
  /** 円単位でも表示するか */
  showYen?: boolean
}

export function CalculatorResultRow({
  label,
  value,
  unit,
  showYen = true,
}: CalculatorResultRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm sm:text-xl font-bold text-gray-700">{label}</span>
      <div className="text-right">
        <span className="text-xl sm:text-3xl font-bold text-gray-900">
          {value.toLocaleString('ja-JP')}{unit}
        </span>
        {showYen && unit === '万円' && (
          <span className="block text-xs sm:text-base text-gray-700">
            （{(value * 10000).toLocaleString('ja-JP')}円）
          </span>
        )}
      </div>
    </div>
  )
}
```

---

### CalculatorMainResult.tsx

メイン結果（強調表示）。

```tsx
interface CalculatorMainResultProps {
  label: string
  value: number
  unit: string
  showYen?: boolean
}

export function CalculatorMainResult({
  label,
  value,
  unit,
  showYen = true,
}: CalculatorMainResultProps) {
  return (
    <div className="flex justify-between items-center border-t-2 border-blue-400 pt-3 sm:pt-4 mt-2">
      <span className="text-base sm:text-2xl font-bold text-gray-900">
        {label}
      </span>
      <div className="text-right">
        <span className="text-2xl sm:text-5xl font-extrabold text-blue-700 whitespace-nowrap">
          {value.toLocaleString('ja-JP')}{unit}
        </span>
        {showYen && unit === '万円' && (
          <span className="block text-xs sm:text-lg text-gray-700">
            （{(value * 10000).toLocaleString('ja-JP')}円）
          </span>
        )}
      </div>
    </div>
  )
}
```

---

### CalculatorCopyButton.tsx

結果コピーボタン。

```tsx
interface CalculatorCopyButtonProps {
  /** コピーするテキストを生成する関数 */
  getResultText: () => string
}

export function CalculatorCopyButton({ getResultText }: CalculatorCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = getResultText()
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // フォールバック処理
    }
  }

  return (
    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex justify-end">
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300 text-xs sm:text-base font-medium ${
          copied
            ? 'bg-green-100 text-green-700 border-2 border-green-400'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-300 hover:border-blue-400'
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>コピーしました！</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">結果をコピーしてLINEやメールで共有</span>
            <span className="sm:hidden">結果をコピーして送る</span>
          </>
        )}
      </button>
    </div>
  )
}
```

---

### CalculatorFormula.tsx

計算式表示。

```tsx
interface CalculatorFormulaProps {
  title?: string
  children: React.ReactNode
}

export function CalculatorFormula({
  title = '計算式',
  children,
}: CalculatorFormulaProps) {
  return (
    <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-3 sm:p-4">
      <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
        📊 {title}
      </p>
      <div className="text-sm sm:text-lg text-gray-800 space-y-2">
        {children}
      </div>
    </div>
  )
}
```

---

### CalculatorWarning.tsx

警告・注意表示。

```tsx
interface CalculatorWarningProps {
  title: string
  children: React.ReactNode
  /** 表示するかどうか */
  show?: boolean
}

export function CalculatorWarning({
  title,
  children,
  show = true,
}: CalculatorWarningProps) {
  if (!show) return null

  return (
    <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 text-sm">{title}</p>
          <div className="text-sm text-amber-700 mt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 使用例

```tsx
export function YieldCalculatorCompact() {
  const [rent, setRent] = useState(0)
  const [price, setPrice] = useState(0)

  const grossYield = price > 0 ? (rent / price) * 100 : 0

  return (
    <CalculatorContainer>
      <CalculatorTitle
        icon={CalculatorIcon}
        title="利回りを計算する"
      />

      <CalculatorInputField
        label="年間家賃収入"
        value={rent}
        onChange={setRent}
        unit="万円"
        placeholder="例：120"
        icon={Wallet}
      />

      <CalculatorInputField
        label="物件価格"
        value={price}
        onChange={setPrice}
        unit="万円"
        placeholder="例：3000"
        icon={Building}
      />

      <CalculatorResultBox>
        <CalculatorMainResult
          label="表面利回り"
          value={grossYield}
          unit="%"
          showYen={false}
        />
        <CalculatorCopyButton getResultText={() => `表面利回り: ${grossYield.toFixed(2)}%`} />
      </CalculatorResultBox>

      <CalculatorFormula>
        <p>表面利回り = 年間家賃収入 ÷ 物件価格 × 100</p>
        <p className="font-mono">
          {rent}万円 ÷ {price}万円 × 100 = {grossYield.toFixed(2)}%
        </p>
      </CalculatorFormula>
    </CalculatorContainer>
  )
}
```
