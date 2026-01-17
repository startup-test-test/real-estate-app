'use client'

export type TocItem = {
  id: string
  title: string
  level: 2 | 3  // h2 or h3
}

type TocItemWithNumber = TocItem & {
  number: string  // "1", "2", "1-1", "1-2", etc.
}

/**
 * TocItemsに連番を付与する
 * h2: 1, 2, 3...
 * h3: 1-1, 1-2, 2-1, 2-2...
 */
export function getNumberedItems(items: TocItem[]): TocItemWithNumber[] {
  let h2Index = 0
  let h3Index = 0

  return items.map((item) => {
    if (item.level === 2) {
      h2Index++
      h3Index = 0  // h3のカウンターをリセット
      return { ...item, number: `${h2Index}` }
    } else {
      h3Index++
      return { ...item, number: `${h2Index}-${h3Index}` }
    }
  })
}

/**
 * idで該当するTocItemWithNumberを取得
 */
export function getTocItemById(items: TocItem[], id: string): TocItemWithNumber | undefined {
  const numberedItems = getNumberedItems(items)
  return numberedItems.find((item) => item.id === id)
}

type TableOfContentsProps = {
  items: TocItem[]
}

/**
 * 目次コンポーネント（連番付き自動生成）
 *
 * 使い方:
 * 1. ページで見出しデータを定義
 *    const tocItems: TocItem[] = [
 *      { id: 'about', title: '仲介手数料とは', level: 2 },
 *      { id: 'calculation', title: '計算方法（速算式）', level: 3 },
 *    ]
 *
 * 2. 目次を表示
 *    <TableOfContents items={tocItems} />
 *
 * 3. セクションの見出しを自動生成（連番付き）
 *    <SectionHeading id="about" items={tocItems} />
 *    → <h2 id="about">1. 仲介手数料とは</h2>
 *
 *    <SectionHeading id="calculation" items={tocItems} />
 *    → <h3 id="calculation">1-1. 計算方法（速算式）</h3>
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const numberedItems = getNumberedItems(items)

  return (
    <nav className="bg-gray-50 rounded-lg p-5 mb-10">
      <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        目次
      </h2>
      <ol className="space-y-1 text-sm">
        {numberedItems.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'ml-4' : ''}>
            <a
              href={`#${item.id}`}
              className="block py-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {item.number}. {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * セクション見出しコンポーネント（連番付き自動生成）
 * idとitemsを渡すと、自動的にh2/h3と連番を生成
 */
type SectionHeadingProps = {
  id: string
  items: TocItem[]
  className?: string
}

export function SectionHeading({ id, items, className }: SectionHeadingProps) {
  const item = getTocItemById(items, id)

  if (!item) {
    console.warn(`SectionHeading: id "${id}" not found in tocItems`)
    return null
  }

  const baseClass = item.level === 2
    ? 'text-xl font-bold text-gray-900 mt-12 mb-4 scroll-mt-32'
    : 'text-lg font-semibold text-gray-900 mt-8 mb-3 scroll-mt-32'

  const combinedClass = className ? `${baseClass} ${className}` : baseClass
  const titleWithNumber = `${item.number}. ${item.title}`

  if (item.level === 2) {
    return <h2 id={item.id} className={combinedClass}>{titleWithNumber}</h2>
  }
  return <h3 id={item.id} className={combinedClass}>{titleWithNumber}</h3>
}
