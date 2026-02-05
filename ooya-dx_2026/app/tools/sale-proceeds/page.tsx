import { Metadata } from 'next'
import { SaleProceedsCalculator } from './SaleProceedsCalculator'
import { getGlossaryTermsByTool } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産の売却時手取り 計算シミュレーション｜税引き後キャッシュを算出',
  description:
    '不動産売却時の最終手取り額を自動計算。売却価格から仲介手数料、譲渡所得税、ローン残高を差し引いた税引き後キャッシュがわかります。3,000万円控除にも対応。',
  keywords: [
    '売却 手取り',
    '不動産 売却 手取り 計算',
    '不動産 売却 税金',
    '譲渡所得税 計算',
    '売却 手取り シミュレーション',
    'マンション 売却 手取り',
    '家 売却 手取り',
  ],
  openGraph: {
    title: '不動産の売却時手取り 計算シミュレーション｜税引き後キャッシュを算出',
    description: '不動産売却時の最終手取り額を自動計算。仲介手数料、譲渡所得税、ローン残高を考慮した実際の手取り額がわかります。',
    url: `${BASE_URL}/tools/sale-proceeds`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '売却時手取りシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産の売却時手取り 計算シミュレーション｜税引き後キャッシュを算出',
    description: '不動産売却時の最終手取り額を自動計算。仲介手数料、譲渡所得税、ローン残高を考慮した実際の手取り額がわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/sale-proceeds',
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '売却時手取りシミュレーター',
  description: '不動産売却時の最終手取り額を計算するツール',
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
      name: '売却時手取りシミュレーター',
      item: `${BASE_URL}/tools/sale-proceeds`
    }
  ]
}

export default function SaleProceedsPage() {
  const relatedGlossary = getGlossaryTermsByTool('/tools/sale-proceeds')
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
      <SaleProceedsCalculator relatedGlossary={relatedGlossary} />
    </>
  )
}
