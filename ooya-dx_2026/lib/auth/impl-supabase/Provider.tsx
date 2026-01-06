"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// Supabase: リカバリーリンク(type=recovery)で流入した場合は
// 任意のURLからでもパスワード更新ページへ誘導する
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = url && anon ? createBrowserClient(url, anon) : null

    const pathname = window.location.pathname
    const hash = window.location.hash || ''

    // If recovery hash detected anywhere, force password reset page
    if (hash.includes('type=recovery')) {
      if (!pathname.startsWith('/auth/password-reset')) {
        router.replace('/auth/password-reset')
      }
      return
    }

    // OAuth/email-verify code flow: /?code=...
    const sp = new URLSearchParams(window.location.search)
    const code = sp.get('code')

    // If we are on the password reset page, do not redirect away.
    if (pathname.startsWith('/auth/password-reset')) {
      if (code && supabase) {
        // Ensure session is created if coming with ?code
        supabase.auth.exchangeCodeForSession({ code }).catch(() => {})
      }
      return
    }

    // Elsewhere: exchange code and then redirect to dashboard on SIGNED_IN
    const hadCodeRef = { current: false }
    let unsub: (() => void) | null = null
    if (supabase) {
      const sub = supabase.auth.onAuthStateChange((event: any) => {
        if (event === 'PASSWORD_RECOVERY') {
          router.replace('/auth/password-reset')
        } else if (event === 'SIGNED_IN' && hadCodeRef.current) {
          router.replace('/dashboard')
        }
      })
      unsub = () => sub.data.subscription.unsubscribe()
    }
    if (code && supabase) {
      hadCodeRef.current = true
      supabase.auth.exchangeCodeForSession({ code }).catch(() => {})
    }

    return () => { if (unsub) unsub() }
  }, [router])
  return <>{children}</>
}
