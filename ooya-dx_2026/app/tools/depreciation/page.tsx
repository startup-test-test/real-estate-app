import { Metadata } from 'next'
import { DepreciationCalculator } from './DepreciationCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '減価償却費を10秒で無料計算｜構造別・中古物件対応・早見表付き',
  description:
    '不動産投資の減価償却費を無料で計算。建物の取得価額・構造・築年数を入力するだけで年間償却費がすぐわかります。中古物件の簡便法にも対応。構造別・築年数別の早見表付き。',
  keywords: [
    '減価償却',
    '減価償却費 計算',
    '減価償却 シミュレーター',
    '不動産 減価償却',
    '中古 減価償却',
    '木造 減価償却',
    'RC 減価償却',
    '耐用年数',
    '簡便法',
    '不動産投資 節税',
  ],
  openGraph: {
    title: '減価償却費を10秒で無料計算｜構造別・中古物件対応・早見表付き',
    description: '不動産投資の減価償却費を無料で計算。建物の取得価額・構造・築年数を入力するだけで年間償却費がすぐわかります。',
    url: `${BASE_URL}/tools/depreciation`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '減価償却シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '減価償却費を10秒で無料計算｜構造別・中古物件対応・早見表付き',
    description: '不動産投資の減価償却費を無料で計算。建物の取得価額・構造・築年数を入力するだけで年間償却費がすぐわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '減価償却シミュレーター',
  description: '不動産投資における建物の減価償却費を計算するツール。中古物件の簡便法にも対応。',
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
      name: '減価償却シミュレーター',
      item: `${BASE_URL}/tools/depreciation`
    }
  ]
}

export default function DepreciationPage() {
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
      <DepreciationCalculator />
    </>
  )
}
