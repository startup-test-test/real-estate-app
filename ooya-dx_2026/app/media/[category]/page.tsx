import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticles, getAllCategories } from '@/lib/mdx';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ category: string }>;
}

const categoryMeta: Record<string, { title: string; description: string }> = {
  base: {
    title: '不動産投資の基礎知識',
    description: '不動産投資を始めるための基礎知識。利回り計算、物件選び、リスク管理など初心者に必要な情報を解説。',
  },
  kodate: {
    title: 'ボロ戸建て投資',
    description: 'ボロ戸建て投資の実践ノウハウ。物件選び、リフォーム費用、融資、収益化のポイントを解説。',
  },
};

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = categoryMeta[category];

  if (!meta) {
    return { title: 'カテゴリが見つかりません' };
  }

  const BASE_URL = 'https://ooya-dx2026.vercel.app';

  return {
    title: `${meta.title}｜大家DXジャーナル`,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/media/${category}`,
    },
    openGraph: {
      title: `${meta.title}｜大家DXジャーナル`,
      description: meta.description,
      url: `${BASE_URL}/media/${category}`,
      siteName: '大家DXジャーナル',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${meta.title}｜大家DXジャーナル`,
      description: meta.description,
    },
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const allArticles = getAllArticles();
  const categories = getAllCategories();

  const currentCategory = categories.find((c) => c.slug === category);
  if (!currentCategory) {
    notFound();
  }

  const articles = allArticles.filter((article) => article.categorySlug === category);
  const meta = categoryMeta[category];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      {/* カテゴリヘッダー */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-5 py-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/media" className="hover:text-gray-700">
              大家DXジャーナル
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{currentCategory.name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentCategory.name}
          </h1>
          {meta && (
            <p className="mt-2 text-gray-600">{meta.description}</p>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5">
          {/* カテゴリーナビゲーション */}
          <div className="py-4 border-b border-gray-100 -mx-5 px-5 overflow-x-auto">
            <div className="flex gap-3 min-w-max">
              <Link
                href="/media"
                className="text-sm text-gray-500 hover:text-gray-700 pb-1 border-b-2 border-transparent transition-colors"
              >
                すべて
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/media/${cat.slug}`}
                  className={`text-sm pb-1 border-b-2 transition-colors ${
                    cat.slug === category
                      ? 'font-medium text-gray-900 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 記事一覧 */}
          <div className="divide-y divide-gray-100">
            {articles.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400">記事がありません</p>
              </div>
            ) : (
              articles.map((article, index) => (
                <Link
                  key={`${article.categorySlug}-${article.slug}`}
                  href={`/media/${article.categorySlug}/${article.slug}`}
                  className="block py-6 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-4">
                    {/* サムネイル */}
                    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1 min-w-0">
                      {/* カテゴリー & 日付 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                          {article.category}
                        </span>
                        <time className="text-xs text-gray-400">
                          {formatDate(article.date)}
                        </time>
                      </div>

                      {/* タイトル */}
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                        {article.title}
                      </h2>

                      {/* 説明文 - PCのみ表示 */}
                      <p className="hidden sm:block mt-1 text-sm text-gray-600 leading-relaxed line-clamp-1">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

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
  );
}
