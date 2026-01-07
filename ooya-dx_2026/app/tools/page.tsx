import { Metadata } from 'next'
import Link from 'next/link'
import {
  Calculator,
  Receipt,
  Building,
  FileText,
  Landmark,
  TrendingUp,
  Home
} from 'lucide-react'

export const metadata: Metadata = {
  title: '不動産計算ツール一覧 | 大家DX',
  description: '不動産取引に必要な税金・費用を簡単計算。仲介手数料、譲渡所得税、不動産取得税、登録免許税など、スマホで即座に計算できます。',
}

const categories = [
  {
    slug: 'brokerage',
    name: '仲介手数料',
    description: '売買価格から仲介手数料を計算',
    icon: Receipt,
    color: 'bg-blue-500',
    tools: [
      { slug: 'standard', name: '速算式（税込）' },
    ]
  },
  {
    slug: 'transfer-tax',
    name: '譲渡所得税',
    description: '不動産売却時の税金を計算',
    icon: TrendingUp,
    color: 'bg-green-500',
    tools: [],
    comingSoon: true
  },
  {
    slug: 'acquisition-tax',
    name: '不動産取得税',
    description: '不動産購入時の税金を計算',
    icon: Building,
    color: 'bg-purple-500',
    tools: [],
    comingSoon: true
  },
  {
    slug: 'registration-tax',
    name: '登録免許税',
    description: '登記にかかる税金を計算',
    icon: Landmark,
    color: 'bg-orange-500',
    tools: [],
    comingSoon: true
  },
  {
    slug: 'stamp-duty',
    name: '印紙税',
    description: '契約書・領収書の印紙税を計算',
    icon: FileText,
    color: 'bg-red-500',
    tools: [],
    comingSoon: true
  },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* パンくずリスト */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700 flex items-center">
            <Home className="h-4 w-4" />
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">計算ツール</span>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            不動産計算ツール
          </h1>
          <p className="text-gray-600">
            不動産取引に必要な税金・費用を簡単計算。スマホでもPCでも使えます。
          </p>
        </div>

        {/* カテゴリ一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <div
                key={category.slug}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${
                  category.comingSoon ? 'opacity-60' : 'hover:shadow-md transition-shadow'
                }`}
              >
                <div className={`${category.color} px-4 py-3`}>
                  <div className="flex items-center text-white">
                    <Icon className="h-5 w-5 mr-2" />
                    <h2 className="font-semibold">{category.name}</h2>
                    {category.comingSoon && (
                      <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
                        準備中
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3">
                    {category.description}
                  </p>
                  {category.tools.length > 0 ? (
                    <div className="space-y-2">
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${category.slug}/${tool.slug}`}
                          className="block px-4 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-gray-700 hover:text-blue-700 transition-colors"
                        >
                          {tool.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      近日公開予定
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
