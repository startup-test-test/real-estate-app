import React from 'react';
import { 
  Check, 
  X,
  Zap,
  BarChart3,
  Shield,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const PremiumPlan: React.FC = () => {
  const plans = [
    {
      name: 'フリープラン',
      price: 0,
      description: '基本的な機能を無料でお試し',
      color: 'border-gray-200',
      buttonColor: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      popular: false,
      features: [
        { name: '収益シミュレーター', included: true, limit: '月5件まで' },
        { name: '基本的な収益分析', included: true },
        { name: '表面利回り計算', included: true },
        { name: 'IRR・CCR計算', included: true },
        { name: '35年キャッシュフロー予測', included: false },
        { name: '詳細レポート出力（PDF）', included: false },
        { name: '無制限シミュレーション', included: false },
        { name: '優先サポート', included: false }
      ]
    },
    {
      name: 'プロプラン',
      price: 2980,
      description: '本格的な不動産投資分析に',
      color: 'border-blue-500 ring-2 ring-blue-500',
      buttonColor: 'bg-blue-600 text-white hover:bg-blue-700',
      popular: true,
      features: [
        { name: '収益シミュレーター', included: true, limit: '無制限' },
        { name: '詳細な収益分析', included: true },
        { name: '全投資指標計算', included: true },
        { name: 'IRR・CCR・DSCR・LTV', included: true },
        { name: '35年キャッシュフロー予測', included: true },
        { name: '詳細レポート出力（PDF）', included: true },
        { name: '売却シミュレーション', included: true },
        { name: 'メールサポート', included: true }
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: '高精度シミュレーション',
      description: '詳細な収支計算と長期予測で投資判断をサポート',
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
      title: '長期予測',
      description: '最大35年間のキャッシュフロー予測',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Shield,
      title: 'セキュリティ',
      description: '企業レベルのセキュリティとデータ保護',
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 rounded-2xl p-8 max-w-4xl mx-auto shadow-lg border border-yellow-200">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-12 w-12 text-yellow-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                プレミアムプラン
              </h1>
            </div>
            <p className="text-xl text-gray-700 font-medium mb-2">
              全機能が無制限でご利用いただけます
            </p>
            <p className="text-gray-600">
              本格的な不動産投資シミュレーションで、より良い投資判断を実現しましょう
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
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
                    ¥{formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-600 ml-2">/月</span>
                </div>

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

        {/* FAQ Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            よくある質問
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">プランの変更はいつでもできますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                はい、いつでもプランの変更が可能です。アップグレードは即座に反映されます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">無料トライアルはありますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                フリープランで基本機能をお試しいただけます。プロプランの全機能を体験したい場合は、ご契約が必要です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">支払い方法は何がありますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                クレジットカード（Visa、MasterCard、JCB、American Express）に対応しています。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">解約はできますか？</h3>
              <p className="text-gray-600 text-sm mb-4">
                いつでも解約可能です。解約後も当月末まではサービスをご利用いただけます。
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section - 削除 */}
      </div>
    </div>
  );
};

export default PremiumPlan;