'use client'

import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
