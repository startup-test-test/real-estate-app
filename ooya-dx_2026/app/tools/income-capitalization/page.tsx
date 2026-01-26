import { Metadata } from 'next'
import { IncomeCapitalizationCalculator } from './IncomeCapitalizationCalculator'
import { getGlossaryTermsByTool } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '収益還元法（直接還元法） 計算シミュレーション',
  description:
    '収益還元法（直接還元法）による不動産の収益価格を無料で計算。年間賃料収入とキャップレートを入力するだけで、収益不動産の理論価格を算出できます。NOI計算・キャップレート早見表付き。',
  keywords: [
    '収益還元法',
    '直接還元法',
    '収益還元法 計算',
    'キャップレート',
    'NOI 計算',
    '不動産 評価額',
    '収益価格',
    '賃貸経営 シミュレーター',
    '還元利回り',
    '純営業収益',
  ],
  openGraph: {
    title: '収益還元法（直接還元法） 計算シミュレーション',
    description: '収益還元法（直接還元法）による不動産の収益価格を無料で計算。年間賃料収入とキャップレートを入力するだけで、収益不動産の理論価格を算出できます。',
    url: `${BASE_URL}/tools/income-capitalization`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '収益還元法シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '収益還元法（直接還元法） 計算シミュレーション',
    description: '収益還元法（直接還元法）による不動産の収益価格を無料で計算。年間賃料収入とキャップレートを入力するだけで、収益不動産の理論価格を算出できます。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '収益還元法シミュレーター',
  description: '収益還元法（直接還元法）による不動産の収益価格を計算するツール。NOI計算・キャップレート早見表対応。',
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
      name: '収益還元法シミュレーター',
      item: `${BASE_URL}/tools/income-capitalization`
    }
  ]
}

export default function IncomeCapitalizationPage() {
  const relatedGlossary = getGlossaryTermsByTool('/tools/income-capitalization').map(term => ({ slug: term.slug, title: term.title }))

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
      <IncomeCapitalizationCalculator relatedGlossary={relatedGlossary} />
    </>
  )
}
