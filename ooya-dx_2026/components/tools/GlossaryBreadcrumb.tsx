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
 * 表示: ホーム > 賃貸経営用語集 > IRR（内部収益率）
 */
export function GlossaryBreadcrumb({ currentPage }: GlossaryBreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center text-sm text-gray-500 mb-6" aria-label="パンくずリスト">
      <Link href="/" className="hover:text-primary-600">
        ホーム
      </Link>
      <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
      <Link href="/glossary" className="hover:text-primary-600">
        {GLOSSARY_CATEGORY_NAME}
      </Link>
      <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
      <span className="text-gray-900">{currentPage}</span>
    </nav>
  )
}
