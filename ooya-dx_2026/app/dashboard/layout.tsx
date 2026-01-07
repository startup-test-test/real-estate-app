import type { Metadata } from 'next'
import { DashboardLayoutClient } from './DashboardLayoutClient'

export const metadata: Metadata = {
  title: 'ダッシュボード - 大家DX',
  description: '大家DXのダッシュボード'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}