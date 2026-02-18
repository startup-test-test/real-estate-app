'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string  // undefinedなら現在ページ（最終項目）
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="relative mb-2 sm:mb-3">
      <nav
        className="flex items-center text-sm text-gray-500 overflow-x-auto scrollbar-hide whitespace-nowrap"
        aria-label="パンくずリスト"
      >
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            {item.href ? (
              <Link href={item.href} className="hover:text-primary-600 flex-shrink-0">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 flex-shrink-0">{item.label}</span>
            )}
          </Fragment>
        ))}
      </nav>
      {/* 右側フェードヒント（スマホのみ） */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
    </div>
  )
}
