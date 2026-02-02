'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/client';
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react';

// 一般向けナビゲーションリンク
const NAV_LINKS = [
  { href: '/simulator', label: '賃貸経営シミュレーター' },
  { href: '/tools', label: '計算ツール' },
  { href: '/glossary', label: '賃貸経営用語集' },
  { href: '/media', label: 'メディア' },
  { href: '/company', label: '会社概要' },
];

// ログインユーザー向けナビゲーションリンク（マイページ系）
const MYPAGE_NAV_LINKS = [
  { href: '/mypage/revenue-simulator', label: '収益シミュレーション' },
  { href: '/mypage/guide', label: 'ご利用ガイド' },
];

// ダッシュボード系のルート・独自ヘッダーを持つページ（グローバルヘッダーを非表示）
const DASHBOARD_ROUTES = ['/mypage', '/mypage/revenue-simulator', '/dashboard', '/billing', '/mypage/guide', '/simulator'];

interface SharedHeaderProps {
  /** メディアページ用のロゴを使用するか */
  useMediaLogo?: boolean;
  /** ヘッダーを常に表示するか（ダッシュボードルートでも） */
  forceShow?: boolean;
}

export function SharedHeader({ useMediaLogo = false, forceShow = false }: SharedHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const user = auth.user;
  const isLoading = auth.isLoading;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // メディアページかどうかを自動判定（propsで上書き可能）
  const isMediaPage = useMediaLogo || pathname?.startsWith('/media');

  // ダッシュボード系のルートではヘッダーを非表示
  const isDashboardRoute = DASHBOARD_ROUTES.some(route => pathname?.startsWith(route));

  // ドロップダウン外クリックで閉じる
  // ※ 早期リターンより前にフックを配置（Reactのルール）
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // フックの後で早期リターン
  if (isDashboardRoute && !forceShow) {
    return null;
  }

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('[SignOut] Error:', error);
      window.location.href = '/';
    }
  };

  // ロゴ設定
  const logoSrc = isMediaPage ? '/img/logo-media.png' : '/img/logo_250709_2.png';
  const logoAlt = isMediaPage ? '大家DXジャーナル' : '大家DX';
  const logoHref = isMediaPage ? '/media' : '/';

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-6 md:pt-8 md:pb-4">
          {/* ロゴ */}
          <Link href={logoHref} className="block relative">
            <span className="hidden md:block text-sm text-gray-900 absolute -top-5 left-0 whitespace-nowrap">
              賃貸経営をもっとスマートに
            </span>
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-8 sm:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-6">
              {(isDashboardRoute ? MYPAGE_NAV_LINKS : NAV_LINKS).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    pathname === link.href
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* 認証セクション */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isLoading ? (
                <div className="w-24 h-10 bg-gray-100 rounded-md animate-pulse" />
              ) : user ? (
                // ログイン済み
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-700">
                      {user?.displayName || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => { setIsDropdownOpen(false); router.push('/mypage'); }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                      >
                        <User className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                        賃貸経営シミュレーション
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // 未ログイン
                <>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">無料登録</span>
                    <span className="sm:hidden">登録</span>
                  </button>
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="px-4 sm:px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
                  >
                    ログイン
                  </button>
                </>
              )}

              {/* モバイルメニューボタン */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {(isDashboardRoute ? MYPAGE_NAV_LINKS : NAV_LINKS).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg ${
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isDashboardRoute && user && (
                <Link
                  href="/mypage"
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  シミュレーション一覧
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// 後方互換性のためのエクスポート
export { SharedHeader as LandingHeader };
