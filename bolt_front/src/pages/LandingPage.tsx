import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  CheckCircle,
  ArrowRight,
  BarChart3,
  Database,
  Clock,
  Heart,
  Target,
  Users,
  Smartphone,
  Shield
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
      problem: '「良い物件発見！でもExcel面倒...市場調査・収支計算・銀行提出書類で徹夜」',
      solution: '楽待URL貼り付けで即分析',
      story: '7物件のExcel管理に限界。シミュレーション作成に毎回2時間かかって、家族時間を削るのが辛い。',
      features: [
        { icon: Clock, title: '作業時間1/10短縮', desc: 'Excel地獄から解放' },
        { icon: Calculator, title: '楽待連携分析', desc: 'URLコピペで即完了' },
        { icon: BarChart3, title: 'FA講座連携', desc: '学んだ指標を自動計算' }
      ]
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
      features: [
        { icon: Smartphone, title: '授乳中でも操作', desc: 'モバイル完全対応' },
        { icon: Users, title: '夫婦で共有', desc: '家族で資産を見える化' },
        { icon: Heart, title: '復職後も安心', desc: '時短効果で両立可能' }
      ]
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
      features: [
        { icon: Database, title: '58室一元管理', desc: '規模拡大に対応' },
        { icon: Shield, title: '法人対応', desc: '税務最適化も簡単' },
        { icon: Target, title: '承継準備', desc: '息子への引き継ぎ' }
      ]
    }
  ];


  const features = [
    {
      icon: Calculator,
      title: "1分で完了する物件分析",
      description: "楽待URLを貼り付けるだけで、IRR・CCR・DSCRなどの投資指標を自動計算。もうExcelで悩む必要はありません。"
    },
    {
      icon: Smartphone,
      title: "スマホで完結する資産管理",
      description: "授乳中でも、通勤中でも。親指だけでサクサク操作できるモバイル完全対応設計。"
    },
    {
      icon: Users,
      title: "家族で共有する投資戦略",
      description: "配偶者も理解できる見える化で、家族みんなで資産形成。事業承継の準備も万全。"
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
                <a href="#news" className="text-gray-600 hover:text-gray-900 transition-colors">
                  ニュース
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
      <section id="about" className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center lg:justify-start">
            {/* メインコピー */}
            <div className="text-center lg:text-left max-w-5xl">
              <div className="mb-6">
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8" style={{ lineHeight: '1.4' }}>
                現役大家が開発した、<br />
                賃貸経営DX。
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
                <button
                  onClick={() => navigate('/simulator')}
                  className="px-10 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-xl font-semibold shadow-sm hover:shadow-md"
                >
                  デモを見る
                </button>
              </div>
              
              {/* 信頼指標 */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-sm text-gray-600">
              </div>
            </div>
          </div>
        </div>
        
        {/* 右側画像 */}
        <div className="hidden lg:flex absolute top-0 right-0 h-full w-1/2 items-center justify-end">
          <img
            src="/img/main_250710_1.png"
            alt="大家DX メインビジュアル"
            className="h-auto" style={{width: '80%', maxWidth: '80%'}}
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
      </section>

      {/* 課題セクション */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              こんな悩みありませんか？
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
                
                {/* 悩み */}
                <div className="mb-6">
                  <p className="text-gray-900 mb-3 text-lg">{persona.problem}</p>
                </div>
                
                
                {/* 機能リスト */}
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
              現役大家が実際に使いながら開発した、本当に必要な機能だけを厳選。<br />
              <span className="text-sm text-gray-500">※ 投資勧誘や保証を行うものではありません。</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 bg-white relative overflow-hidden">
                {/* 背景装飾 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  
                  {/* ホバー時の詳細情報 */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="text-blue-600 font-medium text-base hover:text-blue-700 flex items-center justify-center mx-auto">
                      詳しく見る <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
          
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-gray-100">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-10 leading-relaxed">
                きっかけは、銀行融資の3連敗。
              </div>
              
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">試したツール全滅：</h3>
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium text-lg">不動産会社用</span>
                      <span className="text-gray-600 ml-2 text-lg">→ 売買特化</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium text-lg">会計ソフト</span>
                      <span className="text-gray-600 ml-2 text-lg">→ 賃貸非対応</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium text-lg">海外ツール</span>
                      <span className="text-gray-600 ml-2 text-lg">→ 日本の税制×</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium text-lg">Excel</span>
                      <span className="text-gray-600 ml-2 text-lg">→ ミスだらけ</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-3xl lg:text-4xl font-bold text-slate-700 mb-10">
                だから自分で作った。
              </div>
              
              <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">開発者実績：</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium text-lg">大家歴15年</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium text-lg">所有5棟42室</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium text-lg">満室経営継続中</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium text-lg">融資総額3.2億円</span>
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
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            大家業を、もっとスマートに
          </h2>
          <p className="text-3xl text-blue-100 mb-10 leading-relaxed">
            3分で登録完了。クレジットカード不要で今すぐ無料体験。<br />
            <span className="text-sm text-blue-200">※ シミュレーション結果は参考情報であり、投資勧誘ではありません。</span>
          </p>
          
          {/* 体験の流れ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-2">1</div>
              <h3 className="text-xl font-semibold text-white mb-2">無料登録</h3>
              <p className="text-blue-100 text-base">3分で完了</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-2">2</div>
              <h3 className="text-xl font-semibold text-white mb-2">URLを貼り付け</h3>
              <p className="text-blue-100 text-base">楽待の物件URL</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-2">3</div>
              <h3 className="text-xl font-semibold text-white mb-2">即座に分析</h3>
              <p className="text-blue-100 text-base">1分で完了</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/login?signup=true')}
            className="px-12 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 text-2xl font-semibold inline-flex items-center shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
          >
            1分で悩み解決を体験
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </section>

      {/* ニュースセクション */}
      <section id="news" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              ニュース
            </h2>
          </div>
          <div className="bg-white">
            {/* ニュース項目 */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4 py-4 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    お知らせ
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-500 mb-1">2025.01.07</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer text-lg">
                    大家DX（オオヤディーエックス）サービス開始準備中のお知らせ
                  </h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-4 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    機能
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-500 mb-1">2025.01.05</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer text-lg">
                    不動産投資シミュレーション機能の詳細仕様を公開しました
                  </h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-4 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    アップデート
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-500 mb-1">2025.01.03</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer text-lg">
                    ベータ版テストユーザー募集開始のお知らせ
                  </h3>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-4 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    プレス
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-500 mb-1">2024.12.28</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer text-lg">
                    大家DX開発チーム設立のお知らせ
                  </h3>
                </div>
              </div>
            </div>
            
            {/* もっと見るボタン */}
            <div className="text-center mt-8">
              <button className="text-blue-600 hover:text-blue-800 font-medium text-base">
                もっと見る
              </button>
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