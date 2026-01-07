import type { Metadata } from 'next'
import { BillingLayoutClient } from './BillingLayoutClient'

export const metadata: Metadata = {
  title: 'プラン・課金管理 - 大家DX',
  description: '大家DXの料金プランとサブスクリプション管理'
}

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <BillingLayoutClient>{children}</BillingLayoutClient>
}