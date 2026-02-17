import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'
import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { HeaderSpacer } from '@/components/HeaderSpacer';

export const metadata: Metadata = {
  title: 'よくある質問｜大家DX',
  description: '大家DXに関するよくある質問と回答をまとめました。',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WebPageJsonLd
        name="よくある質問"
        description="大家DXに関するよくある質問と回答をまとめました。"
        path="/faq"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: 'よくある質問', href: '/faq' }]}
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
