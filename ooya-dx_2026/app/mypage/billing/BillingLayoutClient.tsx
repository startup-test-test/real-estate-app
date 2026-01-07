'use client'

import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export function BillingLayoutClient({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
