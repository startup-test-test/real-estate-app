import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'

export const metadata: Metadata = {
  title: 'よくある質問｜大家DX',
  description: '大家DXに関するよくある質問と回答をまとめました。',
  alternates: {
    canonical: '/company/faq',
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
        path="/company/faq"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: 'よくある質問', href: '/company/faq' }]}
      />
      {children}
    </>
  )
}
