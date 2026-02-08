import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { ROICalculator } from './ROICalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のROI（投資利益率） 計算シミュレーション｜CCR・FCR同時計算',
  description:
    '賃貸経営のROI（投資利益率）を無料で計算。キャッシュフローROI、CCR（自己資金配当率）、FCR（実質利回り）を同時に算出。自己資金回収年数も確認可能。',
  keywords: [
    'ROI 計算',
    'ROI シミュレーション',
    '投資利益率 不動産',
    '賃貸経営 ROI',
    'ROI 計算方法',
    'CCR 計算',
    'FCR 実質利回り',
    '自己資金回収 年数',
    '賃貸経営 収益率',
    'キャッシュフロー ROI',
  ],
  openGraph: {
    title: '賃貸経営のROI（投資利益率） 計算シミュレーション｜CCR・FCR同時計算',
    description: '賃貸経営のROI（投資利益率）を無料で計算。キャッシュフローROI、CCR、FCRを同時に算出。',
    url: `${BASE_URL}/tools/roi`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'ROIシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のROI（投資利益率） 計算シミュレーション｜CCR・FCR同時計算',
    description: '賃貸経営のROI（投資利益率）を無料で計算。キャッシュフローROI、CCR、FCRを同時に算出。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/roi',
  },
}

export default function ROIPage() {
  return (
    <>
      <ToolStructuredData
        name="ROI（投資利益率）シミュレーター"
        description="賃貸経営のROI（投資利益率）を計算するツール"
        toolPath="/tools/roi"
      />
      <ROICalculator />
    </>
  )
}
