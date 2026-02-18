'use client'

import { Breadcrumb } from '@/components/Breadcrumb'

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
    <Breadcrumb
      items={[
        { label: '大家DX', href: '/' },
        { label: TOOLS_CATEGORY_NAME, href: '/tools' },
        { label: currentPage },
      ]}
    />
  )
}
