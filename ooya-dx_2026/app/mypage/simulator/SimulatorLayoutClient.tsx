'use client'

import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export function SimulatorLayoutClient({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
