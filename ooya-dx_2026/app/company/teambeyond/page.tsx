import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { CompanyNav } from '@/components/company-nav';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'パラスポーツ、スポーツへの取り組み | 株式会社StartupMarketing',
  description: 'TEAM BEYONDの「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。',
  alternates: {
    canonical: '/company/teambeyond',
  },
};

export default function TeamBeyondPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

      <main className="flex-1">
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

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              会社情報
            </span>
            {(() => {
              const pageInfo = getCompanyPageInfo('/company/teambeyond');
              return pageInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(pageInfo.lastUpdated)}
                </time>
              ) : null;
            })()}
          </div>

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            パラスポーツ、スポーツへの取り組み
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

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
      </main>

      <LandingFooter />
    </div>
  );
}
