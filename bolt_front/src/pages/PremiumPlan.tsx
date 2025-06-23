import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  X,
  Zap,
  BarChart3,
  Download,
  Shield,
  Users,
  Clock,
  Star,
  ArrowRight,
  Calculator,
  TrendingUp,
  FileText,
  Headphones
} from 'lucide-react';

const PremiumPlan: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'フリープラン',
      price: { monthly: 0, yearly: 0 },
      description: '基本的な機能を無料でお試し',
      color: 'border-gray-200',
      buttonColor: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      popular: false,
      features: [
        { name: 'AI物件シミュレーター', included: true, limit: '月3件まで' },
        { name: '基本的な収益分析', included: true },
        { name: '表面利回り計算', included: true },
        { name: 'AI取引事例検索', included: false },
        { name: 'AI市場分析', included: false },
        { name: '詳細レポート出力', included: false },
        { name: '無制限シミュレーション', included: false },
        { name: '優先サポート', included: false },
        { name: 'API連携', included: false }
      ]
    },
    {
      name: 'プロプラン',
      price: { monthly: 2980, yearly: 29800 },
      description: '本格的な不動産投資分析に',
      color: 'border-blue-500 ring-2 ring-blue-500',
      buttonColor: 'bg-blue-600 text-white hover:bg-blue-700',
      popular: true,
      features: [
        { name: 'AI物件シミュレーター', included: true, limit: '無制限' },
        { name: '詳細な収益分析', included: true },
        { name: '全投資指標計算', included: true },
        { name: 'AI取引事例検索', included: true, limit: '月50件まで' },
        { name: 'AI市場分析', included: true, limit: '月10エリア' },
        { name: '詳細レポート出力', included: true },
        { name: '30年キャッシュフロー予測', included: true },
        { name: 'メールサポート', included: true },
        { name: 'API連携', included: false }
      ]
    },
    {
      name: 'エンタープライズ',
      price: { monthly: 9800, yearly: 98000 },
      description: '法人・投資家向けの最上位プラン',
      color: 'border-purple-500',
      buttonColor: 'bg-purple-600 text-white hover:bg-purple-700',
      popular: false,
      features: [
        { name: 'AI物件シミュレーター', included: true, limit: '無制限' },
        { name: '高度な収益分析', included: true },
        { name: '全投資指標計算', included: true },
        { name: 'AI取引事例検索', included: true, limit: '無制限' },
        { name: 'AI市場分析', included: true, limit: '無制限' },
        { name: '詳細レポート出力', included: true },
        { name: 'ポートフォリオ分析', included: true },
        { name: '優先サポート', included: true },
        { name: 'API連携', included: true }
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: 'AI分析エンジン',
      description: '2億件超の不動産データを活用した高精度AI分析',
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      icon: BarChart3,
      title: '詳細レポート',
      description: 'PDF形式での詳細分析レポート出力機能',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: '市場予測',
      description: '将来の市場動向と価格予測分析',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Shield,
      title: 'セキュリティ',
      description: '企業レベルのセキュリティとデータ保護',
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const testimonials = [
    {
      name: '田中 太郎',
      role: '不動産投資家',
      content: 'AI分析の精度が高く、投資判断の精度が大幅に向上しました。特に市場分析機能が素晴らしいです。',
      rating: 5
    },
    {
      name: '佐藤 花子',
      role: '不動産会社経営',
      content: 'クライアントへの提案資料作成が効率化され、成約率も向上しています。',
      rating: 5
    },
    {
      name: '山田 次郎',
      role: '個人投資家',
      content: '初心者でも使いやすく、プロレベルの分析ができるようになりました。',
      rating: 4
    }
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyTotal = monthlyPrice * 12;
    const yearlyPrice = plans.find(p => p.price.monthly === monthlyPrice)?.price.yearly || 0;
    return yearlyTotal - yearlyPrice;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">有料プランについて</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AIを活用した本格的な不動産投資分析で、より良い投資判断を実現しましょう。
            あなたのニーズに合わせたプランをお選びください。
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              月額プラン
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              年額プラン
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                最大20%OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg border-2 ${plan.color} p-8 relative ${
                plan.popular ? 'transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    人気No.1
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ¥{formatPrice(plan.price[billingCycle])}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {billingCycle === 'monthly' ? '/月' : '/年'}
                  </span>
                </div>

                {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    年額プランで¥{formatPrice(getYearlySavings(plan.price.monthly))}お得！
                  </p>
                )}

                <button className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${plan.buttonColor}`}>
                  {plan.name === 'フリープラン' ? '現在のプラン' : 'プランを選択'}
                </button>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                      {feature.limit && (
                        <span className="text-xs text-gray-500 block">{feature.limit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            プレミアム機能の詳細
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-lg ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            お客様の声
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            よくある質問
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">プランの変更はいつでもできますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、ダウングレードは次回請求日から適用されます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">無料トライアルはありますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                プロプランは14日間の無料トライアルをご利用いただけます。クレジットカード登録が必要ですが、期間中に解約すれば課金されません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">支払い方法は何がありますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                クレジットカード（Visa、MasterCard、JCB、American Express）、銀行振込に対応しています。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">法人向けの割引はありますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                複数ユーザーでのご利用や年間契約については、別途お見積もりいたします。お気軽にお問い合わせください。
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">今すぐ始めましょう</h2>
          <p className="text-xl mb-8 opacity-90">
            AIを活用した不動産投資分析で、より良い投資判断を実現しませんか？
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              14日間無料トライアル
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
              詳細を問い合わせる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlan;