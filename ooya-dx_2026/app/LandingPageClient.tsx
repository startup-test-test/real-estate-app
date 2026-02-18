'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BlogPosts from '@/components/landing/BlogPosts';
import CompanyProfile from '@/components/landing/CompanyProfile';
import { LandingFooter } from '@/components/landing-footer';
import { SharedHeader } from '@/components/shared-header';
import { toolCategories } from '@/lib/navigation';
import { HeaderSpacer } from '@/components/HeaderSpacer';
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

  // サービス一覧データ
  const services = [
    {
      id: 'simulator',
      title: '賃貸経営シミュレーター',
      description: 'IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。\n物件購入の意思決定をデータで支援します。',
      href: '/tools/simulator',
      buttonText: 'シミュレーションをする（完全無料）',
      mockup: (
        <Image
          src="/img/kakushin_img01.png"
          alt="賃貸経営シミュレーター"
          width={998}
          height={674}
          sizes="(max-width: 768px) 100vw, 581px"
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
        <Image
          src="/img/kakushin_img02.png"
          alt="買付申込書ジェネレーター"
          width={998}
          height={674}
          sizes="(max-width: 768px) 100vw, 581px"
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
      <HeaderSpacer />

      {/* Hero Section */}
      <section className="relative w-full min-h-[400px] sm:min-h-[480px] md:min-h-[560px]">
        {/* Background Image */}
        <Image
          src="/images/media/hero-media.jpeg"
          alt="大家DX"
          width={1920}
          height={1282}
          sizes="100vw"
          priority
          fetchPriority="high"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Text Content */}
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                  不動産投資
                  <br />
                  クラウドソフト
                  <br />
                  「大家DX」
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-slate-700 leading-relaxed">
                  収益シミュレーション、計算ツール、専門メディア。
                  <br className="hidden sm:block" />
                  不動産経営のすべてを、このプラットフォームで。
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => router.push('/tools/simulator')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    まずは無料でシミュレーションをする
                  </button>
                </div>
              </div>

              {/* Right: Product Image */}
              <div className="hidden md:flex justify-center items-center">
                <Image
                  src="/img/kakushin_img01.png"
                  alt="賃貸経営シミュレーター"
                  width={998}
                  height={674}
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
              const isComingSoon = 'comingSoon' in service && (service as { comingSoon?: boolean }).comingSoon;
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

      {/* ニュースセクション */}
      <section id="news" className="pt-8 pb-1 sm:py-8 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 text-center">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">NEWS</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              ニュース
            </h2>
          </div>
          <div className="bg-white">
            <div className="space-y-0">
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block w-20 px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium text-center">
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
                  <span className="inline-block w-20 px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium text-center">
                    掲載
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2024.10.14</p>
                  <div>
                    <span className="text-gray-900 text-base">
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
                  <span className="inline-block w-20 px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium text-center">
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
                  <span className="inline-block w-20 px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium text-center">
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
