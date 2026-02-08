import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { GiftTaxCalculator } from './GiftTaxCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産の贈与税 計算シミュレーション｜早見表・特例対応',
  description:
    '不動産を贈与した際の贈与税を無料で概算計算。贈与金額を入力するだけで税額の目安がわかります。暦年課税の早見表、住宅取得資金贈与の非課税特例、配偶者控除（おしどり贈与）にも対応。',
  keywords: [
    '贈与税 計算',
    '贈与税 シミュレーション',
    '不動産 贈与税',
    '住宅取得資金贈与',
    '贈与税 早見表',
    '贈与税 税率',
    '暦年課税',
    '配偶者控除 贈与',
    'おしどり贈与',
    '贈与税 110万円',
  ],
  openGraph: {
    title: '不動産の贈与税 計算シミュレーション｜早見表・特例対応',
    description: '不動産を贈与した際の贈与税を無料で概算計算。贈与金額を入力するだけで税額の目安がわかります。',
    url: `${BASE_URL}/tools/gift-tax`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '贈与税シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産の贈与税 計算シミュレーション｜早見表・特例対応',
    description: '不動産を贈与した際の贈与税を無料で概算計算。贈与金額を入力するだけで税額の目安がわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/gift-tax',
  },
}

export default function GiftTaxPage() {
  return (
    <>
      <ToolStructuredData
        name="贈与税シミュレーター"
        description="不動産を贈与した際の贈与税を概算計算するツール"
        toolPath="/tools/gift-tax"
      />
      <GiftTaxCalculator />
    </>
  )
}
