import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/mdx';

const BASE_URL = 'https://ooya.tech';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  // 記事ページ
  const articlePages = articles.map((article) => ({
    url: `${BASE_URL}/media/${article.categorySlug}/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
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
      url: `${BASE_URL}/simulator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  return [...staticPages, ...articlePages];
}
