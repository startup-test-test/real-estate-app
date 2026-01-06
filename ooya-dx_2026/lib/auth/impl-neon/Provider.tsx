"use client"

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui"
import { createAuthClient } from "@neondatabase/neon-js/auth/next"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // NEXT_PUBLIC_NEON_AUTH_URLでNeon Authの有効化を判定
  const neonAuthEnabled = Boolean(process.env.NEXT_PUBLIC_NEON_AUTH_URL)
  const router = useRouter()
  const pathname = usePathname()
  
  // クライアント側でマウント後にのみレンダリング（ハイドレーションエラー回避）
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // authClientをuseMemoで一度だけ作成（mountedがtrueの時のみ）
  const authClient = useMemo(() => {
    if (typeof window === "undefined") return null
    if (!process.env.NEXT_PUBLIC_NEON_AUTH_URL) return null
    return createAuthClient()
  }, [])

  // コールバック関数をメモ化
  const handleNavigate = useCallback((path: string) => router.push(path), [router])
  const handleReplace = useCallback((path: string) => router.replace(path), [router])
  const handleSessionChange = useCallback(() => router.refresh(), [router])

  // パスワードリセットページはカスタムUIを使用するため、NeonAuthUIProviderをバイパス
  const isPasswordResetPage = pathname === "/auth/neon-password-reset"

  // サーバー側、マウント前、または条件を満たさない場合はchildrenのみ返す
  if (!mounted || !neonAuthEnabled || isPasswordResetPage || !authClient) {
    return <>{children}</>
  }

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={handleNavigate}
      replace={handleReplace}
      onSessionChange={handleSessionChange}
      Link={Link}
      redirectTo="/dashboard"
    >
      {children}
    </NeonAuthUIProvider>
  )
}
