'use client'

import { AuthProvider } from '@/lib/auth/Provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
