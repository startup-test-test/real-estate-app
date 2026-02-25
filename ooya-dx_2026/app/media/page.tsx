import Link from 'next/link';
import { Metadata } from 'next';
import { getAllArticles, getAllCategories } from '@/lib/mdx';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { MediaArticleList } from '@/components/media-article-list';
import { SimulatorCTA } from '@/components/tools/SimulatorCTA';
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact';
import { Breadcrumb } from '@/components/Breadcrumb';
import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import { HeaderSpacer } from '@/components/HeaderSpacer';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '大家DXジャーナル｜賃貸経営の実践ノウハウ',
  description: '賃貸経営の基礎知識から実践的なノウハウまで。データドリブンな賃貸経営を支援する情報メディア。',
  openGraph: {
    title: '大家DXジャーナル｜賃貸経営の実践ノウハウ',
    description: '賃貸経営の基礎知識から実践的なノウハウまで。データドリブンな賃貸経営を支援する情報メディア。',
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
    title: '大家DXジャーナル｜賃貸経営の実践ノウハウ',
    description: '賃貸経営の基礎知識から実践的なノウハウまで。データドリブンな賃貸経営を支援する情報メディア。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/media',
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
      <WebPageJsonLd
        name="大家DXジャーナル"
        description="賃貸経営の基礎知識から実践的なノウハウまで。データドリブンな賃貸経営を支援する情報メディア。"
        path="/media"
        datePublished="2026-01-15"
        dateModified="2026-02-10"
        breadcrumbs={[{ name: '大家DXジャーナル', href: '/media' }]}
      />
      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <HeaderSpacer />

        {/* パンくずリスト */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-14 pb-3 w-full">
          <Breadcrumb items={[
            { label: '大家DX', href: '/' },
            { label: '大家DXジャーナル' },
          ]} />
        </div>

        {/* 日付 */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
            <span>公開日：2026年1月15日</span>
            <span>更新日：2026年2月10日</span>
          </div>
        </div>

      {/* メインビジュアル - 横幅いっぱい */}
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px]">
        <img
          src="/images/media/hero-media.jpeg"
          alt="大家DXジャーナル"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 whitespace-nowrap">
                現役大家が語る、賃貸経営の基礎と実践
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-700 whitespace-nowrap">
                現役大家が賃貸経営のシミュレーションをわかりやすく解説するメディア
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* 著者プロフィール */}
          <div className="py-8 border-b border-gray-100">
            <Link href="/profile" className="group block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all">
                  <img
                    src="/images/profile/profile.jpg"
                    alt="Tetsuro Togo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      Tetsuro Togo
                    </h3>
                    <span className="text-xs text-gray-400">著者</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    株式会社StartupMarketing 代表取締役　1987年生まれ　埼玉県在住
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    不動産購入実績（都内〜埼玉7軒 / 総購入額1.7億円 / 家賃収入500万円）｜大家DXの企画・開発者｜Web開発・マーケティング歴18年
                  </p>
                </div>
                <div className="hidden sm:flex items-center text-sm text-primary-600 group-hover:translate-x-1 transition-transform">
                  プロフィールを見る
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          <MediaArticleList articles={articles} categories={categories} />

          {/* CTA */}
          <div className="py-12 border-t border-gray-100">
            <SimulatorCTA />
          </div>

          {/* 運営会社・運営者プロフィール */}
          <div className="pb-12">
            <CompanyProfileCompact />
          </div>
        </div>
      </main>

        <LandingFooter />
      </div>
    </>
  );
}
