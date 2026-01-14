"use client"

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/client'
import { Icons } from '@/components/ui/icons'
import {
  Calculator,
  User,
  Home,
  Menu,
  X,
  BookOpen,
  LogOut,
  Sparkles,
  // CreditCard, // 無料化対応: 課金管理を削除
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface Subscription {
  status: string
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const user = auth.user
  const dropdownRef = useRef<HTMLDivElement>(null)

  // サブスクリプション状態を取得
  useEffect(() => {
    if (user) {
      fetch('/api/stripe/subscription')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.subscription) {
            setSubscription(data.subscription)
          }
        })
        .catch(() => {})
    }
  }, [user])

  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing'

  const handleSignOut = async () => {
    try {
      localStorage.setItem('signing_out', '1')
    } catch {}
    router.replace('/')
    setIsUserDropdownOpen(false)
    try {
      await auth.signOut()
    } catch {}
    finally {
      try {
        localStorage.removeItem('signing_out')
      } catch {}
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigation = [
    { name: 'マイページ', href: '/mypage', icon: Home },
    { name: '賃貸経営シミュレーター', href: '/mypage/simulator', icon: Calculator },
  ]

  const supportNavigation = [
    { name: 'ご利用ガイド・よくある質問', href: '/mypage/guide', icon: BookOpen },
  ]

  const isActive = (href: string) => {
    if (href === '/mypage') {
      return pathname === '/mypage'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - SP版のみ表示 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-lg z-[99999]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link href="/mypage" className="flex items-center">
            <img
              src="/img/logo_250709_2.png"
              alt="大家DX"
              className="h-7 w-auto"
            />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[100001]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-[100002] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="mb-6">
              <Link href="/mypage" className="block">
                <div className="flex justify-center mb-3 transition-transform hover:scale-105">
                  <img
                    src="/img/logo_250709_2.png"
                    alt="大家DX"
                    className="h-11 w-auto"
                  />
                </div>
              </Link>
              <p className="text-gray-600 text-sm font-medium text-center">
                AIが導く、あなたの賃貸経営の未来。
              </p>
            </div>

            {/* Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-soft">
                  {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-gray-800 font-medium text-sm truncate max-w-[140px]">
                    {user?.displayName || user?.email?.split('@')[0] || 'ユーザー'}
                  </div>
                  {/* 無料化対応: プレミアム/未契約バッジを削除 */}
                </div>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <Icons.chevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-2 mb-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* 無料化対応: プラン・課金管理セクションを削除 */}

            {/* Support Section */}
            <div className="mb-8">
              <div className="px-4 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  サポート
                </h3>
              </div>
              <div className="space-y-2">
                {supportNavigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </button>
          </div>

          {/* Legal Links */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 mb-4 px-2">
              <a
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                利用規約
              </a>
              <a
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                個人情報取り扱いについて
              </a>
              <a
                href="/legal/tokushoho"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                特定商取引法に基づく表記
              </a>
              <a
                href="/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                免責事項
              </a>
              <a
                href="https://startup-marketing.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                運営会社
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-600 text-center">
              © 2026 StartupMarketing Inc.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="min-h-screen pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
