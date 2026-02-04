import { Metadata } from 'next'
import { BrokerageGuide } from './BrokerageGuide'
import { getGlossaryTermsByTool } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '仲介手数料とは？計算方法・2024年法改正・支払いの仕組みを解説',
  description:
    '不動産売買の仲介手数料を徹底解説。計算方法（速算式）、2024年7月の法改正（800万円以下の特例）、支払いタイミング、両手仲介と片手仲介の違いなど、仲介手数料の仕組みがわかります。',
  keywords: [
    '仲介手数料とは',
    '仲介手数料 仕組み',
    '仲介手数料 計算方法',
    '仲介手数料 2024年 法改正',
    '仲介手数料 いつ払う',
    '両手仲介 片手仲介',
  ],
  openGraph: {
    title: '仲介手数料とは？計算方法・2024年法改正・支払いの仕組みを解説',
    description: '不動産売買の仲介手数料を徹底解説。計算方法、法改正、支払いタイミングなど。',
    url: `${BASE_URL}/tools/brokerage/guide`,
    siteName: '大家DX',
    type: 'article',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '仲介手数料の解説',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '仲介手数料とは？計算方法・2024年法改正・支払いの仕組みを解説',
    description: '不動産売買の仲介手数料を徹底解説。計算方法、法改正、支払いタイミングなど。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
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
      name: '仲介手数料シミュレーター',
      item: `${BASE_URL}/tools/brokerage`
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: '仲介手数料の解説',
      item: `${BASE_URL}/tools/brokerage/guide`
    }
  ]
}

// Article構造化データ
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '仲介手数料とは？計算方法・2024年法改正・支払いの仕組みを解説',
  description: '不動産売買の仲介手数料を徹底解説。計算方法（速算式）、2024年7月の法改正、支払いタイミングなど。',
  author: {
    '@type': 'Organization',
    name: '大家DX',
    url: 'https://ooya.tech'
  },
  publisher: {
    '@type': 'Organization',
    name: '大家DX',
    url: 'https://ooya.tech'
  },
  datePublished: '2024-07-01',
  dateModified: new Date().toISOString().split('T')[0],
}

export default function BrokerageGuidePage() {
  const relatedGlossary = getGlossaryTermsByTool('/tools/brokerage')
    .map(term => ({ slug: term.slug, title: term.title }))

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema)
        }}
      />
      <BrokerageGuide relatedGlossary={relatedGlossary} />
    </>
  )
}
