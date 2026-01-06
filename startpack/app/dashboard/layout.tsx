import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ダッシュボード - Sample',
  description: 'Sampleサービスのダッシュボード'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}