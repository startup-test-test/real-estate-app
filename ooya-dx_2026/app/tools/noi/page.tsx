import type { Metadata } from 'next'
import { NOICalculator } from './NOICalculator'

export const metadata: Metadata = {
  title: '賃貸経営のNOI（営業純収益） 計算シミュレーション｜経費率目安付き | OOYA.tech',
  description:
    'NOI（Net Operating Income・営業純収益）を計算できる無料シミュレーター。GPI・EGI・OPEXの詳細内訳を表示し、キャッシュフローツリーで収益構造を可視化。物件タイプ別の経費率目安も掲載。',
  keywords: [
    'NOI',
    '営業純収益',
    'Net Operating Income',
    'NOI計算',
    'NOIシミュレーション',
    '賃貸経営NOI',
    'EGI',
    'GPI',
    'OPEX',
    '経費率',
    'キャッシュフロー',
  ],
  openGraph: {
    title: '賃貸経営のNOI（営業純収益） 計算シミュレーション | OOYA.tech',
    description:
      'NOI（営業純収益）を計算できる無料シミュレーター。GPI・EGI・OPEXの詳細内訳とキャッシュフローツリーで収益構造を可視化。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'OOYA.tech',
    url: 'https://ooya.tech/tools/noi',
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営のNOI（営業純収益） 計算シミュレーション | OOYA.tech',
    description:
      'NOI（営業純収益）を計算できる無料シミュレーター。GPI・EGI・OPEXの詳細内訳とキャッシュフローツリーで収益構造を可視化。',
  },
  alternates: {
    canonical: 'https://ooya.tech/tools/noi',
  },
}

export default function NOIPage() {
  return <NOICalculator />
}
