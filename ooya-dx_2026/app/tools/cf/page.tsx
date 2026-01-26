import { Metadata } from 'next'
import { CFCalculator } from './CFCalculator'
import { getGlossaryTermsByTool } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のキャッシュフロー 計算シミュレーション｜BTCF・収支可視化',
  description:
    '賃貸経営のキャッシュフロー（CF）を無料で計算。GPI→EGI→NOI→BTCFのキャッシュフローツリーで収支を可視化。DSCR・経費率も同時算出。',
  keywords: [
    'キャッシュフロー 計算',
    'キャッシュフロー シミュレーション',
    '賃貸経営 CF',
    '税引前キャッシュフロー',
    'BTCF 計算',
    'NOI キャッシュフロー',
    '賃貸経営 収支計算',
    'キャッシュフローツリー',
  ],
  openGraph: {
    title: '賃貸経営のキャッシュフロー 計算シミュレーション｜BTCF・収支可視化',
    description: '賃貸経営のキャッシュフロー（CF）を無料で計算。キャッシュフローツリーで収支を可視化。',
    url: `${BASE_URL}/tools/cf`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'キャッシュフローシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のキャッシュフロー 計算シミュレーション｜BTCF・収支可視化',
    description: '賃貸経営のキャッシュフロー（CF）を無料で計算。キャッシュフローツリーで収支を可視化。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'キャッシュフロー（CF）シミュレーター',
  description: '賃貸経営のキャッシュフローを計算するツール',
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
      name: 'キャッシュフロー（CF）シミュレーター',
      item: `${BASE_URL}/tools/cf`
    }
  ]
}

export default function CFPage() {
  const relatedGlossary = getGlossaryTermsByTool('/tools/cf').map(term => ({ slug: term.slug, title: term.title }))

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
      <CFCalculator relatedGlossary={relatedGlossary} />
    </>
  )
}
