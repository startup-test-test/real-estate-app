import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { SimulatorCTA } from '@/components/tools/SimulatorCTA';
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact';
import { GlossaryBreadcrumb } from '@/components/tools/GlossaryBreadcrumb';
import { getGlossaryTermBySlug, getAllGlossarySlugs, getAllGlossaryTerms } from '@/lib/glossary';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllGlossarySlugs();
  return slugs.map((slug) => ({ slug }));
}

const BASE_URL = 'https://ooya.tech';

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const term = getGlossaryTermBySlug(slug);

  if (!term) {
    return {
      title: '用語が見つかりません',
    };
  }

  const url = `${BASE_URL}/glossary/${slug}`;

  return {
    title: `${term.title}｜大家DX賃貸経営用語集`,
    description: term.description,
    keywords: term.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: term.title,
      description: term.description,
      url: url,
      siteName: '大家DX',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: term.title,
      description: term.description,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getGlossaryTermBySlug(slug);

  if (!term) {
    notFound();
  }

  // 同じカテゴリの他の用語を取得
  const allTerms = getAllGlossaryTerms();
  const relatedTerms = allTerms
    .filter((t) => t.category === term.category && t.slug !== term.slug)
    .slice(0, 3);

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
        name: '用語集',
        item: `${BASE_URL}/glossary`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: term.shortTitle,
        item: `${BASE_URL}/glossary/${slug}`,
      },
    ],
  };

  // FAQ構造化データ（SEO強化）
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${term.shortTitle}とは何ですか？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: term.description,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <div className="h-[72px] sm:h-[88px]"></div>

        <main className="flex-1">
          <article className="max-w-2xl mx-auto px-5 py-12">
            {/* パンくず */}
            <GlossaryBreadcrumb currentPage={term.shortTitle} />

            {/* カテゴリー */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                用語集
              </span>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {term.category}
              </span>
            </div>

            {/* タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {term.title}
            </h1>
            <p className="text-gray-600 mb-8">
              {term.description}
            </p>

            {/* 関連ツールへのリンク */}
            {term.relatedTools && (
              <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-medium">この用語に関連する計算ツール</p>
                  </div>
                  <Link
                    href={term.relatedTools}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    計算する
                  </Link>
                </div>
              </div>
            )}

            {/* 本文 */}
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-200 prose-th:border prose-th:border-gray-200 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 mb-12">
              <MDXRemote
                source={term.content}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug],
                  },
                }}
              />
            </div>

            {/* 関連用語 */}
            {relatedTerms.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  関連する用語
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedTerms.map((relatedTerm) => (
                    <Link
                      key={relatedTerm.slug}
                      href={`/glossary/${relatedTerm.slug}`}
                      className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {relatedTerm.shortTitle}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {relatedTerm.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-16">
              <SimulatorCTA />
            </div>

            {/* 運営会社・運営者プロフィール */}
            <div className="mt-16">
              <CompanyProfileCompact />
            </div>
          </article>
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
