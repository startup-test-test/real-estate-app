import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen, ArrowRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { getAllGlossaryTerms, getKanaChar, KANA_CHAR_ORDER } from '@/lib/glossary'

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
      name: '用語集',
      item: `${BASE_URL}/glossary`,
    },
  ],
};

export default function GlossaryPage() {
  const terms = getAllGlossaryTerms();

  // 50音順でグループ化（個別文字ごと）
  const termsByKanaChar = KANA_CHAR_ORDER.reduce((acc, char) => {
    const charTerms = terms.filter((term) => getKanaChar(term.reading) === char);
    if (charTerms.length > 0) {
      // 読み仮名順でソート
      acc[char] = charTerms.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
    }
    return acc;
  }, {} as Record<string, typeof terms>);

  // 用語がある文字のみ取得
  const activeChars = KANA_CHAR_ORDER.filter((char) => termsByKanaChar[char]?.length > 0);

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
              <span className="text-gray-900">用語集</span>
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
                投資判断に必要な知識を身につけましょう。
              </p>
            </div>

            {/* 50音インデックス */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-10 sticky top-[72px] sm:top-[88px] z-10 border border-gray-100">
              <p className="text-center text-sm text-gray-500 mb-4">クリックして該当の用語にジャンプ</p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {KANA_CHAR_ORDER.map((char) => {
                  const hasTerms = termsByKanaChar[char]?.length > 0;
                  return hasTerms ? (
                    <a
                      key={char}
                      href={`#${char}`}
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-base sm:text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {char}
                    </a>
                  ) : (
                    <span
                      key={char}
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-base sm:text-lg font-bold text-gray-300 bg-gray-100 rounded-lg cursor-default"
                    >
                      {char}
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

            {/* 50音順用語一覧 */}
            {activeChars.map((char) => (
              <div key={char} id={char} className="mb-10 scroll-mt-32">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500 flex items-center">
                  <span className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-lg">
                    {char}
                  </span>
                  {char}
                </h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {termsByKanaChar[char].map((term, index) => (
                    <Link
                      key={term.slug}
                      href={`/glossary/${term.slug}`}
                      className={`group flex items-center justify-between p-4 hover:bg-blue-50 transition-colors ${
                        index !== termsByKanaChar[char].length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {term.shortTitle}
                          </h3>
                          {term.relatedTools && (
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                              計算ツール
                            </span>
                          )}
                        </div>
                        {term.reading && (
                          <p className="text-sm text-gray-400 mt-1">
                            読み：{term.reading}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {term.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-4" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                用語を理解したら、実際に計算してみよう
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                大家DXのシミュレーターで、IRR・CCR・NOIなどを自動計算。
                物件の収益性を簡単に分析できます。
              </p>
              <Link
                href="/simulator"
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                無料でシミュレーションする
              </Link>
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
