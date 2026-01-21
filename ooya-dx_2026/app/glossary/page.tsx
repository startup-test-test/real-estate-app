import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'
import { getAllGlossaryTerms, getKanaRow, KANA_ROW_ORDER } from '@/lib/glossary'

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '賃貸経営用語集｜大家さんのための専門用語解説',
  description: '賃貸経営・不動産オーナーが知っておきたい専門用語をわかりやすく解説。IRR、CCR、NOI、利回りなど、経営判断に必要な用語を網羅的に学べます。',
  openGraph: {
    title: '賃貸経営用語集｜大家さんのための専門用語解説',
    description: '賃貸経営・不動産オーナーが知っておきたい専門用語をわかりやすく解説。IRR、CCR、NOI、利回りなど、経営判断に必要な用語を網羅的に学べます。',
    url: `${BASE_URL}/glossary`,
    siteName: '大家DX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営用語集｜大家さんのための専門用語解説',
    description: '賃貸経営・不動産オーナーが知っておきたい専門用語をわかりやすく解説。',
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
      name: '賃貸経営用語集',
      item: `${BASE_URL}/glossary`,
    },
  ],
};

export default function GlossaryPage() {
  const terms = getAllGlossaryTerms();

  // 50音順でグループ化（行ごと）
  const termsByKanaRow = KANA_ROW_ORDER.reduce((acc, row) => {
    const rowTerms = terms.filter((term) => getKanaRow(term.reading) === row);
    if (rowTerms.length > 0) {
      // 読み仮名順でソート
      acc[row] = rowTerms.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
    }
    return acc;
  }, {} as Record<string, typeof terms>);

  // 用語がある行のみ取得
  const activeRows = KANA_ROW_ORDER.filter((row) => termsByKanaRow[row]?.length > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <div className="h-[72px] sm:h-[88px]"></div>

        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* パンくずリスト */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-primary-600">
                ホーム
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <span className="text-gray-900">賃貸経営用語集</span>
            </nav>

            {/* ヘッダー */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                賃貸経営用語集
              </h1>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                賃貸経営・不動産オーナーが知っておきたい専門用語をわかりやすく解説。
                <br className="hidden sm:block" />
                経営判断に必要な知識を身につけましょう。
              </p>
            </div>

            {/* 50音インデックス（行単位） */}
            <div className="mb-10">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {KANA_ROW_ORDER.map((row) => {
                  const hasTerms = termsByKanaRow[row]?.length > 0;
                  return hasTerms ? (
                    <a
                      key={row}
                      href={`#${row}`}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-center gap-1 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {row}
                    </a>
                  ) : (
                    <span
                      key={row}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-center text-sm sm:text-base font-bold text-gray-300 bg-gray-100 rounded-lg cursor-default"
                    >
                      {row}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 用語がない場合 */}
            {terms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">用語を準備中です。</p>
              </div>
            )}

            {/* 50音順用語一覧（行単位） */}
            {activeRows.map((row) => (
              <div key={row} id={row} className="mb-10 scroll-mt-32">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-8 bg-blue-600 mr-3"></span>
                  {row}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {termsByKanaRow[row].map((term) => (
                    <Link
                      key={term.slug}
                      href={`/glossary/${term.slug}`}
                      className="group bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {term.shortTitle}
                        </h3>
                        {term.relatedTools && (
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                            計算ツール
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {term.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="mt-16">
              <SimulatorCTA />
            </div>

            {/* 運営会社・運営者プロフィール */}
            <div className="mt-12">
              <CompanyProfileCompact />
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
