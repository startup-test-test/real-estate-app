import type { Metadata } from 'next'
import { CCRCalculator } from './CCRCalculator'

export const metadata: Metadata = {
  title: '賃貸経営のCCR（自己資金配当率） 計算シミュレーション｜早見表付き | OOYA.tech',
  description:
    'CCR（Cash on Cash Return・自己資金配当率）を計算できる無料シミュレーター。自己資金に対する年間キャッシュフローの収益率を算出し、レバレッジ効果も判定。物件購入の投資効率を分析できます。',
  keywords: [
    'CCR',
    'キャッシュオンキャッシュリターン',
    '自己資金配当率',
    'CCR計算',
    'CCR不動産',
    'CCRシミュレーション',
    '賃貸経営CCR',
    '自己資金利回り',
    'レバレッジ効果',
    'BTCF',
  ],
  openGraph: {
    title: '賃貸経営のCCR（自己資金配当率） 計算シミュレーション | OOYA.tech',
    description:
      'CCR（自己資金配当率）を計算できる無料シミュレーター。自己資金に対するキャッシュフローの収益率を算出。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'OOYA.tech',
    url: 'https://ooya.tech/tools/ccr',
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のCCR（自己資金配当率） 計算シミュレーション | OOYA.tech',
    description:
      'CCR（自己資金配当率）を計算できる無料シミュレーター。自己資金に対するキャッシュフローの収益率を算出。',
  },
  alternates: {
    canonical: 'https://ooya.tech/tools/ccr',
  },
}

export default function CCRPage() {
  return <CCRCalculator />
}
