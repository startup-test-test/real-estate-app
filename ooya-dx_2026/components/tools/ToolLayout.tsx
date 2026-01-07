'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface ToolLayoutProps {
  title: string
  description: string
  category: string
  categoryName: string
  children: React.ReactNode
}

export function ToolLayout({
  title,
  description,
  category,
  categoryName,
  children
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* パンくずリスト */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700 flex items-center">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/tools" className="hover:text-gray-700">
            計算ツール
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href={`/tools/${category}`} className="hover:text-gray-700">
            {categoryName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900">{title}</span>
        </nav>

        {/* タイトル */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {children}
        </div>

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ※ 本計算結果は参考値です。実際の取引では、不動産会社にご確認ください。
          </p>
        </div>
      </div>
    </div>
  )
}
