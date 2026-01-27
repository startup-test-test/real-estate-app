'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlogPosts from '@/components/landing/BlogPosts';
import CompanyProfile from '@/components/landing/CompanyProfile';
import { LandingFooter } from '@/components/landing-footer';
import { SharedHeader } from '@/components/shared-header';
import { toolCategories } from '@/lib/navigation';
interface Article {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  thumbnail?: string;
}

interface GlossaryTerm {
  slug: string;
  title: string;
  shortTitle: string;
  reading: string;
  description: string;
  category: string;
  relatedTools?: string;
}

interface LandingPageProps {
  articles: Article[];
  glossaryTerms: GlossaryTerm[];
}

const LandingPage: React.FC<LandingPageProps> = ({ articles, glossaryTerms }) => {
  const router = useRouter();

  useEffect(() => {
    document.title = '大家DX｜賃貸経営をもっとスマートに';
  }, []);

  // サービス一覧データ
  const services = [
    {
      id: 'simulator',
      title: '賃貸経営シミュレーター',
      description: 'IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。\n物件購入の意思決定をデータで支援します。',
      href: '/simulator',
      buttonText: 'シミュレーションをする（完全無料）',
      mockup: (
        <img
          src="/img/kakushin_img01.png"
          alt="賃貸経営シミュレーター"
          className="w-full h-auto rounded-lg"
        />
      )
    },
    {
      id: 'purchase-offer',
      title: '買付申込書ジェネレーター',
      description: 'フォームに入力するだけで、A4サイズの買付申込書PDFを作成。\n物件購入時の意思表示をスムーズに。',
      href: '/tools/purchase-offer',
      buttonText: '買付申込書を作成する（完全無料）',
      mockup: (
        <img
          src="/img/kakushin_img02.png"
          alt="買付申込書ジェネレーター"
          className="w-full h-auto rounded-lg"
        />
      )
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SharedHeader />

      {/* Spacer for fixed header */}
      <div className="h-[72px] sm:h-[88px]" />

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
                  alt="賃貸経営シミュレーター"
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
              賃貸経営クラウドサービス
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              大家さんの賃貸経営をもっとスマートに。経営判断に必要なツールを作りました。
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {services.map((service) => {
              const isComingSoon = 'comingSoon' in service && service.comingSoon;
              const CardWrapper = isComingSoon ? 'div' : 'a';

              return (
                <CardWrapper
                  key={service.id}
                  href={isComingSoon ? undefined : service.href}
                  className={`group block bg-[#eef0f2] rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${
                    isComingSoon ? 'cursor-default' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    {/* Card Header - Text */}
                    <div className="pt-10 sm:pt-12 px-6 sm:px-8 pb-6 sm:pb-8 text-center relative">
                      {isComingSoon && (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                          Coming Soon
                        </span>
                      )}
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#32373c] mb-3">
                        {service.title}
                        <span className="ml-2 inline-block px-2 py-0.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-full align-middle">
                          完全無料
                        </span>
                      </h3>
                      <p className="text-sm sm:text-base text-[#32373c] leading-relaxed whitespace-pre-line">
                        {service.description}
                      </p>
                    </div>

                    {/* Mockup Area - Image */}
                    <div className="px-6 sm:px-8">
                      {service.mockup}
                    </div>

                    {/* Button */}
                    <div className="p-6 sm:p-8 text-center">
                      <span className={`inline-block px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg text-xl ${
                        isComingSoon
                          ? 'bg-gray-400 text-white cursor-default'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white group-hover:from-blue-700 group-hover:to-indigo-700 group-hover:shadow-xl transform group-hover:-translate-y-0.5'
                      }`}>
                        {service.buttonText}
                      </span>
                    </div>
                  </div>
                </CardWrapper>
              );
            })}
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
              賃貸経営計算ツール
              <span className="ml-3 inline-block px-3 py-1 bg-gray-900 text-white text-base sm:text-lg font-bold rounded-full align-middle">
                無料
              </span>
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              収益分析・税金・費用をかんたん計算。利回り・DCF法・IRR（内部収益率）など収益指標も充実。
            </p>
          </div>

          {/* カテゴリ別ツール（navigation.tsから動的生成） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#32373c] mb-3 pb-3 border-b border-gray-100">{category.title}</h3>
                <ul className="space-y-1">
                  {category.items.map((item) => (
                    <li key={item.href}>
                      {item.available ? (
                        <a href={item.href} className="text-gray-900 hover:text-gray-600 hover:underline">
                          <span className="text-gray-400 mr-1">›</span>{item.name}
                        </a>
                      ) : (
                        <span className="text-gray-400">
                          <span className="mr-1">›</span>{item.name}（準備中）
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
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

      {/* 用語集セクション */}
      {glossaryTerms.length > 0 && (
        <section id="glossary" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-12 sm:mb-16 text-center">
              <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">GLOSSARY</p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#32373c] leading-tight">
                賃貸経営用語集
              </h2>
              <p className="mt-4 text-gray-600 text-base sm:text-lg">
                賃貸経営・不動産オーナーが知っておきたい専門用語をわかりやすく解説
              </p>
            </div>

            {/* Terms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {glossaryTerms.map((term) => (
                <a
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="block bg-gray-50 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#32373c] group-hover:text-blue-600 transition-colors">
                      {term.shortTitle}
                    </h3>
                    {term.relatedTools && (
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                        計算ツール
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">読み：{term.reading}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{term.description}</p>
                </a>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-10 text-center">
              <a
                href="/glossary"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
              >
                すべての用語を見る
              </a>
            </div>
          </div>
        </section>
      )}

      {/* テンプレートセクション */}
      <section id="templates" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 sm:mb-16 text-center">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">TEMPLATE</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#32373c] leading-tight">
              無料テンプレート
              <span className="ml-3 inline-block px-3 py-1 bg-gray-900 text-white text-base sm:text-lg font-bold rounded-full align-middle">
                無料
              </span>
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              賃貸経営に役立つExcel・スプレッドシートを無料配布しています
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* レントロール */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#32373c]">
                  レントロール（賃料明細表）
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">銀行融資・売却査定に必須の賃料明細表。3種類のフォーマットを無料配布。</p>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">融資</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">売却</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Excel</span>
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href="https://docs.google.com/spreadsheets/d/1gC8vhijyNKV2L1Dp8LtqljmNY5BBLlaWA7PUSs0NcgE/edit?gid=1188886572#gid=1188886572"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  › テンプレートをダウンロードする
                </a>
                <a
                  href="/media/base/rent-roll-template"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  › 記事を読む
                </a>
              </div>
            </div>

            {/* プロフィールシート */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#32373c]">
                  プロフィールシート
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">金融機関や不動産会社への自己紹介資料。信頼感を高める投資家プロフィール。</p>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">融資</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">営業</span>
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href="https://docs.google.com/spreadsheets/d/1wiwlL8_Gi7Xmc3N6Rks8MOaQWBLk8MSqInD_4ZRWdyM/edit?gid=2105346085#gid=2105346085"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  › テンプレートをダウンロードする
                </a>
                <a
                  href="/media/base/profile-sheet-template"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  › 記事を読む
                </a>
              </div>
            </div>

          </div>

          {/* View All Button */}
          <div className="mt-10 text-center">
            <a
              href="/templates"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              すべてのテンプレートを見る
            </a>
          </div>
        </div>
      </section>

      {/* ニュースセクション */}
      <section id="news" className="pt-8 pb-1 sm:py-8 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    賃貸経営シミュレーターをリリースしました。
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
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
