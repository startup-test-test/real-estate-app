import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { getArticleBySlug, getAllArticlePaths } from '@/lib/mdx';
import { ContentPageLayout } from '@/components/tools/ContentPageLayout';
import { TableOfContents } from '@/components/table-of-contents';
import { SimulatorCTA } from '@/components/tools/SimulatorCTA';
import { ShareButtons } from '@/components/tools/ShareButtons';
import { articleAuthorRef, articlePublisherRef } from '@/lib/eeat';
import { QuestionBox } from '@/components/media/QuestionBox';
import { SummaryBox } from '@/components/media/SummaryBox';
import { CTALink } from '@/components/media/CTALink';
import { CTACard } from '@/components/media/CTACard';
import { ExperienceTable } from '@/components/media/ExperienceTable';
import { ExperienceBox } from '@/components/media/ExperienceBox';
import { ToolDisclaimer } from '@/components/tools/ToolDisclaimer';
import Link from 'next/link';

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

  // FAQPage構造化データ（LLMO + Google リッチリザルト対応）
  const faqJsonLd = article.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <ContentPageLayout
        title={article.title}
        toolPath={`/media/${category}/${slug}`}
        publishDate={formatDate(article.date)}
        lastUpdated={formatDate(article.date)}
        category={article.category}
        categoryHref={`/media/${category}`}
        showCalculatorNote={false}
        showShareButtons={false}
        showDisclaimer={false}
        additionalContent={
          <>
            {/* 免責事項 */}
            <div className="mt-10">
              <ToolDisclaimer />
            </div>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <SimulatorCTA />
            </div>
          </>
        }
      >
        {/* メインビジュアル */}
        {article.thumbnail ? (
          <div className="bg-gray-100 mb-4">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="h-[350px] bg-gradient-to-br from-gray-100 to-gray-200 mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* シェアボタン */}
        <div className="flex justify-end mb-6">
          <ShareButtons title={article.title} url={url} />
        </div>

        {/* リード文（最初のH2より前の部分） */}
        {(() => {
          const firstH2Index = article.content.search(/^## /m);
          const leadContent = firstH2Index > 0 ? article.content.slice(0, firstH2Index).trim() : '';
          const bodyContent = firstH2Index > 0 ? article.content.slice(firstH2Index) : article.content;

          const mdxComponents = {
            a: ({ href, children, ...props }: React.ComponentProps<'a'>) => {
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
            QuestionBox,
            SummaryBox,
            CTALink,
            CTACard,
            ExperienceTable,
            ExperienceBox,
          };

          const mdxOptions = {
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug],
            },
          };

          return (
            <>
              {leadContent && (
                <div className="prose prose-lg prose-gray max-w-none prose-p:text-base prose-p:leading-relaxed prose-p:my-4 prose-li:text-base mb-8">
                  <MDXRemote
                    source={leadContent}
                    options={mdxOptions}
                    components={mdxComponents}
                  />
                </div>
              )}

              {/* 目次 */}
              <TableOfContents content={bodyContent} />

              {/* 本文 */}
              <div className="article-body prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-h2:text-lg prose-h2:mt-14 prose-h2:mb-5 prose-h2:bg-primary-950 prose-h2:text-white prose-h2:px-5 prose-h2:py-3 prose-h3:text-base prose-h3:mt-8 prose-h3:mb-3 prose-h3:border-l-4 prose-h3:border-primary-950 prose-h3:pl-3 prose-h3:py-1 prose-p:text-base prose-p:leading-relaxed prose-p:my-4 prose-li:text-base [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-base [&_th]:bg-gray-100 [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_tr:nth-child(even)]:bg-gray-50 [&_strong]:bg-[linear-gradient(transparent_60%,#fef08a_60%)] [&_a_strong]:bg-none">
                <MDXRemote
                  source={bodyContent}
                  options={mdxOptions}
                  components={mdxComponents}
                />
              </div>
            </>
          );
        })()}
      </ContentPageLayout>
    </>
  );
}
