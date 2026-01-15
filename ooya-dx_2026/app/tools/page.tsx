import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '不動産計算ツール一覧 | 大家DX',
  description: '不動産取引に必要な税金・費用を簡単計算。仲介手数料、譲渡所得税、不動産取得税、登録免許税など、スマホで即座に計算できます。',
  openGraph: {
    title: '不動産計算ツール一覧 | 大家DX',
    description: '不動産取引に必要な税金・費用を簡単計算。仲介手数料、譲渡所得税、不動産取得税、登録免許税など、スマホで即座に計算できます。',
    url: `${BASE_URL}/tools`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '不動産計算ツール一覧',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産計算ツール一覧 | 大家DX',
    description: '不動産取引に必要な税金・費用を簡単計算。仲介手数料、譲渡所得税、不動産取得税、登録免許税など、スマホで即座に計算できます。',
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
      name: '不動産計算ツール',
      item: `${BASE_URL}/tools`,
    },
  ],
};

const tools = [
  { name: '仲介手数料', description: '売買価格から仲介手数料を計算', href: '/tools/brokerage', available: true },
  { name: '住宅ローン', description: '毎月返済額・総返済額を計算', href: '/tools/mortgage-loan', available: true },
  { name: '贈与税', description: '不動産贈与時の税金を計算', href: '/tools/gift-tax', available: true },
  { name: '相続税', description: '遺産相続時の税金を計算', href: '/tools/inheritance-tax', available: true },
  { name: '譲渡所得税', description: '不動産売却時の税金を計算', href: '/tools/capital-gains-tax', available: true },
  { name: '不動産取得税', description: '不動産購入時の税金を計算', href: '/tools/acquisition-tax', available: true },
  { name: '登録免許税', description: '登記にかかる税金を計算', href: '/tools/registration-tax', available: true },
  { name: '印紙税', description: '契約書・領収書の印紙税を計算', href: '/tools/stamp-tax', available: true },
  { name: '減価償却', description: '建物の年間減価償却費を計算', href: '/tools/depreciation', available: true },
  { name: '法人税', description: '不動産法人の税金を計算', href: '/tools/corporate-tax', available: true },
]

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
              <span className="text-gray-900">計算ツール</span>
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

            {/* ツール一覧 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {tools.map((tool, index) => (
                <a
                  key={index}
                  href={tool.available ? tool.href : undefined}
                  className={`block bg-white rounded-2xl p-5 shadow-sm transition-all duration-300 ${
                    tool.available
                      ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                      : 'opacity-50 cursor-default'
                  }`}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-[#32373c] mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{tool.description}</p>
                  {tool.available ? (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                      無料で使う
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                      準備中
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
