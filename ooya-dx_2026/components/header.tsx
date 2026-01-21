"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth/client'
import { hasAuthEnv } from '@/lib/auth/env'

// ダッシュボード系のルート（サイドバーレイアウトを使用）
const DASHBOARD_ROUTES = ['/mypage', '/dashboard', '/simulator', '/billing', '/mypage/guide']

// 独自ヘッダーを持つルート
const CUSTOM_HEADER_ROUTES = ['/']

function HeaderAuthed() {
  const auth = useAuth()
  const user = auth.user
  const isLoading = auth.isLoading
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try { localStorage.setItem('signing_out', '1') } catch {}
    // Navigate away first to avoid any page-level flashes
    router.replace('/')
    setIsDropdownOpen(false)
    try { await auth.signOut() } catch {}
    finally { try { localStorage.removeItem('signing_out') } catch {} }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ローディング中はスケルトン表示
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
        <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Link href="/auth/signin">
          <Button variant="ghost" className="hover:bg-blue-50 hover:text-blue-700 rounded-lg">
            ログイン
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg">
            新規登録
          </Button>
        </Link>
      </>
    )
  }

  return (
    <>
      <Link href="/billing">
        <Button variant="ghost" className="text-gray-700">プラン</Button>
      </Link>
      <div className="relative ml-4" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-soft">
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {user?.displayName || user?.email?.split('@')[0] || 'ユーザー'}
            </div>
          </div>
          <Icons.chevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-strong border border-gray-200 py-1 z-50">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Icons.logout className="w-4 h-4 mr-3" />ログアウト
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export function Header() {
  const stackReady = hasAuthEnv()
  const pathname = usePathname()

  // ダッシュボード系のルートではヘッダーを非表示（サイドバーを使用）
  const isDashboardRoute = DASHBOARD_ROUTES.some(route => pathname?.startsWith(route))
  // 独自ヘッダーを持つルートでは非表示
  const hasCustomHeader = CUSTOM_HEADER_ROUTES.includes(pathname || '')
  if (isDashboardRoute || hasCustomHeader) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img
              src="/img/logo_250709_2.png"
              alt="大家DX"
              className="group-hover:opacity-80 transition-opacity duration-200"
              style={{ height: '2rem', width: 'auto', display: 'block' }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/simulator" className="text-gray-600 hover:text-gray-900 transition-colors">
              シミュレーター
            </Link>
            <Link href="/tools" className="text-gray-600 hover:text-gray-900 transition-colors">
              計算ツール
            </Link>
            <Link href="/glossary" className="text-gray-600 hover:text-gray-900 transition-colors">
              用語集
            </Link>
            <Link href="/media" className="text-gray-600 hover:text-gray-900 transition-colors">
              メディア
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {stackReady ? (
              <HeaderAuthed />
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="hover:bg-blue-50 hover:text-blue-700 rounded-lg">
                    ログイン
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg">
                    新規登録
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
