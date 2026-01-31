/** @type {import('next').NextConfig} */

// NEXT_PUBLIC_NEON_AUTH_URL が設定されていて NEON_AUTH_BASE_URL が未設定の場合、自動コピー
if (process.env.NEXT_PUBLIC_NEON_AUTH_URL && !process.env.NEON_AUTH_BASE_URL) {
  process.env.NEON_AUTH_BASE_URL = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
}

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  trailingSlash: false, // URLの末尾スラッシュを統一（なしに統一）
  async redirects() {
    return [
      // 古いURL構造からのリダイレクト
      {
        source: '/media/category/base/:path*',
        destination: '/media/base/:path*',
        permanent: true,
      },
      {
        source: '/media/category/reform/:path*',
        destination: '/media/kodate/:path*',
        permanent: true,
      },
      {
        source: '/media/company/:path*',
        destination: '/company/:path*',
        permanent: true,
      },
      {
        source: '/media/2025/:path*',
        destination: '/media',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
