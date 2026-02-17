# ContentPageLayout 設計詳細

## 概要

計算ツールページ共通の2カラムレイアウトを提供するコンポーネント。

---

## ContentPageLayout.tsx

### Props

```typescript
interface ContentPageLayoutProps {
  /** ページタイトル（H1・パンくず・OGP用） */
  title: string

  /** ツールのパス（例: '/tools/brokerage'） */
  toolPath: string

  /** 公開日（例: '2026-01-15'） */
  publishDate?: string

  /** メインコンテンツ */
  children: React.ReactNode

  /** 早見表・説明・FAQなどの追加コンテンツ */
  additionalContent?: React.ReactNode
}
```

### 構造

```tsx
export function ContentPageLayout({
  title,
  toolPath,
  publishDate,
  children,
  additionalContent,
}: ContentPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[52px] sm:h-[64px] md:h-[80px]" />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">

            {/* 左カラム（メインコンテンツ） */}
            <article>
              <ToolPageHeader
                title={title}
                toolPath={toolPath}
                publishDate={publishDate}
              />

              {/* シミュレーター本体 */}
              {children}

              {/* 計算結果の注記 */}
              <CalculatorNote />

              {/* シェアボタン */}
              <div className="flex items-center justify-end mt-4">
                <ShareButtons title={title} />
              </div>

              {/* 追加コンテンツ（早見表・説明・FAQ等） */}
              {additionalContent}

              {/* 免責事項 */}
              <ToolDisclaimer />

              {/* モバイル用サイドバー */}
              <ToolMobileSidebar />

              {/* 会社概要 */}
              <div className="mt-16">
                <CompanyProfileCompact />
              </div>
            </article>

            {/* 右カラム（サイドバー）- PCのみ */}
            <ToolSidebar />

          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
```

---

## ToolPageHeader.tsx

### Props

```typescript
interface ToolPageHeaderProps {
  title: string
  toolPath: string
  publishDate?: string
}
```

### 構造

```tsx
export function ToolPageHeader({ title, toolPath, publishDate }: ToolPageHeaderProps) {
  const toolInfo = getToolInfo(toolPath)

  return (
    <>
      {/* パンくず */}
      <ToolsBreadcrumb currentPage={title} />

      {/* 日付 */}
      <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        {publishDate && <span>公開日：{publishDate}</span>}
        {toolInfo?.lastUpdated && (
          <span>更新日：{formatToolDate(toolInfo.lastUpdated)}</span>
        )}
      </div>

      {/* H1タイトル */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
        {title}
      </h1>
    </>
  )
}
```

---

## ToolSidebar.tsx（PC用）

### 構造

```tsx
export function ToolSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 space-y-6">

        {/* 全計算ツール（カテゴリ別） */}
        <ToolCategoryList />

        {/* 不動産投資シミュレーターCTA */}
        <SimulatorCTA />

      </div>
    </aside>
  )
}
```

---

## ToolMobileSidebar.tsx（SP用）

### 構造

```tsx
export function ToolMobileSidebar() {
  return (
    <div className="lg:hidden mt-12 space-y-8">

      {/* 全計算ツール（カテゴリ別） */}
      <ToolCategoryList mobile />

      {/* 不動産投資シミュレーターCTA */}
      <SimulatorCTA mobile />

    </div>
  )
}
```

---

## ToolCategoryList.tsx

### Props

```typescript
interface ToolCategoryListProps {
  /** モバイル表示用スタイル */
  mobile?: boolean
}
```

### 構造

カテゴリごとにツールをグループ化して表示。
データは `/lib/navigation.ts` の `toolCategories` から取得。

---

## SimulatorCTA.tsx

### Props

```typescript
interface SimulatorCTAProps {
  mobile?: boolean
}
```

### 構造

```tsx
export function SimulatorCTA({ mobile = false }: SimulatorCTAProps) {
  return (
    <div className={`bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100 ${
      mobile ? 'p-6' : 'p-5'
    }`}>
      <p className="text-xl font-bold text-gray-900 mb-4 text-center">
        <span className="block text-sm font-normal text-gray-600 mb-1">
          現役大家さんが開発した、
        </span>
        不動産投資シミュレーター
      </p>

      <Image ... />

      <p className="text-sm text-gray-600 mb-4">
        IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。
      </p>

      <Link
        href="/simulator"
        className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg"
      >
        無料でシミュレーションをする
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  )
}
```

---

## 使用例

```tsx
// app/tools/yield/YieldCalculator.tsx
export function YieldCalculator() {
  return (
    <ContentPageLayout
      title="表面利回り・実質利回り計算シミュレーター"
      toolPath="/tools/yield"
      publishDate="2026-01-15"
      additionalContent={
        <>
          <QuickReferenceTable data={yieldTableData} />
          <ExplanationSection />
          <FAQSection faqs={yieldFAQs} />
        </>
      }
    >
      <YieldCalculatorCompact />
    </ContentPageLayout>
  )
}
```
