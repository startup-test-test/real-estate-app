import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { CompanyNav } from '@/components/company-nav';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

export const metadata: Metadata = {
  title: '実績・得意領域 | 株式会社StartupMarketing',
  description: '独立5年目のWebディレクター・マーケッター。スタートアップ企業（BtoC）のWebコンサル・マーケティングオートメーション・グロースハック施策を得意領域としています。',
};

export default function PortfolioPage() {
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
            <span>実績・得意領域</span>
          </nav>

          {/* カテゴリー & 日付 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              会社情報
            </span>
            {(() => {
              const pageInfo = getCompanyPageInfo('/company/portfolio');
              return pageInfo?.lastUpdated ? (
                <time className="text-xs text-gray-400">
                  {formatToolDate(pageInfo.lastUpdated)}
                </time>
              ) : null;
            })()}
          </div>

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            実績・経歴
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* 概要 */}
          <p className="text-gray-700 leading-relaxed mb-8">
            スタートアップ企業（BtoC）のWebコンサル・マーケティングオートメーション・グロースハック施策を得意領域としております。Webサイトの新規・リニューアルに関する課題や要望はもちろん、運用・マーケティングに関するお考えや、方針をじっくりヒアリング。
          </p>

          {/* 代表者情報 */}
          <section className="mb-12">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                  <img
                    src="/img/portfolio_profile.png"
                    alt="東後哲郎"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-1">代表取締役 / 東後哲郎（とうごてつろう）</p>
                  <p className="text-gray-600 mb-3">開発ディレクター（Webディレクター） / マーケッター / MA / デザイナー</p>
                  <Link
                    href="/media/profile"
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

          {/* 得意領域 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">【得意領域】</h2>
            <p className="text-gray-700 leading-relaxed">
              独立5年目のWebディレクター・マーケッター / 株式会社StartupMarketingの代表 / Webデザイナー5年→ 新規事業マーケ3年→2016年に独立。得意領域はBtoCマーケ・PM・UI/UX・開発ディレクション・CRM・Marketo。現場で役立った知識を発信。
            </p>
          </section>

          {/* 経歴 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">【経歴】</h2>
            <p className="text-gray-700 leading-relaxed">
              1987年宮崎県生まれ。福岡のデザイン学校を卒業後、Webデザイナーとして5年間就職。その後、イギリス・オーストラリアシドニーにてフリーのデザイナーとして活動。東証一部上場企業の新規事業立ち上げのマーケッターを3年経験後、2016年4月に独立。大手保険会社のWebコンサル・グロース施策、冠婚葬祭サイトのCRM（Marketo）領域を担当。スタートアップ業界専門のグロースに特化した株式会社StartupMarketingを設立。
            </p>
          </section>

          {/* 実績1: 冠婚・葬儀会社MA */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">BtoC：冠婚・葬儀会社のMA（Marketing Automationの導入・戦略設計・実行</h2>
            <img
              src="/img/portfolio_1.png"
              alt="冠婚・葬儀会社MA案件"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-gray-700 leading-relaxed mb-6">
              PM・開発ディレクション及び、Makretoの導入〜戦略設計〜開発周りの仕様書作成から実行まで。データドリブンによる、課題抽出を行い、打ち手を実行し、CVRとLTVの最大化を行う。
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">期間</dt>
                  <dd className="text-gray-900">2019年4月〜2026年1月（6年9ヶ月）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">業種</dt>
                  <dd className="text-gray-900">冠婚・葬祭</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">規模</dt>
                  <dd className="text-gray-900">100名以上〜</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">規模間</dt>
                  <dd className="text-gray-900">大規模（100ページ以上）</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">担当領域</dt>
                  <dd className="text-gray-900">①CRM / Marketoの導入〜戦略〜実行 / リード獲得 / リード育成 /<br />②PM / 開発ディレクション・Webディレクション・グロースハック<br />③推進 / 経営者・決裁者への合意形成・施策承認の合意形成</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">ジャンル</dt>
                  <dd className="text-gray-900">BtoC向け プラットフォーム</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">デバイス</dt>
                  <dd className="text-gray-900">PC/SP</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">スコープ</dt>
                  <dd className="text-gray-900">CRM / Marketoのプロジェクトマネジメント（導入〜戦略〜実行）<br />リード・ビルディングの増加施策<br />リード・ナーチャリングの設計・LTVの向上施策,ステップメールの作成<br />会員ページの設計,開発ディレクション周り<br />データ・ドリブンによる可視化〜施策実行<br />ABテストによるEFO（フォーム開発）の改善施策<br />BIツール（Googleデータ・ポータル）にデータ自動化・可視化</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">契約</dt>
                  <dd className="text-gray-900">準委任契約</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 実績2: 旅行会社CVR改善 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">BtoC：旅行会社のCVR改善の課題抽出〜戦略設計〜実行 / レポート設計</h2>
            <img
              src="/img/portfolio_2.png"
              alt="旅行会社CVR改善案件"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-gray-700 leading-relaxed mb-6">
              外部パートナーと協力をして、社内にABテストの改善チームの環境構築から行いました。ページ事のUXの見直しから、改善効果のレポート作成まで。
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">期間</dt>
                  <dd className="text-gray-900">2018年4月〜2019年3月</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">業種</dt>
                  <dd className="text-gray-900">旅行業</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">会社規模</dt>
                  <dd className="text-gray-900">300名以上〜</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">規模間</dt>
                  <dd className="text-gray-900">大規模（100ページ以上）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">担当領域</dt>
                  <dd className="text-gray-900">①PM・Webディレクター / ABテストの社内体制・仕組み作り</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">ジャンル</dt>
                  <dd className="text-gray-900">BtoC向け プラットフォーム</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">デバイス</dt>
                  <dd className="text-gray-900">PC/SP</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">スコープ</dt>
                  <dd className="text-gray-900">データによるページ事の課題抽出<br />CVR改善の為のABテストの戦略設計・実行施策<br />EFOの最適化<br />ABテスト、プロジェクトマネージャー、Webディレクション<br />定量調査（全体CVR数値の解析、遷移率の解析）<br />定性調査（社内アンケート、ヒアリング、ペルソナ、カスタマージャーニー）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">契約</dt>
                  <dd className="text-gray-900">準委任契約</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 実績3: 証券会社PMO */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">証券会社のPMO・Webコンサルティング（取締役・事業部長の相談役）</h2>
            <img
              src="/img/portfolio_3.png"
              alt="証券会社PMO案件"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-gray-700 leading-relaxed mb-6">
              金融会社フルリニューアルの向けて、スポットにてコンサルティング
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">期間</dt>
                  <dd className="text-gray-900">2017年5月〜2017年8月</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">業種</dt>
                  <dd className="text-gray-900">金融業（大手銀行系サイトのフルリニューアル）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">会社規模</dt>
                  <dd className="text-gray-900">100名以上〜</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">規模間</dt>
                  <dd className="text-gray-900">大規模（50ページ以上）</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">担当領域</dt>
                  <dd className="text-gray-900">①サイトフルリニューアルに向けて、スポットコンサルティング<br />②第三者評価の作成（サイト数値、ROIの数値評価等）<br />③社内リソース管理、進捗管理ソフトウェアの導入</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">ジャンル</dt>
                  <dd className="text-gray-900">BtoC向け プラットフォーム</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">デバイス</dt>
                  <dd className="text-gray-900">PC/SP</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">スコープ</dt>
                  <dd className="text-gray-900">フルリニューアルの要件定義</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">契約</dt>
                  <dd className="text-gray-900">準委任契約</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 実績4: 大手銀行フルリニューアル */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">大手銀行サイトのフルリニューアル</h2>
            <img
              src="/img/portfolio_4.png"
              alt="大手銀行フルリニューアル案件"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-gray-700 leading-relaxed mb-6">
              全体のプロジェクトマネジメントから全体の情報設計・予算の策定・クライアントの合意形成。ニアショア・オフショアの約10名の管理をして推進・管理・クライアントの合意形成。
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">期間</dt>
                  <dd className="text-gray-900">2017年5月〜2018年2月</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">業種</dt>
                  <dd className="text-gray-900">金融業（大手銀行系サイトのフルリニューアル）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">会社規模</dt>
                  <dd className="text-gray-900">100名以上〜</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">規模間</dt>
                  <dd className="text-gray-900">中規模（100ページ以上）</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">担当領域</dt>
                  <dd className="text-gray-900">①PM（プロジェクト・マネジメント）・Webディレクター<br />②ニアショア・オフショアのプロジェクト管理<br />③デザインの品質管理</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">ジャンル</dt>
                  <dd className="text-gray-900">BtoC向け プラットフォーム</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">デバイス</dt>
                  <dd className="text-gray-900">PC/SP</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">スコープ</dt>
                  <dd className="text-gray-900">フルリニューアルの要件定義 / 工数算出 / アサインメンバーの選定<br />クライアントの合意形成 / サイトの情報設計（ワイヤー）<br />デザイン品質管理 / ニアショア・オフショアのマネジメント</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">契約</dt>
                  <dd className="text-gray-900">準委任契約</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 実績5: 招待制融資・ビジネスローン */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">招待制融資・ビジネスローンのサイト設計 及び LP</h2>
            <img
              src="/img/portfolio_5.png"
              alt="招待制融資・ビジネスローン案件"
              className="w-full rounded-lg mb-6"
            />
            <div className="bg-gray-50 rounded-xl p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">期間</dt>
                  <dd className="text-gray-900">2017年5月〜2018年2月</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">業種</dt>
                  <dd className="text-gray-900">金融業（大手銀行系サイトのフルリニューアル）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">会社規模</dt>
                  <dd className="text-gray-900">100名以上〜</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">規模間</dt>
                  <dd className="text-gray-900">中規模（100ページ以上）</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">担当領域</dt>
                  <dd className="text-gray-900">①PM（プロジェクト・マネジメント）・Webディレクター<br />②ニアショア・オフショアのプロジェクト管理<br />③デザインの品質管理</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">ジャンル</dt>
                  <dd className="text-gray-900">BtoC向け プラットフォーム</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">デバイス</dt>
                  <dd className="text-gray-900">PC/SP</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">スコープ</dt>
                  <dd className="text-gray-900">LP施策の要件定義・構成・デザインのディレクション</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">契約</dt>
                  <dd className="text-gray-900">準委任契約</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* 実績6: 保険サイトフルリニューアル */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">招待制融資・ビジネスローンのサイト設計 及び BtoC向け保険サイトのフルリニューアル</h2>
            <img
              src="/img/portfolio_6.png"
              alt="保険サイトフルリニューアル案件"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-gray-700 leading-relaxed mb-6">
              保険会社のフルリニューアル・Webコンサルタント・ディレクション（上流設計からKGI・KPIの設計）。WEBコンサルから、必要な内容を取りまとめ、クライアントからの内容をヒアリングしながら企画書にまとめていきました。WEB制作の部分だけでなく、店舗でのコミュニケーション部分も含めてご提案。
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <dl className="space-y-3 text-sm">
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">期間</dt>
                  <dd className="text-gray-900">2016年8月〜2017年5月</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">業種</dt>
                  <dd className="text-gray-900">保険業（総合広告代理店案件）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">会社規模</dt>
                  <dd className="text-gray-900">100名以上〜</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">規模間</dt>
                  <dd className="text-gray-900">中規模（100ページ以上）</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">担当領域</dt>
                  <dd className="text-gray-900">サイトのフルリニューアル（ページボリューム：200〜）<br />上流設計 / 要件定義 / KPI / KGIの設計 / 競合他社調査 / ペルソナ設計<br />カスタマージャーニーの設計 / ワイヤーフレームの作成 / スケジュール調整 /<br />ベンダーコントロール</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">ジャンル</dt>
                  <dd className="text-gray-900">BtoC向けの保険申込みの全体設計</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">デバイス</dt>
                  <dd className="text-gray-900">PC/SP</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="text-gray-500 w-24 flex-shrink-0">スコープ</dt>
                  <dd className="text-gray-900">フルリニューアルの要件定義 / 工数算出 / アサインメンバーの選定<br />クライアントの合意形成 / サイトの情報設計（ワイヤー）</dd>
                </div>
                <div className="flex">
                  <dt className="text-gray-500 w-24 flex-shrink-0">契約</dt>
                  <dd className="text-gray-900">準委任契約</dd>
                </div>
              </dl>
            </div>
          </section>

        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
