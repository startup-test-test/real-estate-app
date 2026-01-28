import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'
import { HeaderWrapper } from '@/components/header-wrapper'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
// import { Footer } from '@/components/footer'

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
