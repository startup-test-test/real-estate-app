'use client'

// 古いブラウザ向けのポリフィル（他のインポートより先に読み込む）
import '@/lib/polyfills'

import { AuthProvider } from '@/lib/auth/Provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
