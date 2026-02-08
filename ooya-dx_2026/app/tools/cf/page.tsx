import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { CFCalculator } from './CFCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '賃貸経営のキャッシュフロー 計算シミュレーション｜BTCF・収支可視化',
  description:
    '賃貸経営のキャッシュフロー（CF）を無料で計算。GPI→EGI→NOI→BTCFのキャッシュフローツリーで収支を可視化。DSCR・経費率も同時算出。',
  keywords: [
    'キャッシュフロー 計算',
    'キャッシュフロー シミュレーション',
    '賃貸経営 CF',
    '税引前キャッシュフロー',
    'BTCF 計算',
    'NOI キャッシュフロー',
    '賃貸経営 収支計算',
    'キャッシュフローツリー',
  ],
  openGraph: {
    title: '賃貸経営のキャッシュフロー 計算シミュレーション｜BTCF・収支可視化',
    description: '賃貸経営のキャッシュフロー（CF）を無料で計算。キャッシュフローツリーで収支を可視化。',
    url: `${BASE_URL}/tools/cf`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: 'キャッシュフローシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のキャッシュフロー 計算シミュレーション｜BTCF・収支可視化',
    description: '賃貸経営のキャッシュフロー（CF）を無料で計算。キャッシュフローツリーで収支を可視化。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/cf',
  },
}

export default function CFPage() {
  return (
    <>
      <ToolStructuredData
        name="キャッシュフロー（CF）シミュレーター"
        description="賃貸経営のキャッシュフローを計算するツール"
        toolPath="/tools/cf"
      />
      <CFCalculator />
    </>
  )
}
