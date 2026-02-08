import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { CapitalGainsTaxCalculator } from './CapitalGainsTaxCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産の譲渡所得税 計算シミュレーション｜3000万円控除対応',
  description:
    '不動産売却時の譲渡所得税（所得税・住民税）を無料で概算計算。売却価格と取得費を入力するだけで税額の目安がわかります。3,000万円特別控除、10年超所有の軽減税率にも対応。',
  keywords: [
    '譲渡所得税 計算',
    '譲渡所得税 シミュレーション',
    '不動産売却 税金',
    '3000万円控除',
    '長期譲渡所得',
    '短期譲渡所得',
    '譲渡所得 税率',
    'マイホーム売却 税金',
    '不動産 売却益 税金',
    '居住用財産 特別控除',
  ],
  openGraph: {
    title: '不動産の譲渡所得税 計算シミュレーション｜3000万円控除対応',
    description: '不動産売却時の譲渡所得税を無料で概算計算。売却価格と取得費を入力するだけで税額の目安がわかります。',
    url: `${BASE_URL}/tools/capital-gains-tax`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '譲渡所得税シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産の譲渡所得税 計算シミュレーション｜3000万円控除対応',
    description: '不動産売却時の譲渡所得税を無料で概算計算。売却価格と取得費を入力するだけで税額の目安がわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/capital-gains-tax',
  },
}

export default function CapitalGainsTaxPage() {
  return (
    <>
      <ToolStructuredData
        name="譲渡所得税シミュレーター"
        description="不動産売却時の譲渡所得税を概算計算するツール"
        toolPath="/tools/capital-gains-tax"
      />
      <CapitalGainsTaxCalculator />
    </>
  )
}
