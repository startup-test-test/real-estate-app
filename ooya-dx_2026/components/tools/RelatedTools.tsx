/**
 * 関連シミュレーターコンポーネント
 *
 * 同じカテゴリのツールを自動的に表示
 * navigation.ts のカテゴリ情報を活用して自動生成
 * デザインはトップページの「賃貸経営計算ツール」セクションと統一
 */

import Link from 'next/link'
import { toolCategories, NavigationItem } from '@/lib/navigation'

interface RelatedToolsProps {
  /** 現在のページのパス（例: '/tools/gift-tax'） */
  currentPath: string
  /** 表示する最大件数（デフォルト: 6） */
  maxItems?: number
}

/**
 * 現在のツールと同じカテゴリのツールを取得
 */
function getRelatedTools(currentPath: string, maxItems: number): NavigationItem[] {
  // 現在のツールが属するカテゴリを検索
  const currentCategory = toolCategories.find(category =>
    category.items.some(item => item.href === currentPath)
  )

  if (!currentCategory) {
    // カテゴリが見つからない場合は全ての利用可能なツールから表示
    const allAvailable = toolCategories
      .flatMap(cat => cat.items)
      .filter(item => item.available && item.href !== currentPath)
    return allAvailable.slice(0, maxItems)
  }

  // 同じカテゴリの他のツール（利用可能なもののみ）
  const sameCategory = currentCategory.items.filter(
    item => item.available && item.href !== currentPath
  )

  // 同じカテゴリで足りない場合は他のカテゴリから補完
  if (sameCategory.length >= maxItems) {
    return sameCategory.slice(0, maxItems)
  }

  const otherCategories = toolCategories
    .filter(cat => cat.id !== currentCategory.id)
    .flatMap(cat => cat.items)
    .filter(item => item.available && item.href !== currentPath)

  return [...sameCategory, ...otherCategories].slice(0, maxItems)
}

export function RelatedTools({ currentPath, maxItems = 6 }: RelatedToolsProps) {
  const relatedTools = getRelatedTools(currentPath, maxItems)

  if (relatedTools.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-[#32373c] mb-3 pb-3 border-b border-gray-100">
        関連するシミュレーター
      </h3>
      <ul className="space-y-1">
        {relatedTools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="text-gray-900 hover:text-gray-600 hover:underline"
            >
              <span className="text-gray-400 mr-1">›</span>
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
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
