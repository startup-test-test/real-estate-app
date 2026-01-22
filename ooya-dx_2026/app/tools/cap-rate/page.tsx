import { Metadata } from 'next'
import { CapRateCalculator } from './CapRateCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産のキャップレート（還元利回り）計算シミュレーション｜地域別相場付き',
  description:
    '不動産のキャップレート（還元利回り）を無料で計算。NOIと物件価格から利回りを算出。東京・大阪など地域別の相場データ付きで投資判断をサポート。',
  keywords: [
    'キャップレート',
    'キャップレート 計算',
    'キャップレート シミュレーション',
    '還元利回り',
    '還元利回り 計算',
    'Cap Rate',
    'NOI利回り',
    'キャップレート 相場',
    'キャップレート 東京',
    '不動産 利回り 計算',
  ],
  openGraph: {
    title: '不動産のキャップレート（還元利回り）計算シミュレーション｜地域別相場付き',
    description: '不動産のキャップレート（還元利回り）を無料で計算。NOIと物件価格から利回りを算出。',
    url: `${BASE_URL}/tools/cap-rate`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'キャップレート（還元利回り）シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産のキャップレート（還元利回り）計算シミュレーション｜地域別相場付き',
    description: '不動産のキャップレート（還元利回り）を無料で計算。NOIと物件価格から利回りを算出。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'キャップレート（還元利回り）シミュレーター',
  description: 'キャップレート（還元利回り）を計算するツール。NOIと物件価格から利回りを算出、物件価格の逆算も可能。',
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
      name: 'キャップレート（還元利回り）シミュレーター',
      item: `${BASE_URL}/tools/cap-rate`
    }
  ]
}

export default function CapRatePage() {
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
      <CapRateCalculator />
    </>
  )
}
