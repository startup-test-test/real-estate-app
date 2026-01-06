import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プラン - Sample',
  description: 'Sampleサービスの料金プランとサブスクリプション管理'
}

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}