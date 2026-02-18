import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: 'メニュー・料金 ｜株式会社StartupMarketing',
  description: '業界歴14年目のプロのWebコンサルティングが、データ分析を元に事業・経営課題を発見して戦略支援致します。',
  alternates: {
    canonical: '/company/service',
  },
  openGraph: {
    title: 'メニュー・料金 ｜株式会社StartupMarketing',
    description: '業界歴14年目のプロのWebコンサルティングが、データ分析を元に事業・経営課題を発見して戦略支援致します。',
    url: `${BASE_URL}/company/service`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'メニュー・料金 ｜株式会社StartupMarketing',
    description: '業界歴14年目のプロのWebコンサルティングが、データ分析を元に事業・経営課題を発見して戦略支援致します。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function ServicePage() {
  return (
    <>
      <WebPageJsonLd
        name="メニュー・料金"
        description="業界歴14年目のプロのWebコンサルティングが、データ分析を元に事業・経営課題を発見して戦略支援致します。"
        path="/company/service"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: 'メニュー・料金', href: '/company/service' }]}
      />

        <article className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
          {/* パンくず */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-600">
              ホーム
            </Link>
            <span className="mx-2">&gt;</span>
            <span>メニュー・料金</span>
          </nav>

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/service');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            メニュー・料金
          </h1>

          {/* 概要 */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-4">
              業界歴14年目のプロのWebコンサルティングが、データ分析を元に事業・経営課題を発見して戦略支援致します。
            </p>
            <p className="text-gray-700 leading-relaxed">
              データ分析をベースに、現状分析を行い課題を設定し、プロジェクトの目的・根幹を明確にした上で、Webサイトの戦略立案・情報設計を行います。お気軽にご相談ください。
            </p>
          </section>

          {/* サービス一覧 */}
          <section className="mb-12">
            <div className="space-y-8">

              {/* 顧問Webディレクター */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">顧問Webディレクター・マーケッター・コンサルティング</h2>
                <p className="text-gray-600 mb-3">月額固定の専属Webディレクターサービス</p>
                <h3 className="font-bold text-gray-900 mb-2">顧問Webディレクター・マーケティングのサービス</h3>
                <p className="text-gray-700 mb-4">
                  月額契約をしていただくことで、貴社の専属のWebディレクターとしてプロジェクトのアドバイス・社内ディレクターの教育・アドバイスを行っていきます。
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="text-gray-700">1.スポット / 月間5時間</span>
                    <span className="font-bold text-gray-900">月額75,000円</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="text-gray-700">2.シンプル / 月間10時間</span>
                    <span className="font-bold text-gray-900">月額120,000円</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="text-gray-700">3.スタンダード / 月間20時間</span>
                    <span className="font-bold text-gray-900">月額200,000円</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  対応可能範囲：PMO支援、上流設計・戦略設計、ペルソナ・カスタマージャーニー・定量データの作成、WBSの作成、要件定義書のセカンドオピニオン、デザインの方針作成、3C分析、競合調査、ワイヤー、改善コンサルティング、定例MTGのファシリテーション、WBS、CRM（Marketo支援・戦略支援）、その他 Webディレクターのアドバイザー、プロジェクトのアドバイザー、広告代理店・制作会社選定のセカンドオピニオン、Webディレクターの採用の際のセカンドオピニオン等々。
                </p>
                <p className="text-sm text-gray-500">
                  ※フルリモートの対応になります。 ※お支払いは前金制・準委任契約になります。
                </p>
              </div>

              {/* 定期コンサルティング */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">定期コンサルティング</h2>
                <p className="font-bold text-gray-900 mb-3">月額：150,000円〜</p>
                <p className="text-gray-700 mb-3">
                  定期的（毎月1回の60分）に、お客様のWebサイトの現状分析、改善提案をするプラン
                </p>
                <p className="text-gray-700 mb-3">
                  ・解析レポートの提出、オンラインによるご報告と改善提案
                </p>
                <p className="text-sm text-gray-500">
                  ※制作費用は別途になります。
                </p>
              </div>

              {/* Googleデータポータル */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Googleデータ ポータルの設置（BIツール）</h2>
                <p className="font-bold text-gray-900 mb-3">初期：50,000円〜（月額：10,000円〜）</p>
                <p className="text-gray-700 mb-3">
                  全体のアクセスとCV状況、流入状況とページ別訪問状況、Google自然検索キーワードを掲載した簡易レポートのご提出。オンラインによるご説明はございません。月額費用は定期メンテナンス費用になります。例）最大2目標まで /「問合せ完了」
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  ※Webコンサルティングの定期コンサルティングプランには付いております。
                </p>
                <p className="text-sm text-gray-500">
                  ※タグ設定、CV設定などがお済みでない場合は、別途費用になります。
                </p>
              </div>

              {/* 改善コンサルティング */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">改善コンサルティング / CRO / ABテスト</h2>
                <p className="font-bold text-gray-900 mb-3">月額：350,000円〜</p>
                <p className="text-gray-700">
                  CVR改善施策 /（A/Bテスト） / EFO / 月間4本のテストのご提案、35万円〜CVR改善の為の分析を行い、月に4本〜6本程度の提案資料を納品致します。
                </p>
              </div>

              {/* PMO */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">PMO（プロジェクト・マネジメント）</h2>
                <p className="font-bold text-gray-900 mb-3">月額： 1人月 1,200,000円〜</p>
                <p className="text-gray-700">
                  PM・開発ディレクション、Webディレクション、UI/UX領域のご支援。
                </p>
              </div>

              {/* Marketo */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Marketoの導入・戦略設計・データ マネジメント</h2>
                <p className="font-bold text-gray-900 mb-3">月額： 1人月 1,200,000円〜</p>
                <p className="text-gray-700 mb-3">
                  マーケティング・オートメーションツールのMarketoの導入・戦略設計及びデータ・マネジメントのテーブルを設計致します。
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  ※Webコンサルティングの定期コンサルティングプランには付いております。
                </p>
                <p className="text-sm text-gray-500">
                  ※タグ設定、CV設定などがお済みでない場合は、別途費用になります。
                </p>
              </div>

            </div>
          </section>

        </article>
    </>
  );
}
