import { Metadata } from 'next'
import { ReplacementCostCalculator } from './ReplacementCostCalculator'

const PAGE_TITLE = '建物の再調達価格 計算シミュレーション｜構造・用途別の積算評価'
const PAGE_DESCRIPTION = '建物の再調達価格（再調達原価）を計算。延床面積・構造・用途・築年数を入力するだけで、新築時の建築費用と現在の建物価値を算出します。'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    '再調達価格',
    '再調達原価',
    '建物評価',
    '積算評価',
    '建築単価',
    '不動産評価',
    '担保評価',
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: 'website',
    locale: 'ja_JP',
    siteName: '大家DX',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  alternates: {
    canonical: 'https://www.ooya.tech/tools/replacement-cost',
  },
}

// 構造化データ（JSON-LD）
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '再調達価格シミュレーター',
  description: PAGE_DESCRIPTION,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  author: {
    '@type': 'Organization',
    name: '大家DX',
    url: 'https://www.ooya.tech',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'トップ',
      item: 'https://www.ooya.tech',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '計算ツール',
      item: 'https://www.ooya.tech/tools',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: '再調達価格',
      item: 'https://www.ooya.tech/tools/replacement-cost',
    },
  ],
}

export default function ReplacementCostPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ReplacementCostCalculator />
    </>
  )
}
