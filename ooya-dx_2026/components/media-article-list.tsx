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

interface Category {
  slug: string;
  name: string;
}

interface Props {
  articles: Article[];
  categories: Category[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function MediaArticleList({ articles, categories }: Props) {
  return (
    <>
      {/* カテゴリーナビゲーション */}
      {categories.length > 0 && (
        <div className="py-4 border-b border-gray-100 -mx-5 px-5 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            <span className="text-sm font-medium text-gray-900 pb-1 border-b-2 border-gray-900">
              すべて
            </span>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/media/${category.slug}`}
                className="text-sm text-gray-500 hover:text-gray-700 pb-1 border-b-2 border-transparent transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

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
    </>
  );
}
