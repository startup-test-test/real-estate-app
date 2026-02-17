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
  title: 'SDGsの達成に向けた取組み ｜株式会社StartupMarketing',
  description: '株式会社StartupMarketingのSDGsへの取り組み。さいたま市CS・SDGsパートナーズ、関西SDGsプラットフォームに参加しています。',
  alternates: {
    canonical: '/company/sdgs',
  },
  openGraph: {
    title: 'SDGsの達成に向けた取組み ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingのSDGsへの取り組み。さいたま市CS・SDGsパートナーズ、関西SDGsプラットフォームに参加しています。',
    url: `${BASE_URL}/company/sdgs`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SDGsの達成に向けた取組み ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingのSDGsへの取り組み。さいたま市CS・SDGsパートナーズ、関西SDGsプラットフォームに参加しています。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function SDGsPage() {
  const sdgsInitiatives = [
    {
      number: 3,
      title: 'すべての人に健康と福祉を',
      image: '/img/sdgs_03_health.png',
      items: [
        '従業員の健康診断（全額負担）',
        '付加検診制度',
        'インターネットリテラシー向上支援',
      ],
    },
    {
      number: 4,
      title: '質の高い教育をみんなに',
      image: '/img/sdgs_04_education.png',
      items: [
        'WEBメディアでの情報提供',
        '起業支援',
      ],
    },
    {
      number: 7,
      title: 'エネルギーをみんなに。そしてクリーンに',
      image: '/img/sdgs_07_energy.png',
      items: [
        'リモートワーク推進',
        '省エネ家電導入',
        'リサイクル資材活用',
      ],
    },
    {
      number: 8,
      title: '働きがいも経済成長も',
      image: '/img/sdgs_08_work.png',
      items: [
        '柔軟な勤務形態',
        'スキル教育プログラム',
        '育児休暇サポート',
      ],
    },
    {
      number: 9,
      title: '産業と技術革新の基盤を作ろう',
      image: '/img/sdgs_09_industry.png',
      items: [
        '自然言語処理技術活用',
        '地域メディア運営',
      ],
    },
    {
      number: 10,
      title: '人や国の不平等をなくそう',
      image: '/img/sdgs_10_equality.png',
      items: [
        '情報格差改善',
        '女性活躍推進',
        'LGBTQ+理解促進',
      ],
    },
  ];

  return (
    <>
      <WebPageJsonLd
        name="SDGsの達成に向けた取組み"
        description="株式会社StartupMarketingのSDGsへの取り組み。さいたま市CS・SDGsパートナーズ、関西SDGsプラットフォームに参加しています。"
        path="/company/sdgs"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: 'SDGs', href: '/company/sdgs' }]}
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
            <span>SDGsの達成に向けた取組み</span>
          </nav>

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/sdgs');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            SDGsの達成に向けた取組み
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* ヘッダー画像 */}
          <div className="mb-8">
            <img
              src="/img/sdgs_header.jpg"
              alt="SDGs"
              className="w-full max-w-md rounded-xl"
            />
          </div>

          {/* SDGsとは */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed">
              SDGsとは「Sustainable Development Goals」の略語で、2015年9月に国連総会で採択されました。
              17の具体的なゴールと169のターゲットで構成されています。
            </p>
          </section>

          {/* 取り組み一覧 */}
          <section className="mb-12">
            <div className="space-y-8">
              {sdgsInitiatives.map((initiative) => (
                <div key={initiative.number} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={initiative.image}
                        alt={`SDGs ${initiative.number}: ${initiative.title}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {initiative.title}
                      </h2>
                      <ul className="space-y-2">
                        {initiative.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">●</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </article>
      </main>

      <LandingFooter />
    </div>
    </>
  );
}
