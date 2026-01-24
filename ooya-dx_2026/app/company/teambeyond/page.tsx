import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'パラスポーツ、スポーツへの取り組み | 株式会社StartupMarketing',
  description: 'TEAM BEYONDの「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。',
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

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-8">
            パラスポーツ、スポーツへの取り組み
          </h1>

          {/* 概要 */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed">
              TEAM BEYONDの「パラスポーツを通じて、みんなが個性を発揮できる未来を目指す」という取り組みに賛同します。
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

          {/* 関連ページ */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">関連ページ</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/company"
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-gray-900 mb-1">会社概要</h3>
                <p className="text-sm text-gray-600">基本情報・事業内容</p>
              </Link>
              <Link
                href="/company/sdgs"
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-gray-900 mb-1">SDGsへの取り組み</h3>
                <p className="text-sm text-gray-600">持続可能な社会への貢献</p>
              </Link>
            </div>
          </section>

        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
