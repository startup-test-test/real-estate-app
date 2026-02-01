import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { CompanyNav } from '@/components/company-nav';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

export const metadata: Metadata = {
  title: '気候変動への適応に向けた取り組み | 株式会社StartupMarketing',
  description: '株式会社StartupMarketingの気候変動適応への取り組み。リモートワーク推進、ペーパーレス化、マイボトル活用などを通じて、地球沸騰化時代に適応した働き方を実践しています。',
};

export default function ClimateAdaptationPage() {
  const initiatives = [
    {
      title: 'リモートワーク推進による省エネ',
      items: [
        { label: '通勤削減', description: 'フルリモートワーク体制により、通勤に伴うCO2排出をゼロに' },
        { label: 'オフィス電力削減', description: '大規模オフィスを持たない運営で電力消費を最小限に' },
        { label: '猛暑時の外出回避', description: '真夏の通勤による熱中症リスクを回避し、快適な環境で業務' },
      ],
      actions: ['01 猛暑でも快適に暮らそう', '07 エネルギーを効率よく使おう'],
    },
    {
      title: 'ペーパーレス化の徹底',
      items: [
        { label: 'クラウド活用', description: '契約書・請求書等すべて電子化し、紙の使用を削減' },
        { label: '印刷物ゼロ', description: '業務における印刷物をほぼゼロに' },
      ],
      actions: ['07 エネルギーを効率よく使おう'],
    },
    {
      title: '柔軟な働き方で気候変動に適応',
      items: [
        { label: '猛暑対策', description: '酷暑日は自宅の快適な環境で業務を継続' },
        { label: '災害時対応', description: '台風・豪雨時も在宅で事業継続が可能' },
      ],
      actions: ['01 猛暑でも快適に暮らそう', '03 防災ノウハウを身につけよう'],
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingHeader />

      {/* ヘッダー固定時のスペーサー */}
      <div className="h-[72px] sm:h-[88px]"></div>

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
            <span>気候変動への適応に向けた取り組み</span>
          </nav>

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              会社情報
            </span>
            {(() => {
              const pageInfo = getCompanyPageInfo('/company/climate-adaptation');
              return pageInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(pageInfo.lastUpdated)}
                </time>
              ) : null;
            })()}
          </div>

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            気候変動への適応に向けた取り組み
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* #適応しようバッジ */}
          <div className="mb-8 flex items-center gap-4">
            <a
              href="https://adaptation-platform.nies.go.jp/everyone/campaign/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 hover:bg-green-100 transition-colors"
            >
              <span className="text-green-700 font-medium text-sm">国立環境研究所「#適応しよう」キャンペーン賛同パートナー</span>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* 概要 */}
          <section className="mb-12">
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                当社は「地球沸騰化時代」における気候変動への適応に取り組んでいます。
                IT企業として、リモートワーク推進やペーパーレス化など、環境負荷を最小限に抑えながら快適に働ける体制を構築しています。
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                国立環境研究所気候変動適応センターが推進する<strong>「#適応しよう」キャンペーン</strong>の賛同パートナーとして、気候変動適応に関する情報発信にも取り組んでいます。
              </p>
            </div>
          </section>

          {/* 取り組み一覧 */}
          {initiatives.map((initiative, index) => (
            <section key={index} className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{initiative.title}</h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <ul className="space-y-4">
                  {initiative.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className="text-green-500 mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-900">{item.label}：</span>
                        <span className="text-gray-700">{item.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    関連する適応アクション：{initiative.actions.join(' / ')}
                  </p>
                </div>
              </div>
            </section>
          ))}

          {/* マイボトル活用 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">マイボトル活用によるプラスチック削減</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-900">ペットボトル購入ゼロ：</span>
                        <span className="text-gray-700">マイボトル（保温タンブラー）を徹底活用し、使い捨て容器の使用を削減</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-900">CO2削減への貢献：</span>
                        <span className="text-gray-700">ペットボトル製造・廃棄に伴うCO2排出を削減</span>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      関連する適応アクション：07 エネルギーを効率よく使おう
                    </p>
                  </div>
                </div>
                <div className="sm:w-48 flex-shrink-0">
                  <img
                    src="/img/plastics_smart_main.png"
                    alt="マイボトル活用"
                    className="w-full rounded-lg shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 情報発信 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Webサイト・SNSでの情報発信</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">●</span>
                  <div>
                    <span className="text-gray-700">自社Webサイトにて気候変動適応や環境への取り組みに関する情報を発信</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">●</span>
                  <div>
                    <span className="text-gray-700">SNSを通じた啓発活動</span>
                  </div>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  関連する適応アクション：15 適応しよう・参加しよう・シェアしよう
                </p>
              </div>
            </div>
          </section>

          {/* #適応しようキャンペーンについて */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">「#適応しよう」キャンペーンとは</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                「#適応しよう」キャンペーンは、国立環境研究所気候変動適応センターが推進する取り組みです。
                「地球沸騰化時代の生き方改革」として、現在および将来の気候変動の影響にそなえ、快適に暮らしていくための「適応アクション」を広げていくことを目的としています。
              </p>
              <a
                href="https://adaptation-platform.nies.go.jp/everyone/campaign/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                「#適応しよう」キャンペーン公式サイト
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>

          {/* 関連ページへのリンク */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">その他の環境への取り組み</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <Link href="/company/plastics-smart" className="text-blue-600 hover:text-blue-800 hover:underline">
                    プラスチック削減の取り組み
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <Link href="/company/lib-partner" className="text-blue-600 hover:text-blue-800 hover:underline">
                    リチウムイオン電池の火災防止啓発
                  </Link>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <Link href="/company/sdgs" className="text-blue-600 hover:text-blue-800 hover:underline">
                    SDGsの達成に向けた取組み
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
      </main>

      <LandingFooter />
    </div>
  );
}
