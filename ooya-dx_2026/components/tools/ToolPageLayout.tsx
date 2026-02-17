'use client'

import { ReactNode, Suspense } from 'react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { ToolPageHeader } from './ToolPageHeader'
import { ToolSidebar } from './ToolSidebar'
import { ToolMobileSidebar } from './ToolMobileSidebar'
import { ToolDisclaimer } from './ToolDisclaimer'
import { CompanyProfileCompact } from './CompanyProfileCompact'
import { CalculatorNote } from './CalculatorNote'
import { ShareButtons } from './ShareButtons'
import { HeaderSpacer } from '@/components/HeaderSpacer';

interface ToolPageLayoutProps {
  /** ページタイトル（H1・パンくず用） */
  title: string
  /** ツールのパス（例: '/tools/brokerage'） */
  toolPath: string
  /** 公開日（例: '2026年1月15日'） */
  publishDate?: string
  /** メインコンテンツ（シミュレーター本体） */
  children: ReactNode
  /** 追加コンテンツ（早見表・説明・FAQ等） */
  additionalContent?: ReactNode
  /** 計算結果の注記を表示するか */
  showCalculatorNote?: boolean
  /** シェアボタンを表示するか */
  showShareButtons?: boolean
  /** 免責事項を表示するか */
  showDisclaimer?: boolean
  /** 会社概要を表示するか */
  showCompanyProfile?: boolean
}

/**
 * ツールページ共通レイアウト
 * 2カラム構成（左：メインコンテンツ、右：サイドバー）
 */
export function ToolPageLayout({
  title,
  toolPath,
  publishDate,
  children,
  additionalContent,
  showCalculatorNote = true,
  showShareButtons = true,
  showDisclaimer = true,
  showCompanyProfile = true,
}: ToolPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <HeaderSpacer />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
            {/* 左カラム（メインコンテンツ） */}
            <article>
              <ToolPageHeader
                title={title}
                toolPath={toolPath}
                publishDate={publishDate}
              />

              {/* シミュレーター本体 */}
              <Suspense fallback={
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 animate-pulse">
                  <div className="h-8 bg-blue-100 rounded w-1/2 mb-4" />
                  <div className="h-12 bg-blue-100 rounded mb-4" />
                </div>
              }>
                {children}
              </Suspense>

              {/* 計算結果の注記 */}
              {showCalculatorNote && <CalculatorNote />}

              {/* シェアボタン */}
              {showShareButtons && (
                <div className="flex items-center justify-end mt-4">
                  <ShareButtons title={title} />
                </div>
              )}

              {/* 追加コンテンツ（早見表・説明・FAQ等） */}
              {additionalContent}

              {/* 免責事項 */}
              {showDisclaimer && <ToolDisclaimer />}

              {/* モバイル用サイドバー */}
              <ToolMobileSidebar />

              {/* 会社概要 */}
              {showCompanyProfile && (
                <div className="mt-16">
                  <CompanyProfileCompact />
                </div>
              )}
            </article>

            {/* 右カラム（サイドバー）- PCのみ */}
            <ToolSidebar />
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
