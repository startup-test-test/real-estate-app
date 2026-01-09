'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/client';
import {
  ChevronDown,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import BlogPosts from '@/components/landing/BlogPosts';
import CompanyProfile from '@/components/landing/CompanyProfile';

interface Article {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  thumbnail?: string;
}

interface LandingPageProps {
  articles: Article[];
}

const LandingPage: React.FC<LandingPageProps> = ({ articles }) => {
  const router = useRouter();
  const auth = useAuth();
  const user = auth.user;
  const isLoading = auth.isLoading;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    try {
      await auth.signOut();
      router.push('/');
    } catch {}
  };

  useEffect(() => {
    document.title = '大家DX｜大家さんのための不動産テックポータル';
  }, []);

  // サービス一覧データ
  const services = [
    {
      id: 'simulator',
      title: '収益シミュレーター',
      description: 'IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。物件購入の意思決定をデータで支援します。',
      href: '/simulator',
      buttonText: 'まずは無料でシミュレーションをする',
      mockup: (
        <img
          src="/img/kakushin_img01.png"
          alt="収益シミュレーター"
          className="w-full h-auto rounded-lg"
        />
      )
    },
    {
      id: 'tools',
      title: '計算ツール',
      description: '仲介手数料、利回り、ローン返済など不動産投資に必要な計算をすべて無料で。',
      href: '/tools/brokerage',
      buttonText: '計算ツールについての詳細',
      mockup: (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 shadow-inner">
          <div className="space-y-3">
            <div className="text-xs text-slate-500">売買価格</div>
            <div className="bg-white rounded px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200">
              ¥50,000,000
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="text-xs text-slate-500 mb-1">仲介手数料</div>
              <div className="text-lg font-bold text-emerald-600">¥1,716,000</div>
              <div className="text-xs text-slate-400">（税込）</div>
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/30 md:fixed md:top-0 md:left-0 md:right-0 md:z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            {/* Logo */}
            <a href="/" className="block">
              <img
                src="/img/logo_250709_2.png"
                alt="大家DX"
                className="h-8 sm:h-10 w-auto hover:opacity-80 transition-opacity"
              />
            </a>

            <div className="flex items-center space-x-6">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/simulator" className="text-gray-600 hover:text-gray-900 transition-colors">
                  シミュレーター
                </a>
                <a href="/tools/brokerage" className="text-gray-600 hover:text-gray-900 transition-colors">
                  計算ツール
                </a>
                <a href="/media" className="text-gray-600 hover:text-gray-900 transition-colors">
                  メディア
                </a>
              </nav>

              {/* Auth Section */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {isLoading ? (
                  <div className="w-24 h-10 bg-gray-100 rounded-md animate-pulse" />
                ) : user ? (
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
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={() => { setIsDropdownOpen(false); router.push('/mypage'); }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          マイページ
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
                  <>
                    <button
                      onClick={() => router.push('/auth/signup')}
                      className="px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">10秒で無料登録</span>
                      <span className="sm:hidden">無料登録</span>
                    </button>
                    <button
                      onClick={() => router.push('/auth/signin')}
                      className="px-4 sm:px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
                    >
                      ログイン
                    </button>
                  </>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col gap-2">
                <a href="/simulator" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  シミュレーター
                </a>
                <a href="/tools/brokerage" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  計算ツール
                </a>
                <a href="/media" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  メディア
                </a>
                {!user && (
                  <a href="/auth/signin" className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    ログイン
                  </a>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Spacer for fixed header (PC only) */}
      <div className="hidden md:block h-[88px]" />

      {/* Hero Section */}
      <section className="relative w-full min-h-[400px] sm:min-h-[480px] md:min-h-[560px]">
        {/* Background Image */}
        <img
          src="/images/media/hero-media.jpeg"
          alt="大家DX"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Text Content */}
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                  賃貸経営を、
                  <br />
                  もっとスマートに
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-slate-700 leading-relaxed">
                  収益シミュレーション、計算ツール、専門メディア。
                  <br className="hidden sm:block" />
                  不動産経営のすべてを、このプラットフォームで。
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => router.push('/simulator')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    まずは無料でシミュレーションをする
                  </button>
                </div>
              </div>

              {/* Right: Product Image */}
              <div className="hidden md:flex justify-center items-center">
                <img
                  src="/img/kakushin_img01.png"
                  alt="収益シミュレーター"
                  className="w-full h-auto max-w-md lg:max-w-lg xl:max-w-xl scale-[1.32]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Section - GMO賃貸DX Style */}
      <section id="service" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 sm:mb-16 text-center">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">SERVICE</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#32373c] leading-tight">
              サービス一覧
            </h2>
          </div>

          {/* Service Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {services.map((service) => (
              <a
                key={service.id}
                href={service.href}
                className="group block bg-[#eef0f2] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  {/* Card Header - Text */}
                  <div className="pt-10 sm:pt-12 px-6 sm:px-8 pb-6 sm:pb-8 text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#32373c] mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#32373c] leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Mockup Area - Image */}
                  <div className="px-6 sm:px-8">
                    {service.mockup}
                  </div>

                  {/* Button */}
                  <div className="p-6 sm:p-8 text-center">
                    <span className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-0.5 text-xl">
                      {service.buttonText}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tools Section */}
      <section id="free-tools" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 sm:mb-16 text-center">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">CALCULATOR</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#32373c] leading-tight">
              賃貸経営計算ツール（無料）
            </h2>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6">
            {[
              { name: '仲介手数料', href: '/tools/brokerage', available: true },
              { name: '譲渡所得税', href: '/tools/transfer-tax', available: false },
              { name: '不動産取得税', href: '/tools/acquisition-tax', available: false },
              { name: '登録免許税', href: '/tools/registration-tax', available: false },
              { name: '印紙税', href: '/tools/stamp-duty', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
              { name: 'テキスト', href: '#', available: false },
            ].map((tool, index) => (
              <a
                key={index}
                href={tool.available ? tool.href : undefined}
                className={`block bg-white rounded-2xl p-6 text-center shadow-sm transition-all duration-300 ${
                  tool.available
                    ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                    : 'opacity-60 cursor-default'
                }`}
              >
                <h3 className="text-lg font-bold text-[#32373c] mb-2">{tool.name}</h3>
                {tool.available ? (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                    無料で使う
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                    準備中
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-10 text-center">
            <a
              href="/tools"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              すべての計算ツールを見る
            </a>
          </div>
        </div>
      </section>

      {/* Media Section */}
      <BlogPosts articles={articles} />

      {/* ニュースセクション */}
      <section id="news" className="pt-8 pb-1 sm:py-8 lg:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 text-center">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">NEWS</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              ニュース
            </h2>
          </div>
          <div className="bg-gray-50">
            <div className="space-y-0">
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium whitespace-nowrap">
                    メディア<br />掲載
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.10.21</p>
                  <div>
                    <span className="text-gray-900 text-base">
                      <a
                        href="https://www.jutaku-s.com/newsp/id/0000064588"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        住宅新報社様
                      </a>
                      に「賃貸経営者向け収益シミュレーションSaaS『大家DX』」が掲載されました（
                      <a
                        href="/img/住宅新聞.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        新聞掲載PDF
                      </a>
                      ・
                      <a
                        href="https://www.jutaku-s.com/newsp/id/0000064588"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Webメディア
                      </a>
                      ）
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium whitespace-nowrap">
                    掲載
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2024.10.14</p>
                  <div>
                    <span className="text-gray-900 text-base">
                      <a
                        href="https://omiya.keizai.biz/release/477943/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        大宮経済新聞
                      </a>
                      ・
                      <a
                        href="https://saitama.publishing.3rd-in.co.jp/article/2aa1cd40-a89a-11f0-88f0-9ca3ba0a67df#gsc.tab=0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        saitamaDays
                      </a>
                      に掲載されました。
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium">
                    リリース
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.10.01</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    収益シミュレーターをリリースしました。
                  </h3>
                </div>
              </div>
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium">
                    リリース
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.08.19</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    大家DXをBETA版でリリースしました。
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 会社概要セクション */}
      <CompanyProfile />

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-4 md:mb-0">
              <img src="/img/logo_250709_2.png" alt="大家DX" className="h-8 w-auto mb-2" style={{ mixBlendMode: 'multiply' }} />
              <div className="text-xs text-gray-600">
                <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 block">
                  株式会社StartupMarketing
                </a>
                <span className="text-gray-500">〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              {/* PC版ナビゲーション */}
              <nav className="hidden md:flex items-center space-x-6 mb-2">
                <a href="/simulator" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  シミュレーター
                </a>
                <a href="/tools/brokerage" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  計算ツール
                </a>
                <a href="/media" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  メディア
                </a>
                <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  お問合せ
                </a>
              </nav>

              {/* SP版ナビゲーション */}
              <nav className="md:hidden w-full mb-2">
                <div className="flex justify-start space-x-3">
                  <a href="/simulator" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    シミュレーター
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="/tools/brokerage" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    計算ツール
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="/media" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    メディア
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    お問合せ
                  </a>
                </div>
              </nav>

              {/* PC版: 右寄せ */}
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center space-x-4 text-xs mb-1">
                  <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    運営会社
                  </a>
                  <a href="/terms" className="text-gray-500 hover:text-gray-700">
                    利用規約
                  </a>
                  <a href="/privacy" className="text-gray-500 hover:text-gray-700">
                    個人情報保護方針
                  </a>
                  <a href="/tokushoho" className="text-gray-500 hover:text-gray-700">
                    特定商取引法
                  </a>
                  <a href="/disclaimer" className="text-gray-500 hover:text-gray-700">
                    免責事項
                  </a>
                </div>
                <div className="text-xs text-gray-500">
                  © 2026 大家DX. All rights reserved.
                </div>
              </div>

              {/* SP版: 左寄せ */}
              <div className="md:hidden flex flex-col items-start w-full">
                <div className="overflow-x-auto w-full mb-1">
                  <div className="flex items-center space-x-4 text-xs whitespace-nowrap pb-1">
                    <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      運営会社
                    </a>
                    <a href="/terms" className="text-gray-500 hover:text-gray-700">
                      利用規約
                    </a>
                    <a href="/privacy" className="text-gray-500 hover:text-gray-700">
                      個人情報保護方針
                    </a>
                    <a href="/tokushoho" className="text-gray-500 hover:text-gray-700">
                      特定商取引法
                    </a>
                    <a href="/disclaimer" className="text-gray-500 hover:text-gray-700">
                      免責事項
                    </a>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  © 2026 大家DX. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
