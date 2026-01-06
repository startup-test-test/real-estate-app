'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Footer from './Footer';
// TODO: 認証移行後に有効化
// import { useAuthContext } from '@/components/AuthProvider';
// import { calculateRemainingDays, formatRemainingTime, getSubscriptionStatus } from '@/utils/subscriptionHelpers';
// import { supabase } from '@/lib/supabase';
import {
  Calculator,
  User,
  Home,
  Menu,
  X,
  Settings,
  BookOpen,
  LogOut,
  Sparkles,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  // TODO: 認証移行後に有効化
  // const { user, signOut } = useAuthContext();
  const user = { email: 'user@example.com' }; // 仮のモックデータ
  const signOut = async () => {}; // 仮のモック関数

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      router.push('/auth/login');
    }
  };

  const navigation: Array<{ name: string; href: string; icon: any; badge?: string }> = [
    { name: 'マイページ', href: '/dashboard', icon: Home },
    { name: '収益シミュレーター', href: '/simulator', icon: Calculator },
  ];

  const supportNavigation = [
    { name: 'ご利用ガイド・よくある質問', href: '/guide', icon: BookOpen },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - SP版のみ表示、印刷時は非表示 */}
      <div className="lg:hidden print:hidden fixed top-0 left-0 right-0 bg-white shadow-lg" style={{ zIndex: 99999 }}>
        {/* Logo Section */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/img/logo_250709_2.png"
              alt="Logo"
              className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Menu Button */}
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

      {/* Mobile Menu Overlay - 印刷時は非表示 */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden print:hidden fixed inset-0 bg-black/50"
          style={{ zIndex: 100001 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Integrated Header and Logo Design - 印刷時は非表示 */}
      <div className={`fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ zIndex: 100002 }}>
        <div className="flex h-full flex-col">
          {/* Integrated Header with Logo */}
          <div className="p-6 border-b border-gray-200">
            {/* Logo Section */}
            <div className="mb-6">
              <Link href="/dashboard" className="block">
                <div className="flex justify-center mb-3 transition-transform hover:scale-105">
                  <img
                    src="/img/logo_250709_2.png"
                    alt="Logo"
                    className="h-11 w-auto cursor-pointer"
                  />
                </div>
              </Link>
              <p className="text-gray-600 text-sm font-medium text-center">AIが導く、あなたの賃貸経営の未来。</p>
            </div>

            {/* Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-gray-800 font-medium text-sm">{user?.email || 'ゲストユーザー'}</div>
                  {isPremium ? (
                    <div className="flex items-center mt-1">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        ベーシックプラン
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-bold text-gray-500">フリープラン</span>
                    </div>
                  )}
                </div>
              </div>
              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-2 mb-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-4 text-base font-medium rounded-lg transition-colors relative ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-4 h-6 w-6" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Support Section */}
            <div className="mb-8">
              <div className="px-4 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">サポート</h3>
              </div>
              <div className="space-y-2">
                {supportNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
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
                  );
                })}
              </div>
            </div>

          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              ログアウト
            </button>
          </div>

          {/* Legal Links */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 mb-4 px-2">
              <Link
                href="/terms"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                利用規約
              </Link>
              <Link
                href="/privacy"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                個人情報取り扱いについて
              </Link>
              <Link
                href="/tokushoho"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                特定商取引法に基づく表記
              </Link>
              <Link
                href="/disclaimer"
                className="block text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                免責事項
              </Link>
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
              © 2025 StartupMarketing Inc.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - 印刷時はパディングなし */}
      <div className="lg:pl-72 print:pl-0">
        <main className="min-h-screen pt-16 lg:pt-0 print:pt-0 flex flex-col print:min-h-0">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
