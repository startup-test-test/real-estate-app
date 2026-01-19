import { Metadata } from 'next'
import { DSCRCalculator } from './DSCRCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: 'DSCR（債務返済カバー率） 計算シミュレーション｜融資審査の目安がわかる',
  description:
    'DSCR（債務返済カバー率）を無料で計算。年間賃料収入と借入条件を入力するだけで、金融機関の融資審査における返済能力の目安がわかります。ストレステスト機能付き。',
  keywords: [
    'DSCR',
    '債務返済カバー率',
    'DSCR 計算',
    '融資審査',
    '不動産投資 融資',
    '返済余力',
    'ローン審査',
    '不動産投資 シミュレーター',
    'NOI',
    '純営業収益',
  ],
  openGraph: {
    title: 'DSCR（債務返済カバー率） 計算シミュレーション｜融資審査の目安がわかる',
    description: 'DSCR（債務返済カバー率）を無料で計算。年間賃料収入と借入条件を入力するだけで、金融機関の融資審査における返済能力の目安がわかります。',
    url: `${BASE_URL}/tools/dscr`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'DSCRシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSCR（債務返済カバー率） 計算シミュレーション｜融資審査の目安がわかる',
    description: 'DSCR（債務返済カバー率）を無料で計算。年間賃料収入と借入条件を入力するだけで、金融機関の融資審査における返済能力の目安がわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'DSCRシミュレーター',
  description: 'DSCR（債務返済カバー率）を計算するツール。融資審査における返済能力の目安がわかります。ストレステスト機能付き。',
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
      name: 'DSCRシミュレーター',
      item: `${BASE_URL}/tools/dscr`
    }
  ]
}

export default function DSCRPage() {
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
      <DSCRCalculator />
    </>
  )
}
