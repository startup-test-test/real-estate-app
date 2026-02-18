import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'
import { CompanyPageLayout } from '@/components/CompanyPageLayout';

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
  return (
    <>
      <WebPageJsonLd
        name="有料プランについて"
        description="大家DXの有料プランに関するお知らせ。現在、すべての機能を完全無料・無制限でご提供しております。"
        path="/pricing"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '料金プラン', href: '/pricing' }]}
      />
      <CompanyPageLayout>{children}</CompanyPageLayout>
    </>
  )
}
