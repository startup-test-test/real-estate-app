import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '有料プランについて｜大家DX',
  description: '大家DXの有料プランに関するお知らせ。現在、すべての機能を完全無料・無制限でご提供しております。',
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
