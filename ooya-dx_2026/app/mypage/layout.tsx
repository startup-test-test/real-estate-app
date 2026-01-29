import type { Metadata } from 'next'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export const metadata: Metadata = {
  title: 'マイページ - 大家DX',
  description: '不動産投資シミュレーションツールのダッシュボード'
}

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
