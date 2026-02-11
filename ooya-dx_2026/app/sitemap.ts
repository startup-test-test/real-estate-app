import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/mdx';
import { getToolInfo, getCompanyPageInfo, getPageInfo } from '@/lib/navigation';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://ooya.tech';

// navigation.tsの日付またはフォールバックでDateオブジェクトを返す
function getLastModDate(href: string): Date {
  const info = getPageInfo(href);
  if (info?.lastUpdated) return new Date(info.lastUpdated);
  return new Date();
}

// /tools ディレクトリから自動的にページを検出
function getToolSlugs(): string[] {
  const toolsDir = path.join(process.cwd(), 'app', 'tools');

  try {
    const entries = fs.readdirSync(toolsDir, { withFileTypes: true });
    return entries
      .filter((entry) => {
        // ディレクトリで、_で始まらない、componentsでない
        if (!entry.isDirectory()) return false;
        if (entry.name.startsWith('_')) return false;
        if (entry.name === 'components') return false;
        if (entry.name === 'template-demo') return false;
        // page.tsxが存在するか確認
        const pagePath = path.join(toolsDir, entry.name, 'page.tsx');
        return fs.existsSync(pagePath);
      })
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  // 記事ページ
  const articlePages = articles.map((article) => {
    // 無効な日付の場合は現在日時を使用
    const date = article.date ? new Date(article.date) : new Date();
    const lastModified = isNaN(date.getTime()) ? new Date() : date;

    return {
      url: `${BASE_URL}/media/${article.categorySlug}/${article.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    };
  });

  // 計算ツールページ（自動検出 + navigation.tsの日付）
  const toolSlugs = getToolSlugs();
  const toolPages = toolSlugs.map((slug) => {
    const toolInfo = getToolInfo(`/tools/${slug}`);
    const lastModified = toolInfo?.lastUpdated ? new Date(toolInfo.lastUpdated) : new Date();
    return {
      url: `${BASE_URL}/tools/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    };
  });

  // ネストされたツールページ（自動検出対象外）
  const nestedToolPages = [
    { path: '/tools/brokerage/guide', priority: 0.8 },
    { path: '/tools/brokerage/standard', priority: 0.8 },
  ].map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: getLastModDate('/tools/brokerage'),
    changeFrequency: 'monthly' as const,
    priority: page.priority,
  }));

  // 静的ページ
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/media`,
      lastModified: getLastModDate('/media'),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // お問い合わせ・FAQ・料金
    {
      url: `${BASE_URL}/contact`,
      lastModified: getLastModDate('/contact'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: getLastModDate('/faq'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: getLastModDate('/pricing'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // 法的ページ
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: getLastModDate('/legal/privacy'),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: getLastModDate('/legal/terms'),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: getLastModDate('/disclaimer'),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    // プロフィールページ
    {
      url: `${BASE_URL}/profile`,
      lastModified: getLastModDate('/profile'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // 会社情報ページ
  const companyPages = [
    { slug: '', priority: 0.7 },           // /company (会社概要)
    { slug: '/service', priority: 0.7 },   // サービス
    { slug: '/portfolio', priority: 0.6 }, // ポートフォリオ
    { slug: '/contact', priority: 0.7 },   // お問い合わせ
    { slug: '/csr', priority: 0.5 },       // CSR
    { slug: '/sdgs', priority: 0.5 },      // SDGs
    { slug: '/climate-adaptation', priority: 0.5 },
    { slug: '/plastics-smart', priority: 0.5 },
    { slug: '/teambeyond', priority: 0.5 },
    { slug: '/lib-partner', priority: 0.5 },
    { slug: '/consumer-policy', priority: 0.5 },
    { slug: '/link', priority: 0.4 },      // リンク集
  ].map((page) => {
    const href = `/company${page.slug}`;
    const pageInfo = getCompanyPageInfo(href);
    const lastModified = pageInfo?.lastUpdated ? new Date(pageInfo.lastUpdated) : new Date();
    return {
      url: `${BASE_URL}${href}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: page.priority,
    };
  });

  // メディアカテゴリページ（記事から動的に取得）
  const categories = new Set(articles.map((article) => article.categorySlug));
  const mediaCategoryPages = Array.from(categories).map((category) => ({
    url: `${BASE_URL}/media/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...companyPages, ...mediaCategoryPages, ...toolPages, ...nestedToolPages, ...articlePages];
}
