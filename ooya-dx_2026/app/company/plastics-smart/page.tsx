import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: 'プラスチック削減の取り組み ｜株式会社StartupMarketing',
  description: '株式会社StartupMarketingのプラスチックごみ削減への取り組み。マイボトル活用による「脱・使い捨て容器」を推進し、環境省プラスチック・スマートキャンペーンに参加しています。',
  alternates: {
    canonical: '/company/plastics-smart',
  },
  openGraph: {
    title: 'プラスチック削減の取り組み ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingのプラスチックごみ削減への取り組み。マイボトル活用による「脱・使い捨て容器」を推進し、環境省プラスチック・スマートキャンペーンに参加しています。',
    url: `${BASE_URL}/company/plastics-smart`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プラスチック削減の取り組み ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingのプラスチックごみ削減への取り組み。マイボトル活用による「脱・使い捨て容器」を推進し、環境省プラスチック・スマートキャンペーンに参加しています。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function PlasticsSmartPage() {
  const initiatives = [
    {
      title: 'マイボトル（保温タンブラー）の徹底活用',
      description: '仕事中の水分補給には徹底して「マイボトル（保温タンブラー）」を使用し、オフィス内でのペットボトル飲料の消費をゼロにしています。',
    },
    {
      title: '外出先でもマイボトル持参',
      description: '外出先での打ち合わせやコワーキングスペースを利用する際にも必ずマイボトルを持参し、コンビニ等でのペットボトルや、カフェでの使い捨てプラスチックカップの購入を控えています。',
    },
    {
      title: '年間数百本分のプラスチック削減',
      description: 'この取り組みを通じて削減したプラスチックごみの量は年間で数百本分に相当します。',
    },
    {
      title: '情報発信と啓発活動',
      description: '自社のWebサイトやSNSでこうした環境への配慮を発信し、取引先との会話でも話題に挙げるなど、事業サイズに関わらず持続可能な社会づくりに貢献する姿勢を大切にしています。',
    },
  ];

  return (
    <>
      <WebPageJsonLd
        name="プラスチック削減の取り組み"
        description="株式会社StartupMarketingのプラスチックごみ削減への取り組み。マイボトル活用による「脱・使い捨て容器」を推進し、環境省プラスチック・スマートキャンペーンに参加しています。"
        path="/company/plastics-smart"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: 'プラスチック削減', href: '/company/plastics-smart' }]}
      />
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
            <span>プラスチック削減の取り組み</span>
          </nav>

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/plastics-smart');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            プラスチック削減の取り組み
          </h1>

          {/* メインビジュアル */}
          <div className="mb-8">
            <img
              src="/img/plastics_smart_main.png"
              alt="マイボトル活用によるプラスチック削減の取り組み"
              className="w-full max-w-2xl rounded-xl shadow-sm"
            />
          </div>

          {/* プラスチック・スマートバッジ */}
          <div className="mb-8 flex items-center gap-4">
            <a
              href="https://plastics-smart.env.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 hover:bg-green-100 transition-colors"
            >
              <span className="text-green-700 font-medium text-sm">環境省「プラスチック・スマート」キャンペーン参加</span>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* 概要 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              マイボトル活用による「脱・使い捨て容器」の推進
            </h2>
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                当社は一人オフィスでの事業運営を行っておりますが、事業活動における環境負荷を最小限にするため、代表自らが率先してプラスチックごみの削減に取り組んでいます。
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                小さな事業所だからこそできる<strong>「例外なき徹底」</strong>を心がけています。
              </p>
            </div>
          </section>

          {/* 具体的な取り組み */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">具体的な取り組み</h2>
            <div className="space-y-4">
              {initiatives.map((initiative, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
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

          {/* プラスチック・スマートについて */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">プラスチック・スマートとは</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                「プラスチック・スマート」は、環境省が推進するプラスチックごみ削減キャンペーンです。
                海洋プラスチックごみ問題の解決に向け、個人・自治体・企業・NGO等が行っているプラスチックごみ削減の取組を広く募集し、発信しています。
              </p>
              <a
                href="https://plastics-smart.env.go.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                環境省 プラスチック・スマート公式サイト
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
                  <Link href="/company/sdgs" className="text-blue-600 hover:text-blue-800 hover:underline">
                    SDGsの達成に向けた取組み
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <Link href="/company/consumer-policy" className="text-blue-600 hover:text-blue-800 hover:underline">
                    消費者志向自主宣言ならびに運営ポリシー
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
    </>
  );
}
