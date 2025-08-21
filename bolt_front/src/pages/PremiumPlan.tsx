import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X,
  Zap,
  BarChart3,
  Shield,
  TrendingUp,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import CancelSubscriptionModal from '../components/CancelSubscriptionModal';
import { calculateRemainingDays, formatRemainingTime, formatCancelDate, getSubscriptionStatus } from '../utils/subscriptionHelpers';

const PremiumPlan: React.FC = () => {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    document.title = '料金プラン | 大家DX';
  }, []);

  // サブスクリプション情報を取得
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error && error.code !== 'PGRST116') {
          console.error('Subscription fetch error:', error);
        }

        setSubscription(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        // Loading state removed
      }
    };

    fetchSubscription();
  }, [user]);

  // サブスクリプションステータスを取得
  const subscriptionStatus = getSubscriptionStatus(subscription);

  // 解約処理
  const handleCancelSubscription = async () => {
    if (!user?.id) {
      alert('ログインが必要です');
      return;
    }

    setIsCanceling(true);

    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {},
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      // サブスクリプション情報を再取得
      const { data: updatedSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setSubscription(updatedSub);
      setIsModalOpen(false);
      alert(`解約が完了しました。${data.message}`);
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      // エラーメッセージを日本語化
      let errorMessage = '解約処理中にエラーが発生しました';
      
      if (error.message?.includes('already') || error.message?.includes('non-2xx')) {
        errorMessage = 'この操作はすでに処理済みです。しばらくお待ちいただくか、ページを更新してください。';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        errorMessage = 'セッションの有効期限が切れました。再度ログインしてください。';
      }
      
      alert(errorMessage);
    } finally {
      setIsCanceling(false);
    }
  };

  // 解約取り消し処理
  const handleResumeSubscription = async () => {
    if (!user?.id) {
      alert('ログインが必要です');
      return;
    }

    if (!confirm('プレミアムプランを継続しますか？')) {
      return;
    }

    setIsCanceling(true);

    try {
      const { data, error } = await supabase.functions.invoke('resume-subscription', {
        body: {},
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      // サブスクリプション情報を再取得
      const { data: updatedSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setSubscription(updatedSub);
      alert('解約が取り消されました。プレミアムプランを継続します。');
    } catch (error: any) {
      console.error('Resume subscription error:', error);
      // エラーメッセージを日本語化
      let errorMessage = '解約の取り消しに失敗しました';
      
      if (error.message?.includes('already') || error.message?.includes('non-2xx')) {
        errorMessage = 'この操作はすでに処理済みです。しばらくお待ちいただくか、ページを更新してください。';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        errorMessage = 'セッションの有効期限が切れました。再度ログインしてください。';
      }
      
      alert(errorMessage);
    } finally {
      setIsCanceling(false);
    }
  };
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

                {/* プランボタンの表示を条件分岐 */}
                {plan.name === 'フリープラン' ? (
                  <button 
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${plan.buttonColor}`}
                    disabled
                  >
                    {subscriptionStatus.isPremium ? 'フリープラン' : '現在のプラン'}
                  </button>
                ) : (
                  <div>
                    {subscriptionStatus.isPremium ? (
                      <div className="space-y-3">
                        {/* 解約予定の場合 */}
                        {subscriptionStatus.isCanceling ? (
                          <>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
                              <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-semibold text-amber-800 text-base mb-2">解約予定</p>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-amber-700">
                                      <span className="font-medium">利用期限：</span>
                                      {formatCancelDate(subscription?.cancel_at)}
                                    </p>
                                    <p className="text-amber-600 font-medium">
                                      {formatRemainingTime(subscriptionStatus.remainingDays || 0)}利用可能
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={handleResumeSubscription}
                              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              解約を取り消す
                            </button>
                          </>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Check className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm font-semibold text-green-800">現在のプラン</span>
                              </div>
                              <Sparkles className="h-5 w-5 text-yellow-500" />
                            </div>
                          </div>
                        )}
                        
                        {/* 解約ボタン（解約予定でない場合のみ表示） */}
                        {!subscriptionStatus.isCanceling && (
                          <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                          >
                            プランを解約
                          </button>
                        )}
                      </div>
                    ) : (
                      <button 
                        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${plan.buttonColor}`}
                        onClick={async () => {
                          if (!user) {
                            alert('ログインが必要です');
                            return;
                          }
                          // Stripe Checkoutへリダイレクト
                          try {
                            const priceId = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1RvChRR8rkVVzR7nAeDvfiur';
                            const { data, error } = await supabase.functions.invoke('smart-service', {
                              body: { 
                                priceId: priceId,
                                userId: user.id 
                              }
                            });
                            if (error) throw error;
                            if (data?.url) {
                              window.location.href = data.url;
                            }
                          } catch (err: any) {
                            console.error('Upgrade error:', err);
                            // エラーメッセージを日本語化
                            let errorMessage = 'アップグレード処理中にエラーが発生しました';
                            
                            if (err.message?.includes('already') || err.message?.includes('non-2xx')) {
                              errorMessage = 'すでにプレミアムプランをご利用中です。ページを更新してください。';
                            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                              errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
                            } else if (err.message?.includes('unauthorized') || err.message?.includes('401')) {
                              errorMessage = 'セッションの有効期限が切れました。再度ログインしてください。';
                            }
                            
                            alert(errorMessage);
                          }
                        }}
                      >
                        プランを選択
                      </button>
                    )}
                  </div>
                )}
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

      {/* 解約確認モーダル */}
      <CancelSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelSubscription}
        cancelDate={formatCancelDate(subscription?.cancel_at || subscription?.current_period_end)}
        remainingDays={calculateRemainingDays(subscription?.cancel_at || subscription?.current_period_end)}
        isLoading={isCanceling}
      />
    </div>
  );
};

export default PremiumPlan;