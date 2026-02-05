'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedLink {
  /** リンク先URL */
  href: string
  /** ラベル */
  label: string
  /** 値（表示する計算結果） */
  value?: string
}

interface CalculatorRelatedLinksProps {
  /** タイトル */
  title?: string
  /** リンク一覧 */
  links: RelatedLink[]
}

/**
 * 関連ツールリンク
 * 関連する計算ツールへのリンクを表示
 */
export function CalculatorRelatedLinks({
  title = 'その他の費用（概算）',
  links,
}: CalculatorRelatedLinksProps) {
  return (
    <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-3 sm:p-4">
      <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
        📋 {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-2 py-2 sm:px-3 sm:py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group border border-blue-200 hover:border-blue-300"
          >
            <span className="text-sm sm:text-base text-blue-800 group-hover:text-blue-900">
              {link.label}
              {link.value && (
                <span className="font-bold text-base sm:text-lg">{link.value}</span>
              )}
            </span>
            <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
