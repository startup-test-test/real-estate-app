import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ArrowRight, TrendingUp, Building, BarChart3, Receipt, Landmark, ShieldAlert, FileText, Banknote, Scale, Users } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { Breadcrumb } from '@/components/Breadcrumb'
import { toolCategories } from '@/lib/navigation'
import { HeaderSpacer } from '@/components/HeaderSpacer';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '不動産投資の計算ツール一覧（全27種）｜現役大家が開発【完全無料】｜大家DX',
  description: '利回り・収支分析・IRRから、仲介手数料・譲渡所得税・印紙税まで、不動産投資に必要な計算ツール全27種を完全網羅。2026年度最新税制に対応し、現役大家の実務目線で「本当に必要な計算」を1ページに集約。すべて無料で使い放題です。',
  openGraph: {
    title: '不動産投資の計算ツール一覧（全27種）｜現役大家が開発【完全無料】｜大家DX',
    description: '利回り・収支分析・IRRから、仲介手数料・譲渡所得税・印紙税まで、不動産投資に必要な計算ツール全27種を完全網羅。2026年度最新税制に対応し、現役大家の実務目線で「本当に必要な計算」を1ページに集約。すべて無料で使い放題です。',
    url: `${BASE_URL}/tools`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '不動産投資の計算ツール一覧',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産投資の計算ツール一覧（全27種）｜現役大家が開発【完全無料】｜大家DX',
    description: '利回り・収支分析・IRRから、仲介手数料・譲渡所得税・印紙税まで、不動産投資に必要な計算ツール全27種を完全網羅。2026年度最新税制に対応し、現役大家の実務目線で「本当に必要な計算」を1ページに集約。すべて無料で使い放題です。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/tools',
  },
}

// パンくずリスト構造化データ
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '大家DX',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '計算ツール一覧',
      item: `${BASE_URL}/tools`,
    },
  ],
};

// WebPage構造化データ（作成日・更新日）
const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '不動産投資 計算ツール一覧',
  description: '利回り・キャッシュフロー・IRRなどの収益分析から、仲介手数料・譲渡所得税・印紙税などの税金計算まで。賃貸経営に必要な計算ツールを全て無料で提供。',
  url: `${BASE_URL}/tools`,
  datePublished: '2026-01-15',
  dateModified: '2026-02-08',
  publisher: {
    '@type': 'Organization',
    name: '大家DX',
    url: BASE_URL,
    logo: `${BASE_URL}/img/logo_250709_2.png`,
  },
};

// サブヘッダーアイコンマッピング
const subHeaderIcons: Record<string, React.ReactNode> = {
  '利回り・収支を調べたい': <TrendingUp className="h-5 w-5" />,
  'この物件、いくらが妥当？': <Building className="h-5 w-5" />,
  '収益性を数字で確認したい': <BarChart3 className="h-5 w-5" />,
  '高度な投資分析をしたい': <TrendingUp className="h-5 w-5" />,
  '購入時にかかる費用・税金を知りたい': <Receipt className="h-5 w-5" />,
  '融資・ローンを調べたい': <Landmark className="h-5 w-5" />,
  '将来のリスクに備えたい': <ShieldAlert className="h-5 w-5" />,
  '毎年かかる税金・経費を把握したい': <FileText className="h-5 w-5" />,
  '売ったらいくら残るか知りたい': <Banknote className="h-5 w-5" />,
  '売却にかかる税金・費用を知りたい': <Scale className="h-5 w-5" />,
  '家族に不動産を渡したい': <Users className="h-5 w-5" />,
}

// 表示対象のカテゴリ（利用可能なツールがあるもののみ）
const visibleCategories = toolCategories.filter(
  category => category.items.some(item => item.available)
);

// ItemList構造化データ
const availableItems = visibleCategories.flatMap(c =>
  c.items.filter(i => i.available && i.href !== '/tools/simulator')
);
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '不動産投資 計算ツール一覧',
  numberOfItems: availableItems.length,
  itemListElement: availableItems.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    url: `${BASE_URL}${item.href}`,
  })),
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <HeaderSpacer />

        <main className="flex-1">
          {/* メインビジュアル */}
          <div className="bg-gradient-to-b from-blue-50 to-blue-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-6 sm:pb-8 md:pb-10">
              {/* パンくずリスト */}
              <Breadcrumb items={[
                { label: '大家DX', href: '/' },
                { label: '計算ツール一覧' },
              ]} />

              {/* 日付 */}
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                <span>公開日：2026年1月15日</span>
                <span>更新日：2026年2月8日</span>
              </div>

              {/* H1 + リードテキスト */}
              <div className="mb-6 sm:mb-8 text-center">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  不動産投資の計算ツール一覧（全27種・完全無料）
                </h1>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  利回り・キャッシュフロー分析から、税金・売却シミュレーションまで。
                  投資のすべてのフェーズを無料でサポートします。
                </p>
              </div>

              {/* ライフサイクルフローナビゲーション */}
              <nav aria-label="投資フェーズナビゲーション">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <a href="#entry" className="relative block p-3 sm:p-4 bg-white border border-blue-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all group">
                    <p className="text-[10px] sm:text-xs text-primary-600 font-semibold mb-1">STEP 1</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">購入検討</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-relaxed">利回り・評価・税金</p>
                    <ArrowRight className="hidden sm:block absolute right-[-14px] top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300 z-10" />
                  </a>
                  <a href="#management" className="relative block p-3 sm:p-4 bg-white border border-blue-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all group">
                    <p className="text-[10px] sm:text-xs text-primary-600 font-semibold mb-1">STEP 2</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">保有・運営</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-relaxed">収支・税金・リスク</p>
                    <ArrowRight className="hidden sm:block absolute right-[-14px] top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300 z-10" />
                  </a>
                  <a href="#exit" className="block p-3 sm:p-4 bg-white border border-blue-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all group">
                    <p className="text-[10px] sm:text-xs text-primary-600 font-semibold mb-1">STEP 3</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">売却・出口</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 leading-relaxed">手取り・税金・承継</p>
                  </a>
                </div>
              </nav>
            </div>
          </div>

          {/* ツール一覧 */}
          <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">

            {/* カテゴリ別セクション */}
            <div className="space-y-8 sm:space-y-12">
              {visibleCategories.map((category) => {
                // シミュレーターはバナーで表示するためカードから除外
                const displayItems = category.items.filter(
                  item => item.href !== '/tools/simulator'
                );

                return (
                  <section key={category.id} id={category.id}>
                    <div className="mb-4 sm:mb-5">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {category.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-500 mt-1">
                        {category.description}
                      </p>
                    </div>
                    {(() => {
                      // isHeader でグループ分け（サブ見出し＋ツールカード）
                      const hasHeaders = displayItems.some(item => item.isHeader);
                      if (!hasHeaders) {
                        // サブ見出しなし：従来どおりフラットなグリッド
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {displayItems.map((item) => (
                              item.available ? (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className="block p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all group"
                                >
                                  <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors text-sm sm:text-base">
                                    {item.name}
                                  </p>
                                  {item.description && (
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </Link>
                              ) : (
                                <div
                                  key={item.href}
                                  className="block p-4 bg-gray-50 rounded-xl border border-gray-100"
                                >
                                  <p className="font-bold text-gray-400 text-sm sm:text-base">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">準備中</p>
                                </div>
                              )
                            ))}
                          </div>
                        );
                      }

                      // サブ見出しあり：グループごとに見出し＋グリッド
                      const groups: { header: typeof displayItems[0]; items: typeof displayItems }[] = [];
                      displayItems.forEach((item) => {
                        if (item.isHeader) {
                          groups.push({ header: item, items: [] });
                        } else if (groups.length > 0) {
                          groups[groups.length - 1].items.push(item);
                        }
                      });

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {groups.map((group) => (
                            <div key={group.header.name} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                              <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                                <p className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-1.5">
                                  {subHeaderIcons[group.header.name] && (
                                    <span className="text-primary-500">{subHeaderIcons[group.header.name]}</span>
                                  )}
                                  {group.header.name}
                                </p>
                                {group.header.description && (
                                  <p className="text-xs sm:text-sm text-gray-700 mt-0.5 leading-relaxed">{group.header.description}</p>
                                )}
                              </div>
                              <div className="divide-y divide-gray-50">
                                {group.items.map((item) => (
                                  item.available ? (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/50 transition-colors group"
                                    >
                                      <span className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors text-sm">
                                        <span className="text-gray-400 mr-1.5">・</span>{item.name}
                                      </span>
                                      <ChevronRight className="h-5 w-5 text-gray-900 flex-shrink-0 ml-2" />
                                    </Link>
                                  ) : (
                                    <div
                                      key={item.href}
                                      className="flex items-center px-4 py-2.5"
                                    >
                                      <span className="font-medium text-gray-300 text-sm">
                                        <span className="text-gray-200 mr-1.5">・</span>{item.name}
                                      </span>
                                      <span className="text-[10px] text-gray-300 ml-2 border border-gray-200 rounded px-1.5 py-0.5">準備中</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </section>
                );
              })}
            </div>

            {/* 総合シミュレーターバナー */}
            <Link
              href="/tools/simulator"
              className="block mt-8 sm:mt-12 p-4 sm:p-5 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary-600 font-semibold mb-1">総合シミュレーター</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                    賃貸経営シミュレーター
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    IRR・CCR・DSCR、35年キャッシュフロー一括計算
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
              </div>
            </Link>
          </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
