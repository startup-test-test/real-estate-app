import { Metadata } from 'next'
import { CorporateTaxCalculator } from './CorporateTaxCalculator'

const BASE_URL = 'https://ooya.tech'

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産法人の法人税等 計算シミュレーション｜早見表付き',
  description:
    '不動産法人（資産管理会社）の法人税・住民税・事業税等を無料で計算。課税所得を入力するだけで、税額と実効税率がすぐわかります。早見表付き。',
  keywords: [
    '法人税 シミュレーター',
    '不動産 法人化 税金',
    '法人税 計算',
    '実効税率 計算',
    '不動産 法人 税金',
    '資産管理会社 税金',
    '法人税 早見表',
  ],
  openGraph: {
    title: '不動産法人の法人税等 計算シミュレーション｜早見表付き',
    description: '不動産法人の法人税・住民税・事業税等を無料で計算。課税所得を入力するだけで税額と実効税率がすぐわかります。',
    url: `${BASE_URL}/tools/corporate-tax`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '法人税シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産法人の法人税等 計算シミュレーション｜早見表付き',
    description: '不動産法人の法人税・住民税・事業税等を無料で計算。課税所得を入力するだけで税額と実効税率がすぐわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '不動産法人税シミュレーター',
  description: '不動産法人（資産管理会社）の法人税・住民税・事業税等を計算するツール',
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
      name: '法人税シミュレーター',
      item: `${BASE_URL}/tools/corporate-tax`
    }
  ]
}

export default function CorporateTaxPage() {
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
      <CorporateTaxCalculator />
    </>
  )
}
