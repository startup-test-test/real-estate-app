'use client'

import Link from 'next/link'
import { Breadcrumb } from '@/components/Breadcrumb'
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
  /** カテゴリ名（例: '不動産投資の基礎知識'） */
  category?: string
  /** カテゴリリンク先（例: '/media/base'） */
  categoryHref?: string
}

/**
 * ツールページヘッダー
 * パンくず・日付・H1タイトルをまとめて表示
 */
export function ToolPageHeader({ title, toolPath, publishDate, lastUpdated, category, categoryHref }: ToolPageHeaderProps) {
  const toolInfo = getToolInfo(toolPath)

  // propsで渡された日付、またはnavigation configから取得
  const displayPublishDate = publishDate || (toolInfo?.publishDate ? formatToolDate(toolInfo.publishDate) : undefined)
  const displayLastUpdated = lastUpdated || (toolInfo?.lastUpdated ? formatToolDate(toolInfo.lastUpdated) : undefined)

  // カテゴリ：明示的に渡されなければ「無料計算ツール」→ /tools をデフォルト表示
  const displayCategory = category || '無料計算ツール'
  const displayCategoryHref = categoryHref || '/tools'

  return (
    <>
      {/* パンくず */}
      {categoryHref?.startsWith('/media') ? (
        <Breadcrumb
          items={[
            { label: '大家DX', href: '/' },
            { label: '大家DXジャーナル', href: '/media' },
            { label: category || '', href: categoryHref },
            { label: title },
          ]}
        />
      ) : (
        <ToolsBreadcrumb currentPage={title} />
      )}

      {/* 日付・執筆者 */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        {displayPublishDate && <span>公開日：{displayPublishDate}</span>}
        {displayLastUpdated && (
          <span>更新日：{displayLastUpdated}</span>
        )}
        <Link href="/profile" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap">
          <img
            src="/images/profile/profile.jpg"
            alt="Tetsuro Togo"
            className="w-5 h-5 rounded-full object-cover"
          />
          <span>執筆者：Tetsuro Togo</span>
        </Link>
        <Link href={displayCategoryHref} className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded hover:bg-primary-100 transition-colors">
          {displayCategory}
        </Link>
      </div>

      {/* H1タイトル */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
        {title}
      </h1>
    </>
  )
}
