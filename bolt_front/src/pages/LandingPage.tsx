import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  CheckCircle,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import BlogPosts from '../components/BlogPosts';
import '../styles/animations.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '現役大家が開発した不動産投資シミュレーター｜大家DX';
  }, []);

  const personas = [
    {
      id: 'fujita',
      image: '/img/people_1.png',
      color: 'from-blue-500 to-blue-700',
      title: '課題1.\nシミュレーションに時間がかかる',
      problem: '良い物件を発見したのだが、Excelでのシミュレーションに時間がかかる。他にも周辺調査や銀行書類提出を作らないといけない。',
      solution: '物件情報入力で即分析',
      story: '7物件のExcel管理に限界。シミュレーション作成に毎回2時間かかって、家族時間を削るのが辛い。',
      features: [] as { icon: any; title: string; desc: string }[]
    },
    {
      id: 'yamamoto',
      image: '/img/people_2.png',
      color: 'from-pink-500 to-rose-700',
      title: '課題2.\n表面利回りだけでは判断できない',
      problem: '減価償却・税金・修繕・出口まで入れた実質収益性（IRR/DSCR/NOI）で見たいが、Excelではモデルが複雑すぎる。',
      solution: 'スマホで完結、夫婦で共有',
      story: '育児の合間での物件管理が大変。銀行訪問も娘連れで効率悪い。復職後の両立が不安。',
      features: [] as { icon: any; title: string; desc: string }[]
    },
    {
      id: 'sato',
      image: '/img/people_3.png',
      color: 'from-green-500 to-green-700',
      title: '課題3.\n金利・空室・家賃下落の\n感度が取れない',
      problem: '金利+0.5%／空室+5%／家賃-3%で35年CFやDSCRがどこで赤字化するのか、しきい値を知りたい。',
      solution: '大規模対応、事業承継準備',
      story: '58室の管理が限界。修繕履歴の把握も困難で、息子への引き継ぎ準備も進まない。',
      features: [] as { icon: any; title: string; desc: string }[]
    }
  ];




  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white/75 backdrop-blur-md border-b border-gray-200/30 md:fixed md:top-0 md:left-0 md:right-0 md:z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-10 w-auto" />
            </div>
            <div className="flex items-center space-x-6">
              {/* ナビゲーションメニュー */}
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  大家DXの特徴
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  料金
                </a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                  よくある質問
                </a>
                <a href="#news" className="text-gray-600 hover:text-gray-900 transition-colors">
                  ニュース
                </a>
                <a href="https://ooya.tech/media/" className="text-gray-600 hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                  メディア
                </a>
              </nav>
              
              {/* ログイン・サインアップボタン */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  10秒で無料登録
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  ログイン
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ヘッダー固定時のスペーサー（PC版のみ） */}
      <div className="hidden md:block h-[88px]"></div>

      {/* ヒーローセクション */}
      <section id="about" className="py-16 bg-white bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(/img/background_001.jpg)'}}>
        {/* 背景オーバーレイ */}
        <div className="absolute inset-0 bg-white opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左側：メインコピー */}
            <div className="text-left">
              <div className="mb-6">
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8" style={{ lineHeight: '1.4' }}>
                <span className="text-3xl md:text-4xl lg:text-5xl" style={{ fontSize: '85%' }}>現役大家が開発した</span><br />
                <span className="text-5xl md:text-6xl lg:text-7xl">不動産投資<br />シミュレーター</span>
              </h1>
              <div className="text-3xl lg:text-4xl text-gray-900 mb-6" style={{paddingLeft: '10px', paddingRight: '10px'}}>
                <p className="mb-4 relative inline-block">
                  Excelで半日かかる収支計算、
                  <span className="absolute left-0 w-full h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-8px'}}></span>
                </p>
                <br />
                <p className="relative inline-block">
                  「大家DX」なら60秒で解決
                  <span className="absolute left-0 w-full h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-8px', animationDelay: '0.5s'}}></span>
                </p>
              </div>
              <p className="text-lg lg:text-xl text-gray-700 mb-10 leading-relaxed" style={{paddingLeft: '10px', paddingRight: '10px'}}>
                収入・経費・税金・返済・残債・自己資金回収率を<br />
                年ごとに可視化。35年の推移がひと目でわかる。
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-xl font-semibold inline-flex items-end justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                10秒で無料登録<span className="text-base ml-1 pb-0.5">（クレカ不要）</span>
                <ArrowRight className="h-5 w-5 ml-2 mb-0.5" />
              </button>
            </div>
            
            {/* 右側：画像 */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="/img/kakushin_img01.png"
                alt="大家DX メインビジュアル"
                className="w-full h-auto max-w-3xl transform"
                style={{transform: 'scale(1.4) translateX(30px)', marginLeft: '20px'}}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-gray-500';
                  fallback.textContent = 'メインビジュアル';
                  target.parentNode?.appendChild(fallback);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-lg text-blue-600 font-semibold mb-2">What is 大家DX！</p>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-12 leading-tight">
              大家DXの3つの特徴
            </h2>
          </div>
          
          {/* 3つの特徴を横並び */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* 特徴1 */}
            <div className="text-center px-6 py-3 border-2 border-gray-200 rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">01</div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                35年のキャッシュフローを<br />
                グラフと表で可視化
              </h3>
              <div className="flex justify-center">
                <img
                  src="/img/tokuchou01.jpg"
                  alt="35年のキャッシュフローを可視化"
                  className="w-full h-48 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* 特徴2 */}
            <div className="text-center px-6 py-3 border-2 border-gray-200 rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">02</div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                物件のステータスを<br />
                一元管理
              </h3>
              <div className="flex justify-center">
                <img
                  src="/img/tokuchou02.jpg"
                  alt="物件のステータスを一元管理"
                  className="w-full h-48 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* 特徴3 */}
            <div className="text-center px-6 py-3 border-2 border-gray-200 rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">03</div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                金融機関に提出資料も<br />
                1クリックでPDF保存
              </h3>
              <div className="flex justify-center">
                <img
                  src="/img/tokuchou03.jpg"
                  alt="金融機関に提出資料も1クリックでPDF保存"
                  className="w-full h-48 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 機能詳細セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 機能1 */}
          <div className="flex flex-col mb-32">
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <div className="w-full lg:w-1/3">
                <div>
                  <div className="text-6xl lg:text-7xl font-bold text-gray-900 mb-4">01</div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    35年のキャッシュフローを<br />
                    グラフと表で可視化
                  </h3>
                  <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                    収入・経費・税金・返済・残債・自己資金回収率を年ごとに表示。
                  </p>
                  <p className="text-sm lg:text-base text-gray-600">
                    各年度の重要指標を年次で可視化。投資判断を強力にサポート。
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
              <video
                src="/img/tokuchou_01.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  // エラー時は静止画にフォールバック
                  const img = document.createElement('img');
                  img.src = '/img/tokuchou01.jpg';
                  img.alt = '特徴1: 35年のキャッシュフローを可視化';
                  img.className = target.className;
                  target.parentNode?.replaceChild(img, target);
                }}
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              </div>
            </div>
          </div>

          {/* 機能2 */}
          <div className="flex flex-col mb-32">
            <div className="flex flex-col lg:flex-row-reverse items-start gap-8 mb-8">
              <div className="w-full lg:w-1/3">
                <div>
                  <div className="text-6xl lg:text-7xl font-bold text-gray-900 mb-4">02</div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    物件のステータスを<br />
                    一元管理
                  </h3>
                  <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                    検討中／内見予定／買付／保有中／取得済みを保存。
                  </p>
                  <p className="text-sm lg:text-base text-gray-600">
                    URL・写真・メモや償却まで保存。投資情報を整理。
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
              <video
                src="/img/tokuchou_02.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  // エラー時は静止画にフォールバック
                  const img = document.createElement('img');
                  img.src = '/img/tokuchou02.jpg';
                  img.alt = '特徴2: 物件のステータス管理';
                  img.className = target.className;
                  target.parentNode?.replaceChild(img, target);
                }}
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              </div>
            </div>
          </div>

          {/* 機能3 */}
          <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <div className="w-full lg:w-1/3">
                <div>
                  <div className="text-6xl lg:text-7xl font-bold text-gray-900 mb-4">03</div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    金融機関に提出資料も<br />
                    1クリックでPDF保存
                  </h3>
                  <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                    前提・計算式つきで主要指標／年次CF／3価をレポート化。
                  </p>
                  <p className="text-sm lg:text-base text-gray-600">
                    銀行が重視する指標を整理。融資審査資料として活用可能。
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
              <video
                src="/img/tokuchou_03.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  // エラー時は静止画にフォールバック
                  const img = document.createElement('img');
                  img.src = '/img/tokuchou03.jpg';
                  img.alt = '特徴3: ワンクリックでPDF保存';
                  img.className = target.className;
                  target.parentNode?.replaceChild(img, target);
                }}
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 課題セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-lg text-blue-600 font-semibold mb-5">Top 3 Pain Points for Real Estate Investors</p>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              多くの大家さんが直面する3つの課題
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {personas.map((persona) => (
              <div key={persona.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center">
                {/* ペルソナ画像 */}
                <div className="mb-6 flex flex-col items-center">
                  <div className="w-40 h-32 mx-auto mb-5">
                    <img 
                      src={persona.image} 
                      alt="ペルソナ画像"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOUI5Qjk5Ij4KPHA+VXNlcjwvcD4KPC9zdmc+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                </div>
                
                {/* タイトル */}
                {persona.title && (
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900 whitespace-pre-line">{persona.title}</h4>
                  </div>
                )}
                
                {/* 悩み */}
                <div className="mb-6">
                  <p className="text-gray-900 mb-3 text-lg">{persona.problem}</p>
                </div>
                
                
                {/* 機能リスト */}
                {persona.features.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {persona.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${persona.color}`}>
                          <feature.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <h5 className="font-medium text-gray-900 text-lg">{feature.title}</h5>
                          <p className="text-gray-600 text-base">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            ))}
          </div>
          
          {/* 統一CTA */}
          <div className="text-center mt-12">
            <p className="text-3xl lg:text-4xl text-gray-700 relative inline-block">
              どのタイプでも、<span className="font-bold text-blue-600">1分でシミュレーション体験</span>できます
              <span className="absolute left-0 w-full h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-8px'}}></span>
            </p>
          </div>
        </div>
      </section>

      {/* ブログ記事セクション */}
      <BlogPosts />

      {/* 料金プランセクション */}
      <section id="pricing" className="py-16 bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(/img/background_002.jpg)'}}>
        {/* 背景オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-white/60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <p className="text-lg text-blue-600 font-semibold mb-5">Pricing Plans</p>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              成長に合わせた料金プラン
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed">
              初心者から大規模投資家まで。投資規模に応じて最適なプランを選択できます。
            </p>
          </div>
          
          {/* 比較表形式のプラン */}
          <div className="overflow-x-auto pt-4">
            <table className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-xl border border-gray-200">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b-2 border-gray-200"></th>
                  <th className="p-4 border-b-2 border-gray-200 bg-white">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">フリープラン</h3>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-4xl font-bold text-gray-900">¥0</span>
                        <span className="text-lg text-gray-600 ml-1">/月</span>
                      </div>
                      <p className="text-sm text-gray-600">個人利用に最適</p>
                    </div>
                  </th>
                  <th className="p-4 border-b-2 border-blue-500 bg-blue-50 relative">
                    <div className="text-center">
                      <div className="inline-block mb-2">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                          人気プラン
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">ベーシックプラン</h3>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-4xl font-bold text-gray-900">¥2,980</span>
                        <span className="text-lg text-gray-600 ml-1">/月</span>
                      </div>
                      <p className="text-sm text-gray-600">個人・小規模法人向け</p>
                    </div>
                  </th>
                  <th className="p-4 border-b-2 border-purple-500 bg-purple-50 relative">
                    <div className="text-center">
                      <div className="inline-block mb-2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Coming Soon
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">プロプラン</h3>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-4xl font-bold text-gray-400">¥9,800</span>
                        <span className="text-lg text-gray-400 ml-1">/月</span>
                      </div>
                      <p className="text-sm text-gray-500">法人・プロ投資家向け</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 bg-white">
                  <td className="p-4 text-gray-700 font-medium border-r border-gray-200">シミュレーション計算</td>
                  <td className="p-4 text-center text-gray-600 font-semibold bg-white">月5件まで</td>
                  <td className="p-4 text-center bg-blue-50 font-bold text-blue-600 border-x border-gray-200">無制限</td>
                  <td className="p-4 text-center bg-purple-50 font-bold text-purple-600">無制限</td>
                </tr>
                <tr className="border-b border-gray-200 bg-white">
                  <td className="p-4 text-gray-700 font-medium border-r border-gray-200">全機能の利用・データ保存</td>
                  <td className="p-4 text-center bg-white">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center bg-blue-50 border-x border-gray-200">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center bg-purple-50">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 bg-white">
                  <td className="p-4 text-gray-700 font-medium border-r border-gray-200">
                    <div>
                      AI市場分析
                      <span className="ml-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">※ 現在開発中です。</div>
                  </td>
                  <td className="p-4 text-center bg-white">
                    <div className="text-gray-400 text-sm">−</div>
                  </td>
                  <td className="p-4 text-center bg-blue-50 border-x border-gray-200">
                    <div className="text-gray-400 text-sm">−</div>
                  </td>
                  <td className="p-4 text-center bg-purple-50">
                    <CheckCircle className="h-5 w-5 text-purple-500 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="p-4 text-gray-700 font-medium border-r border-gray-200">
                    <div>
                      AIエージェント
                      <span className="ml-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">※ 現在開発中です。</div>
                  </td>
                  <td className="p-4 text-center bg-white">
                    <div className="text-gray-400 text-sm">−</div>
                  </td>
                  <td className="p-4 text-center bg-blue-50 border-x border-gray-200">
                    <div className="text-gray-400 text-sm">−</div>
                  </td>
                  <td className="p-4 text-center bg-purple-50">
                    <CheckCircle className="h-5 w-5 text-purple-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 統一CTAボタン */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/signup')}
              className="px-14 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-2xl font-semibold flex items-end justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mx-auto"
            >
              10秒で無料登録<span className="text-lg ml-1 pb-0.5">（クレカ不要）</span>
              <ArrowRight className="h-6 w-6 ml-2 mb-1" />
            </button>
          </div>
        </div>
      </section>

      {/* よくある質問セクション */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              よくある質問
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q1. どんな分析ができるサービスですか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                物件の収益性を約1分で総合的に分析できます。
                主要指標（IRR：内部収益率、DSCR：借入返済余裕度、LTV：借入比率、NOI：実質収益）から
                35年間のキャッシュフロー、3つの評価額まで一括計算。
                銀行提出用のPDF出力にも対応しています。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q2. 無料プランではどこまで利用できますか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                無料プランでは月5件まで物件シミュレーションが可能です。
                基本的な収益指標の確認とPDFレポート出力（ウォーターマーク付）をご利用いただけます。
                物件の保存・共有機能や詳細な分析機能は有料プランでご提供しています。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q3. リスク分析（感度分析）は可能ですか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                はい、リスクシナリオの検証が簡単にできます。
                例えば「金利が0.5%上昇」「空室率が5%増加」「家賃が3%下落」した場合の
                収支への影響をワンクリックで確認。
                キャッシュフローが赤字になる条件も把握できます。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q4. スマートフォンでも利用できますか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                はい、完全にモバイル対応しています。
                外出先での物件内見時にその場でシミュレーション、
                写真やURLのメモ保存、複数物件の比較検討まで、
                すべての機能をスマートフォンで快適にご利用いただけます。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q5. データは安全に管理されていますか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                お客様のデータは厳重に保護されています。
                すべての通信はTLS暗号化、保存データはサーバー側で安全に管理。
                不要になったデータはワンクリックで完全削除でき、
                削除後はバックアップを除き復元されることはありません。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q6. 解約はいつでもできますか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                はい、いつでも解約可能です。
                解約手続き後も当月末まではサービスをご利用いただけ、
                翌月以降の課金は自動的に停止されます。
                複雑な手続きは不要で、マイページから簡単に解約できます。
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q7. どのような支払い方法がありますか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                クレジットカード決済のみ対応しております。
                決済システムは世界的に信頼される大手決済プラットフォーム「Stripe」を使用しており、
                お客様のカード情報は直接弊社サーバーに保存されることはありません。
                安全性の高い決済環境でご利用いただけます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ニュースセクション */}
      <section id="news" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              ニュース
            </h2>
          </div>
          <div className="bg-white">
            {/* ニュース項目 */}
            <div className="space-y-0">
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium">
                    リリース
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.08.19</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    大家DXをBETA版でリリースしました。
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer id="contact" className="bg-gray-100 text-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-4 md:mb-0">
              <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-8 w-auto mb-2" style={{ mixBlendMode: 'multiply' }} />
              <div className="text-xs text-gray-600">
                <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 block">
                  株式会社StartupMarketing
                </a>
                <span className="text-gray-500">〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <nav className="flex items-center space-x-6 mb-2">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  大家DXの特徴
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  料金
                </a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  よくある質問
                </a>
                <a href="#news" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  ニュース
                </a>
                <a href="https://ooya.tech/media/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm" target="_blank" rel="noopener noreferrer">
                  メディア
                </a>
                <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  お問合せ
                </a>
              </nav>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-4 text-xs mb-1">
                  <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    運営会社
                  </a>
                  <a href="/terms" className="text-gray-500 hover:text-gray-700">
                    利用規約
                  </a>
                  <a href="/privacy" className="text-gray-500 hover:text-gray-700">
                    個人情報保護方針
                  </a>
                </div>
                <div className="text-xs text-gray-500">
                  © 2025 大家DX. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;