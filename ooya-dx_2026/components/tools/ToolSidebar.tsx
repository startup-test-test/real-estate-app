'use client'

import { ToolCategoryList } from './ToolCategoryList'
import { ToolSidebarCTA } from './ToolSidebarCTA'

/**
 * ツールページ右サイドバー（PCのみ表示）
 * スティッキー配置でツール一覧とCTAを表示
 */
export function ToolSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 space-y-6">
        {/* 全計算ツール（カテゴリ別） */}
        <ToolCategoryList />

        {/* 不動産投資シミュレーターCTA */}
        <ToolSidebarCTA />
      </div>
    </aside>
  )
}
