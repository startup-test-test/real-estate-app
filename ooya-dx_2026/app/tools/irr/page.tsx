import { Metadata } from 'next'
import { IRRCalculator } from './IRRCalculator'
import { getGlossaryTermsByTool } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のIRR（内部収益率） 計算シミュレーション｜早見表付き',
  description:
    '賃貸経営のIRR（内部収益率）を無料で計算。物件購入から売却までの収益性を時間価値を考慮して評価。NPV、収益倍率も同時計算。早見表付き。',
  keywords: [
    'IRR 計算',
    'IRR シミュレーション',
    '内部収益率 不動産',
    '賃貸経営 IRR',
    'IRR 計算方法',
    'IRR 目安',
    '内部収益率 計算',
    '賃貸経営 収益率',
    'NPV 計算',
    '経営判断 指標'
  ],
  openGraph: {
    title: '賃貸経営のIRR（内部収益率） 計算シミュレーション｜早見表付き',
    description: '賃貸経営のIRR（内部収益率）を無料で計算。物件購入から売却までの収益性を時間価値を考慮して評価。',
    url: `${BASE_URL}/tools/irr`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'IRRシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のIRR（内部収益率） 計算シミュレーション｜早見表付き',
    description: '賃貸経営のIRR（内部収益率）を無料で計算。物件購入から売却までの収益性を時間価値を考慮して評価。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/irr',
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'IRR（内部収益率）シミュレーター',
  description: '賃貸経営のIRR（内部収益率）を計算するツール',
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
      name: 'IRR（内部収益率）シミュレーター',
      item: `${BASE_URL}/tools/irr`
    }
  ]
}

export default function IRRPage() {
  // 関連用語を取得（用語側のrelatedToolsから逆引き）
  const relatedGlossary = getGlossaryTermsByTool('/tools/irr')
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
      <IRRCalculator relatedGlossary={relatedGlossary} />
    </>
  )
}
