import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: 'パラスポーツ、スポーツへの取り組み ｜株式会社StartupMarketing',
  description: 'TEAM BEYONDの「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。',
  alternates: {
    canonical: '/company/teambeyond',
  },
  openGraph: {
    title: 'パラスポーツ、スポーツへの取り組み ｜株式会社StartupMarketing',
    description: 'TEAM BEYONDの「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。',
    url: `${BASE_URL}/company/teambeyond`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'パラスポーツ、スポーツへの取り組み ｜株式会社StartupMarketing',
    description: 'TEAM BEYONDの「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function TeamBeyondPage() {
  return (
    <>
      <WebPageJsonLd
        name="パラスポーツ、スポーツへの取り組み"
        description="TEAM BEYONDの「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。"
        path="/company/teambeyond"
        datePublished="2026-01-15"
        dateModified="2026-02-05"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: 'Team Beyond', href: '/company/teambeyond' }]}
      />
        <article className="max-w-4xl mx-auto px-5 py-12">
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
            <span>Team Beyond</span>
          </nav>

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/teambeyond');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            パラスポーツ、スポーツへの取り組み
          </h1>

          {/* 概要 */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed">
              <a
                href="https://www.para-sports.tokyo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                TEAM BEYOND
              </a>
              の「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              当社は
              <a
                href="https://www.para-sports.tokyo/member/group/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                TEAM BEYONDメンバー（団体）
              </a>
              として登録されています。
            </p>
          </section>

          {/* 取り組み内容 */}
          <section className="mb-12">
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span className="text-gray-700">パラスポーツを通じて、みんなが個性を発揮できる未来を目指す</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span className="text-gray-700">パラスポーツ体験会や観戦会への参加を積極的に推進します</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span className="text-gray-700">パラスポーツの認知、普及に積極的に取り組んでいきます</span>
                </li>
              </ul>
            </div>
          </section>

        </article>
    </>
  );
}
