import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { YieldRateCalculator } from './YieldRateCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '表面利回り・実質利回り 計算シミュレーション｜早見表付き',
  description:
    '賃貸経営の表面利回り・実質利回りを10秒で無料計算。物件価格と年間賃料を入力するだけで、グロス利回り・ネット利回りの両方がすぐわかります。早見表付き。',
  keywords: [
    '利回り計算',
    '表面利回り',
    '実質利回り',
    '賃貸経営 利回り',
    'グロス利回り',
    'ネット利回り',
    '利回り シミュレーター',
    '収益物件 利回り',
  ],
  openGraph: {
    title: '表面利回り・実質利回り 計算シミュレーション｜早見表付き',
    description: '賃貸経営の表面利回り・実質利回りを10秒で無料計算。物件価格と年間賃料を入力するだけで、グロス利回り・ネット利回りがすぐわかります。',
    url: `${BASE_URL}/tools/yield-rate`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '利回りシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '表面利回り・実質利回り 計算シミュレーション｜早見表付き',
    description: '賃貸経営の表面利回り・実質利回りを10秒で無料計算。物件価格と年間賃料を入力するだけで、グロス利回り・ネット利回りがすぐわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/yield-rate',
  },
}

export default function YieldRatePage() {
  return (
    <>
      <ToolStructuredData
        name="利回りシミュレーター"
        description="賃貸経営の表面利回り・実質利回りを計算するツール"
        toolPath="/tools/yield-rate"
      />
      <YieldRateCalculator />
    </>
  )
}
