'use client'

import { ToolCategoryList } from './ToolCategoryList'
import { ToolSidebarCTA } from './ToolSidebarCTA'

/**
 * モバイル用サイドバー（記事下に表示）
 * PCでは非表示
 */
export function ToolMobileSidebar() {
  return (
    <div className="lg:hidden mt-12 space-y-8">
      {/* 全計算ツール（カテゴリ別） */}
      <ToolCategoryList mobile />

      {/* 不動産投資シミュレーターCTA */}
      <ToolSidebarCTA mobile />
    </div>
  )
}
