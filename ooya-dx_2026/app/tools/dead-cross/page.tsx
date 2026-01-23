import { Metadata } from 'next'
import { DeadCrossCalculator } from './DeadCrossCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産のデッドクロス発生時期 予測シミュレーション｜元本返済と減価償却の比較',
  description:
    'デッドクロス（元本返済額が減価償却費を上回る時期）の発生時期を無料で予測。建物構造・築年数・ローン条件を入力するだけで、黒字倒産リスクを事前に把握できます。',
  keywords: [
    'デッドクロス',
    'デッドクロス 計算',
    'デッドクロス シミュレーション',
    'デッドクロス 賃貸経営',
    '減価償却 元本返済',
    '賃貸経営 キャッシュフロー',
    '黒字倒産',
    '賃貸経営 税金',
  ],
  openGraph: {
    title: '不動産のデッドクロス発生時期 予測シミュレーション｜元本返済と減価償却の比較',
    description: 'デッドクロスの発生時期を無料で予測。建物構造・築年数・ローン条件を入力するだけで、黒字倒産リスクを事前に把握できます。',
    url: `${BASE_URL}/tools/dead-cross`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'デッドクロス発生時期予測シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産のデッドクロス発生時期 予測シミュレーション',
    description: 'デッドクロスの発生時期を無料で予測。黒字倒産リスクを事前に把握できます。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'デッドクロス発生時期予測シミュレーター',
  description: '賃貸経営のデッドクロス（元本返済額が減価償却費を上回る時期）を予測する計算ツール',
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
      name: 'デッドクロス発生時期予測シミュレーター',
      item: `${BASE_URL}/tools/dead-cross`
    }
  ]
}

export default function DeadCrossPage() {
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
      <DeadCrossCalculator />
    </>
  )
}
