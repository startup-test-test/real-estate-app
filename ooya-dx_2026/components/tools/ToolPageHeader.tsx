'use client'

import { ToolsBreadcrumb } from './ToolsBreadcrumb'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

interface ToolPageHeaderProps {
  /** ページタイトル */
  title: string
  /** ツールのパス（例: '/tools/brokerage'） */
  toolPath: string
  /** 公開日（例: '2026年1月15日'） */
  publishDate?: string
}

/**
 * ツールページヘッダー
 * パンくず・日付・H1タイトルをまとめて表示
 */
export function ToolPageHeader({ title, toolPath, publishDate }: ToolPageHeaderProps) {
  const toolInfo = getToolInfo(toolPath)

  // propsで渡された公開日、またはnavigation configから取得
  const displayPublishDate = publishDate || (toolInfo?.publishDate ? formatToolDate(toolInfo.publishDate) : undefined)

  return (
    <>
      {/* パンくず */}
      <ToolsBreadcrumb currentPage={title} />

      {/* 日付 */}
      <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        {displayPublishDate && <span>公開日：{displayPublishDate}</span>}
        {toolInfo?.lastUpdated && (
          <span>更新日：{formatToolDate(toolInfo.lastUpdated)}</span>
        )}
      </div>

      {/* H1タイトル */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
        {title}
      </h1>
    </>
  )
}
