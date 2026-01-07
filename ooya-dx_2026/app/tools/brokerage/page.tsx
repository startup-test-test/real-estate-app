import { Metadata } from 'next'
import Link from 'next/link'
import { Receipt, ChevronRight, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: '仲介手数料計算 | 大家DX',
  description: '不動産売買の仲介手数料を簡単計算。速算式、レーマン方式など複数の計算方法に対応。',
}

const tools = [
  {
    slug: 'standard',
    name: '速算式（税込）',
    description: '売買価格から仲介手数料を速算式で計算。最も一般的な計算方法です。',
  },
  // 今後追加
  // { slug: 'lehman', name: 'レーマン方式', description: 'M&Aで使われるレーマン方式での計算' },
]

export default function BrokerageCategoryPage() {
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
          <span className="text-gray-900">仲介手数料</span>
        </nav>

        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <div className="bg-blue-500 p-3 rounded-lg mr-4">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">仲介手数料計算</h1>
            <p className="text-gray-600">売買価格から仲介手数料を計算</p>
          </div>
        </div>

        {/* ツール一覧 */}
        <div className="space-y-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/brokerage/${tool.slug}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-gray-900">{tool.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        {/* 説明 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">仲介手数料とは</h3>
          <p className="text-sm text-blue-800">
            不動産売買の際に、仲介を行った不動産会社に支払う報酬です。
            宅建業法により上限額が定められており、売買価格に応じた料率で計算されます。
          </p>
        </div>
      </div>
    </div>
  )
}
