import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { CompanyNav } from '@/components/company-nav';
import { organizationDetailJsonLd } from '@/lib/eeat';
import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';
import { HeaderSpacer } from '@/components/HeaderSpacer';

export const metadata: Metadata = {
  title: '会社概要 ｜株式会社StartupMarketing',
  description: '株式会社StartupMarketingの会社概要。不動産テック事業「大家DX」の開発・運営、不動産業界向けシステム受託開発を行っています。',
  alternates: {
    canonical: '/company',
  },
};

export default function CompanyPage() {
  const companyInfo = [
    { label: '会社名', value: '株式会社StartupMarketing', hasMigrationNote: true },
    { label: '法人番号', value: '2010001212632（国税庁 法人番号公表サイト）', url: 'https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=2010001212632' },
    { label: '会社ロゴ', value: '', isLogo: true },
    { label: '事業内容', value: '不動産テック事業（大家DX）、Web制作・Webコンサルティング、不動産業界向けシステム受託開発' },
    { label: '代表者', value: '代表取締役 東後 哲郎（とうご てつろう）' },
    { label: '設立', value: '2020年9月29日（2016年に個人事業主を開始、2020年に法人化）' },
    { label: '資本金', value: '990万円' },
    { label: '顧問弁護士', value: 'スタートビズ法律事務所（代表弁護士: 宮岡 遼 / 第一東京弁護士会）', url: 'https://it-lawyer.jp/' },
    { label: '顧問税理士', value: '青山税理士法人', url: 'https://aoyamatax.jp/' },
    { label: '所在地', value: '〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階\n（旧住所：〒104-0061 東京都中央区銀座1-22-11 銀座大竹ビジデンス 2F）' },
  ];

  const banks = [
    { name: '埼玉縣信用金庫（大宮西支店）', note: '2024年12月に資金調達済み（資金調達合計4回）' },
    { name: '日本政策金融公庫（大宮支店）', note: '2024年8月に資金調達済み（資金調達合計2回）' },
    { name: '三井住友銀行', note: '' },
  ];

  return (
    <>
      {/* Organization 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationDetailJsonLd) }}
      />
      <WebPageJsonLd
        name="会社概要"
        description="株式会社StartupMarketingの会社概要。不動産テック事業「大家DX」の開発・運営、不動産業界向けシステム受託開発を行っています。"
        path="/company"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '会社概要', href: '/company' }]}
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
            <span>会社概要</span>
          </nav>

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            会社概要
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* 会社紹介 */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-6">
              株式会社StartupMarketingは、不動産オーナー向けの業務効率化ツール「大家DX」の開発・運営を行っています。
              代表自身が不動産の賃貸経営者として7戸の物件を購入・運用した経験を活かし、実務に役立つシミュレーターやツールを提供しています。
            </p>
            <p className="text-gray-700 leading-relaxed">
              また、不動産業界に特化したWebサイト制作・システム開発の受託も承っております。
            </p>
          </section>

          {/* 会社情報テーブル */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報</h2>
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <dl className="divide-y divide-gray-200">
                {companyInfo.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row">
                    <dt className="bg-gray-100 px-5 py-4 sm:w-44 flex-shrink-0 font-medium text-gray-900">
                      {item.label}
                    </dt>
                    <dd className="px-5 py-4 text-gray-700">
                      {'hasMigrationNote' in item && item.hasMigrationNote ? (
                        <div>
                          <div className="font-medium">{item.value}</div>
                          <p className="text-sm text-gray-600 mt-2">
                            法人ページは https://startup-marketing.co.jp/ から ooya.tech/company/ に移転しました。
                          </p>
                        </div>
                      ) : 'isLogo' in item && item.isLogo ? (
                        <img
                          src="/img/logo_startup_marketing.png"
                          alt="株式会社StartupMarketing"
                          className="h-8 w-auto"
                        />
                      ) : item.label === 'メール' ? (
                        <a href={`mailto:${item.value}`} className="text-blue-600 hover:underline">
                          {item.value}
                        </a>
                      ) : 'url' in item && item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {item.value}
                        </a>
                      ) : item.value.includes('\n') ? (
                        <div>
                          {item.value.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* 所属加盟団体 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">所属加盟団体</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span className="flex flex-wrap gap-x-1">
                    <a href="https://www.saitamadx.com/dx-partner/solution/348/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">埼玉県DXパートナー</a>
                    <span className="text-gray-500">/</span>
                    <a href="https://www.tokyo-cci.or.jp/shachonet/profile/2454.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">東京商工会議所</a>
                    <span className="text-gray-500">/</span>
                    <a href="https://www.amatias.com/asp/navi.asp?s_code=S0006864" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">さいたま商工会議所</a>
                    <span className="text-gray-500">/</span>
                    <a href="https://stib.jp/member/name-list/?s=StartupMarketing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">さいたま観光国際協会</a>
                    <span className="text-gray-500">/</span>
                    <a href="https://www.city.saitama.lg.jp/006/007/002/008/p062519.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">さいたま市CS・SDGsパートナーズ</a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <a href="https://www.freelance-jp.org/talents/12828" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">一般社団法人プロフェッショナル&パラレルキャリア・フリーランス協会</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <a href="https://www.sysadmingroup.jp/sandoukigyo/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">システム管理者の会</a>
                </li>
              </ul>
            </div>
          </section>

          {/* メディア掲載 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">メディア掲載</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-4">
                <li className="text-sm">
                  <span className="text-gray-500 font-medium">2025年10月：</span>
                  <span className="text-gray-900">
                    <a href="https://www.jutaku-s.com/newsp/id/0000064588" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">住宅新報社様</a>
                    に「賃貸経営者向け収益シミュレーションSaaS『大家DX』」が掲載されました（
                    <a href="/img/住宅新聞.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">新聞掲載PDF</a>
                    ・
                    <a href="https://www.jutaku-s.com/newsp/id/0000064588" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">Webメディア</a>
                    ）
                  </span>
                </li>
                <li className="text-sm">
                  <span className="text-gray-500 font-medium">2024年10月：</span>
                  <span className="text-gray-900">
                    <a href="https://saitama.publishing.3rd-in.co.jp/article/2aa1cd40-a89a-11f0-88f0-9ca3ba0a67df#gsc.tab=0" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">saitamaDays</a>
                    に掲載されました
                  </span>
                </li>
                <li className="text-sm">
                  <span className="text-gray-500 font-medium">2024年1月：</span>
                  <span className="text-gray-900">
                    【フジテレビ様】フジテレビ「イット！」にて、不動産賃貸業の空き家再生にてインタビューされました（
                    <a href="/img/akiya.png" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">放送画像</a>
                    ）
                  </span>
                </li>
                <li className="text-sm">
                  <span className="text-gray-500 font-medium">2020年5月：</span>
                  <a href="https://offers.jp/media/sidejob/workstyle/a_1862" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">【株式会社overflow様】フリーランスWebディレクターのキャリアと案件の進め方</a>
                </li>
                <li className="text-sm">
                  <span className="text-gray-500 font-medium">2019年4月：</span>
                  <a href="https://www.shibuyamov.com/interviews/webyour-times.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">【渋谷ヒカリエ Creative Lounge MOV様】フリーランスwebデザイナーがはじめた 写真に残せない想い出を絵本にするギフトサービス『YOUR TIMES』</a>
                </li>
              </ul>
            </div>
          </section>

          {/* 主要取引金融機関 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">主要取引金融機関</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-3">
                {banks.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-0.5">●</span>
                    <div>
                      <span className="text-gray-900">{item.name}</span>
                      {item.note && <span className="text-gray-500 ml-2">– {item.note}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 代表者プロフィール */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">代表者について</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  <img
                    src="/images/profile/profile.jpg"
                    alt="東後 哲郎"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">東後 哲郎（とうご てつろう）</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    開発ディレクター / マーケッター / 不動産オーナー
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <a href="https://zenko-kyo.or.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">古家再生プランナー</a>（一般社団法人 全国古家再生推進協議会）
                    <a href="/docs/furuya-planner-certificate.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline ml-1">[認定証]</a>
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    福岡のデザイン学校卒業後、Webデザイナー・マーケッターとして15年以上の経験を持つ。
                    2023年より不動産投資を開始し、現在6戸を保有・運用中。
                    開発×マーケ×不動産の掛け合わせで「大家DX」を開発。
                  </p>
                  <Link
                    href="/profile"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    詳しいプロフィールを見る
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 社会貢献・取り組み */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">社会貢献・取り組み</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <Link href="/company/sdgs" className="text-blue-600 hover:text-blue-800 hover:underline">SDGsの達成に向けた取組み</Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <span className="flex flex-wrap gap-x-1">
                    <Link href="/company/consumer-policy" className="text-blue-600 hover:text-blue-800 hover:underline">消費者志向自主宣言ならびに運営ポリシー</Link>
                    <span className="text-gray-500">/</span>
                    <a href="https://www.caa.go.jp/policies/policy/consumer_partnerships/consumer_oriented_management/businesses" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">消費者庁</a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <span className="flex flex-wrap gap-x-1">
                    <Link href="/company/teambeyond" className="text-blue-600 hover:text-blue-800 hover:underline">Team Beyond参加</Link>
                    <span className="text-gray-500">/</span>
                    <a href="https://www.para-sports.tokyo/member/group/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">掲載サイト</a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <span className="flex flex-wrap gap-x-1">
                    <Link href="/company/plastics-smart" className="text-blue-600 hover:text-blue-800 hover:underline">プラスチック削減の取り組み</Link>
                    <span className="text-gray-500">/</span>
                    <a href="https://plastics-smart.env.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">掲載サイト</a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <span className="flex flex-wrap gap-x-1">
                    <Link href="/company/lib-partner" className="text-blue-600 hover:text-blue-800 hover:underline">リチウムイオン電池の火災防止啓発</Link>
                    <span className="text-gray-500">/</span>
                    <a href="https://lithium.env.go.jp/recycle/waste/lithium_1/partner.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">掲載サイト</a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <span className="flex flex-wrap gap-x-1">
                    <Link href="/company/climate-adaptation" className="text-blue-600 hover:text-blue-800 hover:underline">気候変動への適応に向けた取り組み</Link>
                    <span className="text-gray-500">/</span>
                    <a href="https://adaptation-platform.nies.go.jp/everyone/campaign/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">掲載サイト</a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <a href="https://sportinlife.go.jp/consortium/participant/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">Sport in Life プロジェクト参画</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <a href="https://uminohi.jp/partner/list.html?tab=2" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">海と日本PROJECT 推進パートナー</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-900 mt-0.5">●</span>
                  <Link href="/company/link" className="text-blue-600 hover:text-blue-800 hover:underline">相互リンク</Link>
                </li>
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
