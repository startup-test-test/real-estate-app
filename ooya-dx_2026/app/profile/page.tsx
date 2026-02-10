import { LandingHeader } from '@/components/landing-header';
import { LandingFooter } from '@/components/landing-footer';
import { SimulatorCTA } from '@/components/tools/SimulatorCTA';
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact';
import { personJsonLd } from '@/lib/eeat';
import Link from 'next/link';

export const metadata = {
  title: '自己紹介と不動産購入実績｜大家DX',
  description: '大家DX運営者のプロフィールと不動産購入実績。2025年9月時点で7戸購入、1戸売却、現在6戸保有。開発×マーケ×不動産の掛け合わせで、再生と収益改善に強み。',
  alternates: {
    canonical: '/profile',
  },
};

export default function ProfilePage() {
  // 投資用物件
  const investmentProperties = [
    {
      number: 1,
      year: '2023年',
      title: '1戸目 / 2023年 / 埼玉県春日部市の築古戸建',
      type: '築約50年の築古戸建',
      area: '土地85.1㎡ / 建物75.4㎡',
      finance: '物件は現金で購入して、リフォームローンを日本政策金融公庫さんから5年融資',
      description: '埼玉県春日部市に築50年の戸建の家を現金400万円で購入。フルリフォームをして、4ヶ月程でなんとか入居付け出来ました。ゴミ撤去業者に撤去業務をして頂き、内装を間取り変更からトイレ交換、床をクッションフロア、壁のクロスを全面張り替えなど全て行いました。',
      image: '/images/profile/property-2.png',
    },
    {
      number: 2,
      year: '2023年',
      title: '2戸目 / 2023年 / 埼玉県春日部市の築古戸建',
      type: '築約50年の築古戸建',
      area: '土地108.9㎡ / 建物55.4㎡',
      finance: '物件は現金で購入して、リフォームローンを埼玉縣信用金庫さんからにて10年融資',
      description: '埼玉県春日部市の近いエリアにもう1戸、築50年の築古戸建を400万円から指値を入れて現金300万円で購入。こちらもフルリフォームして1ヶ月以内に入居付け出来ました。内装を間取り変更からトイレ交換、床をクッションフロア、壁のクロスを全面張り替えなど全て行いました。',
      image: '/images/profile/property-3.png',
    },
    {
      number: 3,
      year: '2024年',
      title: '3戸目 / 2024年 / 埼玉県越谷市のファミリー区分マンション',
      type: 'ファミリー区分マンションをリースバックにて購入',
      area: '57.59㎡（2LDK＋S）',
      finance: '埼玉縣信用金庫さん / 15年融資にてフルローン',
      description: '2戸目と3戸目で少し慣れてきた事と、現金を結構使ったので、出来るだけ融資を活用しようと、割安のファミリー区分マンションを見つけて、すぐに現場にいき、調査して、買付を入れました。',
      image: '/images/profile/property-4.jpg',
    },
    {
      number: 4,
      year: '2024年',
      title: '4戸目 / 2024年 / 埼玉県川越市のファミリー区分マンション',
      type: 'ファミリー区分マンションをオーナーチェンジで購入',
      area: '48.07㎡（2LDK＋S）',
      finance: '埼玉縣信用金庫さん / 15年融資にてフルローン',
      description: 'こちらも割安のオーナーチェンジのファミリー区分マンションを見つけて、買付を入れました。オーナーチェンジは築古戸建と違ってリフォームなどもする事がないので、購入してそのままです。',
      image: '/images/profile/property-5.jpg',
    },
    {
      number: 5,
      year: '2024年',
      title: '5戸目 / 2024年 / 埼玉県さいたま市浦和区の戸建',
      type: '築30年の戸建をフルローンで購入',
      area: '土地98.71㎡ / 建物100㎡（4LDK＋S）',
      finance: '埼玉縣信用金庫さん / 15年融資にてフルローンとリフォーム費用 / 日本政策金融公庫さんから5年ローン',
      description: '浦和区にて路線価の中古戸建が出た為、購入。購入後の隣人トラブルが大変でしたが、グループホームの福祉施設用さんへの賃貸をしております。リフォームを4社程あいみつを行い、スプレッドシートにてリフォームの項目を徹底的に洗い出し良質なパートナーを見つける事が出来ました。リフォーム業社の金額差は100万円以上〜出たりするので、お任せにするのではなく、自分がリフォームに詳しくなる事が大事なと気づきました。',
      image: '/images/profile/property-6.png',
    },
  ];

  // 自己居住用物件
  const residenceProperties = [
    {
      number: 1,
      year: '2019年',
      title: '1戸目 / 2019年 / 東京都品川区 品川シーサイド駅 徒歩3分（売却済）',
      type: '新築2LDKマンション',
      area: '62平米',
      finance: '住宅ローンにてフルローンで購入',
      description: '品川シーサイド駅の徒歩3分の新築の区分マンション（2LDK）を持ち家にて購入。3年間住んで購入金額の155%で売却。（2025年現在約200%にまで上昇しておりました。。）双子の男の子が生まれて、広い家に住みたかったので、家族全員で都内から埼玉県のさいたま新都心に引っ越し。1棟目の値段が高く売れた事で、本格的に事業化しようと。不動産投資に関するスクールを3つ受け、書籍を100冊以上読んで、猛勉強しました。',
      image: '/images/profile/property-1.jpg',
    },
    {
      number: 2,
      year: '2025年',
      title: '2戸目 / 2025年 / 埼玉県さいたま市大宮区のさいたま新都心駅の築30年のフルリノベの中古戸建を購入',
      type: '築30年のフルリノベ戸建',
      area: '土地135㎡ / 建物158㎡（5LDK＋S＋屋上付き）',
      finance: '埼玉縣信用金庫さんから住宅ローンにてオーバーローンにて購入',
      description: 'さいたま新都心駅に家族5人で、戸建賃貸で住んでおりましたが、今後を考え近辺で良い物件がないかなと1年程探しておりましたが、なかなか出なく、ある時にパッとSUUMOに掲載されて、土地実勢価格が購入金額に近しい事とこのエリアでこの広さの戸建と庭付き駐車場2台はなかった為、すぐに買付を入れました。その週で4名買付が入りましたが、なんとか無事に選ばれました。',
      image: '/images/profile/property-7.jpg',
    },
  ];

  const career = [
    { year: '1987年', content: '宮崎県生まれ' },
    { year: '2000年', content: '中学生時に趣味でサイト制作開始' },
    { year: '2007年', content: '九州デザイン専門学校 総合デザイン学科 卒業' },
    { year: '2008年', content: '化粧品メーカー販売促進クリエイティブ担当' },
    { year: '2010年', content: 'イギリス・オーストラリア就業・インターン' },
    { year: '2012年', content: '制作会社で大手メーカーデザイン担当' },
    { year: '2013年', content: '東証一部上場企業マーケティング事業部（マーケティング・Web制作）' },
    { year: '2016年', content: 'フリーランスのWebディレクター・デザイナーとして独立' },
    { year: '2020年', content: '法人化、株式会社StartupMarketing設立' },
  ];

  const freelanceProjects = [
    { period: '2019年4月〜2025年9月', content: 'ライフエンディング業界CRM導入・促進' },
    { period: '2018年4月〜2019年3月', content: '旅行会社グロースハック（ABテスト）' },
    { period: '2018年1月〜2018年2月', content: '証券会社Webコンサルタント' },
    { period: '2017年5月〜2018年1月', content: '制作会社PM・ディレクター' },
    { period: '2017年5月〜2017年7月', content: '一般社団法人すこっぷ デザイン' },
    { period: '2017年1月〜2017年2月', content: 'DISCOVER株式会社 UIデザイン' },
    { period: '2016年8月〜2017年5月', content: '総合広告代理店 保険会社フルリニューアル・上流設計' },
  ];

  const mediaAppearances = [
    { year: '2024年1月', content: 'フジテレビ「イット！」にて、不動産賃貸業の空き家再生についてインタビュー', link: '/img/akiya.png' },
    { year: '2020年5月', content: '株式会社overflow「フリーランスWebディレクターのキャリアと案件の進め方」', link: 'https://offers.jp/media/sidejob/workstyle/a_1862' },
    { year: '2019年4月', content: '渋谷ヒカリエ Creative Lounge MOV「フリーランスwebデザイナーがはじめた写真に残せない想い出を絵本にするギフトサービス『YOUR TIMES』」', link: 'https://www.shibuyamov.com/interviews/webyour-times.html' },
  ];

  const strengthsFinder = ['最上志向', '分析思考', '適応性', '着想', '戦略性'];

  return (
    <>
      {/* Person 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

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
              <span>自己紹介と不動産購入実績</span>
            </nav>

            {/* H1タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-8">
              自己紹介と不動産購入実績
            </h1>

            {/* プロフィール概要 */}
            <section className="mb-12">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="/images/profile/profile.jpg"
                    alt="Tetsuro Togo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    Tetsuro Togo
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">株式会社StartupMarketing</a> 代表取締役
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    開発ディレクター / マーケッター / 不動産オーナー
                  </p>
                  <p className="text-sm text-gray-500">
                    1987年（宮崎県生まれ）
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
                <p>
                  福岡のデザイン学校を卒業後、Webデザイナーとして5年間就職。その後、イギリス・オーストラリアシドニーにてフリーのデザイナーとして活動。東証一部上場企業の新規事業立ち上げのマーケッターを3年経験後、2016年4月に独立。
                </p>
                <p>
                  <span className="font-semibold text-blue-600">2025年9月時点で、7戸物件を購入して、1戸売却。現在6戸を保有しております。</span>
                </p>
                <p>
                  開発×マーケ×不動産の掛け合わせで、再生と収益改善に強み。大家向け高度シミュレーター「大家DX」を2025年8月リリース。
                </p>
              </div>

              {/* 保有資格 */}
              <div className="mt-6">
                <h3 className="text-base font-bold text-gray-900 mb-2">保有資格</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">●</span>
                    <span>
                      古家再生プランナー（<a href="https://zenko-kyo.or.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">一般社団法人 全国古家再生推進協議会</a>）
                      <a href="/docs/furuya-planner-certificate.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline ml-1">[認定証]</a>
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 収益不動産の購入実績 */}
            <section className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                【収益不動産の購入実績】
              </h2>

              <div className="space-y-8">
                {investmentProperties.map((property) => (
                  <div key={property.number}>
                    {/* タイトル（カードの外） */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-snug">
                      {property.title}
                    </h3>
                    {/* カード */}
                    <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        {/* 左側：物件画像 */}
                        <div className="md:w-[280px] flex-shrink-0">
                          <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        {/* 右側：詳細 */}
                        <div className="flex-1 p-5 sm:p-6">
                          <dl className="space-y-2 text-sm mb-4">
                            <div className="flex">
                              <dt className="text-gray-500 w-20 flex-shrink-0">物件種類</dt>
                              <dd className="text-gray-900">{property.type}</dd>
                            </div>
                            <div className="flex">
                              <dt className="text-gray-500 w-20 flex-shrink-0">面積</dt>
                              <dd className="text-gray-900">{property.area}</dd>
                            </div>
                            <div className="flex">
                              <dt className="text-gray-500 w-20 flex-shrink-0">融資</dt>
                              <dd className="text-gray-900">{property.finance}</dd>
                            </div>
                          </dl>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {property.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 自己居住用の購入実績 */}
            <section className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                【自己居住用の購入実績】
              </h2>

              <div className="space-y-8">
                {residenceProperties.map((property) => (
                  <div key={property.number}>
                    {/* タイトル（カードの外） */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-snug">
                      {property.title}
                    </h3>
                    {/* カード */}
                    <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        {/* 左側：物件画像 */}
                        <div className="md:w-[280px] flex-shrink-0">
                          <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        {/* 右側：詳細 */}
                        <div className="flex-1 p-5 sm:p-6">
                          <dl className="space-y-2 text-sm mb-4">
                            <div className="flex">
                              <dt className="text-gray-500 w-20 flex-shrink-0">物件種類</dt>
                              <dd className="text-gray-900">{property.type}</dd>
                            </div>
                            <div className="flex">
                              <dt className="text-gray-500 w-20 flex-shrink-0">面積</dt>
                              <dd className="text-gray-900">{property.area}</dd>
                            </div>
                            <div className="flex">
                              <dt className="text-gray-500 w-20 flex-shrink-0">融資</dt>
                              <dd className="text-gray-900">{property.finance}</dd>
                            </div>
                          </dl>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {property.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Web業界での経歴 */}
            <section className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                【Web業界での経歴】
              </h2>

              <div className="bg-gray-50 rounded-xl p-5 sm:p-6 mb-6">
                <div className="space-y-3">
                  {career.map((item, index) => (
                    <div key={index} className="flex gap-4 text-sm">
                      <span className="text-gray-500 font-medium w-20 flex-shrink-0">
                        {item.year}
                      </span>
                      <span className="text-gray-900">{item.content}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">得意領域</h3>
                <p className="text-sm text-gray-700">
                  プロジェクトマネジメント・開発ディレクション・グロースハック・CRM（マーケティング・オートメーション）・上流設計
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">フリーランス期間（5年）の主な案件</h3>
                <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                  <div className="space-y-3">
                    {freelanceProjects.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm">
                        <span className="text-gray-500 font-medium sm:w-44 flex-shrink-0">
                          {item.period}
                        </span>
                        <span className="text-gray-900">{item.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* メディア出演・執筆実績 */}
            <section className="mb-12">
              <h3 className="text-base font-bold text-gray-900 mb-4">メディア出演・執筆実績</h3>

              <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                <div className="space-y-4">
                  {mediaAppearances.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-gray-500 font-medium">
                        {item.year}：
                      </span>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                        {item.content}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 個人プロフィール */}
            <section className="mb-12">
              <h3 className="text-base font-bold text-gray-900 mb-4">個人プロフィール</h3>

              <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500 mb-1">趣味</dt>
                    <dd className="text-gray-900">キックボクシング・筋トレ・キャンプ・山登り・クロスバイク・料理・読書</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">血液型</dt>
                    <dd className="text-gray-900">A型</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">家族構成</dt>
                    <dd className="text-gray-900">妻と双子の男の子とおばあちゃん（5人暮らし）</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">現在地</dt>
                    <dd className="text-gray-900">埼玉県さいたま市大宮区のさいたま新都心駅（2024年に東京都品川区から転居）</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">ストレングスファインダー（TOP5）</dt>
                    <dd className="text-gray-900">
                      <ol className="list-decimal list-inside">
                        {strengthsFinder.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">その他</dt>
                    <dd className="text-gray-900">毎日2時間はトレーニングに当てたい</dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* お問合わせ */}
            <section className="mb-12">
              <h3 className="text-base font-bold text-gray-900 mb-4">お問合わせ</h3>

              <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                <p className="text-sm text-gray-700">
                  <a href="mailto:ooya.tech2025@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                    ooya.tech2025@gmail.com
                  </a>
                </p>
              </div>
            </section>

            {/* CTA */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <SimulatorCTA />
            </div>

            {/* 運営会社・運営者プロフィール */}
            <div className="mt-12">
              <CompanyProfileCompact />
            </div>
          </article>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
