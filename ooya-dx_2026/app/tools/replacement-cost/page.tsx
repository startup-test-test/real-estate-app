import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { ReplacementCostCalculator } from './ReplacementCostCalculator'

const PAGE_TITLE = '建物の再調達価格 計算シミュレーション｜構造・用途別の積算評価'
const PAGE_DESCRIPTION = '建物の再調達価格（再調達原価）を計算。延床面積・構造・用途・築年数を入力するだけで、新築時の建築費用と現在の建物価値を算出します。'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    '再調達価格',
    '再調達原価',
    '建物評価',
    '積算評価',
    '建築単価',
    '不動産評価',
    '担保評価',
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: 'website',
    locale: 'ja_JP',
    siteName: '大家DX',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  alternates: {
    canonical: '/tools/replacement-cost',
  },
}

export default function ReplacementCostPage() {
  return (
    <>
      <ToolStructuredData
        name="再調達価格シミュレーター"
        description={PAGE_DESCRIPTION}
        toolPath="/tools/replacement-cost"
      />
      <ReplacementCostCalculator />
    </>
  )
}
