import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { HeaderSpacer } from '@/components/HeaderSpacer';

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
      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />
        <HeaderSpacer />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
