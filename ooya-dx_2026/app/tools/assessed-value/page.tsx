import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { AssessedValueCalculator } from './AssessedValueCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産の積算評価 計算シミュレーション｜土地・建物の担保価値を算出',
  description:
    '賃貸経営における積算評価（原価法）を無料で計算。路線価・建物構造・築年数から土地・建物の積算価格を算出。銀行融資の担保評価の目安がわかります。',
  keywords: [
    '積算評価',
    '積算価格',
    '原価法',
    '不動産価格計算',
    '担保評価',
    '銀行融資',
    '路線価',
    '再調達原価',
    '土地評価',
    '建物評価',
    '賃貸経営',
  ],
  openGraph: {
    title: '不動産の積算評価 計算シミュレーション｜土地・建物の担保価値を算出',
    description: '賃貸経営における積算評価（原価法）を無料で計算。路線価・建物構造・築年数から土地・建物の積算価格を算出。',
    url: `${BASE_URL}/tools/assessed-value`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '積算評価シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産の積算評価 計算シミュレーション｜土地・建物の担保価値を算出',
    description: '賃貸経営における積算評価（原価法）を無料で計算。路線価・建物構造・築年数から土地・建物の積算価格を算出。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/assessed-value',
  },
}

export default function AssessedValuePage() {
  return (
    <>
      <ToolStructuredData
        name="積算評価シミュレーター"
        description="賃貸経営における土地・建物の積算評価（原価法）を計算するツール。銀行融資の担保評価の目安を算出。"
        toolPath="/tools/assessed-value"
      />
      <AssessedValueCalculator />
    </>
  )
}
