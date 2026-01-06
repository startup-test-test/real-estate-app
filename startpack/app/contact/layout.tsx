import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ - Sample',
  description: 'Sampleサービスへのお問い合わせフォーム'
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}