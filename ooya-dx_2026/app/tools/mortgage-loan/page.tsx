import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { MortgageLoanCalculator } from './MortgageLoanCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '住宅ローン 計算シミュレーション｜毎月返済額・総返済額',
  description:
    '住宅ローンの毎月返済額・総返済額を無料で計算。借入額と金利を入力するだけで、元利均等・元金均等の両方式に対応。ボーナス返済や返済負担率も自動計算。早見表付き。',
  keywords: [
    '住宅ローン シミュレーション',
    '住宅ローン 計算',
    '住宅ローン 返済額',
    '住宅ローン 毎月返済額',
    '住宅ローン 総返済額',
    '元利均等返済',
    '元金均等返済',
    'ボーナス返済',
    '返済負担率',
    '住宅ローン 金利'
  ],
  openGraph: {
    title: '住宅ローン 計算シミュレーション｜毎月返済額・総返済額',
    description: '住宅ローンの毎月返済額・総返済額を無料で計算。借入額と金利を入力するだけで瞬時に計算。早見表付き。',
    url: `${BASE_URL}/tools/mortgage-loan`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '住宅ローンシミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '住宅ローン 計算シミュレーション｜毎月返済額・総返済額',
    description: '住宅ローンの毎月返済額・総返済額を無料で計算。借入額と金利を入力するだけで瞬時に計算。早見表付き。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/mortgage-loan',
  },
}

export default function MortgageLoanPage() {
  return (
    <>
      <ToolStructuredData
        name="住宅ローンシミュレーター"
        description="住宅ローンの毎月返済額・総返済額を計算するツール"
        toolPath="/tools/mortgage-loan"
      />
      <MortgageLoanCalculator />
    </>
  )
}
