import { Metadata } from 'next'
import { CFCalculator } from './CFCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のキャッシュフロー 計算シミュレーション｜税引前・税引後CF',
  description:
    '賃貸経営のキャッシュフロー（CF）を無料で計算。税引前CF（BTCF）・税引後CF（ATCF）を同時算出。GPI→EGI→NOI→BTCFのキャッシュフローツリーで収支を可視化。',
  keywords: [
    'キャッシュフロー 計算',
    'キャッシュフロー シミュレーション',
    '賃貸経営 CF',
    '税引前キャッシュフロー',
    '税引後キャッシュフロー',
    'BTCF 計算',
    'ATCF 計算',
    'NOI キャッシュフロー',
    '賃貸経営 収支計算',
  ],
  openGraph: {
    title: '賃貸経営のキャッシュフロー 計算シミュレーション｜税引前・税引後CF',
    description: '賃貸経営のキャッシュフロー（CF）を無料で計算。税引前CF・税引後CFを同時算出。',
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
    title: '賃貸経営のキャッシュフロー 計算シミュレーション｜税引前・税引後CF',
    description: '賃貸経営のキャッシュフロー（CF）を無料で計算。税引前CF・税引後CFを同時算出。',
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
      <CFCalculator />
    </>
  )
}
