import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'
import { HeaderWrapper } from '@/components/header-wrapper'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
// import { Footer } from '@/components/footer'

const BASE_URL = 'https://ooya.tech';

// 構造化データ: Organization（会社情報）
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '大家DX',
  url: BASE_URL,
  logo: `${BASE_URL}/img/logo_250709_2.png`,
  description: '賃貸経営のためのシミュレーションツール・計算ツールを提供',
  sameAs: [],
};

// 構造化データ: WebSite（サイト情報）
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '大家DX',
  url: BASE_URL,
  description: '賃貸経営のためのシミュレーションツール',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const metadata: Metadata = {
  title: '大家DX',
  description: '賃貸経営のためのシミュレーションツール',
  // Google Search Console 認証は本番のみ（GoogleAnalytics.tsx で設定）
  manifest: '/manifest.json',
  themeColor: '#1e40af',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '大家DX',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Ahrefs Web Analytics - 本番環境のみ */}
        {process.env.NODE_ENV === 'production' && (
          <script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="/hlXktE60u9qqkU2yVH6cA"
            async
          />
        )}
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 flex flex-col antialiased" suppressHydrationWarning>
        <GoogleAnalytics />
        <Providers>
          <HeaderWrapper />
          <main className="flex-grow relative">
            {children}
          </main>
          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  )
}
