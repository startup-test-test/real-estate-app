import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'

export const metadata: Metadata = {
  title: '免責事項｜大家DX',
  description: '大家DXサービスの免責事項について。本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。',
  alternates: {
    canonical: '/company/disclaimer',
  },
}

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WebPageJsonLd
        name="免責事項"
        description="大家DXサービスの免責事項について。本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。"
        path="/company/disclaimer"
        datePublished="2025-08-11"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '免責事項', href: '/company/disclaimer' }]}
      />
      {children}
    </>
  )
}
