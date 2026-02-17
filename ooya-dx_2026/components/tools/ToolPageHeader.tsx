'use client'

import Link from 'next/link'
import { ToolsBreadcrumb } from './ToolsBreadcrumb'
import { getToolInfo, formatToolDate } from '@/lib/navigation'

interface ToolPageHeaderProps {
  /** ページタイトル */
  title: string
  /** ツールのパス（例: '/tools/brokerage'） */
  toolPath: string
  /** 公開日（例: '2026年1月15日'） */
  publishDate?: string
  /** 更新日（例: '2026年1月15日'） */
  lastUpdated?: string
}

/**
 * ツールページヘッダー
 * パンくず・日付・H1タイトルをまとめて表示
 */
export function ToolPageHeader({ title, toolPath, publishDate, lastUpdated }: ToolPageHeaderProps) {
  const toolInfo = getToolInfo(toolPath)

  // propsで渡された日付、またはnavigation configから取得
  const displayPublishDate = publishDate || (toolInfo?.publishDate ? formatToolDate(toolInfo.publishDate) : undefined)
  const displayLastUpdated = lastUpdated || (toolInfo?.lastUpdated ? formatToolDate(toolInfo.lastUpdated) : undefined)

  return (
    <>
      {/* パンくず */}
      <ToolsBreadcrumb currentPage={title} />

      {/* 日付・執筆者 */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        {displayPublishDate && <span>公開日：{displayPublishDate}</span>}
        {displayLastUpdated && (
          <span>更新日：{displayLastUpdated}</span>
        )}
        <Link href="/profile" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap">
          <img
            src="/images/profile/profile.jpg"
            alt="東後 哲郎"
            className="w-5 h-5 rounded-full object-cover"
          />
          <span>執筆者：東後 哲郎</span>
        </Link>
      </div>

      {/* H1タイトル */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
        {title}
      </h1>
    </>
  )
}
