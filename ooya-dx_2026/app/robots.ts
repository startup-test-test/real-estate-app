import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ooya.tech';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/mypage/',      // ログイン後のマイページ
          '/api/',         // APIエンドポイント
          '/auth/',        // 認証関連
          '/_next/data/',   // Next.jsデータAPI（CSS/JSは許可）
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
