import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { DCFCalculator } from './DCFCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: 'DCF法 計算シミュレーション',
  description:
    'DCF法（割引キャッシュフロー法）で不動産の収益価格を無料で概算計算。年間NOI・割引率・保有期間を入力するだけで、将来キャッシュフローの現在価値と復帰価格から評価額を算出。早見表付き。',
  keywords: [
    'DCF法',
    'DCF 不動産',
    'DCF法 計算',
    '割引キャッシュフロー法',
    'Discounted Cash Flow',
    '収益還元法',
    'NOI',
    '割引率',
    '還元利回り',
    '復帰価格',
    '現在価値',
  ],
  openGraph: {
    title: 'DCF法 計算シミュレーション',
    description: 'DCF法（割引キャッシュフロー法）で不動産の収益価格を無料で概算計算。早見表付き。',
    url: `${BASE_URL}/tools/dcf`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'DCF法シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DCF法 計算シミュレーション',
    description: 'DCF法（割引キャッシュフロー法）で不動産の収益価格を無料で概算計算。早見表付き。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/dcf',
  },
}

export default function DCFPage() {
  return (
    <>
      <ToolStructuredData
        name="DCF法シミュレーター"
        description="DCF法（割引キャッシュフロー法）による不動産評価額の計算ツール"
        toolPath="/tools/dcf"
      />
      <DCFCalculator />
    </>
  )
}
