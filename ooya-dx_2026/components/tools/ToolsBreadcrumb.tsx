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
 * 表示: ホーム > 不動産・賃貸経営計算ツール > 贈与税シミュレーター
 */
export function ToolsBreadcrumb({ currentPage }: ToolsBreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="パンくずリスト">
      <Link href="/" className="hover:text-primary-600">
        ホーム
      </Link>
      <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
      <Link href="/tools" className="hover:text-primary-600">
        {TOOLS_CATEGORY_NAME}
      </Link>
      <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
      <span className="text-gray-900">{currentPage}</span>
    </nav>
  )
}
