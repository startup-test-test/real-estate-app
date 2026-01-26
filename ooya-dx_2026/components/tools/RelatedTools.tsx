/**
 * 関連シミュレーターコンポーネント
 *
 * カテゴリ別にツールを表示
 * navigation.ts のカテゴリ情報を活用して自動生成
 * デザインはトップページの「賃貸経営計算ツール」セクションと統一
 */

import Link from 'next/link'
import { toolCategories, ToolCategory, NavigationItem } from '@/lib/navigation'

interface RelatedToolsProps {
  /** 現在のページのパス（例: '/tools/gift-tax'） */
  currentPath: string
  /** 表示する最大カテゴリ数（デフォルト: 3） */
  maxCategories?: number
  /** カテゴリあたりの最大表示件数（デフォルト: 5） */
  maxItemsPerCategory?: number
}

interface CategoryWithTools {
  category: ToolCategory
  tools: NavigationItem[]
}

/**
 * カテゴリ別にツールを取得（現在のカテゴリを優先）
 */
function getRelatedToolsByCategory(
  currentPath: string,
  maxCategories: number,
  maxItemsPerCategory: number
): CategoryWithTools[] {
  // 現在のツールが属するカテゴリを検索
  const currentCategory = toolCategories.find(category =>
    category.items.some(item => item.href === currentPath)
  )

  const result: CategoryWithTools[] = []

  // 現在のカテゴリを最初に追加
  if (currentCategory) {
    const tools = currentCategory.items.filter(
      item => item.available && item.href !== currentPath
    )
    if (tools.length > 0) {
      result.push({
        category: currentCategory,
        tools: tools.slice(0, maxItemsPerCategory)
      })
    }
  }

  // 他のカテゴリを追加
  for (const category of toolCategories) {
    if (result.length >= maxCategories) break
    if (currentCategory && category.id === currentCategory.id) continue

    const tools = category.items.filter(
      item => item.available && item.href !== currentPath
    )
    if (tools.length > 0) {
      result.push({
        category,
        tools: tools.slice(0, maxItemsPerCategory)
      })
    }
  }

  return result
}

export function RelatedTools({
  currentPath,
  maxCategories = 99,
  maxItemsPerCategory = 99
}: RelatedToolsProps) {
  const categoriesWithTools = getRelatedToolsByCategory(currentPath, maxCategories, maxItemsPerCategory)

  if (categoriesWithTools.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-[#32373c] mb-4 pb-3 border-b border-gray-100">
        関連する無料の賃貸経営シミュレーター
      </h3>
      <div className="space-y-4">
        {categoriesWithTools.map(({ category, tools }) => (
          <div key={category.id}>
            <h4 className="text-sm font-semibold text-gray-500 mb-2">
              {category.title}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-gray-900 hover:text-gray-600 hover:underline text-sm"
                  >
                    <span className="text-gray-400 mr-1">›</span>
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link
          href="/tools"
          className="text-gray-900 hover:text-gray-600 hover:underline text-sm"
        >
          <span className="text-gray-400 mr-1">›</span>
          すべてのシミュレーターを見る
        </Link>
      </div>
    </div>
  )
}
