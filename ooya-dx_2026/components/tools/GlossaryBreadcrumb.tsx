'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// パンくずの中間階層名（1箇所で管理）
export const GLOSSARY_CATEGORY_NAME = '賃貸経営用語集'

interface GlossaryBreadcrumbProps {
  /** 現在の用語名（例: IRR（内部収益率）） */
  currentPage: string
}

/**
 * 用語集ページ用パンくずリスト
 *
 * 使用例:
 * <GlossaryBreadcrumb currentPage="IRR（内部収益率）" />
 *
 * 表示: 大家DX > 賃貸経営用語集 > IRR（内部収益率）
 */
export function GlossaryBreadcrumb({ currentPage }: GlossaryBreadcrumbProps) {
  return (
    <div className="relative mb-2 sm:mb-6">
      <nav
        className="flex items-center text-sm text-gray-500 overflow-x-auto scrollbar-hide whitespace-nowrap"
        aria-label="パンくずリスト"
      >
        <Link href="/" className="hover:text-primary-600 flex-shrink-0">
          大家DX
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
        <Link href="/glossary" className="hover:text-primary-600 flex-shrink-0">
          {GLOSSARY_CATEGORY_NAME}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
        <span className="text-gray-900 flex-shrink-0">{currentPage}</span>
      </nav>
      {/* 右側フェードヒント（スマホのみ） */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
    </div>
  )
}
