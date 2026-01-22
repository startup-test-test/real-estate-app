import { Metadata } from 'next'
import { LTVCalculator } from './LTVCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のLTV（借入比率） 計算シミュレーション｜自己資金比率も同時計算',
  description:
    '賃貸経営のLTV（Loan to Value：借入比率）を無料で計算。物件価格と借入額からLTVを算出。自己資金比率、自己資金額も同時に確認できます。',
  keywords: [
    'LTV 計算',
    'LTV シミュレーション',
    '借入比率 不動産',
    '賃貸経営 LTV',
    'LTV 計算方法',
    '自己資金比率 計算',
    'Loan to Value',
    '不動産投資 レバレッジ',
    '借入比率 目安',
    'LTV 計算 無料',
  ],
  openGraph: {
    title: '賃貸経営のLTV（借入比率） 計算シミュレーション｜自己資金比率も同時計算',
    description: '賃貸経営のLTV（借入比率）を無料で計算。自己資金比率、自己資金額も同時に確認できます。',
    url: `${BASE_URL}/tools/ltv`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'LTVシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のLTV（借入比率） 計算シミュレーション｜自己資金比率も同時計算',
    description: '賃貸経営のLTV（借入比率）を無料で計算。自己資金比率、自己資金額も同時に確認できます。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'LTV（借入比率）シミュレーター',
  description: '賃貸経営のLTV（借入比率）を計算するツール',
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
      name: 'LTV（借入比率）シミュレーター',
      item: `${BASE_URL}/tools/ltv`
    }
  ]
}

export default function LTVPage() {
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
      <LTVCalculator />
    </>
  )
}
