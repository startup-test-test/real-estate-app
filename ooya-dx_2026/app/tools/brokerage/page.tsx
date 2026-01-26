import { Metadata } from 'next'
import { BrokerageCalculator } from './BrokerageCalculator'
import { getGlossaryTermsByTool } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産売買の仲介手数料 計算シミュレーション｜早見表付き',
  description:
    '不動産売買の仲介手数料を10秒で無料計算。売買価格を入力するだけで、税込金額がすぐわかります。早見表付きで1,000万円〜1億円の手数料も一目で確認。',
  keywords: [
    '仲介手数料',
    '仲介手数料 計算',
    '仲介手数料 シミュレーター',
    '不動産 仲介手数料',
    '仲介手数料 早見表',
    '仲介手数料 3000万',
    '仲介手数料 5000万'
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

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '仲介手数料シミュレーター',
  description: '不動産売買の仲介手数料を計算するツール',
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
      name: '仲介手数料シミュレーター',
      item: `${BASE_URL}/tools/brokerage`
    }
  ]
}

export default function BrokeragePage() {
  const relatedGlossary = getGlossaryTermsByTool('/tools/brokerage')
    .map(term => ({ slug: term.slug, title: term.title }))

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
      <BrokerageCalculator relatedGlossary={relatedGlossary} />
    </>
  )
}
