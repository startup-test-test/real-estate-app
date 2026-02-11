import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'

export const metadata: Metadata = {
  title: 'お問い合わせ｜大家DX',
  description: '大家DXに関するご質問、ご要望、その他お問い合わせはこちらから。',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WebPageJsonLd
        name="お問い合わせ"
        description="大家DXに関するご質問、ご要望、その他お問い合わせはこちらから。"
        path="/contact"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: 'お問い合わせ', href: '/contact' }]}
      />
      {children}
    </>
  )
}
