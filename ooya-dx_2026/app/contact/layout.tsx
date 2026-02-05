import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ | 大家DX',
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
  return children
}
