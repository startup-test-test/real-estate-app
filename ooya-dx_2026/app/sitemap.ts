import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/mdx';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://ooya-dx.com';

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

  // 計算ツールページ（自動検出）
  const toolSlugs = getToolSlugs();
  const toolPages = toolSlugs.map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
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
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/simulator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  return [...staticPages, ...toolPages, ...articlePages];
}
