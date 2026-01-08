import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content/media');

export interface ArticleMeta {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  thumbnail?: string;
}

export interface Article extends ArticleMeta {
  content: string;
}

// カテゴリーフォルダ内のすべての記事を取得
export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const categories = fs.readdirSync(CONTENT_DIR).filter((item) => {
    const itemPath = path.join(CONTENT_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });

  const articles: ArticleMeta[] = [];

  for (const categorySlug of categories) {
    const categoryPath = path.join(CONTENT_DIR, categorySlug);
    const files = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.mdx'));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      const filePath = path.join(categoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);

      articles.push({
        slug,
        categorySlug,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        category: data.category || '',
        thumbnail: data.thumbnail || undefined,
      });
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// カテゴリーとスラッグで記事を取得
export function getArticleBySlug(categorySlug: string, slug: string): Article | null {
  const filePath = path.join(CONTENT_DIR, categorySlug, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug,
    categorySlug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    category: data.category || '',
    thumbnail: data.thumbnail || undefined,
    content,
  };
}

// 特定カテゴリーの記事を取得
export function getArticlesByCategory(categorySlug: string): ArticleMeta[] {
  const articles = getAllArticles();
  return articles.filter((article) => article.categorySlug === categorySlug);
}

// 全カテゴリー一覧を取得
export function getAllCategories(): { slug: string; name: string }[] {
  const articles = getAllArticles();
  const categoryMap = new Map<string, string>();

  for (const article of articles) {
    if (article.categorySlug && article.category) {
      categoryMap.set(article.categorySlug, article.category);
    }
  }

  return Array.from(categoryMap.entries()).map(([slug, name]) => ({
    slug,
    name,
  }));
}

// 全ての記事パスを取得（静的生成用）
export function getAllArticlePaths(): { categorySlug: string; slug: string }[] {
  const articles = getAllArticles();
  return articles.map((article) => ({
    categorySlug: article.categorySlug,
    slug: article.slug,
  }));
}
