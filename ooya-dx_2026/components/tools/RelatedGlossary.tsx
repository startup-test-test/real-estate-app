/**
 * 関連用語コンポーネント
 *
 * ツールページに関連する用語集へのリンクを表示
 */

import Link from 'next/link'

interface GlossaryItem {
  slug: string
  title: string
}

interface RelatedGlossaryProps {
  /** 関連用語のリスト */
  items: GlossaryItem[]
}

export function RelatedGlossary({ items }: RelatedGlossaryProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-[#32373c] mb-4 pb-3 border-b border-gray-100">
        関連用語
      </h3>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/glossary/${item.slug}`}
              className="text-gray-900 hover:text-gray-600 hover:underline text-sm"
            >
              <span className="text-gray-400 mr-1">›</span>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link
          href="/glossary"
          className="text-gray-900 hover:text-gray-600 hover:underline text-sm"
        >
          <span className="text-gray-400 mr-1">›</span>
          すべての用語を見る
        </Link>
      </div>
    </div>
  )
}
