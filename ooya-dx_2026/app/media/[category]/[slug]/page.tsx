import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getArticleBySlug, getAllArticlePaths } from '@/lib/mdx';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import Link from 'next/link';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const paths = getAllArticlePaths();
  return paths.map((path) => ({
    category: path.categorySlug,
    slug: path.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  const article = getArticleBySlug(category, slug);

  if (!article) {
    return {
      title: '記事が見つかりません',
    };
  }

  return {
    title: `${article.title}｜大家DXジャーナル`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      images: article.thumbnail ? [article.thumbnail] : [],
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

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const article = getArticleBySlug(category, slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-2xl mx-auto px-5 py-12">
          {/* パンくず */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/media" className="hover:text-primary-600">
              大家DXジャーナル
            </Link>
            <span className="mx-2">/</span>
            <span>{article.category}</span>
          </nav>

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              {article.category}
            </span>
            <time className="text-xs text-gray-400">
              {formatDate(article.date)}
            </time>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-8">
            {article.title}
          </h1>

          {/* メインビジュアル */}
          {article.thumbnail ? (
            <div className="aspect-video bg-gray-100 rounded-xl mb-10 overflow-hidden">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-10 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}

          {/* 本文 */}
          <div className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-relaxed prose-p:my-4 prose-li:text-base prose-table:text-sm prose-th:bg-gray-50 prose-th:p-3 prose-td:p-3">
            <MDXRemote source={article.content} />
          </div>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4 text-center">
              物件の収益性をシミュレーションしてみませんか？
            </p>
            <div className="text-center">
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
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
