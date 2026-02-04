'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// パンくずの中間階層名（1箇所で管理）
export const TOOLS_CATEGORY_NAME = '不動産・賃貸経営計算ツール'

interface ToolsBreadcrumbProps {
  /** 現在のツール名（例: 贈与税シミュレーター） */
  currentPage: string
}

/**
 * ツールページ用パンくずリスト
 *
 * 使用例:
 * <ToolsBreadcrumb currentPage="贈与税シミュレーター" />
 *
 * 表示: 大家DX > 不動産・賃貸経営計算ツール > 贈与税シミュレーター
 */
export function ToolsBreadcrumb({ currentPage }: ToolsBreadcrumbProps) {
  return (
    <div className="relative mb-2 sm:mb-3">
      <nav
        className="flex items-center text-sm text-gray-500 overflow-x-auto scrollbar-hide whitespace-nowrap"
        aria-label="パンくずリスト"
      >
        <Link href="/" className="hover:text-primary-600 flex-shrink-0">
          大家DX
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
        <Link href="/tools" className="hover:text-primary-600 flex-shrink-0">
          {TOOLS_CATEGORY_NAME}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
        <span className="text-gray-900 flex-shrink-0">{currentPage}</span>
      </nav>
      {/* 右側フェードヒント（スマホのみ） */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
    </div>
  )
}
