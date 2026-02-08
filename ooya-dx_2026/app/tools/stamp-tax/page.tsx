import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { StampTaxCalculator } from './StampTaxCalculator'

const BASE_URL = 'https://ooya.tech';

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '不動産契約の印紙税 計算シミュレーション｜軽減措置・電子契約対応',
  description:
    '不動産売買契約書・建設工事請負契約書・領収書の印紙税を無料で概算計算。契約金額を入力するだけで税額の目安がわかります。2027年3月末までの軽減措置対応。',
  keywords: [
    '印紙税 計算',
    '印紙税 シミュレーション',
    '不動産売買契約書 印紙税',
    '建設工事請負契約書 印紙税',
    '印紙税 軽減措置',
    '電子契約 印紙税',
    '領収書 印紙税',
    '収入印紙 金額',
    '印紙税額一覧表',
    '印紙税 早見表',
  ],
  openGraph: {
    title: '不動産契約の印紙税 計算シミュレーション｜軽減措置・電子契約対応',
    description: '不動産売買契約書・建設工事請負契約書・領収書の印紙税を無料で概算計算。契約金額を入力するだけで税額がわかります。',
    url: `${BASE_URL}/tools/stamp-tax`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '印紙税シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産契約の印紙税 計算シミュレーション｜軽減措置・電子契約対応',
    description: '不動産売買契約書・建設工事請負契約書・領収書の印紙税を無料で概算計算。契約金額を入力するだけで税額がわかります。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools/stamp-tax',
  },
}

export default function StampTaxPage() {
  return (
    <>
      <ToolStructuredData
        name="印紙税シミュレーター"
        description="不動産契約書・領収書の印紙税を概算計算するツール"
        toolPath="/tools/stamp-tax"
      />
      <StampTaxCalculator />
    </>
  )
}
