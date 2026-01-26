/**
 * 関連用語セクション（サーバーコンポーネント）
 *
 * ツールパスから関連用語を自動取得して表示
 * page.tsxに追加するだけで動作
 */

import Link from 'next/link'
import { getGlossaryTermsByTool } from '@/lib/glossary'

interface RelatedGlossarySectionProps {
  /** ツールのパス（例: '/tools/irr'） */
  toolPath: string
}

export function RelatedGlossarySection({ toolPath }: RelatedGlossarySectionProps) {
  const relatedGlossary = getGlossaryTermsByTool(toolPath)

  if (relatedGlossary.length === 0) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-5">
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8 scroll-mt-24">
          関連用語
        </h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {relatedGlossary.map((term) => (
            <li key={term.slug}>
              <Link
                href={`/glossary/${term.slug}`}
                className="text-gray-700 hover:text-gray-900 hover:underline text-sm"
              >
                <span className="text-gray-400 mr-1">›</span>
                {term.shortTitle}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
