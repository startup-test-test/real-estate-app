import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  CheckCircle,
  ArrowRight,
  BarChart3,
  Database,
  Home
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calculator,
      title: "1. 収益シミュレーション機能",
      description: "IRR・CCR・DSCRなどの投資指標を計算し、35年間のキャッシュフローを参考情報として表示します。"
    },
    {
      icon: BarChart3,
      title: "2. 詳細な計算レポート",
      description: "税務処理、減価償却、修繕費等を考慮した計算結果をPDFで出力できます。"
    },
    {
      icon: Database,
      title: "3. データ管理機能",
      description: "物件情報の保存・編集・整理が可能で、複数物件の比較検討にご利用いただけます。"
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
              <div className="h-8 w-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>大家DX</span>
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ログイン
                </button>
                <button
                  onClick={() => navigate('/login?signup=true')}
                  className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-slate-950 transition-all"
                >
                  1分で悩み解決を体験
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section id="about" className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左側：メインコピー */}
            <div className="text-center lg:text-left max-w-4xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8" style={{ lineHeight: '1.4' }}>
                <span className="block">現役大家が開発した、</span>
                <span className="block">賃貸経営の悩みを</span>
                <span className="block bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  1分で解決
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed">
                銀行提出書類も、収支計算も、投資判断も。<br />
                もうExcelで徹夜する必要はありません。
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-8">
                <button
                  onClick={() => navigate('/login?signup=true')}
                  className="px-10 py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl hover:from-slate-800 hover:to-slate-950 transition-all duration-300 text-lg font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  1分で悩み解決を体験
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
                <button
                  onClick={() => navigate('/simulator')}
                  className="px-10 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-lg font-semibold shadow-sm hover:shadow-md"
                >
                  デモを見る
                </button>
              </div>
            </div>
            
            {/* 右側：PCモックアップ画面 */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-lg">
                <div className="relative">
                  <img
                    src="/images/main_001.png"
                    alt="大家DX ダッシュボード画面"
                    className="w-full h-auto"
                    onError={(e) => {
                      // 画像読み込みエラー時のフォールバック
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // フォールバック用のテキストを表示
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-64 bg-gray-100 rounded-lg shadow-2xl flex items-center justify-center text-gray-500';
                      fallback.textContent = 'ダッシュボード画面';
                      target.parentNode?.appendChild(fallback);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* お悩みセクション */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              こんな経験、ありませんか？
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">😰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  銀行面談まであと12時間
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  「事業計画書がまだ白紙...<br />
                  収支計算も間違いだらけ...<br />
                  また徹夜確定。家族に申し訳ない」
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏚️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  空室更新、今月で4ヶ月目
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  「5万→4.5万→4万...どこまで下げる？<br />
                  隣の似た物件は5.2万で満室なのに<br />
                  何が違うのか分からない」
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  購入して気づいた現実
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  「表面利回り12%→実質3%<br />
                  修繕費と税金を甘く見てた<br />
                  2,000万の借金だけが残った」
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <div className="inline-block">
              <p className="text-xl text-gray-700 font-medium mb-3 flex items-center justify-center">
                <span className="text-4xl mr-3">↓</span>
              </p>
              <p className="text-2xl text-gray-800 font-bold leading-relaxed mb-3">
                「全部、私も経験しました<br />
                だから本気で解決したかった」
              </p>
              <p className="text-lg text-gray-600">
                開発者より（大家歴15年）
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              大家DXの特徴
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              不動産投資の収益性を簡単に計算できるシミュレーションツールです。<br />
              <span className="text-sm text-gray-500">※ 投資勧誘や保証を行うものではありません。</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                <div className="h-16 w-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{feature.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 開発者セクション */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              なぜ現役大家が開発したのか
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-gray-100">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-10 leading-relaxed">
                きっかけは、銀行融資の3連敗。
              </div>
              
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6">試したツール全滅：</h3>
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium">不動産会社用</span>
                      <span className="text-gray-600 ml-2">→ 売買特化</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium">会計ソフト</span>
                      <span className="text-gray-600 ml-2">→ 賃貸非対応</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium">海外ツール</span>
                      <span className="text-gray-600 ml-2">→ 日本の税制×</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-start text-left">
                    <span className="text-red-500 text-xl mr-3">❌</span>
                    <div>
                      <span className="text-gray-900 font-medium">Excel</span>
                      <span className="text-gray-600 ml-2">→ ミスだらけ</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-2xl lg:text-3xl font-bold text-slate-700 mb-10">
                だから自分で作った。
              </div>
              
              <div className="mt-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6">開発者実績：</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium">大家歴15年</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium">所有5棟42室</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium">満室経営継続中</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 font-medium">融資総額3.2億円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              シンプルな料金プラン
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              投資規模に合わせて選べる3つのプラン。まずは無料でお試しください。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl border-2 p-10 relative transition-all duration-300 ${plan.popular ? 'border-slate-500 shadow-2xl scale-105 transform' : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      人気プラン
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xl text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-lg text-gray-600 mt-3">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
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
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-24 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            不動産投資の参考情報を簡単計算
          </h2>
          <p className="text-2xl text-slate-100 mb-10 leading-relaxed">
            3分で登録完了。クレジットカード不要で今すぐ無料でお試しいただけます。<br />
            <span className="text-sm text-slate-200">※ シミュレーション結果は参考情報であり、投資勧誘ではありません。</span>
          </p>
          <button
            onClick={() => navigate('/login?signup=true')}
            className="px-12 py-5 bg-white text-slate-700 rounded-xl hover:bg-gray-50 transition-all duration-300 text-xl font-semibold inline-flex items-center shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
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
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
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
                  <p className="text-sm text-gray-500 mb-1">2025.01.07</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer">
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
                  <p className="text-sm text-gray-500 mb-1">2025.01.05</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer">
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
                  <p className="text-sm text-gray-500 mb-1">2025.01.03</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer">
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
                  <p className="text-sm text-gray-500 mb-1">2024.12.28</p>
                  <h3 className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer">
                    大家DX開発チーム設立のお知らせ
                  </h3>
                </div>
              </div>
            </div>
            
            {/* もっと見るボタン */}
            <div className="text-center mt-8">
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
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
                <div className="h-8 w-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold" style={{ fontFamily: 'serif' }}>大家DX</span>
              </div>
              <p className="text-gray-400 mb-4">
                不動産投資の参考情報を簡単計算。<br />
                投資検討の参考情報としてご利用ください。
              </p>
              <p className="text-gray-500 text-sm">
                © 2025 大家DX. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">収益シミュレーション</a></li>
                <li><a href="#" className="hover:text-white transition-colors">投資分析レポート</a></li>
                <li><a href="#" className="hover:text-white transition-colors">データ管理</a></li>
                <li><a href="#" className="hover:text-white transition-colors">料金プラン</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">お問合せ</h4>
              <div className="space-y-3 text-gray-400">
                <div>
                  <p className="text-sm">メールでのお問合せ</p>
                  <a href="mailto:support@ooya-dx.com" className="text-white hover:text-gray-300 transition-colors">
                    support@ooya-dx.com
                  </a>
                </div>
                <div>
                  <p className="text-sm">サポート時間</p>
                  <p className="text-gray-400">平日 9:00-18:00</p>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-500">
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