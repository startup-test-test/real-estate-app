/** @type {import('next').NextConfig} */

// NEXT_PUBLIC_NEON_AUTH_URL が設定されていて NEON_AUTH_BASE_URL が未設定の場合、自動コピー
if (process.env.NEXT_PUBLIC_NEON_AUTH_URL && !process.env.NEON_AUTH_BASE_URL) {
  process.env.NEON_AUTH_BASE_URL = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
}

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  trailingSlash: false, // URLの末尾スラッシュを統一（なしに統一）
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // ===== 公開ページ company配下統合（2026/02/18） =====
      {
        source: '/contact',
        destination: '/company/contact',
        permanent: true,
      },
      {
        source: '/legal/:path*',
        destination: '/company/legal/:path*',
        permanent: true,
      },
      {
        source: '/disclaimer',
        destination: '/company/disclaimer',
        permanent: true,
      },
      {
        source: '/pricing',
        destination: '/company/pricing',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/company/faq',
        permanent: true,
      },

      // ===== プロフィールページ URL移行（2026/02/10） =====
      {
        source: '/media/profile',
        destination: '/profile',
        permanent: true,
      },

      // ===== シミュレーター URL移行（2026/02/08） =====
      {
        source: '/simulator',
        destination: '/tools/simulator',
        permanent: true,
      },

      // ===== 古いURL構造からのリダイレクト =====
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

      // ===== 用語集 → 計算ツール（2026/02/05 廃止に伴うリダイレクト） =====
      // 同名の計算ツールへ
      { source: '/glossary/ccr', destination: '/tools/ccr', permanent: true },
      { source: '/glossary/roi', destination: '/tools/roi', permanent: true },
      { source: '/glossary/irr', destination: '/tools/irr', permanent: true },
      { source: '/glossary/noi', destination: '/tools/noi', permanent: true },
      { source: '/glossary/npv', destination: '/tools/npv', permanent: true },
      { source: '/glossary/dscr', destination: '/tools/dscr', permanent: true },
      { source: '/glossary/ltv', destination: '/tools/ltv', permanent: true },
      // 関連する計算ツールへ
      { source: '/glossary/cash-flow', destination: '/tools/cf', permanent: true },
      { source: '/glossary/net-yield', destination: '/tools/yield-rate', permanent: true },
      { source: '/glossary/gross-yield', destination: '/tools/yield-rate', permanent: true },
      { source: '/glossary/principal-payment', destination: '/tools/mortgage-loan', permanent: true },
      { source: '/glossary/level-payment', destination: '/tools/mortgage-loan', permanent: true },
      { source: '/glossary/egi', destination: '/tools/noi', permanent: true },
      { source: '/glossary/ads', destination: '/tools/dscr', permanent: true },
      { source: '/glossary/gpi', destination: '/tools/noi', permanent: true },
      { source: '/glossary/k-percent', destination: '/tools/dscr', permanent: true },
      { source: '/glossary/opex-ratio', destination: '/tools/noi', permanent: true },
      { source: '/glossary/vacancy-rate', destination: '/tools/noi', permanent: true },
      { source: '/glossary/pi', destination: '/tools/npv', permanent: true },
      // フォールバック（上記以外の用語集URL）
      { source: '/glossary/:slug', destination: '/tools', permanent: true },
      { source: '/glossary', destination: '/tools', permanent: true },
    ];
  },
};

export default nextConfig;
