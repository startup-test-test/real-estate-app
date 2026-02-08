import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { NPVCalculator } from './NPVCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のNPV（正味現在価値） 計算シミュレーション｜感度分析付き',
  description:
    '賃貸経営のNPV（正味現在価値）を無料で計算。DCF法に基づき、将来キャッシュフローの現在価値を算出。割引率別の感度分析機能付き。収益性指数（PI）も同時計算。',
  keywords: [
    'NPV 計算',
    'NPV シミュレーション',
    '正味現在価値 不動産',
    '賃貸経営 NPV',
    'NPV 計算方法',
    'NPV 目安',
    'DCF法 計算',
    '割引率 不動産',
    '収益性指数 PI',
    '賃貸経営 投資判断',
  ],
  openGraph: {
    title: '賃貸経営のNPV（正味現在価値） 計算シミュレーション｜感度分析付き',
    description: '賃貸経営のNPV（正味現在価値）を無料で計算。DCF法に基づき、将来キャッシュフローの現在価値を算出。',
    url: `${BASE_URL}/tools/npv`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'NPVシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のNPV（正味現在価値） 計算シミュレーション｜感度分析付き',
    description: '賃貸経営のNPV（正味現在価値）を無料で計算。DCF法に基づき、将来キャッシュフローの現在価値を算出。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/npv',
  },
}

export default function NPVPage() {
  return (
    <>
      <ToolStructuredData
        name="NPV（正味現在価値）シミュレーター"
        description="賃貸経営のNPV（正味現在価値）を計算するツール"
        toolPath="/tools/npv"
      />
      <NPVCalculator />
    </>
  )
}
