import { Breadcrumb } from '@/components/Breadcrumb';
import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: 'CSR・健康経営 ｜株式会社StartupMarketing',
  description: '株式会社StartupMarketingのCSR活動・健康経営への取り組み。がん対策推進企業アクション、ポジティブ・オフに参加しています。',
  alternates: {
    canonical: '/company/csr',
  },
  openGraph: {
    title: 'CSR・健康経営 ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingのCSR活動・健康経営への取り組み。がん対策推進企業アクション、ポジティブ・オフに参加しています。',
    url: `${BASE_URL}/company/csr`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSR・健康経営 ｜株式会社StartupMarketing',
    description: '株式会社StartupMarketingのCSR活動・健康経営への取り組み。がん対策推進企業アクション、ポジティブ・オフに参加しています。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function CSRPage() {
  const initiatives = [
    {
      name: 'がん対策推進企業アクション',
      org: '厚生労働省',
      description: '従業員のがん検診受診率向上や、がんになっても働き続けられる職場環境づくりに取り組んでいます。',
      url: 'https://www.gankenshin50.mhlw.go.jp/',
    },
    {
      name: 'ポジティブ・オフ',
      org: '国土交通省 観光庁',
      description: '休暇を取得しやすい職場環境づくりを推進し、ワークライフバランスの実現を目指しています。',
      url: 'https://www.mlit.go.jp/kankocho/positive-off/',
    },
  ];

  return (
    <>
      <WebPageJsonLd
        name="CSR・健康経営"
        description="株式会社StartupMarketingのCSR活動・健康経営への取り組み。がん対策推進企業アクション、ポジティブ・オフに参加しています。"
        path="/company/csr"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: 'CSR・健康経営', href: '/company/csr' }]}
      />

        <article className="max-w-4xl mx-auto px-5 py-12">
          {/* パンくず */}
          <Breadcrumb items={[
            { label: '賃貸経営ツール 大家DX', href: '/' },
            { label: '会社概要', href: '/company' },
            { label: 'CSR・健康経営' },
          ]} />

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/csr');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-8">
            CSR・健康経営
          </h1>

          {/* 概要 */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-4">
              株式会社StartupMarketingは、企業の社会的責任（CSR）を果たし、
              従業員が健康で働きやすい環境づくりに取り組んでいます。
            </p>
            <p className="text-gray-700 leading-relaxed">
              政府が推進する各種プログラムに参加し、健康経営の実践を通じて
              持続可能な事業運営を目指しています。
            </p>
          </section>

          {/* 健康経営への取り組み */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">健康経営への取り組み</h2>
            <div className="space-y-6">
              {initiatives.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{item.org}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    詳細を見る（外部サイト）
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* 消費者志向自主宣言 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">消費者志向自主宣言</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                当社は、消費者志向経営の推進に取り組み、お客様の声に耳を傾け、
                より良いサービスの提供を目指しています。
              </p>
              <h3 className="font-medium text-gray-900 mb-3">運営ポリシー</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>お客様の視点に立ったサービス開発・改善</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>お問い合わせへの迅速・丁寧な対応</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>サービス品質の継続的な向上</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>透明性の高い情報発信</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 具体的な取り組み */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">具体的な取り組み</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">定期健康診断の実施</h4>
                    <p className="text-sm text-gray-600">
                      従業員の健康管理のため、定期的な健康診断を実施しています。
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">柔軟な働き方の推進</h4>
                    <p className="text-sm text-gray-600">
                      リモートワークやフレックスタイムを活用し、ワークライフバランスを実現。
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">休暇取得の推進</h4>
                    <p className="text-sm text-gray-600">
                      有給休暇の計画的な取得を推奨し、リフレッシュできる環境を整備。
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

        </article>
    </>
  );
}
