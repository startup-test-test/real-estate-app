import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  CheckCircle,
  ArrowRight,
  Smartphone
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ホーム | 大家DX - 現役大家が開発した賃貸経営DX';
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


  const features = [
    {
      icon: Calculator,
      title: "特徴1. 35年CF可視化",
      description: "収入・経費・税金・返済・残債・自己資金回収率を年次表示。",
      image: "/img/feature_1.png"
    },
    {
      icon: Smartphone,
      title: "特徴2. ステータス管理",
      description: "検討中～取得済みまで一元管理。URL・写真・メモ・償却を保存。",
      image: "/img/feature_2.png"
    },
    {
      icon: CheckCircle,
      title: "特徴3. PDF自動生成",
      description: "前提・計算式つきで主要指標／年次CF／3価をレポート化。",
      image: "/img/feature_3.png"
    }
  ];

  const pricingPlans = [
    {
      name: "フリープラン",
      price: "¥0",
      period: "/月",
      description: "個人利用に最適",
      features: [
        "月5件のシミュレーション計算",
        "基本的な収益指標の表示",
        "PDFレポート出力（ウォーターマーク付き）"
      ],
      buttonText: "1分で悩み解決を体験",
      buttonStyle: "bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200"
    },
    {
      name: "プロプラン",
      price: "¥2,980",
      period: "/月",
      description: "個人・小規模法人向け",
      features: [
        "無制限のシミュレーション計算",
        "詳細な収益指標の表示",
        "データ保存・共有機能",
        "PDFレポート出力（ウォーターマーク無し）"
      ],
      buttonText: "まずは無料で体験する",
      buttonStyle: "bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:from-slate-800 hover:to-slate-950",
      popular: true
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
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  大家DXとは？
                </a>
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  機能
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  料金
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
                  無料ではじめる
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
                <p className="mb-2">Excelで半日かかる収支計算、</p>
                <p>「大家DX」なら60秒で解決</p>
              </div>
              <p className="text-lg lg:text-xl text-gray-700 mb-10 leading-relaxed" style={{paddingLeft: '10px', paddingRight: '10px'}}>
                収入・経費・税金・返済・残債・自己資金回収率を<br />
                年ごとに可視化。35年の推移がひと目でわかる。
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-8">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  まずは無料ではじめる
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
              
              {/* 信頼指標 */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-sm text-gray-600">
              </div>
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
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-lg text-blue-600 font-semibold mb-5">What is 大家DX！</p>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              大家DXの3つの特徴
            </h2>
            <p className="text-xl text-gray-900 max-w-4xl mx-auto leading-relaxed">
              現役大家の判断軸を実装した高性能シミュレーター。融資・税務・修繕・出口を一体計算し、IRR/DSCR/LTV/NOIや35年CF、3価（積算/収益還元/想定売却）を1分で可視化。エクセル不要、銀行が重視する指標をワンクリック。
            </p>
          </div>
          
          {/* メインレイアウト: 左側PC画像、右側機能リスト */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* 左側: PC画像 */}
            <div className="w-full lg:w-3/5 lg:pl-0">
              <div className="relative -ml-4 sm:-ml-6 lg:-ml-8">
                <img
                  src="/img/kakushin_img01.png"
                  alt="大家DX システム画面"
                  className="w-full h-auto rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUIxQzFDIiBmb250LXNpemU9IjI0cHgiPuOCt+OCueODhuODoOeUu+mdojwvdGV4dD4KPC9zdmc+Cg==';
                  }}
                />
              </div>
            </div>
            
            {/* 右側: 機能リスト */}
            <div className="w-full lg:w-2/5">
              <div className="space-y-12">
                {features.map((feature, index) => (
                  <div key={index}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 機能詳細セクション */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 機能1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="w-full lg:w-1/2">
              <div>
                <div className="text-6xl lg:text-8xl font-bold text-gray-900 mb-6">01</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  特徴1. 35年のキャッシュフローを可視化
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  収入・経費・税金・返済・残債・自己資金回収率を年ごとに表示。35年の推移が一目で分かる。
                </p>
                <p className="text-gray-600">
                  各年度の収入、経費、税金、ローン返済、残債額、自己資金回収率まで、
                  すべての重要指標を年次で可視化。投資判断を強力にサポートします。
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <img
                src="/img/kakushin_img01.png"
                alt="機能1の画面"
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUIxQzFDIiBmb250LXNpemU9IjI0cHgiPuOCt+OCueODhuODoOeUu+mdojwvdGV4dD4KPC9zdmc+Cg==';
                }}
              />
            </div>
          </div>

          {/* 機能2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-32">
            <div className="w-full lg:w-1/2">
              <div>
                <div className="text-6xl lg:text-8xl font-bold text-gray-900 mb-6">02</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  特徴2. 物件のステータス管理
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  検討中／内見予定／買付／保有中／取得済みを保存して、URL・写真・メモや償却まで保存。
                </p>
                <p className="text-gray-600">
                  物件URL、現地写真、メモ、減価償却情報など、
                  投資に必要な情報をステータスごとに整理して保存。
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <img
                src="/img/feature_2.png"
                alt="機能2の画面"
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUIxQzFDIiBmb250LXNpemU9IjI0cHgiPuOCt+OCueODhuODoOeUu+mdojwvdGV4dD4KPC9zdmc+Cg==';
                }}
              />
            </div>
          </div>

          {/* 機能3 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div>
                <div className="text-6xl lg:text-8xl font-bold text-gray-900 mb-6">03</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  特徴3. ワンクリックでPDF保存
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  前提・計算式つきで主要指標／年次CF／3価を自動レポート化。銀行が重視する指標を整理した資料として共有できます。
                </p>
                <p className="text-gray-600">
                  計算根拠を含めた詳細レポートをワンクリックで生成。
                  銀行融資審査に必要な重要指標を整理。※提出要件は金融機関により異なります。
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <img
                src="/img/feature_3.png"
                alt="機能3の画面"
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUIxQzFDIiBmb250LXNpemU9IjI0cHgiPuOCt+OCueODhuODoOeUu+mdojwvdGV4dD4KPC9zdmc+Cg==';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 課題セクション */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-lg text-blue-600 font-semibold mb-5">Top 3 Pain Points for Real Estate Investors</p>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight relative">
              <span className="relative inline-block">
                多くの大家さんが直面する3つの課題
                <span className="absolute left-0 w-full h-3 bg-blue-500 opacity-80 z-0" style={{bottom: '-10px'}}></span>
              </span>
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
          <div className="text-center mt-16">
            <p className="text-3xl lg:text-4xl text-gray-700 mb-6">
              どのタイプでも、<span className="font-bold text-blue-600">1分でシミュレーション体験</span>できます
            </p>
          </div>
        </div>
      </section>

      {/* 開発者セクション */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              なぜ現役大家が開発したのか
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-gray-200">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* 左側: 画像 */}
                <div className="flex-shrink-0">
                  <img 
                    src="/img/people_4.png" 
                    alt="開発者"
                    className="w-48 h-48 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* 右側: テキスト */}
                <div className="flex-1">
                  <div className="flex flex-col gap-4">
                    <p className="text-base text-gray-900 leading-relaxed">
                      良い案件を見つけても、夜中までExcel。式が壊れ、修繕や税金の影響を入れ忘れ、
                      翌日、銀行で「この前提は？」と詰まる——3行連続の否決を経験しました。
                    </p>
                    <p className="text-base text-gray-900 leading-relaxed">
                      「早く・漏れなく・根拠を説明できる」ことが投資の生命線だと痛感。
                      そこで自分のために、IRR/DSCR/LTV と 35年CF、3価（積算/収益還元/想定）を
                      1分で一体計算し、採用値と前提をその場で示せるツールを作成。
                    </p>
                    <p className="text-base text-gray-900 leading-relaxed">
                      結果、銀行との会話が数字中心に変わり、比較・判断が圧倒的に速くなった。
                      同じ悩みの大家仲間から声がかかり、プロダクト化したのが大家DXです。
                    </p>
                    <p className="text-base text-gray-900 leading-relaxed font-bold">
                      設計思想は精度・速度・透明性。現場で使える数字だけを、最短で。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              成長に合わせた料金プラン
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed">
              初心者から大規模投資家まで。投資規模に応じて最適なプランを選択できます。
            </p>
          </div>
          
          {/* 詳細プラン */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl border-2 p-10 relative transition-all duration-300 ${plan.popular ? 'border-blue-500 shadow-2xl scale-105 transform' : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      人気プラン
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-2xl text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-xl text-gray-600 mt-3">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700' : plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-24 bg-blue-50 bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(/img/background_002.jpg)'}}>
        {/* 背景オーバーレイ */}
        <div className="absolute inset-0 bg-blue-50 opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8" style={{lineHeight: '1.3'}}>
            10秒で無料登録。<br />クレカ不要で今すぐ体験。
          </h2>
          
          {/* CTAボタン */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              1分で悩み解決を体験
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
          
        </div>
      </section>

      {/* よくある質問セクション */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              よくある質問
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 無料プランでどこまで利用できますか？
              </h3>
              <p className="text-gray-600">
                A. 月5件までの物件シミュレーションと基本的な収益指標の表示が可能です。PDFレポートの出力も可能ですが、ウォーターマークが付きます。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. スマートフォンでも利用できますか？
              </h3>
              <p className="text-gray-600">
                A. はい、完全にモバイル対応しています。授乳中や通勤中など、いつでもどこでも物件分析が可能です。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 投資の成功を保証してくれますか？
              </h3>
              <p className="text-gray-600">
                A. 本サービスは投資判断の参考情報を提供するものであり、投資の成功を保証するものではありません。最終的な投資判断はご自身の責任でお願いします。
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
      <footer id="contact" className="bg-gradient-to-b from-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-10 w-auto" />
                <span className="text-2xl font-bold" style={{ fontFamily: 'serif' }}>大家DX</span>
              </div>
              <p className="text-gray-400 mb-4 text-lg">
                不動産投資の参考情報を簡単計算。<br />
                投資検討の参考情報としてご利用ください。
              </p>
              <p className="text-gray-500 text-base">
                © 2025 大家DX. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-xl">サービス</h4>
              <ul className="space-y-2 text-gray-400 text-lg">
                <li><a href="#" className="hover:text-white transition-colors">収益シミュレーション</a></li>
                <li><a href="#" className="hover:text-white transition-colors">投資分析レポート</a></li>
                <li><a href="#" className="hover:text-white transition-colors">データ管理</a></li>
                <li><a href="#" className="hover:text-white transition-colors">料金プラン</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-xl">お問合せ</h4>
              <div className="space-y-3 text-gray-400 text-lg">
                <div>
                  <p className="text-base">メールでのお問合せ</p>
                  <a href="mailto:ooya.tech2025@gmail.com" className="text-white hover:text-gray-300 transition-colors">
                    ooya.tech2025@gmail.com
                  </a>
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