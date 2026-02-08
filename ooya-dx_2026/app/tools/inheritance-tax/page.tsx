import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { InheritanceTaxCalculator } from './InheritanceTaxCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '相続税 計算シミュレーション｜早見表・基礎控除対応',
  description:
    '相続税を無料で概算計算。遺産総額と相続人の人数を入力するだけで税額の目安がわかります。相続税の早見表、基礎控除の計算方法、税率表も掲載。',
  keywords: [
    '相続税 計算',
    '相続税 シミュレーション',
    '相続税 早見表',
    '相続税 基礎控除',
    '相続税 税率',
    '相続税 いくら',
    '不動産 相続税',
    '法定相続人',
    '配偶者控除 相続税',
    '相続税申告',
  ],
  openGraph: {
    title: '相続税 計算シミュレーション｜早見表・基礎控除対応',
    description: '相続税を無料で概算計算。遺産総額と相続人の人数を入力するだけで税額の目安がわかります。',
    url: `${BASE_URL}/tools/inheritance-tax`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '相続税シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '相続税 計算シミュレーション｜早見表・基礎控除対応',
    description: '相続税を無料で概算計算。遺産総額と相続人の人数を入力するだけで税額の目安がわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/inheritance-tax',
  },
}

export default function InheritanceTaxPage() {
  return (
    <>
      <ToolStructuredData
        name="相続税シミュレーター"
        description="相続税を概算計算するツール"
        toolPath="/tools/inheritance-tax"
      />
      <InheritanceTaxCalculator />
    </>
  )
}
