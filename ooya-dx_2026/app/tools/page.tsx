import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { toolCategories } from '@/lib/navigation'

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '賃貸経営計算ツール一覧 | 大家DX',
  description: '不動産取引に必要な税金・費用を簡単計算。物件購入・収益分析、融資・ローン、税金、売却、リフォームなど、カテゴリ別に計算ツールをご用意。',
  openGraph: {
    title: '賃貸経営計算ツール一覧 | 大家DX',
    description: '不動産取引に必要な税金・費用を簡単計算。物件購入・収益分析、融資・ローン、税金、売却、リフォームなど、カテゴリ別に計算ツールをご用意。',
    url: `${BASE_URL}/tools`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '賃貸経営計算ツール一覧',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営計算ツール一覧 | 大家DX',
    description: '不動産取引に必要な税金・費用を簡単計算。物件購入・収益分析、融資・ローン、税金、売却、リフォームなど、カテゴリ別に計算ツールをご用意。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// パンくずリスト構造化データ
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '大家DX',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '賃貸経営計算ツール',
      item: `${BASE_URL}/tools`,
    },
  ],
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <div className="h-[72px] sm:h-[88px]"></div>

        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* パンくずリスト */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-primary-600">
                ホーム
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <span className="text-gray-900">賃貸経営計算ツール</span>
            </nav>

            {/* ヘッダー */}
            <div className="mb-12 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                賃貸経営計算ツール
                <span className="ml-3 inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full align-middle">
                  無料
                </span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                不動産取引に必要な税金・費用をかんたん計算。スマホでもPCでも使えます。
              </p>
            </div>

            {/* カテゴリ別ツール一覧（navigation.tsから自動生成） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#32373c] mb-3 pb-3 border-b border-gray-100">{category.title}</h2>
                  <ul className="space-y-1">
                    {category.items.map((item) => (
                      <li key={item.href}>
                        {item.available ? (
                          <a href={item.href} className="text-gray-900 hover:text-gray-600 hover:underline">
                            <span className="text-gray-400 mr-1">›</span>{item.name}
                          </a>
                        ) : (
                          <span className="text-gray-400">
                            <span className="mr-1">›</span>{item.name}（準備中）
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
