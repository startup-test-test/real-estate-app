/** @type {import('next').NextConfig} */

// NEXT_PUBLIC_NEON_AUTH_URL が設定されていて NEON_AUTH_BASE_URL が未設定の場合、自動コピー
if (process.env.NEXT_PUBLIC_NEON_AUTH_URL && !process.env.NEON_AUTH_BASE_URL) {
  process.env.NEON_AUTH_BASE_URL = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
}

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default nextConfig;
