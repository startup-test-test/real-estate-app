import React from 'react';
import Link from 'next/link';

interface Article {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  thumbnail?: string;
}

interface BlogPostsProps {
  articles?: Article[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const BlogPosts: React.FC<BlogPostsProps> = ({ articles = [] }) => {
  if (!articles || articles.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 text-center">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">MEDIA</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              大家DXジャーナル
            </h2>
          </div>
          <div className="text-center py-12 text-gray-500">
            記事がありません
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center">
          <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">MEDIA</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            大家DXジャーナル
          </h2>
        </div>

        {/* 記事一覧 - 横並び */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={`${article.categorySlug}-${article.slug}`}
              href={`/media/${article.categorySlug}/${article.slug}`}
              className="block group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* サムネイル */}
              <div className="aspect-video overflow-hidden bg-gray-200">
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
              <div className="p-5">
                {/* カテゴリー & 日付 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {article.category}
                  </span>
                  <time className="text-xs text-gray-400">
                    {formatDate(article.date)}
                  </time>
                </div>

                {/* タイトル */}
                <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/media"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
          >
            すべての記事を見る
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPosts;
