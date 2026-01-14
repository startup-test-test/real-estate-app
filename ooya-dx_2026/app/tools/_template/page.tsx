import { Metadata } from 'next'
import { ToolNameCalculator } from './ToolNameCalculator'

const BASE_URL = 'https://ooya.tech';

// =================================================================
// 【変更箇所】以下のメタデータを各ツールに合わせて編集してください
// =================================================================

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  // タイトル: 「〇〇を△秒で無料計算｜◇◇付き」形式推奨
  title: '【ツール名】を10秒で無料計算｜早見表付き',
  description:
    '【ツールの説明文】を無料で計算。〇〇を入力するだけで、△△がすぐわかります。早見表付きで一目で確認。',
  keywords: [
    '【キーワード1】',
    '【キーワード2】',
    '【キーワード3】',
    // 検索ボリュームの多い関連キーワードを追加
  ],
  openGraph: {
    title: '【ツール名】を10秒で無料計算｜早見表付き',
    description: '【ツールの説明文】を無料で計算。〇〇を入力するだけで、△△がすぐわかります。',
    url: `${BASE_URL}/tools/【tool-slug】`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '【ツール名】シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '【ツール名】を10秒で無料計算｜早見表付き',
    description: '【ツールの説明文】を無料で計算。〇〇を入力するだけで、△△がすぐわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
}

// 構造化データ（WebApplication）
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '【ツール名】シミュレーター',
  description: '【ツールの説明】を計算するツール',
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
      name: '計算ツール',
      item: `${BASE_URL}/tools`
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: '【ツール名】シミュレーター',
      item: `${BASE_URL}/tools/【tool-slug】`
    }
  ]
}

// =================================================================
// 【ここから下は基本的に変更不要】
// =================================================================

export default function ToolNamePage() {
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
      <ToolNameCalculator />
    </>
  )
}
