'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  ArrowRight,
  Building2,
  Newspaper,
  Wrench,
  TrendingUp,
  FileText,
  PiggyBank
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    document.title = '大家DX｜大家さんのための不動産テックポータル';
  }, []);

  const products = [
    {
      id: 'simulator',
      icon: TrendingUp,
      title: '収益シミュレーター',
      description: 'IRR、CCR、DSCR、35年キャッシュフローを一括計算。物件の収益性を即座に分析。',
      href: '/simulator',
      color: 'from-blue-600 to-indigo-600',
      badge: '無料'
    }
  ];

  const tools = [
    {
      id: 'brokerage-fee',
      icon: PiggyBank,
      title: '仲介手数料計算',
      description: '売買価格から仲介手数料を速算',
      href: '/tools/calculators/brokerage-fee',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'yield-calculator',
      icon: Calculator,
      title: '利回り計算',
      description: '表面・実質利回りを簡単計算',
      href: '/tools/calculators/yield',
      color: 'bg-purple-100 text-purple-600',
      comingSoon: true
    },
    {
      id: 'loan-simulator',
      icon: FileText,
      title: 'ローン返済計算',
      description: '月々の返済額・総返済額を算出',
      href: '/tools/calculators/loan',
      color: 'bg-orange-100 text-orange-600',
      comingSoon: true
    }
  ];

  const mediaArticles = [
    {
      title: '不動産投資の利回りとは？計算方法と目安を解説',
      category: 'ノウハウ',
      href: 'https://ooya.tech/media/'
    },
    {
      title: 'キャッシュフロー計算の基本と注意点',
      category: 'ノウハウ',
      href: 'https://ooya.tech/media/'
    },
    {
      title: '融資を有利に進めるための準備',
      category: 'ノウハウ',
      href: 'https://ooya.tech/media/'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ヘッダー */}
      <header className="bg-white/75 backdrop-blur-md border-b border-gray-200/30 md:fixed md:top-0 md:left-0 md:right-0 md:z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <a href="/" className="block">
                <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-8 sm:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </a>
            </div>
            <div className="flex items-center space-x-6">
              {/* ナビゲーションメニュー */}
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors">
                  プロダクト
                </a>
                <a href="#tools" className="text-gray-600 hover:text-gray-900 transition-colors">
                  計算ツール
                </a>
                <a href="https://ooya.tech/media/" className="text-gray-600 hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
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

      {/* ヘッダー固定時のスペーサー（PC版のみ） */}
      <div className="hidden md:block h-[88px]"></div>

      {/* ヒーローセクション */}
      <section className="pt-8 pb-12 sm:pt-16 sm:pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{ lineHeight: '1.3' }}>
            大家さんのための
            <br />
            <span className="text-blue-600">不動産テック</span>ポータル
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            収益シミュレーション、計算ツール、不動産投資ノウハウを一箇所で。
            <br className="hidden sm:block" />
            賃貸経営をテクノロジーで効率化。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/simulator')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              収益シミュレーターを使う
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button
              onClick={() => router.push('#tools')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              計算ツールを見る
            </button>
          </div>
        </div>
      </section>

      {/* プロダクトセクション */}
      <section id="products" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span className="text-blue-600 font-semibold">Products</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              プロダクト
            </h2>
            <p className="text-gray-600 text-lg">
              賃貸経営を効率化するプロダクト
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {products.map((product) => (
              <a
                key={product.id}
                href={product.href}
                className="block bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${product.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${product.color}`}>
                      <product.icon className="w-6 h-6 text-white" />
                    </div>
                    {product.badge && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    詳しく見る
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 計算ツールセクション */}
      <section id="tools" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wrench className="w-6 h-6 text-blue-600" />
              <span className="text-blue-600 font-semibold">Tools</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              計算ツール
            </h2>
            <p className="text-gray-600 text-lg">
              不動産投資に役立つ無料計算ツール
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tools.map((tool) => (
              <a
                key={tool.id}
                href={tool.comingSoon ? '#' : tool.href}
                className={`block bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 ${tool.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md hover:border-blue-200'}`}
                onClick={(e) => tool.comingSoon && e.preventDefault()}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${tool.color}`}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{tool.title}</h3>
                      {tool.comingSoon && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          近日公開
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              その他の計算ツールも順次追加予定
            </p>
          </div>
        </div>
      </section>

      {/* メディアセクション */}
      <section id="media" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Newspaper className="w-6 h-6 text-blue-600" />
              <span className="text-blue-600 font-semibold">Media</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              メディア
            </h2>
            <p className="text-gray-600 text-lg">
              不動産投資のノウハウ・最新情報
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {mediaArticles.map((article, index) => (
              <a
                key={index}
                href={article.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs text-blue-600 font-medium">{article.category}</span>
                <h3 className="text-gray-900 font-medium mt-2 line-clamp-2">{article.title}</h3>
              </a>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://ooya.tech/media/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
            >
              メディアをもっと見る
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
            今すぐ収益シミュレーションを始めよう
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            完全無料・登録10秒で全機能が使えます
          </p>
          <button
            onClick={() => router.push('/auth/signup')}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            無料で始める
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-100 text-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-4 md:mb-0">
              <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-8 w-auto mb-2" style={{ mixBlendMode: 'multiply' }} />
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
                <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  プロダクト
                </a>
                <a href="#tools" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  計算ツール
                </a>
                <a href="https://ooya.tech/media/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm" target="_blank" rel="noopener noreferrer">
                  メディア
                </a>
                <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  お問合せ
                </a>
              </nav>

              {/* SP版ナビゲーション */}
              <nav className="md:hidden w-full mb-2">
                <div className="flex justify-start space-x-3">
                  <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                    プロダクト
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="#tools" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                    計算ツール
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="https://ooya.tech/media/" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap" target="_blank" rel="noopener noreferrer">
                    メディア
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
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
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    利用規約
                  </a>
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    個人情報保護方針
                  </a>
                  <a href="/tokushoho" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    特定商取引法
                  </a>
                  <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
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
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      利用規約
                    </a>
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      個人情報保護方針
                    </a>
                    <a href="/tokushoho" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      特定商取引法
                    </a>
                    <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
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
