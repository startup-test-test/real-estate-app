'use client'

import Script from 'next/script'

const GA_MEASUREMENT_ID = 'G-Z2QBGBT7JP'
const GOOGLE_SITE_VERIFICATION = 'FERI9xJOWHijjbYzGTJ-QXJGqPFv-wVJAsa-_ZAfG7A'
const AHREFS_DATA_KEY = '/hlXktE60u9qqkU2yVH6cA'

export function GoogleAnalytics() {
  // 本番環境のみで発火（開発環境では読み込まない）
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      {/* Google Search Console 認証 */}
      <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />

      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      {/* Ahrefs Web Analytics */}
      <Script
        src="https://analytics.ahrefs.com/analytics.js"
        data-key={AHREFS_DATA_KEY}
        strategy="afterInteractive"
      />
    </>
  )
}
