import { Metadata } from 'next'
import { NPVCalculator } from './NPVCalculator'
import { getGlossaryTermsByTool } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のNPV（正味現在価値） 計算シミュレーション｜感度分析付き',
  description:
    '賃貸経営のNPV（正味現在価値）を無料で計算。DCF法に基づき、将来キャッシュフローの現在価値を算出。割引率別の感度分析機能付き。収益性指数（PI）も同時計算。',
  keywords: [
    'NPV 計算',
    'NPV シミュレーション',
    '正味現在価値 不動産',
    '賃貸経営 NPV',
    'NPV 計算方法',
    'NPV 目安',
    'DCF法 計算',
    '割引率 不動産',
    '収益性指数 PI',
    '賃貸経営 投資判断',
  ],
  openGraph: {
    title: '賃貸経営のNPV（正味現在価値） 計算シミュレーション｜感度分析付き',
    description: '賃貸経営のNPV（正味現在価値）を無料で計算。DCF法に基づき、将来キャッシュフローの現在価値を算出。',
    url: `${BASE_URL}/tools/npv`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'NPVシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のNPV（正味現在価値） 計算シミュレーション｜感度分析付き',
    description: '賃貸経営のNPV（正味現在価値）を無料で計算。DCF法に基づき、将来キャッシュフローの現在価値を算出。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NPV（正味現在価値）シミュレーター',
  description: '賃貸経営のNPV（正味現在価値）を計算するツール',
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
      name: 'NPV（正味現在価値）シミュレーター',
      item: `${BASE_URL}/tools/npv`
    }
  ]
}

export default function NPVPage() {
  const relatedGlossary = getGlossaryTermsByTool('/tools/npv')
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
      <NPVCalculator relatedGlossary={relatedGlossary} />
    </>
  )
}
