'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  CheckCircle,
  ArrowRight,
  Smartphone,
  UserPlus,
  Home,
  FileText
} from 'lucide-react';
import BlogPosts from '@/components/landing/BlogPosts';
import CompanyProfile from '@/components/landing/CompanyProfile';
import DeveloperProfile from '@/components/landing/DeveloperProfile';
// import MaintenanceNotice from '@/components/shared/MaintenanceNotice';

const LandingPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    document.title = '賃貸経営のためのシミュレーション｜大家DX';
  }, []);

  const personas = [
    {
      id: 'fujita',
      image: '/img/people_1.png',
      color: 'from-blue-500 to-blue-700',
      title: '課題1.\n収支計算に時間がかかる',
      problem: '物件の収益性を判断したいが、手計算やExcelでの収支計算に時間がかかる。IRRやDSCRなどの重要指標を素早く確認したい。',
      solution: '物件情報入力で即分析',
      story: 'テキストテキスト',
      features: [] as { icon: any; title: string; desc: string }[]
    },
    {
      id: 'yamamoto',
      image: '/img/people_2.png',
      color: 'from-pink-500 to-rose-700',
      title: '課題2.\nシミュレーションに時間がかかる',
      problem: '良い物件を発見したのだが、Excelでのシミュレーションに時間がかかる。複数物件の比較検討や資料作成に時間がかかる。',
      solution: 'スマホで完結、夫婦で共有',
      story: '7物件のExcel管理に限界。シミュレーション作成に毎回2時間かかって、家族時間を削るのが辛い。',
      features: [] as { icon: any; title: string; desc: string }[]
    },
    {
      id: 'sato',
      image: '/img/people_3.png',
      color: 'from-green-500 to-green-700',
      title: '課題3.\n長期的な収益性が見えない',
      problem: '35年間のキャッシュフローや残債推移を把握するのが大変。金利上昇や空室率変動のリスクシナリオを簡単に検証したい。',
      solution: '大規模対応、事業承継準備',
      story: '育児の合間での物件管理が大変。各種手続きも娘連れで効率悪い。復職後の両立が不安。',
      features: [] as { icon: any; title: string; desc: string }[]
    }
  ];




  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ヘッダー */}
      <header className="bg-white/75 backdrop-blur-md border-b border-gray-200/30 md:fixed md:top-0 md:left-0 md:right-0 md:z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <a href="/" className="block">
                <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-8 sm:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </a>
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
                <a href="#company" className="text-gray-600 hover:text-gray-900 transition-colors">
                  会社概要
                </a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                  よくある質問
                </a>
                <a href="#developer" className="text-gray-600 hover:text-gray-900 transition-colors">
                  開発者プロフィール
                </a>
                <a href="#news" className="text-gray-600 hover:text-gray-900 transition-colors">
                  ニュース
                </a>
                <a href="https://ooya.tech/media/" className="text-gray-600 hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                  メディア
                </a>
              </nav>
              
              {/* ログイン・サインアップボタン */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-4 sm:px-5 py-2.5 sm:py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">10秒で無料登録</span>
                  <span className="sm:hidden">10秒無料登録</span>
                </button>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-4 sm:px-5 py-2.5 sm:py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-[15px] sm:text-sm whitespace-nowrap"
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

      {/* お知らせバナー - 非表示（サービス終了通知は不要）
      <section className="py-4 sm:py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MaintenanceNotice />
        </div>
      </section>
      */}

      {/* ヒーローセクション */}
      <section 
        id="about" 
        className="py-4 sm:py-8 md:py-16 bg-white bg-cover bg-no-repeat relative" 
        style={{
          backgroundImage: 'url(/img/background_001.jpg)',
          backgroundPosition: 'center 20%'
        }}
      >
        {/* 背景オーバーレイ */}
        <div className="absolute inset-0 bg-white opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 左側：メインコピー */}
            <div className="text-left">
              <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6" style={{ lineHeight: '1.5' }}>
                <span className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl block mb-2" style={{ fontSize: '90%' }}>賃貸経営のための</span>
                <span className="block text-4xl sm:text-4xl md:text-5xl lg:text-6xl" style={{ lineHeight: '1.1' }}>シミュレーション</span>
              </h1>
              <div className="text-base sm:text-xl md:text-2xl lg:text-3xl text-gray-900 mb-4 sm:mb-6">
                <p className="mb-2 sm:mb-3 relative inline-block max-w-full">
                  <span className="block sm:inline">収支計算を</span>
                  <span className="block sm:inline">大幅に効率化</span>
                  <span className="absolute left-0 w-full h-1 sm:h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-4px'}}></span>
                </p>
                <p className="relative inline-block max-w-full">
                  <span className="block sm:inline">「大家DX」なら</span>
                  <span className="block sm:inline">簡単・スピーディー</span>
                  <span className="absolute left-0 w-full h-1 sm:h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-4px', animationDelay: '0.5s'}}></span>
                </p>
              </div>
              <button
                onClick={() => router.push('/auth/signup')}
                className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center mr-2 sm:mr-3">
                  <span className="text-lg sm:text-xl">10秒で無料登録する</span>
                  <span className="text-sm mt-1 opacity-90">（完全無料・無制限で利用可能）</span>
                </div>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-1 sm:ml-2" />
              </button>
            </div>
            
            {/* 右側：画像 */}
            <div className="flex justify-center lg:justify-end overflow-hidden sm:overflow-visible">
              <img
                src="/img/kakushin_img01.png"
                alt="大家DX メインビジュアル"
                className="w-full h-auto max-w-2xl sm:max-w-3xl main-visual-image"
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

          {/* 免責事項 - メインビジュアル内に配置 */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <div className="text-left text-xs text-gray-600 leading-relaxed">
              <p className="font-semibold mb-1">【重要免責事項】</p>
              <p>
                本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。
                提供する情報・分析結果は参考情報であり、将来の経営や事業の成功を保証するものではありません。
                実際の経営判断・投資判断は、宅地建物取引士・税理士等の専門家にご相談の上、必ずご自身の責任において行ってください。
                当社は金融商品取引業および宅地建物取引業の登録を受けておらず、特定の金融商品を推奨するものではなく、取引代理・媒介・仲介は行っておりません。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="pt-2 sm:pt-8 lg:pt-16 pb-1 sm:pb-2 lg:pb-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-3 sm:mb-8">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2">What is 大家DX！</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              大家DXの特徴
            </h2>
          </div>
        </div>
      </section>

      {/* 機能詳細セクション */}
      <section className="pt-1 sm:pt-2 lg:pt-4 pb-2 sm:pb-8 lg:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 機能1 - メンテナンス中のため非表示 */}
          {/* <div className="flex flex-col mb-4 sm:mb-16 lg:mb-32">
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <div className="w-full lg:w-1/3">
                <div className="sm:hidden">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold text-gray-900">01</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        AI市場分析
                      </h3>
                    </div>
                  </div>
                  <p className="text-xl text-gray-700 leading-relaxed mb-3 mt-4 font-semibold">
                    物件住所を入力するだけで、<br />AIが類似物件の取引事例を自動収集・分析。
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    取引価格、延べ床面積、建築年、間取りなど詳細データを一覧化。地域の価格分布・中央値レンジを可視化し、経営判断の参考情報を短時間で取得。
                  </p>
                  <p className="text-xs text-gray-500">
                    ※「不動産取引価格情報」（<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">国土交通省 不動産情報ライブラリ</a>）をもとに株式会社StartupMarketingが編集・加工
                  </p>
                </div>

                <div className="hidden sm:block">
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">01</div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    AI市場分析
                  </h3>
                  <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-3 font-semibold">
                    物件住所を入力するだけで、<br />AIが類似物件の取引事例を自動収集・分析。
                  </p>
                  <p className="text-sm lg:text-base text-gray-600 mb-2">
                    取引価格、延べ床面積、建築年、間取りなど詳細データを一覧化。地域の価格分布・中央値レンジを可視化し、経営判断の参考情報を短時間で取得。
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    ※「不動産取引価格情報」（<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">国土交通省 不動産情報ライブラリ</a>）をもとに株式会社StartupMarketingが編集・加工
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
              <video
                src="/img/tokuchou_ai.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  const img = document.createElement('img');
                  img.src = '/img/tokuchou01.jpg';
                  img.alt = '特徴1: AI市場分析';
                  img.className = target.className;
                  target.parentNode?.replaceChild(img, target);
                }}
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              </div>
            </div>
          </div> */}

          {/* 機能1 */}
          <div className="flex flex-col mb-4 sm:mb-16 lg:mb-32">
            <div className="flex flex-col lg:flex-row-reverse items-start gap-8 mb-8">
              <div className="w-full lg:w-1/3">
                {/* SP版: 横並びレイアウト */}
                <div className="sm:hidden">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold text-gray-900">01</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        収益シミュレーション
                      </h3>
                    </div>
                  </div>
                  <p className="text-xl text-gray-700 leading-relaxed mb-3 mt-4 font-semibold">
                    35年のキャッシュフローをグラフと表で可視化
                  </p>
                  <p className="text-sm text-gray-600">
                    収入・経費・税金・返済・残債・自己資金回収率を年ごとに表示。各年度の重要指標を年次で可視化。経営判断の参考情報を提供。
                  </p>
                </div>

                {/* PC版: 従来のレイアウト */}
                <div className="hidden sm:block">
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">01</div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    収益シミュレーション
                  </h3>
                  <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-3 font-semibold">
                    35年のキャッシュフローをグラフと表で可視化
                  </p>
                  <p className="text-sm lg:text-base text-gray-600">
                    収入・経費・税金・返済・残債・自己資金回収率を年ごとに表示。各年度の重要指標を年次で可視化。経営判断の参考情報を提供。
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
                  img.alt = '特徴2: 35年のキャッシュフローを可視化';
                  img.className = target.className;
                  target.parentNode?.replaceChild(img, target);
                }}
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              </div>
            </div>
          </div>

          {/* 機能3 - メンテナンス中のため非表示 */}
          {/* <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <div className="w-full lg:w-1/3">
                <div className="sm:hidden">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold text-gray-900">03</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        公示地価検索
                      </h3>
                    </div>
                  </div>
                  <p className="text-xl text-gray-700 leading-relaxed mb-3 mt-4 font-semibold">
                    物件周辺の公示地価を検索・可視化。直近4年分のトレンドをグラフで確認。
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    エリアの公示地価の推移を把握し、経営判断の参考情報として活用可能。
                  </p>
                  <p className="text-xs text-gray-500">
                    ※「地価公示」「都道府県地価調査」（<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">国土交通省 不動産情報ライブラリ</a>）をもとに株式会社StartupMarketingが編集・加工
                  </p>
                </div>

                <div className="hidden sm:block">
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">03</div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    公示地価検索
                  </h3>
                  <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-3 font-semibold">
                    物件周辺の公示地価を検索・可視化。直近4年分のトレンドをグラフで確認。
                  </p>
                  <p className="text-sm lg:text-base text-gray-600 mb-2">
                    エリアの資産価値推移を把握し、経営判断の参考情報として活用可能。
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    ※「地価公示」「都道府県地価調査」（<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">国土交通省 不動産情報ライブラリ</a>）をもとに株式会社StartupMarketingが編集・加工
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-2/3">
              <video
                src="/img/tokuchou_landprice.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  const img = document.createElement('img');
                  img.src = '/img/tokuchou_landprice.jpg';
                  img.alt = '特徴3: 公示地価検索';
                  img.className = target.className;
                  target.parentNode?.replaceChild(img, target);
                }}
              >
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* 課題セクション */}
      <section className="py-2 sm:py-8 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-16">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">Top 3 Pain Points for Real Estate Investors</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-8 leading-tight">
              <span className="sm:hidden">多くの大家さんが<br />直面する3つの課題</span>
              <span className="hidden sm:inline">多くの大家さんが直面する3つの課題</span>
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
            <p className="text-3xl lg:text-4xl text-gray-700">
              {/* SP版: 改行あり */}
              <span className="sm:hidden">
                <span className="relative inline-block mb-2">
                  どの課題も「大家DX」なら
                  <span className="absolute left-0 w-full h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-8px'}}></span>
                </span>
                <br />
                <span className="relative inline-block">
                  <span className="font-bold text-blue-600">効率的に解決</span>できます
                  <span className="absolute left-0 w-full h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-8px'}}></span>
                </span>
              </span>

              {/* PC版: 改行なし */}
              <span className="hidden sm:inline-block relative">
                どの課題も「大家DX」なら<span className="font-bold text-blue-600">効率的に解決</span>できます
                <span className="absolute left-0 w-full h-2 bg-blue-500 opacity-80 z-0 underline-animation" style={{bottom: '-8px'}}></span>
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section id="pricing" className="py-2 sm:py-8 lg:py-16 bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(/img/background_002.jpg)'}}>
        {/* 背景オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-white/60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-4 sm:mb-8">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">Pricing</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-8 leading-tight">
              料金プラン
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 leading-relaxed">
              すべての機能を完全無料でご利用いただけます
            </p>
          </div>

          {/* 無料プランカード - PC/SP共通 */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 border-2 border-blue-500 relative">
              {/* バッジ */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  完全無料プラン
                </span>
              </div>

              <div className="text-center mt-4">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">無料プラン</h3>
                <div className="flex items-baseline justify-center mb-6">
                  <span className="text-6xl sm:text-7xl font-bold text-blue-600">¥0</span>
                  <span className="text-2xl text-gray-600 ml-2">/月</span>
                </div>
                <p className="text-lg sm:text-xl text-gray-700 mb-8 font-semibold">
                  完全無料・無制限で全機能をご利用いただけます
                </p>

                {/* 機能リスト */}
                <div className="space-y-4 text-left max-w-lg mx-auto mb-8">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">収益シミュレーション</p>
                      <p className="text-sm text-gray-600">回数制限なし・無制限で利用可能</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">PDFレポート出力</p>
                      <p className="text-sm text-gray-600">無制限でダウンロード可能</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">35年キャッシュフロー分析</p>
                      <p className="text-sm text-gray-600">IRR・DSCR・LTV等の主要指標を表示</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">物件データ管理</p>
                      <p className="text-sm text-gray-600">複数物件の比較・管理が可能</p>
                    </div>
                  </div>
                </div>

                {/* CTAボタン */}
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-col items-center mr-3">
                    <span className="text-xl">10秒で無料登録する</span>
                    <span className="text-sm mt-1 opacity-90">（完全無料・無制限で利用可能）</span>
                  </div>
                  <ArrowRight className="h-6 w-6 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* 補足説明 */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              ※ 現在、有料プランの新規募集は停止しており、すべてのユーザー様に無料でご提供しております。
            </p>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-8 sm:py-12 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-base sm:text-lg text-blue-600 font-semibold mb-2 sm:mb-5">How to Use</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-8 leading-tight">
              3ステップでシミュレーションを始める
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              面倒な設定は不要。今すぐシミュレーションを始められます
            </p>
          </div>

          {/* ステップカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {/* STEP 1 */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-bold shadow-lg">
                STEP 1
              </div>
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  無料アカウント作成
                </h3>
                <ul className="space-y-3 text-gray-700 text-left inline-block">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>メールアドレスのみで登録</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>面倒な個人情報入力不要</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="relative bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white rounded-full px-4 py-2 text-sm font-bold shadow-lg">
                STEP 2
              </div>
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                  <Home className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  物件情報を入力
                </h3>
                <ul className="space-y-3 text-gray-700 text-left inline-block">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>物件住所や購入価格を入力</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>賃料や諸経費を設定</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>ローン条件を入力するだけ</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-bold shadow-lg">
                STEP 3
              </div>
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 mx-auto">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  シミュレーション結果を確認
                </h3>
                <ul className="space-y-3 text-gray-700 text-left inline-block">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>35年のキャッシュフローを可視化</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>IRR・CCR・DSCRなど主要指標を表示</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>PDFレポートで簡単に共有</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA ボタン */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center mr-3">
                <span className="text-xl">10秒で無料登録する</span>
                <span className="text-sm mt-1 opacity-90">（完全無料・無制限で利用可能）</span>
              </div>
              <ArrowRight className="h-6 w-6 ml-2" />
            </button>
          </div>

        </div>
      </section>

      {/* よくある質問セクション */}
      <section id="faq" className="pt-8 pb-1 sm:py-8 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              よくある質問
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q1. どんな分析ができるサービスですか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                IRR・DSCR・LTV・NOI等の主要指標と35年キャッシュフローを一括計算。
                金利上昇や空室増加などのリスクシナリオもワンクリックで検証でき、
                PDF出力にも対応しています。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q2. 無料プランではどこまで利用できますか？
              </h3>
              <p className="text-gray-600 leading-relaxed">
                現在、すべての機能を完全無料・無制限でご利用いただけます。
                収益シミュレーション機能は回数制限なく使い放題で、
                基本的な収益指標の確認とPDFレポート出力も無制限に可能です。
                有料プランの新規募集は停止しており、すべてのユーザー様に無料でご提供しております。
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q3. スマートフォンでも利用できますか？
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
                Q4. データは安全に管理されていますか？
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
                Q5. 解約はいつでもできますか？
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
                Q6. どのような支払い方法がありますか？
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

      {/* 開発者プロフィールセクション */}
      <DeveloperProfile />

      {/* 会社概要セクション */}
      <CompanyProfile />

      {/* ブログ記事セクション */}
      <BlogPosts />

      {/* ニュースセクション */}
      <section id="news" className="pt-8 pb-1 sm:py-8 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              ニュース
            </h2>
          </div>
          <div className="bg-white">
            {/* ニュース項目 */}
            <div className="space-y-0">
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium whitespace-nowrap">
                    メディア<br />掲載
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.10.21</p>
                  <div>
                    <span className="text-gray-900 text-base">
                      <a
                        href="https://www.jutaku-s.com/newsp/id/0000064588"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        住宅新報社様
                      </a>
                      に「賃貸経営者向け収益シミュレーションSaaS『大家DX』」が掲載されました（
                      <a
                        href="/img/住宅新聞.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        新聞掲載PDF
                      </a>
                      ・
                      <a
                        href="https://www.jutaku-s.com/newsp/id/0000064588"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Webメディア
                      </a>
                      ）
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium whitespace-nowrap">
                    掲載
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2024.10.14</p>
                  <div>
                    <span className="text-gray-900 text-base">
                      <a
                        href="https://omiya.keizai.biz/release/477943/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        大宮経済新聞
                      </a>
                      ・
                      <a
                        href="https://saitama.publishing.3rd-in.co.jp/article/2aa1cd40-a89a-11f0-88f0-9ca3ba0a67df#gsc.tab=0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        saitamaDays
                      </a>
                      に掲載されました。
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4 py-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-block px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium">
                    リリース
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">2025.10.01</p>
                  <h3 className="text-gray-900 font-normal text-base">
                    収益シミュレーターをリリースしました。
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

      {/* データ出典セクション */}
      <section className="py-4 sm:py-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-gray-600">
            <p>
              【データ出典】「不動産取引価格情報」「地価公示」「都道府県地価調査」（<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener" className="text-blue-600 hover:text-blue-800 underline">国土交通省 不動産情報ライブラリ</a>）をもとに株式会社StartupMarketingが編集・加工
            </p>
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
              {/* PC版ナビゲーション */}
              <nav className="hidden md:flex items-center space-x-6 mb-2">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  大家DXの特徴
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  料金
                </a>
                <a href="#company" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  会社概要
                </a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  よくある質問
                </a>
                <a href="#developer" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  開発者プロフィール
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
              
              {/* SP版ナビゲーション - 2行表示 */}
              <nav className="md:hidden w-full mb-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-start space-x-3">
                    <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                      大家DXの特徴
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                      料金
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="#company" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                      会社概要
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                      よくある質問
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="#developer" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                      開発者
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="#news" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                      ニュース
                    </a>
                  </div>
                  <div className="flex justify-start space-x-3">
                    <a href="https://ooya.tech/media/" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap" target="_blank" rel="noopener noreferrer">
                      メディア
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                      お問合せ
                    </a>
                  </div>
                </div>
              </nav>
              {/* PC版: 右寄せ */}
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center space-x-4 text-xs mb-1">
                  <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    運営会社
                  </a>
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    利用規約
                  </a>
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    個人情報保護方針
                  </a>
                  <a href="/tokushoho" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    特定商取引法
                  </a>
                  <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    免責事項
                  </a>
                </div>
                <div className="text-xs text-gray-500">
                  © 2025 大家DX. All rights reserved.
                </div>
              </div>
              
              {/* SP版: 左寄せ - 横スクロール対応 */}
              <div className="md:hidden flex flex-col items-start w-full">
                <div className="overflow-x-auto w-full mb-1">
                  <div className="flex items-center space-x-4 text-xs whitespace-nowrap pb-1">
                    <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      運営会社
                    </a>
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      利用規約
                    </a>
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      個人情報保護方針
                    </a>
                    <a href="/tokushoho" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      特定商取引法
                    </a>
                    <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      免責事項
                    </a>
                  </div>
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