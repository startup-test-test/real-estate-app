'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ExternalLink } from 'lucide-react'
import { BrokerageCalculatorCompact, AcquisitionTaxCalculatorCompact, RegistrationTaxCalculatorCompact } from '@/components/calculators'
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer'

// ツール定義
interface Tool {
  id: string
  name: string
  description: string
  seoPath: string
  component: React.ComponentType<{ compact?: boolean; showTitle?: boolean }> | null
}

interface ToolCategory {
  id: string
  name: string
  tools: Tool[]
}

const toolCategories: ToolCategory[] = [
  {
    id: 'expenses',
    name: '諸費用',
    tools: [
      {
        id: 'brokerage',
        name: '仲介手数料',
        description: '売買価格から仲介手数料の上限額を計算',
        seoPath: '/tools/brokerage',
        component: BrokerageCalculatorCompact,
      },
      {
        id: 'acquisition-tax',
        name: '不動産取得税',
        description: '物件取得時にかかる税金を計算',
        seoPath: '/tools/acquisition-tax',
        component: AcquisitionTaxCalculatorCompact,
      },
      {
        id: 'registration-tax',
        name: '登録免許税',
        description: '登記にかかる税金を計算',
        seoPath: '/tools/registration-tax',
        component: RegistrationTaxCalculatorCompact,
      },
      {
        id: 'stamp-tax',
        name: '印紙税',
        description: '契約書に必要な印紙税額を計算',
        seoPath: '/tools/stamp-tax',
        component: null,
      },
    ],
  },
  {
    id: 'income',
    name: '収益指標',
    tools: [
      {
        id: 'yield-rate',
        name: '利回り',
        description: '表面利回り・実質利回りを計算',
        seoPath: '/tools/yield-rate',
        component: null,
      },
      {
        id: 'noi',
        name: 'NOI（営業純利益）',
        description: '経費控除後の純収益を計算',
        seoPath: '/tools/noi',
        component: null,
      },
      {
        id: 'depreciation',
        name: '減価償却',
        description: '建物の減価償却費を計算',
        seoPath: '/tools/depreciation',
        component: null,
      },
    ],
  },
  {
    id: 'loan-sale',
    name: 'ローン・売却',
    tools: [
      {
        id: 'mortgage-loan',
        name: '住宅ローン',
        description: '毎月の返済額を計算',
        seoPath: '/tools/mortgage-loan',
        component: null,
      },
      {
        id: 'capital-gains-tax',
        name: '譲渡所得税',
        description: '売却時の税金を計算',
        seoPath: '/tools/capital-gains-tax',
        component: null,
      },
    ],
  },
]

export default function CalculatorsClient() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  const openModal = (tool: Tool) => {
    if (tool.component) {
      setSelectedTool(tool)
    }
  }

  const closeModal = () => {
    setSelectedTool(null)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            各種計算ツール
            <span className="ml-3 inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full align-middle">
              無料
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            不動産投資に必要な計算を無料でご利用いただけます
          </p>
        </div>

        {/* 3列グリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">
                {category.name}
              </h2>
              <ul className="space-y-2">
                {category.tools.map((tool) => {
                  const isAvailable = !!tool.component

                  return (
                    <li key={tool.id}>
                      {isAvailable ? (
                        <button
                          onClick={() => openModal(tool)}
                          className="text-left text-gray-900 hover:text-blue-600 hover:underline"
                        >
                          <span className="text-gray-400 mr-1">›</span>
                          {tool.name}
                        </button>
                      ) : (
                        <span className="text-gray-400">
                          <span className="mr-1">›</span>
                          {tool.name}（準備中）
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* 免責事項 */}
        <div className="mt-8">
          <ToolDisclaimer />
        </div>

        {/* フッター */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            各ツールの詳細な解説は
            <Link href="/tools" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mx-1">
              計算ツール一覧
            </Link>
            からご覧いただけます
          </p>
        </div>
      </div>

      {/* モーダル */}
      {selectedTool && selectedTool.component && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          {/* モーダル本体 */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900">{selectedTool.name}</h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* スクロールコンテナ */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <selectedTool.component compact={false} showTitle={false} />

              {/* 詳細ページへのリンク */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <Link
                  href={selectedTool.seoPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  詳しい解説を見る
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* スクロールインジケーター（下部グラデーション） */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
