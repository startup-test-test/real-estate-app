import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';

interface Post {
  id: number;
  title: {
    rendered: string;
  };
  link: string;
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

const BlogPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://ooya.tech/media/wp-json/wp/v2/posts?per_page=6&_embed');
      if (!response.ok) {
        throw new Error('記事の取得に失敗しました');
      }
      const data = await response.json();
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
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
      return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return '/img/default-blog-image.png';
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            大家の教科書
          </h2>
          <p className="text-lg text-gray-600">
            不動産投資に関する最新情報をお届けします
          </p>
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