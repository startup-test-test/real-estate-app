import { Metadata } from 'next'
import { YieldRateCalculator } from './YieldRateCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '表面利回り・実質利回り 計算シミュレーション｜早見表付き',
  description:
    '不動産投資の表面利回り・実質利回りを10秒で無料計算。物件価格と年間賃料を入力するだけで、グロス利回り・ネット利回りの両方がすぐわかります。早見表付き。',
  keywords: [
    '利回り計算',
    '表面利回り',
    '実質利回り',
    '不動産投資 利回り',
    'グロス利回り',
    'ネット利回り',
    '利回り シミュレーター',
    '収益物件 利回り',
  ],
  openGraph: {
    title: '表面利回り・実質利回り 計算シミュレーション｜早見表付き',
    description: '不動産投資の表面利回り・実質利回りを10秒で無料計算。物件価格と年間賃料を入力するだけで、グロス利回り・ネット利回りがすぐわかります。',
    url: `${BASE_URL}/tools/yield-rate`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '利回りシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '表面利回り・実質利回り 計算シミュレーション｜早見表付き',
    description: '不動産投資の表面利回り・実質利回りを10秒で無料計算。物件価格と年間賃料を入力するだけで、グロス利回り・ネット利回りがすぐわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '利回りシミュレーター',
  description: '不動産投資の表面利回り・実質利回りを計算するツール',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY'
  },
  provider: {
    '@type': 'Organization',
    name: '大家DX'
  }
}

// パンくずリスト構造化データ
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: BASE_URL
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '不動産・賃貸経営計算ツール',
      item: `${BASE_URL}/tools`
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: '利回りシミュレーター',
      item: `${BASE_URL}/tools/yield-rate`
    }
  ]
}

export default function YieldRatePage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <YieldRateCalculator />
    </>
  )
}
