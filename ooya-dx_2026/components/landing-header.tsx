'use client';

import { useRouter, usePathname } from 'next/navigation';

export function LandingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isMediaPage = pathname?.startsWith('/media');

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-6">
          <div className="flex items-center">
            <a href={isMediaPage ? "/media" : "/"} className="block">
              <img
                src={isMediaPage ? "/img/logo-media.png" : "/img/logo_250709_2.png"}
                alt={isMediaPage ? "大家DXジャーナル" : "大家DX"}
                className="h-8 sm:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                style={{ mixBlendMode: 'multiply' }}
              />
            </a>
          </div>
          <div className="flex items-center space-x-6">
            {/* ナビゲーションメニュー */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/simulator" className="text-gray-600 hover:text-gray-900 transition-colors">
                シミュレーター
              </a>
              <a href="/tools" className="text-gray-600 hover:text-gray-900 transition-colors">
                計算ツール
              </a>
              <a href="/glossary" className="text-gray-600 hover:text-gray-900 transition-colors">
                用語集
              </a>
              <a href="/media" className="text-gray-600 hover:text-gray-900 transition-colors">
                メディア
              </a>
            </nav>

            {/* ログイン・サインアップボタン */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => router.push('/auth/signup')}
                className="px-4 sm:px-5 py-2.5 sm:py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
              >
                <span className="hidden sm:inline">無料登録</span>
                <span className="sm:hidden">登録</span>
              </button>
              <button
                onClick={() => router.push('/auth/signin')}
                className="px-4 sm:px-5 py-2.5 sm:py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
