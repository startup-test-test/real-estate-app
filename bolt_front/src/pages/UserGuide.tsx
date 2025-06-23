import React from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  ArrowRight, 
  Calculator,
  Building,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

const UserGuide: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: '物件情報の入力',
      description: '投資を検討している物件の基本情報を入力します',
      icon: Building,
      details: [
        '物件名・住所の入力',
        '取得価格・建物価格の設定',
        '収支条件（賃料・管理費等）の入力',
        '借入条件の設定'
      ]
    },
    {
      id: 2,
      title: 'AI分析の実行',
      description: 'AIが市場データを基に物件の投資価値を分析します',
      icon: Zap,
      details: [
        '2億件超の不動産データから類似物件を抽出',
        '収益還元法による適正価格の算出',
        '空室率・賃料下落率の予測',
        '投資リスクの評価'
      ]
    },
    {
      id: 3,
      title: '結果の確認',
      description: '詳細な分析結果とシミュレーションを確認できます',
      icon: BarChart3,
      details: [
        'キャッシュフロー予測（最大30年）',
        '投資指標（IRR、CCR、DSCR等）',
        '市場価格との比較分析',
        '将来の売却シミュレーション'
      ]
    }
  ];

  const features = [
    {
      icon: Calculator,
      title: 'AI物件シミュレーター',
      description: '2億件超の不動産データを活用したAI分析で、物件の収益性と投資リスクを正確に評価します。'
    },
    {
      icon: TrendingUp,
      title: '長期収益予測',
      description: '最大30年間のキャッシュフロー予測と、様々な売却タイミングでの収益シミュレーションが可能です。'
    },
    {
      icon: Target,
      title: '投資判断サポート',
      description: 'IRR、CCR、DSCRなどの投資指標を自動計算し、客観的な投資判断をサポートします。'
    },
    {
      icon: Shield,
      title: '市場価格分析',
      description: '周辺の類似物件データと比較して、物件価格の妥当性を評価します。'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">はじめに・ご利用ガイド</h1>
          </div>
          <p className="text-lg text-gray-600">
            大家DXの使い方をご説明します。AIを活用した不動産投資分析で、より良い投資判断をサポートします。
          </p>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">大家DXへようこそ！</h2>
          <p className="text-lg mb-6">
            AIが導く、あなたの賃貸経営の未来。2億件超の不動産データを活用して、最適な投資判断をサポートします。
          </p>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              <Play className="h-5 w-5 mr-2" />
              チュートリアル動画を見る
            </button>
            <button className="flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
              <Calculator className="h-5 w-5 mr-2" />
              今すぐ始める
            </button>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ご利用の流れ</h2>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {step.id}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <Icon className="h-6 w-6 text-indigo-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-shrink-0">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">よくある質問</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">AI査定価格はどのように算出されますか？</h3>
              <p className="text-gray-600 text-sm">
                2億件超の不動産データを機械学習で分析し、収益還元法に基づいて算出しています。立地、築年数、構造などの要素を総合的に評価します。
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">シミュレーション結果の精度はどの程度ですか？</h3>
              <p className="text-gray-600 text-sm">
                過去の実績データとの照合により、高い精度を実現していますが、市場環境の変化により実際の結果と異なる場合があります。投資判断の参考としてご活用ください。
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">データはどのくらいの頻度で更新されますか？</h3>
              <p className="text-gray-600 text-sm">
                市場データは月次で更新され、AI分析モデルは四半期ごとに最新のデータで再学習を行っています。
              </p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">サポート・お問い合わせ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">メールサポート</h3>
              <p className="text-gray-600 text-sm mb-2">support@ooya-dx.com</p>
              <p className="text-gray-500 text-xs">平日 9:00-18:00（土日祝除く）</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">オンラインヘルプ</h3>
              <p className="text-gray-600 text-sm mb-2">詳細なマニュアルとFAQをご用意しています</p>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                ヘルプセンターを見る →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;