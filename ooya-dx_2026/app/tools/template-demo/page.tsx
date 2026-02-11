import { Metadata } from 'next'
import { TemplateCalculator } from './TemplateCalculator'

const BASE_URL = 'https://ooya.tech';

// =================================================================
// 【テンプレートデモ】
// このページはテンプレートの見た目確認用です
// 新規ツール作成時は _template フォルダからコピーしてください
// =================================================================

export const metadata: Metadata = {
  title: '【テンプレート】シミュレーターを10秒で無料計算｜早見表付き',
  description:
    'テンプレートの説明文。〇〇を入力するだけで、△△がすぐわかります。早見表付きで一目で確認。',
  robots: {
    index: false,
    follow: false,
  },
  keywords: [
    'キーワード1',
    'キーワード2',
    'キーワード3',
  ],
  openGraph: {
    title: '【テンプレート】シミュレーターを10秒で無料計算｜早見表付き',
    description: 'テンプレートの説明文。〇〇を入力するだけで、△△がすぐわかります。',
    url: `${BASE_URL}/tools/template-demo`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'テンプレートシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '【テンプレート】シミュレーターを10秒で無料計算｜早見表付き',
    description: 'テンプレートの説明文。〇〇を入力するだけで、△△がすぐわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  // 検索エンジンにインデックスさせない（デモページのため）
  robots: {
    index: false,
    follow: false,
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'テンプレートシミュレーター',
  description: 'テンプレートの説明を計算するツール',
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
      name: 'テンプレートシミュレーター',
      item: `${BASE_URL}/tools/template-demo`
    }
  ]
}

export default function TemplateDemoPage() {
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
      <TemplateCalculator />
    </>
  )
}
