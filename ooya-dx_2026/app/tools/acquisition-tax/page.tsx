import { Metadata } from 'next'
import { AcquisitionTaxCalculator } from './AcquisitionTaxCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産取得税を10秒で無料計算｜軽減措置・控除額シミュレーション',
  description:
    '不動産取得税を無料で概算計算。建物・土地の固定資産税評価額を入力するだけで税額の目安がわかります。新築住宅控除（1,200万円）、認定長期優良住宅（1,300万円）、中古住宅の築年数別控除、土地の軽減措置にも対応。',
  keywords: [
    '不動産取得税 計算',
    '不動産取得税 シミュレーション',
    '不動産取得税 軽減措置',
    '不動産取得税 控除',
    '不動産取得税 新築',
    '不動産取得税 中古',
    '不動産取得税 税率',
    '住宅用土地 軽減',
    '認定長期優良住宅 控除',
    '不動産取得税 いくら',
  ],
  openGraph: {
    title: '不動産取得税を10秒で無料計算｜軽減措置・控除額シミュレーション',
    description: '不動産取得税を無料で概算計算。建物・土地の固定資産税評価額を入力するだけで税額の目安がわかります。',
    url: `${BASE_URL}/tools/acquisition-tax`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '不動産取得税シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産取得税を10秒で無料計算｜軽減措置・控除額シミュレーション',
    description: '不動産取得税を無料で概算計算。建物・土地の固定資産税評価額を入力するだけで税額の目安がわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '不動産取得税シミュレーター',
  description: '不動産取得税を概算計算するツール',
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
      name: '不動産取得税シミュレーター',
      item: `${BASE_URL}/tools/acquisition-tax`
    }
  ]
}

export default function AcquisitionTaxPage() {
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
      <AcquisitionTaxCalculator />
    </>
  )
}
