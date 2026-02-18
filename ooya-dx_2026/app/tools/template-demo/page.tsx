'use client'

import { ContentPageLayout } from '@/components/tools'

export default function TemplateDemoPage() {
  return (
    <ContentPageLayout
      title="ContentPageLayout サンプル"
      toolPath="/tools/template-demo"
      publishDate="2026年1月15日"
      lastUpdated="2026年2月18日"
      showCalculatorNote={false}
      showDisclaimer={false}
      showCompanyProfile={true}
      additionalContent={
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">追加コンテンツエリア</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-700">
              ここには早見表・説明・FAQ等の追加コンテンツが表示されます。
              ContentPageLayout の <code>additionalContent</code> プロパティで渡します。
            </p>
          </div>
        </div>
      }
    >
      {/* メインコンテンツエリア */}
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">レイアウト情報</h2>
          <ul className="text-blue-800 space-y-1">
            <li><strong>テンプレート名:</strong> ContentPageLayout</li>
            <li><strong>構成:</strong> 2カラム（左：メインコンテンツ、右：サイドバー）</li>
            <li><strong>用途:</strong> ツール計算ページ、メディア記事・カテゴリ</li>
            <li><strong>対象ページ数:</strong> 約42ページ</li>
          </ul>
        </div>

        <div className="prose prose-gray max-w-none">
          <h2>特徴</h2>
          <ul>
            <li>2カラムレイアウト（PC: 左メイン + 右サイドバー300px）</li>
            <li>モバイルでは1カラムに切り替え</li>
            <li>パンくずリスト（Breadcrumb）自動生成</li>
            <li>公開日・更新日の表示</li>
            <li>シェアボタン</li>
            <li>免責事項（ToolDisclaimer）</li>
            <li>会社概要コンパクト版（CompanyProfileCompact）</li>
            <li>サイドバー（ToolSidebar）- PC用</li>
            <li>モバイル用サイドバー（ToolMobileSidebar）</li>
          </ul>

          <h2>使用しているページ例</h2>
          <ul>
            <li><a href="/tools/brokerage">仲介手数料計算</a></li>
            <li><a href="/tools/yield-rate">利回り計算</a></li>
            <li><a href="/tools/depreciation">減価償却計算</a></li>
            <li><a href="/tools/irr">IRR計算</a></li>
          </ul>

          <h2>サンプルコンテンツ</h2>
          <p>
            このページは ContentPageLayout の2カラムレイアウトで表示されています。
            右側にサイドバーが表示されているはずです（PCのみ）。
          </p>
          <p>
            モバイルではサイドバーはメインコンテンツの下に表示されます。
          </p>
        </div>
      </div>
    </ContentPageLayout>
  )
}
