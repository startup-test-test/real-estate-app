import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  CheckCircle,
  ArrowRight,
  Users,
  Smartphone
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const personas = [
    {
      id: 'fujita',
      name: '藤田 健太',
      age: '37歳',
      job: 'ITコンサルタント',
      image: '/img/people_1.png',
      color: 'from-blue-500 to-blue-700',
      title: '悩み1.\nシミュレーションに時間がかかる',
      problem: '「良い物件を発見したのだが、Excelでのシミュレーションに時間がかかる。他にも周辺調査や銀行書類提出を作らないといけない。」',
      solution: '楽待URL貼り付けで即分析',
      story: '7物件のExcel管理に限界。シミュレーション作成に毎回2時間かかって、家族時間を削るのが辛い。',
      features: []
    },
    {
      id: 'yamamoto',
      name: '山本 理恵',
      age: '34歳',
      job: '育休中プランナー',
      image: '/img/people_2.png',
      color: 'from-pink-500 to-rose-700',
      problem: '「授乳中に楽待チェック、でも分析は娘が寝た後...復職後どうしよう」',
      solution: 'スマホで完結、夫婦で共有',
      story: '育児の合間での物件管理が大変。銀行訪問も娘連れで効率悪い。復職後の両立が不安。',
      features: []
    },
    {
      id: 'sato',
      name: '佐藤 慎一',
      age: '45歳',
      job: '大手メーカー部長',
      image: '/img/people_3.png',
      color: 'from-green-500 to-green-700',
      problem: '「58室の管理で確定申告3日間...税理士に『整理が必要』と言われた」',
      solution: '大規模対応、事業承継準備',
      story: '58室の管理が限界。修繕履歴の把握も困難で、息子への引き継ぎ準備も進まない。',
      features: []
    }
  ];


  const features = [
    {
      icon: Calculator,
      title: "機能1. 1分で完了する物件分析",
      description: "楽待URLを貼り付けるだけで、IRR・CCR・DSCRなどの投資指標を自動計算。もうExcelで悩む必要はありません。",
      image: "/img/feature_1.png"
    },
    {
      icon: Smartphone,
      title: "機能2. スマホで完結する資産管理",
      description: "授乳中でも、通勤中でも。親指だけでサクサク操作できるモバイル完全対応設計。",
      image: "/img/feature_2.png"
    },
    {
      icon: Users,
      title: "機能3. 家族で共有する投資戦略",
      description: "配偶者も理解できる見える化で、家族みんなで資産形成。事業承継の準備も万全。",
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
        "月10件のシミュレーション計算",
        "基本的な収益指標の表示",
        "PDFレポート出力（ウォーターマーク付き）",
        "メールサポート"
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
        "月500件のシミュレーション計算",
        "詳細な収益指標の表示",
        "データ保存・共有機能",
        "優先メールサポート",
        "PDFレポート出力（ウォーターマーク無し）"
      ],
      buttonText: "プロプランを選択",
      buttonStyle: "bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:from-slate-800 hover:to-slate-950",
      popular: true
    },
    {
      name: "エンタープライズ",
      price: "¥9,800",
      period: "/月",
      description: "法人・チーム向け",
      features: [
        "無制限のシミュレーション計算",
        "カスタムレポート作成",
        "API連携機能",
        "複数ユーザー管理",
        "専任サポート・電話対応"
      ],
      buttonText: "お問い合わせ",
      buttonStyle: "bg-slate-900 text-white hover:bg-slate-800"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
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
                <a href="#media" className="text-gray-600 hover:text-gray-900 transition-colors">
                  メディア
                </a>
              </nav>
              
              {/* ログイン・サインアップボタン */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login?signup=true')}
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

      {/* ヒーローセクション */}
      <section id="about" className="py-16 bg-white bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(/img/background_001.jpg)'}}>
        {/* 背景オーバーレイ */}
        <div className="absolute inset-0 bg-white opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左側：メインコピー */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8" style={{ lineHeight: '1.4' }}>
                <span className="text-3xl md:text-4xl lg:text-5xl" style={{ fontSize: '85%' }}>現役大家が開発した、</span><br />
                <span className="text-5xl md:text-6xl lg:text-7xl">賃貸経営DX</span>
              </h1>
              <p className="text-2xl lg:text-3xl text-gray-600 mb-10 leading-relaxed">
                市場分析・収支判断・銀行提出。<br />
                すべて1分。
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-8">
                <button
                  onClick={() => navigate('/login?signup=true')}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  1分で悩み解決を体験
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
              
              {/* 信頼指標 */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-sm text-gray-600">
              </div>
            </div>
            
            {/* 右側：画像 */}
            <div className="flex justify-center lg:justify-end pr-4 sm:pr-6 lg:pr-8">
              <img
                src="/img/kakushin_img01.png"
                alt="大家DX メインビジュアル"
                className="w-full h-auto max-w-4xl transform"
                style={{transform: 'scale(1.2) translateX(-15px)'}}
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

      {/* 課題セクション */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight relative">
              <span className="relative inline-block">
                こんなお悩みありませんか？
                <span className="absolute left-0 w-full h-3 bg-blue-500 opacity-80 z-0" style={{bottom: '-10px'}}></span>
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              多くの大家さんが抱える3つの共通課題
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {personas.map((persona) => (
              <div key={persona.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center">
                {/* ペルソナ画像 */}
                <div className="mb-6 flex flex-col items-center">
                  <div className="w-40 h-32 mx-auto mb-5">
                    <img 
                      src={persona.image} 
                      alt={persona.name}
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
            <p className="text-2xl text-gray-700 mb-6">
              どのタイプでも、<span className="font-bold text-blue-600">1分でシミュレーション体験</span>できます
            </p>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              3つの革新的機能
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              現役大家が実際に使いながら開発した、本当に必要な機能だけを厳選。
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

      {/* 開発者セクション */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              なぜ現役大家が開発したのか
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
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
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">きっかけは、銀行融資の3連敗。</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    融資面談で何度も断られ、収支シミュレーションの重要性を痛感。しかし、使えるツールがありませんでした。
                  </p>
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
          
          {/* プラン比較表 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* ヘッダー */}
              <div className="p-6 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-900">機能</h3>
              </div>
              {pricingPlans.map((plan, index) => (
                <div key={index} className={`p-6 text-center ${plan.popular ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xl text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>
              ))}
              
              {/* 機能比較 */}
              <div className="p-6">
                <div className="text-base text-gray-600">分析回数</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-gray-900 font-medium text-lg">月10件</div>
              </div>
              <div className="p-6 text-center bg-blue-50">
                <div className="text-gray-900 font-medium text-lg">月500件</div>
              </div>
              <div className="p-6 text-center">
                <div className="text-gray-900 font-medium text-lg">無制限</div>
              </div>
            </div>
          </div>
          
          {/* 詳細プラン */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  onClick={() => {
                    if (plan.buttonText === '1分で悩み解決を体験') {
                      navigate('/login?signup=true');
                    } else {
                      navigate('/login');
                    }
                  }}
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
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{lineHeight: '1.3'}}>
            3分で無料登録。<br />クレカ不要で今すぐ体験。
          </h2>
          
          {/* 新規会員登録フォーム */}
          <div className="max-w-2xl mx-auto mb-10">
            <form className="space-y-6">
              <div className="flex items-center space-x-4">
                <label htmlFor="email" className="w-32 text-sm font-medium text-gray-700 text-right">
                  E-Mail <span className="text-blue-600">(必須)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder=""
                />
              </div>
              <div className="flex items-center space-x-4">
                <label htmlFor="password" className="w-32 text-sm font-medium text-gray-700 text-right">
                  パスワード <span className="text-blue-600">(必須)</span>
                </label>
                <div className="flex-1">
                  <input
                    type="password"
                    id="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder=""
                  />
                  <p className="text-xs text-gray-500 mt-1">半角英数字8文字以上</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  <a href="#" className="text-blue-600 hover:underline">個人情報の取り扱い</a>
                  <span className="mx-1">・</span>
                  <a href="#" className="text-blue-600 hover:underline">利用規約</a>
                  <span className="ml-1">に同意する。</span>
                </label>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="w-full max-w-md px-12 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  1分で悩み解決を体験
                </button>
              </div>
            </form>
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
                A. 月10件までの物件シミュレーションと基本的な収益指標の表示が可能です。PDFレポートの出力も可能ですが、ウォーターマークが付きます。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 楽待以外の物件情報も分析できますか？
              </h3>
              <p className="text-gray-600">
                A. 現在は楽待のURL貼り付けによる自動分析に対応しています。他のサイトへの対応は今後順次拡張予定です。
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
                Q. 家族でアカウントを共有できますか？
              </h3>
              <p className="text-gray-600">
                A. プロプラン以上では複数ユーザーでの共有機能をご利用いただけます。ご家族での投資戦略共有に最適です。
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
                    動画配信
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.06.03</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    不動産テックの学校「Gate.School」にて最新動画を公開いたしました
                  </h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium">
                    リリース
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.06.02</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    東京都内の単身者向けマンション賃料、平均7%上昇！一人気エリアは10%以上の値上がりも
                  </h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium">
                    セミナー
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.05.01</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    【セミナー開催】不動産営業の新時代！AIとインサイドセールスチームの連携で成約数を倍増させる方法
                  </h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium">
                    セミナー
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.04.20</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    【セミナー開催】他社はこう提案している！収益物件仲介のリアルな提案例を大公開！
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
                  <a href="mailto:support@ooya-dx.com" className="text-white hover:text-gray-300 transition-colors">
                    support@ooya-dx.com
                  </a>
                </div>
                <div>
                  <p className="text-base">サポート時間</p>
                  <p className="text-gray-400">平日 9:00-18:00</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-500">
                    ※ お返事までお時間をいただく場合があります
                  </p>
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