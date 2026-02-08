import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { DepreciationCalculator } from './DepreciationCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産の減価償却費 計算シミュレーション｜早見表・中古建物対応',
  description:
    '賃貸経営の減価償却費を無料で計算。建物の取得価額・構造・築年数を入力するだけで年間償却費がすぐわかります。中古物件の簡便法にも対応。構造別・築年数別の早見表付き。',
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
    '賃貸経営 節税',
  ],
  openGraph: {
    title: '不動産の減価償却費 計算シミュレーション｜早見表・中古建物対応',
    description: '賃貸経営の減価償却費を無料で計算。建物の取得価額・構造・築年数を入力するだけで年間償却費がすぐわかります。',
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
    title: '不動産の減価償却費 計算シミュレーション｜早見表・中古建物対応',
    description: '賃貸経営の減価償却費を無料で計算。建物の取得価額・構造・築年数を入力するだけで年間償却費がすぐわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/depreciation',
  },
}

export default function DepreciationPage() {
  return (
    <>
      <ToolStructuredData
        name="減価償却シミュレーター"
        description="賃貸経営における建物の減価償却費を計算するツール。中古物件の簡便法にも対応。"
        toolPath="/tools/depreciation"
      />
      <DepreciationCalculator />
    </>
  )
}
