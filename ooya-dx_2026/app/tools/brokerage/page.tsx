import { Metadata } from 'next'
import { BrokerageCalculator } from './BrokerageCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '仲介手数料計算シミュレーター｜不動産売買の手数料を10秒で計算',
  description:
    '不動産売買の仲介手数料を10秒で無料計算。売買価格を入力するだけで、税込金額がすぐわかります。早見表付き。',
  keywords: [
    '仲介手数料 計算',
    '仲介手数料 シミュレーター',
    '仲介手数料 早見表',
    '不動産 仲介手数料 計算',
  ],
  openGraph: {
    title: '不動産売買の仲介手数料 計算シミュレーション｜早見表付き',
    description: '不動産売買の仲介手数料を10秒で無料計算。売買価格を入力するだけで、税込金額がすぐわかります。早見表付き。',
    url: `${BASE_URL}/tools/brokerage`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '仲介手数料シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産売買の仲介手数料 計算シミュレーション｜早見表付き',
    description: '不動産売買の仲介手数料を10秒で無料計算。売買価格を入力するだけで、税込金額がすぐわかります。早見表付き。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（SoftwareApplication - Calculator）
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '仲介手数料計算シミュレーター',
  description: '不動産売買の仲介手数料を瞬時に計算するツール。売買価格を入力するだけで税込金額がわかります。',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Windows, macOS, Android, iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY'
  },
  provider: {
    '@type': 'Organization',
    name: '大家DX',
    url: 'https://ooya.tech'
  },
  featureList: [
    '仲介手数料の自動計算',
    '税込・税抜金額の表示',
    '早見表による確認'
  ]
}

// WebPage構造化データ（日付情報含む）
const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '【2026年最新】仲介手数料シミュレーター｜早見表・800万円特例対応',
  description: '不動産売買の仲介手数料を瞬時に計算。2024年法改正の800万円特例にも対応。早見表・計算式付き。',
  url: `${BASE_URL}/tools/brokerage`,
  datePublished: '2026-01-15',
  dateModified: '2026-02-04',
  publisher: {
    '@type': 'Organization',
    name: '大家DX',
    url: 'https://ooya.tech'
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: '仲介手数料計算シミュレーター'
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
      name: '仲介手数料シミュレーター',
      item: `${BASE_URL}/tools/brokerage`
    }
  ]
}

export default function BrokeragePage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <BrokerageCalculator />
    </>
  )
}
