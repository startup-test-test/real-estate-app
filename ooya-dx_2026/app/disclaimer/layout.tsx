import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '免責事項｜大家DX',
  description: '大家DXサービスの免責事項について。本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。',
  alternates: {
    canonical: '/disclaimer',
  },
}

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
