import './globals.css'
import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'
import { Providers } from './providers'
import { HeaderWrapper } from '@/components/header-wrapper'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
// import { Footer } from '@/components/footer'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  preload: false,
})

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
  preload: false,
})

const BASE_URL = 'https://ooya.tech';

// 構造化データ: Organization（会社情報）
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/company#organization`,
  name: '株式会社StartupMarketing',
  alternateName: '大家DX',
  url: BASE_URL,
  logo: `${BASE_URL}/img/logo_250709_2.png`,
  description: '【完全無料】現役大家が開発した不動産投資クラウドツール。収支・利回り・税金など27種類の計算ソフトを全て無料で提供。実務に基づいた精度の高いシミュレーションで、購入判断から出口戦略までをトータルにサポートする大家のためのプラットフォームです。',
  founder: {
    '@type': 'Person',
    '@id': `${BASE_URL}/profile#person`,
    name: 'Tetsuro Togo',
  },
  sameAs: [
    'https://startup-marketing.co.jp/',
    'https://www.tokyo-cci.or.jp/shachonet/profile/2454.html',
    'https://www.saitamadx.com/dx-partner/solution/348/',
    'https://www.amatias.com/asp/navi.asp?s_code=S0006864',
    'https://stib.jp/member/name-list/?s=StartupMarketing',
    'https://www.city.saitama.lg.jp/006/007/002/008/p062519.html',
    'https://www.freelance-jp.org/talents/12828',
    'https://www.jutaku-s.com/newsp/id/0000064588',
    'https://saitama.publishing.3rd-in.co.jp/article/2aa1cd40-a89a-11f0-88f0-9ca3ba0a67df',
    'https://www.para-sports.tokyo/member/group/',
    'https://adaptation-platform.nies.go.jp/everyone/campaign/',
    'https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=2010001212632',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'ooya.tech2025@gmail.com',
    contactType: 'customer service',
    availableLanguage: 'Japanese',
  },
};

// 構造化データ: WebSite（サイト情報）
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '大家DX',
  url: BASE_URL,
  description: '不動産投資クラウドソフト「大家DX」',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: '不動産投資クラウドソフトなら「大家DX」｜現役大家が開発',
  description: '【完全無料】現役大家が開発した不動産投資クラウドツール。収支・利回り・税金など27種類の計算ソフトを全て無料で提供。実務に基づいた精度の高いシミュレーションで、購入判断から出口戦略までをトータルにサポートする大家のためのプラットフォームです。',
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
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable} ${notoSerifJP.variable}`} suppressHydrationWarning>
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
