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
  title: '消費者志向自主宣言ならびに運営ポリシー ｜株式会社StartupMarketing',
  description: '株式会社StartupMarketingの消費者志向自主宣言ならびに運営ポリシー。住環境における顧客満足度向上を最優先に掲げています。',
  alternates: {
    canonical: '/company/consumer-policy',
  },
  openGraph: {
    title: '消費者志向自主宣言ならびに運営ポリシー ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingの消費者志向自主宣言ならびに運営ポリシー。住環境における顧客満足度向上を最優先に掲げています。',
    url: `${BASE_URL}/company/consumer-policy`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '消費者志向自主宣言ならびに運営ポリシー ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingの消費者志向自主宣言ならびに運営ポリシー。住環境における顧客満足度向上を最優先に掲げています。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function ConsumerPolicyPage() {
  return (
    <>
      <WebPageJsonLd
        name="消費者志向自主宣言ならびに運営ポリシー"
        description="株式会社StartupMarketingの消費者志向自主宣言ならびに運営ポリシー。住環境における顧客満足度向上を最優先に掲げています。"
        path="/company/consumer-policy"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: '消費者志向自主宣言', href: '/company/consumer-policy' }]}
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
            <span>消費者志向自主宣言</span>
          </nav>

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/consumer-policy');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            消費者志向自主宣言ならびに運営ポリシー
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* 理念 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">理念</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">
                株式会社StartupMarketingは、住環境において全てのお客様に「快適と心地よさ」を感じて頂けるサービスを提供し、当店に関わる全ての人が幸せな生活を送る事を目指しています。ご利用頂いた全ての人が、幸せを感じられるように精一杯努め、満足度の高いサービスを常に追求していきます。
              </p>
            </div>
          </section>

          {/* 取り組み方針 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">取り組み方針</h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">経営トップの方針</h3>
                <p className="text-gray-700 leading-relaxed">
                  お客様の住環境に対する満足度を高めることを最優先にサイト運営を考えます。経営者自ら新しい情報やサービスを収集しお客様に提供することで、満足度を高めて参ります。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">お客様に利用しやすいサービスを提供する</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  ホームページ制作から生まれる価値を最大化するために、快適さと心地よさを両立する照明器具に関する最新情報を提供します。具体的には、以下の取り組みを実施します：
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-3">
                  <li>情報コラムの発信を通じた消費者への有益な情報提供</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  これらの取り組みを通じて、お客様の満足度向上に貢献します。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">消費者との情報交換</h3>
                <p className="text-gray-700 leading-relaxed">
                  消費者の不安を取り除く為、お問い合わせフォームや記事などを常に更新しお客様に寄り添った取り組みしてを継続していきます
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">消費者の要望を踏まえた改善</h3>
                <p className="text-gray-700 leading-relaxed">
                  お客様からいただいたご意見・ご要望をもとに、より使い安く利用しやすい高品質なサービスができるよう努めて参ります。
                </p>
              </div>
            </div>
          </section>

          {/* 更新日 */}
          <div className="text-gray-500 text-sm">
            更新日：2024/12/25
          </div>

        </article>
      </main>

      <LandingFooter />
    </div>
    </>
  );
}
