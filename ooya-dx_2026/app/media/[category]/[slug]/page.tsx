import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { getArticleBySlug, getAllArticlePaths } from '@/lib/mdx';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { TableOfContents } from '@/components/table-of-contents';
import { SimulatorCTA } from '@/components/tools/SimulatorCTA';
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact';
import { RelatedTools } from '@/components/tools/RelatedTools';
import { ShareButtons } from '@/components/tools/ShareButtons';
import { articleAuthorRef, articlePublisherRef } from '@/lib/eeat';
import Link from 'next/link';
import { HeaderSpacer } from '@/components/HeaderSpacer';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// generateStaticParamsに含まれないパスは自動的に404を返す
export const dynamicParams = false;

export async function generateStaticParams() {
  const paths = getAllArticlePaths();
  return paths.map((path) => ({
    category: path.categorySlug,
    slug: path.slug,
  }));
}

const BASE_URL = 'https://ooya.tech';

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  const article = getArticleBySlug(category, slug);

  if (!article) {
    notFound();
  }

  const url = `${BASE_URL}/media/${category}/${slug}`;

  return {
    title: `${article.title}｜大家DXジャーナル`,
    description: article.description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: url,
      siteName: '大家DXジャーナル',
      type: 'article',
      publishedTime: article.date,
      authors: ['Tetsuro Togo'],
      images: article.thumbnail
        ? [
            {
              url: article.thumbnail,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
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

  const url = `${BASE_URL}/media/${category}/${slug}`;

  // Article構造化データ
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.thumbnail || undefined,
    datePublished: article.date,
    dateModified: article.date,
    author: articleAuthorRef,
    publisher: articlePublisherRef,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
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
        name: '大家DXジャーナル',
        item: `${BASE_URL}/media`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.category,
        item: `${BASE_URL}/media/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: url,
      },
    ],
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <HeaderSpacer />

        <main className="flex-1">
          <article className="max-w-2xl mx-auto px-5 py-12">
            {/* パンくず */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
              <Link href="/media" className="hover:text-primary-600">
                大家DXジャーナル
              </Link>
              <svg className="h-4 w-4 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900">{article.category}</span>
            </nav>

            {/* カテゴリー & 日付 & 執筆者 */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {article.category}
              </span>
              <time className="text-xs text-gray-400">
                {formatDate(article.date)}
              </time>
              <Link href="/profile" className="flex items-center gap-1.5 text-xs text-gray-900 hover:text-blue-600 transition-colors">
                <img
                  src="/images/profile/profile.jpg"
                  alt="東後 哲郎"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>執筆者：東後 哲郎</span>
              </Link>
            </div>

            {/* タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {article.title}
            </h1>

            {/* シェアボタン */}
            <div className="mb-8">
              <ShareButtons title={article.title} url={url} />
            </div>

            {/* メインビジュアル */}
            {article.thumbnail ? (
              <div className="aspect-video bg-gray-100 mb-10 overflow-hidden">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 mb-10 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}

            {/* 目次 */}
            <TableOfContents content={article.content} />

            {/* 本文 */}
            <div className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-relaxed prose-p:my-4 prose-li:text-base [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-sm [&_th]:bg-gray-100 [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_tr:nth-child(even)]:bg-gray-50">
              <MDXRemote
                source={article.content}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug],
                  },
                }}
                components={{
                  a: ({ href, children, ...props }) => {
                    const isExternal = href?.startsWith('http') || href?.startsWith('https');
                    if (isExternal) {
                      return (
                        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                          {children}
                        </a>
                      );
                    }
                    return <Link href={href || '#'} {...props}>{children}</Link>;
                  },
                }}
              />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <SimulatorCTA />
            </div>

            {/* 関連シミュレーター一覧 */}
            <RelatedTools currentPath="" />

            {/* 運営会社・運営者プロフィール */}
            <div className="mt-12">
              <CompanyProfileCompact />
            </div>
          </article>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
