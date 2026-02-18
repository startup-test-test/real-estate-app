import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'

export const metadata: Metadata = {
  title: '有料プランについて｜大家DX',
  description: '大家DXの有料プランに関するお知らせ。現在、すべての機能を完全無料・無制限でご提供しております。',
  alternates: {
    canonical: '/company/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WebPageJsonLd
        name="有料プランについて"
        description="大家DXの有料プランに関するお知らせ。現在、すべての機能を完全無料・無制限でご提供しております。"
        path="/company/pricing"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '料金プラン', href: '/company/pricing' }]}
      />
      {children}
    </>
  )
}
