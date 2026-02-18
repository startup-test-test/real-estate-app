import { SimulatorCTA } from '@/components/tools/SimulatorCTA';
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact';
import { Breadcrumb } from '@/components/Breadcrumb';
import { personJsonLd } from '@/lib/eeat';
import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import Link from 'next/link';


const BASE_URL = 'https://ooya.tech';

export const metadata = {
  title: '自己紹介と不動産購入実績｜大家DX',
  description: '大家DX運営者のプロフィールと不動産購入実績。2025年9月時点で7戸購入、1戸売却、現在6戸保有。開発×マーケ×不動産の掛け合わせで、再生と収益改善に強み。',
  alternates: {
    canonical: '/profile',
  },
  openGraph: {
    title: '自己紹介と不動産購入実績｜大家DX',
    description: '大家DX運営者のプロフィールと不動産購入実績。2025年9月時点で7戸購入、1戸売却、現在6戸保有。',
    url: `${BASE_URL}/profile`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '自己紹介と不動産購入実績｜大家DX',
    description: '大家DX運営者のプロフィールと不動産購入実績。2025年9月時点で7戸購入、1戸売却、現在6戸保有。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
};

export default function ProfilePage() {
  // 全物件（時系列順）
  const allProperties = [
    {
      number: 1,
      year: '2019年',
      title: '2019年：1軒目｜初めての持ち家を品川区 新築マンションを住宅ローンで購入',
      tag: '自己居住',
      tagColor: 'bg-green-100 text-green-800',
      type: '新築2LDKマンション',
      area: '東京都品川区',
      building: '62平米',
      finance: '住宅ローンにてフラット35Sでフルローンで購入',
      extraFields: [
        { label: '売却損益', value: '購入価格の155%で売却' },
      ],
      reason: '夫婦で初めて品川区の駅徒歩3分の新築の区分マンション（2LDK）を持ち家にて購入。双子の男の子が生まれて、家族の協力が必要になり、都内から埼玉県のさいたま新都心に引っ越しを決意しました。3年間住んで購入金額の155%で売却。（2025年では購入価格から約200%にまで上昇しておりました。）不動産の構造を理解したく、勉強を開始を始めました。',
      futurePlans: '不動産投資の初心者の勉強方法 / ファイナンシャルアカデミーに通う / 仲介手数料を50%にする',
      image: '/images/profile/property-1.jpg',
    },
    {
      number: 2,
      year: '2023年',
      title: '2023年：2軒目｜初めての収益物件　埼玉県東部 築古戸建を現金で購入',
      tag: '収益物件',
      tagColor: 'bg-blue-100 text-blue-800',
      type: '築約50年の築古戸建',
      area: '埼玉県東部',
      building: '75.4㎡',
      finance: '物件を現金で購入して、リフォームローンを日本政策金融公庫さんから5年融資',
      extraFields: [
        { label: '月額家賃', value: '70,000円' },
        { label: '利回り', value: '10.11%' },
        { label: '入居付期間', value: '4ヶ月' },
      ],
      reason: 'まずは小さく賃貸経営を始めて見ようと、少額の現金で買える物件にて、築古戸建を選択。5軒程内見をして購入。ゴミ撤去業者に撤去業務をして頂き、内装を間取り変更からトイレ交換、床をクッションフロア、壁のクロスを全面張り替えなどのリフォームを全て行いました。リフォーム資金は日本政策金融公庫から5年融資にて借入をしましたが、初めての法人での資金調達で金融機関に16社断られました。都内の日本政策金融公庫はNGで支店によって、見解も全く違いました。Web事業で、黒字で2期以上出しており、現金比率も結構あったのですが、築が古い事でNGの所が多く、しっかり見極めなければがならないなと。',
      futurePlans: '不動産投資の始め方 / 融資・審査事情 / 戸建て不動産投資の始め方 / 利回り計算ツール',
      image: '/images/profile/property-2.png',
    },
    {
      number: 3,
      year: '2023年',
      title: '2023年：3軒目｜埼玉県東部 築古戸建を現金で購入',
      tag: '収益物件',
      tagColor: 'bg-blue-100 text-blue-800',
      type: '築約50年の築古戸建',
      area: '埼玉県東部',
      building: '55.4㎡',
      finance: '物件は現金で購入して、リフォームローンを埼玉縣信用金庫さんからにて保証協会融資の10年融資。埼玉県制度を活用して、金利をお得に借入出来ました。県や市の保証制度はしっかり確認をするとお得です',
      extraFields: [
        { label: '月額家賃', value: '65,000円' },
        { label: '利回り', value: '10.45%' },
        { label: '入居付期間', value: '1ヶ月' },
      ],
      reason: '2軒目の埼玉県東部 築古戸建の近くでお得な物件が出た為、現金で購入。同エリアに集中することで管理効率を高める狙いがありました。こちらも同様に内装をフルリフォームして1ヶ月以内に入居付け出来ました。都内から埼玉に引っ越しをしていたので、埼玉の信用金庫の口座開設と初見でしたので、保証協会融資にて、10年間のリフォーム融資を受けました。',
      futurePlans: '物件探し・優良物件を見つける方法 / 初期費用・必要資金',
      image: '/images/profile/property-3.png',
    },
    {
      number: 4,
      year: '2024年',
      title: '2024年：4軒目｜越谷市 ファミリー区分マンションをリースバックにて購入',
      tag: '収益物件',
      tagColor: 'bg-blue-100 text-blue-800',
      type: 'ファミリー区分マンションをリースバックにて購入',
      area: '越谷市',
      building: '57.59㎡（2LDK＋S）',
      finance: '埼玉縣信用金庫さん / 15年融資にてフルローン',
      extraFields: [
        { label: '月額家賃', value: '65,000円' },
        { label: '利回り', value: '10.26%' },
        { label: '入居付期間', value: '売主がそのまま入居している為、空室期間なし' },
      ],
      reason: '築古戸建で現金を大きく使ったのと、2戸目と3戸目で少し慣れてきた為、物件購入を融資を大きく活用する方針に切り替え。割安なファミリー区分マンションをリースバックで購入し、フルローンで資金効率を重視しました。売主さんもそのまま住む為、空室期間はなしにて、賃貸契約書も「定期借家契約の2年」にしました。',
      futurePlans: 'マンションオーナーチェンジのリアル / 頭金はいくら必要？フルローンは可能？',
      image: '/images/profile/property-4.jpg',
    },
    {
      number: 5,
      year: '2024年',
      title: '2024年：5軒目｜川越市 ファミリー区分マンションをフルローンで購入',
      tag: '収益物件',
      tagColor: 'bg-blue-100 text-blue-800',
      type: 'ファミリー区分マンションをオーナーチェンジで購入',
      area: '川越市',
      building: '48.07㎡（2LDK＋S）',
      finance: '埼玉縣信用金庫さん / 15年融資にてフルローン',
      extraFields: [
        { label: '月額家賃', value: '70,000円' },
        { label: '利回り', value: '8.4%' },
      ],
      reason: '割安なオーナーチェンジ物件を発見。リフォーム不要で購入後すぐに家賃収入が得られるため、手間をかけずにポートフォリオを拡大できると判断しました。こちらも割安のオーナーチェンジのファミリー区分マンションを見つけて、買付を入れました。オーナーチェンジは築古戸建と違ってリフォームなどもする事がないので、購入してそのままです。',
      futurePlans: 'ローン金利比較・低金利で借りるコツ / キャッシュフロー計算',
      image: '/images/profile/property-5.jpg',
    },
    {
      number: 6,
      year: '2024年',
      title: '2024年：6軒目｜さいたま市浦和区 戸建をフルローンで購入',
      tag: '収益物件',
      tagColor: 'bg-blue-100 text-blue-800',
      type: '築30年の戸建をフルローンで購入',
      area: 'さいたま市浦和区',
      building: '100㎡（4LDK＋S）',
      finance: '埼玉縣信用金庫さん / 15年フルローン + 日本政策金融公庫さんリフォーム5年（100万円）',
      extraFields: [
        { label: '月額家賃', value: '155,000円' },
        { label: '利回り', value: '13.7%' },
      ],
      reason: '浦和区で路線価割れの中古戸建が出たため、資産価値の高いエリアでの収益物件として購入。グループホームの福祉施設向け賃貸で安定運用を実現しました。浦和区にて路線価の中古戸建が出た為、購入。購入後の隣人トラブルが大変でしたが、グループホームの福祉施設用さんへの賃貸をしております。リフォームを4社程あいみつを行い、スプレッドシートにてリフォームの項目を徹底的に洗い出し良質なパートナーを見つける事が出来ました。',
      futurePlans: '失敗談・経験した教訓 / 自主管理体験 / 返済比率の目安',
      image: '/images/profile/property-6.png',
    },
    {
      number: 7,
      year: '2025年',
      title: '2025年：7軒目｜さいたま市大宮区 フルリノベ戸建を住宅ローンで購入',
      tag: '自己居住',
      tagColor: 'bg-green-100 text-green-800',
      type: '築30年のフルリノベ戸建',
      area: 'さいたま市大宮区',
      building: '158㎡（5LDK＋S＋屋上付き）',
      finance: '埼玉縣信用金庫さんから住宅ローンにてオーバーローンにて購入',
      extraFields: [],
      reason: '土地の実勢価格が購入金額に近く、このエリアでこの広さの戸建・庭付き・駐車場2台はめったに出ないため、投資家目線で資産価値を見極めて即買付を入れました。さいたま新都心駅に家族5人で、戸建賃貸で住んでおりましたが、今後を考え近辺で良い物件がないかなと1年程探しておりましたが、なかなか出なく、ある時にパッとSUUMOに掲載されて、土地実勢価格が購入金額に近しい事とこのエリアでこの広さの戸建と庭付き駐車場2台はなかった為、すぐに買付を入れました。その週で4名買付が入りましたが、なんとか無事に選ばれました。',
      futurePlans: '不動産投資のメリット・デメリット',
      image: '/images/profile/property-7.jpg',
    },
  ];


  return (
    <>
      {/* Person 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <WebPageJsonLd
        name="自己紹介と不動産購入実績"
        description="大家DX運営者のプロフィールと不動産購入実績。2025年9月時点で7戸購入、1戸売却、現在6戸保有。"
        path="/profile"
        datePublished="2026-01-15"
        dateModified="2026-02-16"
        breadcrumbs={[{ name: 'プロフィール', href: '/profile' }]}
      />

      <article className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
            {/* パンくず */}
            <Breadcrumb items={[
              { label: '賃貸経営ツール 大家DX', href: '/' },
              { label: '自己紹介' },
            ]} />

            {/* 日付 */}
            <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
              <span>公開日：2026年1月15日</span>
              <span>更新日：2026年2月16日</span>
            </div>

            {/* H1タイトル */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-8">
              大家DX開発者の自己紹介 | 不動産投資実績と経歴
            </h1>

            {/* 会社サブナビゲーション */}
            <nav className="mb-8 bg-gray-50 rounded-xl p-4">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <li><Link href="/company" className="text-blue-600 hover:text-blue-800 hover:underline">&gt; 会社概要</Link></li>
                <li><Link href="/company/portfolio" className="text-blue-600 hover:text-blue-800 hover:underline">&gt; 実績・得意領域</Link></li>
                <li><Link href="/company/service" className="text-blue-600 hover:text-blue-800 hover:underline">&gt; メニュー・料金</Link></li>
                <li><span className="text-gray-900 font-medium">&gt; 自己紹介</span></li>
                <li><Link href="/media" className="text-blue-600 hover:text-blue-800 hover:underline">&gt; ブログ</Link></li>
                <li><Link href="/company/contact" className="text-blue-600 hover:text-blue-800 hover:underline">&gt; お問合わせ</Link></li>
              </ul>
            </nav>

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
                  <h2 className="text-xl sm:text-lg text-gray-900 mb-1">
                    東後 哲郎（とうご てつろう）
                  </h2>
                  <p className="text-base text-gray-900 mb-1">
                    <Link href="/company" className="text-blue-600 underline">株式会社StartupMarketing</Link> 代表取締役　1987年 宮崎生まれ
                  </p>
                  <p className="text-base text-gray-900 mb-1">不動産購入実績（都内〜埼玉7軒 / 総購入額1.7億円 / 家賃収入500万円）</p>
                  <p className="text-base text-gray-900 mb-1">賃貸経営者向けのツール「<a href="https://ooya.tech/" className="text-blue-600 underline">大家DX</a>」の企画・開発者</p>
                  <p className="text-base text-gray-900 mb-4">本業はWeb系の開発やマーケティングです（業界歴18年）</p>
                  <div className="flex items-center gap-3">
                    <a href="https://www.linkedin.com/in/tetsuro-togo-63aa7b216/" target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:text-[#004182] transition-colors" aria-label="LinkedIn">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="https://x.com/tetsurotogo" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-600 transition-colors" aria-label="X">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* メディア出演・保有資格・受講スクール */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">メディア出演</h3>
                <ul className="space-y-1 text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">●</span>
                    <span><span className="text-gray-500">2024年1月：</span><a href="/img/akiya.png" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">フジテレビ「イット！」にて、不動産賃貸業の空き家再生についてインタビュー</a></span>
                  </li>
                </ul>
                <h3 className="text-lg font-bold text-gray-900 mb-2 mt-4">保有資格</h3>
                <ul className="space-y-1 text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">●</span>
                    <span><a href="/docs/furuya-planner-certificate.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">古家再生投資プランナー[認定証]</a>（<a href="https://zenko-kyo.or.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">一般社団法人 全国古家再生推進協議会</a>）</span>
                  </li>
                </ul>
                <h3 className="text-lg font-bold text-gray-900 mb-2 mt-4">受講した不動産投資スクール</h3>
                <p className="text-base text-gray-700"><a href="https://zenko-kyo.or.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">一般社団法人 全国古家再生推進協議会</a>（2023年2月〜） / <a href="https://www.f-academy.jp/school/fudo.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ファイナンシャルアカデミー 不動産投資スクール</a>（2022年5月〜） / <a href="https://www.f-academy.jp/school/finance_strategy.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ファイナンス戦略ゼミ</a>（2024年9月〜） / <a href="https://www.yamori.co.jp/kateikyoshi" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ヤモリの家庭教師</a>（2023年12月〜2025年12月まで 現在退会）</p>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3 mt-8">経歴</h2>
              <div className="text-gray-700 text-base leading-relaxed">
                <p>1987年生まれ。デザイン専門学校を卒業後、Webデザイナーとして5年間働き、東証一部上場のマーケティングに転職。ECサイトや新規立ち上げ部署などを3年経験した後、独立をしてフリーに。2020年にWeb制作会社・マーケティング・データ分析の株式会社StartupMarketingを設立。受託だけでなく、安定的にストックビジネスを作らないと、猛勉強をして、賃貸経営を2023年に開始。2025年から週3日の働き方に変えて、3年間の試行錯誤の賃貸経営の失敗や勉強内容を「大家DX」にて執筆・開発に集中しております。</p>
              </div>

              <h2 id="origin" className="text-xl font-bold text-gray-900 mb-6 mt-8">1. 不動産投資を始めたきっかけ</h2>
              <div className="text-base text-gray-700 mb-6 leading-relaxed">
                <p>実家は曾祖父の代から大家さんを営んでおり、父も現役の大家です。2019年に住宅ローンで購入した持ち家が年々値上がりしていく経験から不動産に興味を持ち、不動産関連の書籍を数十冊読み込みました。2022年に双子が誕生し、Web事業と並行できる安定収入として不動産賃貸を選択。賃貸経営スクールを3つ受講し、2023年から収益物件の購入を開始しました。築古戸建再生物件から、戸建ての福祉施設、マンションオーナーチェンジを小さく小さく買っている「現役の小規模大家」です。2026年までに7軒の不動産取引を経験しました。</p>
              </div>
            </section>

            {/* 不動産購入実績サマリー */}
            <section className="mb-12">
              <div className="rounded-xl overflow-hidden border-2 border-blue-900">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-blue-900">
                      <th colSpan={2} className="py-4 px-4 text-white font-bold text-left text-xl">不動産購入実績 <span className="text-sm font-normal text-blue-200">※ 2026年2月時点</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 w-40 bg-gray-100 font-medium">総購入額</td><td className="py-3 px-4 text-gray-900 text-lg">約1.7億円<span className="text-sm text-gray-900 ml-2">（収益 約5,000万円 / 自己居住 約1.2億円）</span></td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">家賃収入</td><td className="py-3 px-4 text-gray-900 text-lg">500万円/年</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">入居率</td><td className="py-3 px-4 text-gray-900 text-lg">100%<span className="text-sm text-gray-900 ml-2">（2026年2月時点）</span></td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">不動産購入開始</td><td className="py-3 px-4 text-gray-900 text-lg">2019年〜</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">購入実績</td><td className="py-3 px-4 text-gray-900 text-lg">7軒<span className="text-sm text-gray-900 ml-2">（マンション3軒・戸建4軒）</span></td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">法人融資</td><td className="py-3 px-4 text-gray-900 text-lg">6回<span className="text-sm text-gray-900 ml-2">（取引金融機関：3社（埼玉の信用金庫2社・日本政策金融公庫）</span></td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">自主管理</td><td className="py-3 px-4 text-gray-900 text-lg">3件<span className="text-sm text-gray-900 ml-2">（マンション2件・戸建1件）</span></td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">リフォーム回数</td><td className="py-3 px-4 text-gray-900 text-lg">4回</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">投資エリア</td><td className="py-3 px-4 text-gray-900 text-lg">埼玉県</td></tr>
                    <tr><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium">投資スタイル</td><td className="py-3 px-4 text-gray-900 text-lg">築古再生＋戸建の福祉施設＋マンションオーナーチェンジ</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 目次 */}
            <nav className="mb-12 bg-gray-50 rounded-xl p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">目次</h3>
              <ol className="space-y-2 text-sm text-blue-600 list-decimal list-inside">
                <li><a href="#origin" className="hover:underline">不動産投資を始めたきっかけ</a></li>
                <li><a href="#properties" className="hover:underline">不動産購入の全記録（7軒）</a></li>
                <li><a href="#ooya-tech" className="hover:underline">なぜ大家DXを作ったのか</a></li>
                <li><a href="#books" className="hover:underline">影響を受けた書籍</a></li>
                <li><a href="#career" className="hover:underline">経歴・メディア出演</a></li>
                <li><a href="#personal" className="hover:underline">個人プロフィール</a></li>
                <li><a href="#contact" className="hover:underline">お問合わせ・メディア取材・執筆について</a></li>
              </ol>
            </nav>

            {/* 不動産購入の全記録 */}
            <section className="mb-12">
              <h2 id="properties" className="text-xl font-bold text-gray-900 mb-6">
                2. 不動産購入の全記録（7軒）
              </h2>

              <div className="space-y-8">
                {allProperties.map((property) => (
                  <div key={property.number}>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-snug">
                      {property.title}
                      <span className={`ml-2 text-xs font-normal ${property.tagColor} px-2 py-0.5 rounded`}>{property.tag}</span>
                    </h3>
                    <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-[280px] flex-shrink-0">
                          <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                            <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex-1 pt-2 pb-5 px-5 sm:pt-2 sm:pb-6 sm:px-6">
                          <dl className="divide-y divide-gray-300 text-base mb-4">
                            <div className="flex py-2"><dt className="text-gray-900 w-24 flex-shrink-0">物件種類</dt><dd className="text-gray-900">{property.type}</dd></div>
                            <div className="flex py-2"><dt className="text-gray-900 w-24 flex-shrink-0">エリア</dt><dd className="text-gray-900">{property.area}</dd></div>
                            <div className="flex py-2"><dt className="text-gray-900 w-24 flex-shrink-0">建物面積</dt><dd className="text-gray-900">{property.building}</dd></div>
                            <div className="flex py-2"><dt className="text-gray-900 w-24 flex-shrink-0">融資</dt><dd className="text-gray-900">{property.finance}</dd></div>
                            {property.extraFields.map((field, i) => (
                              <div key={i} className="flex py-2"><dt className="text-gray-900 w-24 flex-shrink-0">{field.label}</dt><dd className="text-gray-900">{field.value}</dd></div>
                            ))}
                          </dl>
                          <p className="text-base text-gray-700 leading-relaxed"><strong>購入した理由</strong></p>
                          <p className="text-base text-gray-700 leading-relaxed mb-4">{property.reason}</p>
                          <div className="border-t border-gray-100 pt-4 mt-4">
                            <p className="text-sm text-gray-400 mb-1">今後執筆予定：</p>
                            <p className="text-sm text-gray-400">{property.futurePlans}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* なぜ大家DXを作ったのか */}
            <section className="mb-12">
              <h2 id="ooya-tech" className="text-xl font-bold text-gray-900 mb-6">3. なぜ大家DXを作ったのか</h2>
              <div className="space-y-4 text-base text-gray-700 leading-relaxed">
                <p>私の本業はITで戦略・分析、AIを活用したりするデジタルマーケティングが主なのですが、不動産の業界は今でもFAXがあったり、電話であったり、アナログな事が多く、インターネット上のサービスも少ないので、自分が賃貸経営をする上で、クラウドで不動産関連のシミュレーションをしたり、物件管理を楽に出来ないかなと思い、「<a href="https://ooya.tech/" className="text-blue-600 hover:underline">大家DX</a>」のシミュレーションを開発しました。</p>
                <p>今後も不動産賃貸経営の課題解決ツールや、私の実体験から得た経験を読み物として届けられればと思います。</p>
              </div>
            </section>

            {/* 影響を受けた書籍 */}
            <section className="mb-12">
              <h2 id="books" className="text-xl font-bold text-gray-900 mb-6">4. 影響を受けた書籍</h2>
              <p className="text-base text-gray-700 mb-6">不動産関連の書籍を100冊以上読みましたが、その中で実際に行動が変わった本だけを厳選して紹介します。</p>

              {/* PC: テーブル表示 */}
              <div className="hidden md:block bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-blue-900">
                      <th className="py-3 px-4 text-white font-bold text-left w-28">カテゴリ</th>
                      <th className="py-3 px-4 text-white font-bold text-left">書籍名</th>
                      <th className="py-3 px-4 text-white font-bold text-left w-36">著者</th>
                      <th className="py-3 px-4 text-white font-bold text-left">感想</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top">持ち家購入</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/B00BLETB04" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">マンションは10年で買い替えなさい</a></td><td className="py-3 px-4 text-gray-900">沖 有人</td><td className="py-3 px-4 text-gray-900">マンションの適正価格が見れる「<a href="https://www.sumai-surfin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">住まいサーフィン</a>」の著者。楽街の動画でもよく出演されており、見ておりますが、具体的に数字で書かれており、都心寄りで持ち家のマンションを買われる方なら必須。実際に私も都心でマンションを購入しており、売却をする事が出来ました。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top" rowSpan={2}>不動産投資のきっかけ</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/B09S2YVD15" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">元手50万円を月収50万円に変える不動産投資法</a></td><td className="py-3 px-4 text-gray-900">小嶌 大介</td><td className="py-3 px-4 text-gray-900">グラフィックデザイナー出身の方が書かれた書籍で、とても共感しました。私もWebデザイナーからキャリアをスタートしているので、業界の過酷な労働状況から、試行錯誤してから賃貸経営まで行かれたんだなぁと。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/B00AMX1ADQ" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">300万円で大家になって地方でブラブラ暮らす法</a></td><td className="py-3 px-4 text-gray-900">加藤 ひろゆき</td><td className="py-3 px-4 text-gray-900">賃貸経営をする事で、圧倒的に自由度が手に入れられる事が羨ましいと思い、価値観や賃貸経営まで行くまでの過程が書かれています。サラリーマンから大家さんに行く方が多い理由だと思います。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top" rowSpan={3}>入門</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/4815611475" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">まずはアパート一棟、買いなさい! 資金300万円から家賃年収1000万円を生み出す極意</a></td><td className="py-3 px-4 text-gray-900">石原 博光</td><td className="py-3 px-4 text-gray-900">自己資金が300万円でもアパートが買えるんだと、知った書籍。実際に購入している写真や金額なども載っており、高利回りの手法を広めた不動産投資手法が書かれています。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/4800720311" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">世界一やさしい 不動産投資の教科書 1年生</a></td><td className="py-3 px-4 text-gray-900">浅井 佐知子</td><td className="py-3 px-4 text-gray-900">初心者向けに優しく書かれた、不動産投資の教科書の書籍です。初心者の物件の選び方から、5年後の売却も視野に入れる方法など、とても参考になりました。著者も小さな物件を現金購入する方法をお勧めしておりますが、私も最初は低リスクでいく為に、現金購入にて進めていきました。とても体型的に書かれており、参考になります。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/4478002908" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">知識ゼロでも大丈夫! 不動産投資の学校[入門編]</a></td><td className="py-3 px-4 text-gray-900">日本ファイナンシャルアカデミー</td><td className="py-3 px-4 text-gray-900">私も不動産投資スクールで通った、「日本ファイナンシャルアカデミー」の初級者向けの書籍。具体的に数字で書かれており、最寄駅が乗降者数「5万人」で徒歩15分以内を選びましょうなどと書かれており、具体的です。普段私も、乗降者数や徒歩圏内を指標にしております。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top" rowSpan={3}>戸建投資</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/486680095X" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">空き家・古家 不動産投資で利益をつくる</a></td><td className="py-3 px-4 text-gray-900">大熊 重之</td><td className="py-3 px-4 text-gray-900">私も加入している（一社）全国古家再生推進協議会の理事長の書籍。中小零細、フリーランスまで少予算から始められると、帯に書かれており、小さな経営者向けに書かれています。私も法人にして、何か新しい売上を作らないとなぁと考えている時に、読んだ書籍です。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/B08SVTDZVL" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">高利回り戸建て投資術</a></td><td className="py-3 px-4 text-gray-900">サーファー薬剤師</td><td className="py-3 px-4 text-gray-900">戸建投資家の有名Youtubeの「サーファー薬剤師」さん。戸建投資に特化しており、買方や融資のやり方などもとても参考になりました。<a href="https://www.youtube.com/channel/UCT2ttoUX9gQ598oG9Jk_jdg" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Youtube</a>でも実際の融資体験などが語られており、参考になります。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/4478680337" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">もう、アパート投資はするな! 利回り20%をたたき出す戸建賃貸運用法</a></td><td className="py-3 px-4 text-gray-900">浦田 健</td><td className="py-3 px-4 text-gray-900">不動産投資家の戸建賃貸を広めた方の書籍です。戸建賃貸は客付けがしやすいのと積算も出やすいので、私も戸建を中心に勉強をして、2026年までで4軒買っております。また浦田さんの<a href="https://www.youtube.com/%E3%82%A6%E3%83%A9%E3%82%B1%E3%83%B3%E4%B8%8D%E5%8B%95%E7%94%A3-%E6%B5%A6%E7%94%B0%E5%81%A5%E5%85%AC%E5%BC%8F" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Youtube</a>もノウハウがたくさん語られており、たくさん参考にしました。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top">マンションオーナーチェンジ</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/479910330X" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">不動産投資 家賃収入＆売却益 両取りのルール</a></td><td className="py-3 px-4 text-gray-900">束田 光陽</td><td className="py-3 px-4 text-gray-900">私も通ったファイナンシャルアカデミーの講師の束田さんの書籍です。投資手法で少し変わった手法のマンションオーナーチェンジの手法が書かれております。知っている方は上場企業のスターマイカ式とかいいますが、私もマンションオーナーチェンジは2026年までで2軒買っており、とてもいい手法です。何よりも買ってから客付けやリフォームもいらなく、家賃もすぐ入ってくるので、いいですね。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top">収支・利回り</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/4774188107" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Excelでできる 不動産投資「収益計算」のすべて</a></td><td className="py-3 px-4 text-gray-900">玉川 陽介</td><td className="py-3 px-4 text-gray-900">不動産投資をやっていくと、キャッシュフローだけに目がいきますが、その計算ってどうなのかなぁと自分でも疑っていた時に読んだ書籍です。書籍でもキャッシュフローが全てではないと書かれていますが、本当にそうで、土地の含み益が重要であったりします。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top" rowSpan={2}>融資・資金調達</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/4866365730" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">銀行員だった大家が教える! 不動産投資 融資攻略バイブル</a></td><td className="py-3 px-4 text-gray-900">半沢大家</td><td className="py-3 px-4 text-gray-900">銀行員の方が書かれた、融資に特化した書籍です。融資は戦略的に決算書を作っていかないと資金調達が出来なくなるので、不動産経営では最重要です。「定量評価」と「定性評価」のポイントも書かれており、参考になります。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/4797368233" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">たった4年 学生大家から純資産6億円を築いた私の投資法 借りて増やす技術</a></td><td className="py-3 px-4 text-gray-900">石渡 浩</td><td className="py-3 px-4 text-gray-900">私も最初にリフォーム資金を調達する時に、16社断られたのですが、資金調達に特化した、ノウハウが書かれています。信用金庫さんとどうやって関係構築をしていくのかが、戦略的に書かれております。</td></tr>
                    <tr className="border-b border-gray-200"><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top">空室対策</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/B01L1HLDU6" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">あなたのアパート・マンションを即満室にする方法</a></td><td className="py-3 px-4 text-gray-900">浦田 健</td><td className="py-3 px-4 text-gray-900">私が空室期間に悩んだ所、読んだ書籍です。不動産賃貸の業界構造もよくわかっていなく、内見者を集める方法や成約率を上げる方法や家賃アップ術が書かれております。</td></tr>
                    <tr><td className="py-3 px-4 text-gray-900 bg-gray-100 font-medium align-top">リフォーム</td><td className="py-3 px-4 text-gray-900"><a href="https://www.amazon.co.jp/dp/448086427X" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">リフォームコスト削減ノウハウ虎の穴</a></td><td className="py-3 px-4 text-gray-900">小林 大祐</td><td className="py-3 px-4 text-gray-900">私が戸建賃貸をリフォームする時に読んだ書籍です。4社程リフォーム会社にて相見積もりをしましたが、会社によって金額違ったりするので、こちらの書籍を読みながら、改善をしに行きました。リフォームコスト削減の中身が書かれています。</td></tr>
                  </tbody>
                </table>
              </div>

              {/* スマホ: リスト表示 */}
              <div className="md:hidden space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">持ち家購入</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/B00BLETB04" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">マンションは10年で買い替えなさい</a><span className="text-sm text-gray-500 ml-1">/ 沖 有人</span></p>
                  <p className="text-base text-gray-900 mt-1">マンションの適正価格が見れる「<a href="https://www.sumai-surfin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">住まいサーフィン</a>」の著者。楽街の動画でもよく出演されており、具体的に数字で書かれており、都心寄りで持ち家のマンションを買われる方なら必須。実際に私も都心でマンションを購入しており、売却をする事が出来ました。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">不動産投資のきっかけ</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/B09S2YVD15" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">元手50万円を月収50万円に変える不動産投資法</a><span className="text-sm text-gray-500 ml-1">/ 小嶌 大介</span></p>
                  <p className="text-base text-gray-900 mt-1">グラフィックデザイナー出身の方が書かれた書籍で、とても共感しました。私もWebデザイナーからキャリアをスタートしているので、業界の過酷な労働状況から、試行錯誤してから賃貸経営まで行かれたんだなぁと。</p>
                  <p className="text-base text-gray-900 mt-1"><a href="https://www.amazon.co.jp/dp/B00AMX1ADQ" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">300万円で大家になって地方でブラブラ暮らす法</a><span className="text-sm text-gray-500 ml-1">/ 加藤 ひろゆき</span></p>
                  <p className="text-base text-gray-900 mt-1">賃貸経営をする事で、圧倒的に自由度が手に入れられる事が羨ましいと思い、価値観や賃貸経営まで行くまでの過程が書かれています。サラリーマンから大家さんに行く方が多い理由だと思います。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">入門</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/4815611475" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">まずはアパート一棟、買いなさい! 資金300万円から家賃年収1000万円を生み出す極意</a><span className="text-sm text-gray-500 ml-1">/ 石原 博光</span></p>
                  <p className="text-base text-gray-900 mt-1">自己資金が300万円でもアパートが買えるんだと、知った書籍。実際に購入している写真や金額なども載っており、高利回りの手法を広めた不動産投資手法が書かれています。</p>
                  <p className="text-base text-gray-900 mt-1"><a href="https://www.amazon.co.jp/dp/4800720311" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">世界一やさしい 不動産投資の教科書 1年生</a><span className="text-sm text-gray-500 ml-1">/ 浅井 佐知子</span></p>
                  <p className="text-base text-gray-900 mt-1">初心者向けに優しく書かれた、不動産投資の教科書の書籍です。初心者の物件の選び方から、5年後の売却も視野に入れる方法など、とても参考になりました。</p>
                  <p className="text-base text-gray-900 mt-1"><a href="https://www.amazon.co.jp/dp/4478002908" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">知識ゼロでも大丈夫! 不動産投資の学校[入門編]</a><span className="text-sm text-gray-500 ml-1">/ 日本ファイナンシャルアカデミー</span></p>
                  <p className="text-base text-gray-900 mt-1">私も不動産投資スクールで通った、「日本ファイナンシャルアカデミー」の初級者向けの書籍。具体的に数字で書かれており、最寄駅が乗降者数「5万人」で徒歩15分以内を選びましょうなどと書かれており、具体的です。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">戸建投資</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/486680095X" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">空き家・古家 不動産投資で利益をつくる</a><span className="text-sm text-gray-500 ml-1">/ 大熊 重之</span></p>
                  <p className="text-base text-gray-900 mt-1">私も加入している（一社）全国古家再生推進協議会の理事長の書籍。中小零細、フリーランスまで少予算から始められると、帯に書かれており、小さな経営者向けに書かれています。</p>
                  <p className="text-base text-gray-900 mt-1"><a href="https://www.amazon.co.jp/dp/B08SVTDZVL" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">高利回り戸建て投資術</a><span className="text-sm text-gray-500 ml-1">/ サーファー薬剤師</span></p>
                  <p className="text-base text-gray-900 mt-1">戸建投資家の有名Youtubeの「サーファー薬剤師」さん。戸建投資に特化しており、買方や融資のやり方などもとても参考になりました。</p>
                  <p className="text-base text-gray-900 mt-1"><a href="https://www.amazon.co.jp/dp/4478680337" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">もう、アパート投資はするな! 利回り20%をたたき出す戸建賃貸運用法</a><span className="text-sm text-gray-500 ml-1">/ 浦田 健</span></p>
                  <p className="text-base text-gray-900 mt-1">不動産投資家の戸建賃貸を広めた方の書籍です。戸建賃貸は客付けがしやすいのと積算も出やすいので、私も戸建を中心に勉強をして、2026年までで4軒買っております。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">マンションオーナーチェンジ</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/479910330X" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">不動産投資 家賃収入＆売却益 両取りのルール</a><span className="text-sm text-gray-500 ml-1">/ 束田 光陽</span></p>
                  <p className="text-base text-gray-900 mt-1">私も通ったファイナンシャルアカデミーの講師の束田さんの書籍です。マンションオーナーチェンジの手法が書かれております。私もマンションオーナーチェンジは2026年までで2軒買っており、とてもいい手法です。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">収支・利回り</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/4774188107" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Excelでできる 不動産投資「収益計算」のすべて</a><span className="text-sm text-gray-500 ml-1">/ 玉川 陽介</span></p>
                  <p className="text-base text-gray-900 mt-1">不動産投資をやっていくと、キャッシュフローだけに目がいきますが、その計算ってどうなのかなぁと自分でも疑っていた時に読んだ書籍です。キャッシュフローが全てではないと書かれていますが、本当にそうで、土地の含み益が重要であったりします。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">融資・資金調達</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/4866365730" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">銀行員だった大家が教える! 不動産投資 融資攻略バイブル</a><span className="text-sm text-gray-500 ml-1">/ 半沢大家</span></p>
                  <p className="text-base text-gray-900 mt-1">銀行員の方が書かれた、融資に特化した書籍です。融資は戦略的に決算書を作っていかないと資金調達が出来なくなるので、不動産経営では最重要です。</p>
                  <p className="text-base text-gray-900 mt-1"><a href="https://www.amazon.co.jp/dp/4797368233" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">たった4年 学生大家から純資産6億円を築いた私の投資法 借りて増やす技術</a><span className="text-sm text-gray-500 ml-1">/ 石渡 浩</span></p>
                  <p className="text-base text-gray-900 mt-1">私も最初にリフォーム資金を調達する時に、16社断られたのですが、資金調達に特化した、ノウハウが書かれています。信用金庫さんとどうやって関係構築をしていくのかが、戦略的に書かれております。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">空室対策</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/B01L1HLDU6" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">あなたのアパート・マンションを即満室にする方法</a><span className="text-sm text-gray-500 ml-1">/ 浦田 健</span></p>
                  <p className="text-base text-gray-900 mt-1">私が空室期間に悩んだ所、読んだ書籍です。不動産賃貸の業界構造もよくわかっていなく、内見者を集める方法や成約率を上げる方法や家賃アップ術が書かれております。</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-500 mb-2">リフォーム</p>
                  <p className="text-base text-gray-900"><a href="https://www.amazon.co.jp/dp/448086427X" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">リフォームコスト削減ノウハウ虎の穴</a><span className="text-sm text-gray-500 ml-1">/ 小林 大祐</span></p>
                  <p className="text-base text-gray-900 mt-1">私が戸建賃貸をリフォームする時に読んだ書籍です。4社程リフォーム会社にて相見積もりをしましたが、会社によって金額違ったりするので、こちらの書籍を読みながら、改善をしに行きました。</p>
                </div>
              </div>
            </section>

            {/* 経歴・メディア出演 */}
            <section className="mb-12">
              <h2 id="career" className="text-xl font-bold text-gray-900 mb-6">
                5. 経歴・メディア出演
              </h2>

              <div className="bg-gray-50 rounded-xl p-5 sm:p-6 mb-6">
                <div className="space-y-3">
                  {[
                    { year: '1987年', content: '宮崎県生まれ' },
                    { year: '2000年', content: '中学生時に趣味でサイト制作開始' },
                    { year: '2007年', content: '九州デザイン専門学校 総合デザイン学科 卒業' },
                    { year: '2008年', content: '化粧品メーカー販売促進のデザイン担当' },
                    { year: '2010年', content: 'イギリス・オーストラリア就業・インターン' },
                    { year: '2012年', content: '制作会社で大手メーカーデザイン担当' },
                    { year: '2013年', content: '東証一部上場企業マーケティング事業部' },
                    { year: '2016年', content: 'フリーランスのWebディレクター・デザイナーとして独立' },
                    { year: '2020年', content: '法人化、株式会社StartupMarketing設立' },
                    { year: '2023年', content: '不動産投資を開始（第1号物件購入）' },
                    { year: '2025年', content: '大家DXをリリース、7戸目購入' },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 text-base">
                      <span className="text-gray-500 font-medium w-20 flex-shrink-0">{item.year}</span>
                      <span className="text-gray-900">{item.content}</span>
                    </div>
                  ))}
                </div>
                <p className="text-base mt-3"><Link href="/company/portfolio" className="text-blue-600 underline">&rarr; 実績・経歴の詳細はこちら</Link></p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">メディア出演・執筆実績</h3>
                <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="text-base"><span className="text-gray-500 font-medium">2024年1月：</span><a href="/img/akiya.png" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">フジテレビ「イット！」にて、不動産賃貸業の空き家再生についてインタビュー</a></div>
                    <div className="mt-2">
                      <img src="/img/akiya.png" alt="フジテレビ「イット！」出演時の様子" className="rounded-lg border border-gray-200 max-w-full sm:max-w-sm" />
                    </div>
                    <div className="text-base"><span className="text-gray-500 font-medium">2020年5月：</span><a href="https://offers.jp/media/sidejob/workstyle/a_1862" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">株式会社overflow「フリーランスWebディレクターのキャリアと案件の進め方」</a></div>
                    <div className="text-base"><span className="text-gray-500 font-medium">2019年4月：</span><a href="https://www.shibuyamov.com/interviews/webyour-times.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">渋谷ヒカリエ Creative Lounge MOV インタビュー</a></div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">所属・加盟団体</h3>
              <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                <ul className="space-y-1 text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">●</span>
                    <span><a href="https://www.saitamadx.com/dx-partner/solution/348/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">埼玉県DXパートナー</a> / <a href="https://www.tokyo-cci.or.jp/shachonet/profile/2454.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">東京商工会議所</a> / <a href="https://www.amatias.com/asp/navi.asp?s_code=S0006864" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">さいたま商工会議所</a> / <a href="https://stib.jp/member/name-list/?s=StartupMarketing" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">さいたま観光国際協会</a> / <a href="https://www.city.saitama.lg.jp/006/007/002/008/p062519.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">さいたま市CS・SDGsパートナーズ</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">●</span>
                    <span><a href="https://www.freelance-jp.org/talents/12828" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">一般社団法人プロフェッショナル&amp;パラレルキャリア・フリーランス協会</a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">●</span>
                    <span><a href="https://www.sysadmingroup.jp/sandoukigyo/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">システム管理者の会</a></span>
                  </li>
                </ul>
                <p className="text-base mt-3"><Link href="/company" className="text-blue-600 underline">&rarr; 会社概要を見る</Link></p>
              </div>
            </section>

            {/* 個人プロフィール */}
            <section id="personal" className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">6. 個人プロフィール</h2>
              <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                <dl className="space-y-3 text-base">
                  <div><dt className="text-gray-500 mb-1">家族構成</dt><dd className="text-gray-900">妻と双子の男の子とおばあちゃん（5人暮らし）</dd></div>
                  <div><dt className="text-gray-500 mb-1">趣味</dt><dd className="text-gray-900">キックボクシング・筋トレ・キャンプ・山登り・読書</dd></div>
                  <div><dt className="text-gray-500 mb-1">現在地</dt><dd className="text-gray-900">埼玉県さいたま市大宮区（さいたま新都心駅）</dd></div>
                </dl>
              </div>
            </section>

            {/* お問合わせ・メディア取材・執筆について */}
            <section id="contact" className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">7. お問合わせ・メディア取材・執筆について</h2>
              <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                <p className="text-base text-gray-700 mb-4">不動産投資・空き家再生・賃貸経営に関するお問い合わせ・取材・登壇・寄稿のご依頼を受け付けております。</p>
                <p className="text-base"><Link href="/company/contact" className="text-blue-600 underline">&rarr; お問い合わせフォームはこちら</Link></p>
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
    </>
  );
}
