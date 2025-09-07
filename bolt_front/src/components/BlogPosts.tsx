import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';

interface Post {
  id: number;
  title: {
    rendered: string;
  };
  link: string;
  date: string;
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: {
            source_url: string;
          };
          thumbnail?: {
            source_url: string;
          };
          full?: {
            source_url: string;
          };
        };
      };
    }>;
  };
}

// 記事に対応するサムネイル画像のマッピング（WordPressの実際の画像）
const ARTICLE_THUMBNAILS: { [key: string]: string } = {
  'レントロール': 'https://ooya.tech/media/wp-content/uploads/2025/04/towfiqu-barbhuiya-B0q9AkKV6Mk-unsplash-2048x1367.jpg',
  'アパート経営の見積もり': 'https://ooya.tech/media/wp-content/uploads/2025/04/austin-distel-EMPZ7yRZoGw-unsplash-1-2048x1365.jpg',
  '会計ソフト': 'https://ooya.tech/media/wp-content/uploads/2025/04/austin-distel-nGc5RT2HmF0-unsplash-2048x1348.jpg',
  'default': 'https://ooya.tech/media/wp-content/uploads/2025/04/towfiqu-barbhuiya-B0q9AkKV6Mk-unsplash-2048x1367.jpg'
};

const BlogPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://ooya.tech/media/wp-json/wp/v2/posts?per_page=3&_embed');
      if (!response.ok) {
        throw new Error('記事の取得に失敗しました');
      }
      const data = await response.json();
      console.log('Fetched posts with embedded data:', data);
      console.log('First post embedded media:', data[0]?._embedded);
      setPosts(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('記事の読み込みに失敗しました');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (post: Post): string => {
    // タイトルから適切な画像を選択
    const title = post.title.rendered;
    
    if (title.includes('レントロール')) {
      return ARTICLE_THUMBNAILS['レントロール'];
    } else if (title.includes('アパート経営') && title.includes('見積')) {
      return ARTICLE_THUMBNAILS['アパート経営の見積もり'];
    } else if (title.includes('会計ソフト')) {
      return ARTICLE_THUMBNAILS['会計ソフト'];
    }
    
    // デフォルト画像を返す
    return ARTICLE_THUMBNAILS['default'];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">Real Estate Investment Simulation Examples</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="sm:hidden">不動産投資<br />シミュレーション事例集</span>
            <span className="hidden sm:inline">不動産投資シミュレーション事例集</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={getImageUrl(post)}
                    alt={post.title.rendered}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xNzAgOTcuNUMxNzAgODkuNDkxNyAxNzYuNDkyIDgzIDE4NC41IDgzSDE5MC41VjgzSDIxNS41QzIyMy41MDggODMgMjMwIDg5LjQ5MTcgMjMwIDk3LjVWMTI3LjVDMjMwIDEzNS41MDggMjIzLjUwOCAxNDIgMjE1LjUgMTQySDE4NC41QzE3Ni40OTIgMTQyIDE3MCAxMzUuNTA4IDE3MCAxMjcuNVY5Ny41WiIgZmlsbD0iIzlDQTNCOSIvPgo8Y2lyY2xlIGN4PSIxOTAiIGN5PSIxMDMiIHI9IjgiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                    }}
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.date)}
                  </div>

                  <h3
                    className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />

                  <div className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="text-sm">続きを読む</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://ooya.tech/media/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            すべての記事を見る
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogPosts;