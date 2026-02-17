import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { CompanyNav } from '@/components/company-nav';
import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';
import { HeaderSpacer } from '@/components/HeaderSpacer';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '相互リンクページ ｜株式会社StartupMarketing',
  description: '株式会社StartupMarketingの相互リンクページ。提携企業・団体様のリンク集です。',
  alternates: {
    canonical: '/company/link',
  },
  openGraph: {
    title: '相互リンクページ ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingの相互リンクページ。提携企業・団体様のリンク集です。',
    url: `${BASE_URL}/company/link`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '相互リンクページ ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingの相互リンクページ。提携企業・団体様のリンク集です。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function LinkPage() {
  const links = [
    {
      name: 'AIスカウトサービス「RecUp」',
      description: '企業の採用活動を効率化・最適化するAIスカウトサービス「RecUp」。応募を待つのではなく、AIが求職者に直接アプローチするという新しいスタイルで、採用のスピードと質を同時に高めてくれます。\n\nまた、公式サイトでは採用に関するノウハウ記事や事例紹介も積極的に発信しており、採用初心者からベテラン担当者まで役立つ情報が満載です。採用でお悩みの企業にとって、頼れる"もう一人の人事担当者"のような存在となるはずです。詳しくはRecUpサービスサイトをご覧ください。',
      url: 'https://recup.delight21.co.jp/lp/',
      date: '2026年1月21日',
    },
    {
      name: '無料掲載ﾘﾝｸ集ｲｰﾀｳﾝ埼玉',
      description: '',
      url: 'https://www.saitamaken.net/',
      date: '2024年12月26日',
    },
    {
      name: '全国の地域情報',
      description: '',
      url: 'http://www.chiiki-j.com/',
      date: '2024年12月26日',
    },
    {
      name: '不動産応援.com',
      description: '不動産・建築専門　のぼり&看板&現場シートの製作',
      url: 'https://www.fudousan-ouen.com/',
      date: '2024年12月25日',
    },
  ];

  return (
    <>
      <WebPageJsonLd
        name="相互リンクページ"
        description="株式会社StartupMarketingの相互リンクページ。提携企業・団体様のリンク集です。"
        path="/company/link"
        datePublished="2026-01-15"
        dateModified="2026-02-05"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: '相互リンク', href: '/company/link' }]}
      />
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <HeaderSpacer />

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
            <span>相互リンク</span>
          </nav>

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/link');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            相互リンクページ
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* リンク一覧 */}
          <section className="mb-12">
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-6">
                {links.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-900 text-sm">●</span>
                    <div>
                      <p className="text-gray-900 text-sm mb-2">リンク掲載日：{item.date}</p>
                      <p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {item.name}
                        </a>
                      </p>
                      <p className="-mt-0.5">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          {item.url}
                        </a>
                      </p>
                      {item.description && (
                        <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{item.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </article>
      </main>

      <LandingFooter />
    </div>
    </>
  );
}
