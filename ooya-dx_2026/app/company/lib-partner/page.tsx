import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { CompanyNav } from '@/components/company-nav';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: 'リチウムイオン電池の火災防止啓発 ｜株式会社StartupMarketing',
  description: '株式会社StartupMarketingはリチウムイオン電池の火災防止に取り組んでいます。環境省LiBパートナーとして、適切な使用方法・廃棄方法の周知・啓発を行っています。',
  alternates: {
    canonical: '/company/lib-partner',
  },
  openGraph: {
    title: 'リチウムイオン電池の火災防止啓発 ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingはリチウムイオン電池の火災防止に取り組んでいます。環境省LiBパートナーとして、適切な使用方法・廃棄方法の周知・啓発を行っています。',
    url: `${BASE_URL}/company/lib-partner`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'リチウムイオン電池の火災防止啓発 ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingはリチウムイオン電池の火災防止に取り組んでいます。環境省LiBパートナーとして、適切な使用方法・廃棄方法の周知・啓発を行っています。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function LibPartnerPage() {
  const initiatives = [
    {
      title: 'IT機器の適切な管理・保管',
      description: '業務で使用するノートPC、スマートフォン、モバイルバッテリー、ワイヤレスイヤホンなどのリチウムイオン電池搭載機器は、過充電を避け、直射日光や高温を避けた適切な環境で保管しています。',
    },
    {
      title: '使用済みバッテリーの適正処分',
      description: '使用済みのリチウムイオン電池や古くなったIT機器は、メーカーや自治体の回収サービスを利用し、一般ごみとして廃棄しないよう徹底しています。',
    },
    {
      title: 'Webサイトでの啓発情報発信',
      description: '当社Webサイトにてリチウムイオン電池の正しい取り扱い方法や廃棄方法について情報発信し、火災防止の啓発活動を行っています。',
    },
  ];


  const dangers = [
    {
      icon: '🔥',
      title: '発火・火災',
      description: '破損や過充電により内部でショートが起き、発火することがあります。',
    },
    {
      icon: '💥',
      title: '爆発',
      description: 'ごみ収集車や処理施設で圧縮された際に爆発する事故が多発しています。',
    },
    {
      icon: '🚒',
      title: '処理施設の火災',
      description: '全国のごみ処理施設で年間1万件以上の火災が発生しています。',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
        <article className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
          {/* パンくず */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              ホーム
            </Link>
            <span className="mx-2">&gt;</span>
            <Link href="/company" className="hover:text-primary-600">
              会社概要
            </Link>
            <span className="mx-2">&gt;</span>
            <span>リチウムイオン電池の火災防止啓発</span>
          </nav>

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              会社情報
            </span>
            {(() => {
              const pageInfo = getCompanyPageInfo('/company/lib-partner');
              return pageInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(pageInfo.lastUpdated)}
                </time>
              ) : null;
            })()}
          </div>

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            リチウムイオン電池の火災防止啓発
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* LiBパートナーバッジ */}
          <div className="mb-8 flex items-center gap-4">
            <a
              href="https://lithium.env.go.jp/recycle/waste/lithium_1/partner.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 hover:bg-orange-100 transition-colors"
            >
              <span className="text-orange-700 font-medium text-sm">環境省「LiBパートナー」参加</span>
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* 概要 */}
          <section className="mb-12">
            <div className="bg-orange-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                当社はIT企業として、日常的にノートPC、スマートフォン、モバイルバッテリーなど多くのリチウムイオン電池搭載機器を使用しています。
                環境省の「LiBパートナー」として、これらIT機器に含まれるリチウムイオン電池の適切な使用方法・廃棄方法を周知し、火災事故の防止に貢献します。
              </p>
            </div>
          </section>

          {/* リチウムイオン電池による火災の危険性 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">リチウムイオン電池による火災の危険性</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {dangers.map((danger, index) => (
                <div key={index} className="bg-red-50 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">{danger.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{danger.title}</h3>
                  <p className="text-sm text-gray-700">{danger.description}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">
                リチウムイオン電池は、私たちの生活に欠かせない製品に広く使われていますが、誤った取り扱いや廃棄方法により、深刻な火災事故を引き起こすことがあります。
                特に、<strong>一般ごみや資源ごみに混入させると、収集車や処理施設で火災が発生</strong>する原因となります。
              </p>
            </div>
          </section>

          {/* 当社の取り組み */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">当社の取り組み</h2>
            <div className="space-y-4">
              {initiatives.map((initiative, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {initiative.title}
                      </h3>
                      <p className="text-gray-700">{initiative.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 対象製品 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">リチウムイオン電池が使われている主な製品</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="grid sm:grid-cols-2 gap-2">
                {[
                  'スマートフォン・携帯電話',
                  'モバイルバッテリー',
                  'ノートパソコン・タブレット',
                  'ワイヤレスイヤホン',
                  '電動歯ブラシ・電気シェーバー',
                  '加熱式たばこ',
                  'コードレス掃除機',
                  '電動アシスト自転車',
                  'ゲーム機',
                  'デジタルカメラ',
                ].map((product, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-orange-500">●</span>
                    <span className="text-gray-700">{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* LiBパートナーについて */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">LiBパートナーとは</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                「LiBパートナー」は、環境省が推進するリチウムイオン電池火災防止のためのパートナープログラムです。
                リチウムイオン電池等の適切な使用方法・排出方法の周知・啓発、火災防止に関する活動を行う自治体・事業者等を認定しています。
              </p>
              <a
                href="https://lithium.env.go.jp/recycle/waste/lithium_1/partner.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                環境省 LiBパートナー公式サイト
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>

          {/* 関連ページへのリンク */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">その他の社会貢献活動</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <Link href="/company/plastics-smart" className="text-blue-600 hover:text-blue-800 hover:underline">
                    プラスチック削減の取り組み
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <Link href="/company/sdgs" className="text-blue-600 hover:text-blue-800 hover:underline">
                    SDGsの達成に向けた取組み
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <Link href="/company" className="text-blue-600 hover:text-blue-800 hover:underline">
                    会社概要トップ
                  </Link>
                </li>
              </ul>
            </div>
          </section>

        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
