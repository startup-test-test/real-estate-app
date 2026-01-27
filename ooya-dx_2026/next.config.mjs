/** @type {import('next').NextConfig} */
import withPWAInit from 'next-pwa';

// NEXT_PUBLIC_NEON_AUTH_URL が設定されていて NEON_AUTH_BASE_URL が未設定の場合、自動コピー
if (process.env.NEXT_PUBLIC_NEON_AUTH_URL && !process.env.NEON_AUTH_BASE_URL) {
  process.env.NEON_AUTH_BASE_URL = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
}

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 開発環境では無効化
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = {
  reactStrictMode: true,
  // Turbopack設定（next-pwaのwebpack設定との互換性のため）
  turbopack: {},
};

export default withPWA(nextConfig);
