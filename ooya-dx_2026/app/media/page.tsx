import Link from 'next/link';
import { Metadata } from 'next';
import { getAllArticles, getAllCategories } from '@/lib/mdx';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { MediaArticleList } from '@/components/media-article-list';
import { Home } from 'lucide-react';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '大家DXジャーナル｜不動産投資の実践ノウハウ',
  description: '不動産投資の基礎知識から実践的なノウハウまで。データドリブンな不動産投資を支援する情報メディア。',
  openGraph: {
    title: '大家DXジャーナル｜不動産投資の実践ノウハウ',
    description: '不動産投資の基礎知識から実践的なノウハウまで。データドリブンな不動産投資を支援する情報メディア。',
    url: `${BASE_URL}/media`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '大家DXジャーナル',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '大家DXジャーナル｜不動産投資の実践ノウハウ',
    description: '不動産投資の基礎知識から実践的なノウハウまで。データドリブンな不動産投資を支援する情報メディア。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
};

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
      name: '大家DXジャーナル',
      item: `${BASE_URL}/media`,
    },
  ],
};

export default function MediaPage() {
  const articles = getAllArticles();
  const categories = getAllCategories();

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

        {/* パンくずリスト */}
        <nav className="max-w-2xl mx-auto px-5 py-3 w-full">
          <ol className="flex items-center text-sm text-gray-500">
            <li className="flex items-center">
              <Link href="/" className="hover:text-gray-700 flex items-center">
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">大家DXジャーナル</span>
            </li>
          </ol>
        </nav>

      {/* メインビジュアル - 横幅いっぱい */}
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px]">
        <img
          src="/images/media/hero-media.jpeg"
          alt="大家DXジャーナル"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <p className="text-2xl sm:text-3xl md:text-4xl text-gray-900 whitespace-nowrap">
                テック×不動産で、意思決定を数字で。
              </p>
              <p className="mt-3 text-base sm:text-lg text-gray-700 whitespace-nowrap">
                現役不動産投資家が不動産投資のシミュレーションをわかりやすく解説するメディア
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5">

          <MediaArticleList articles={articles} categories={categories} />

          {/* CTA */}
          <div className="py-12 text-center border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">
              物件の収益性をシミュレーションしてみませんか？
            </p>
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              シミュレーターを試す
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

        <LandingFooter />
      </div>
    </>
  );
}
