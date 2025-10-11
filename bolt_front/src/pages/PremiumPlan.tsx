import React, { useState, useEffect } from 'react';
import {
  Check,
  AlertCircle,
  CheckCircle,
  Crown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import CancelSubscriptionModal from '../components/CancelSubscriptionModal';
import { calculateRemainingDays, formatRemainingTime, formatCancelDate, getSubscriptionStatus } from '../utils/subscriptionHelpers';
import { useUsageStatus } from '../hooks/useUsageStatus';
import UsageStatusBar from '../components/UsageStatusBar';
import UpgradeModal from '../components/UpgradeModal';
import Breadcrumb from '../components/Breadcrumb';

const PremiumPlan: React.FC = () => {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const { usage } = useUsageStatus();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

    if (!confirm('ベーシックプランを継続しますか？')) {
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
      alert('解約が取り消されました。ベーシックプランを継続します。');
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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 使用状況バー（マイページと同様に最上部に配置） */}
      <UsageStatusBar onUpgradeClick={() => setShowUpgradeModal(true)} />

      <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb - PC版のみ表示 */}
        <div className="hidden md:block mb-4">
          <Breadcrumb />
        </div>

        {/* ページタイトル - 他のページと統一 */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">有料プランについて</h1>
          <p className="text-gray-600 mt-1">
            月額4,980円で収益シミュレーターとAI市場分析を無制限でご利用いただけます
          </p>
        </div>

        {/* 現在のプランステータス表示 */}
        {subscriptionStatus.isPremium && (
          <div className="mb-6 max-w-4xl mx-auto">
            {subscriptionStatus.isCanceling || subscriptionStatus.remainingDays === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 text-base mb-2">
                      {subscriptionStatus.remainingDays === 0 ? 'プラン終了' : '解約予定'}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-amber-700">
                        <span className="font-medium">利用期限：</span>
                        {formatCancelDate(subscription?.cancel_at)}
                      </p>
                      {subscriptionStatus.remainingDays !== null && subscriptionStatus.remainingDays > 0 && (
                        <p className="text-amber-600 font-medium">
                          {formatRemainingTime(subscriptionStatus.remainingDays)}利用可能
                        </p>
                      )}
                      {subscriptionStatus.remainingDays === 0 && (
                        <p className="text-amber-600 font-medium">
                          フリープランに変更されました
                        </p>
                      )}
                    </div>
                  </div>
                  {subscriptionStatus.remainingDays !== null && subscriptionStatus.remainingDays > 0 && (
                    <button
                      onClick={handleResumeSubscription}
                      className="ml-4 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      解約を取り消す
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-base font-semibold text-green-800">現在ベーシックプランをご利用中です</span>
                  </div>
                  {!subscriptionStatus.isCanceling && subscriptionStatus.remainingDays !== 0 && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      プランを解約
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing Plans Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-xl border border-gray-200">
            <thead>
              <tr>
                <th className="text-left p-4 border-b-2 border-gray-200"></th>
                <th className="p-4 border-b-2 border-gray-200 bg-white">
                  <div className="text-center">
                    {/* バッジエリア - 高さ揃え用 */}
                    <div className="h-7 mb-2"></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">無料プラン</h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-gray-900">¥0</span>
                      <span className="text-lg text-gray-600 ml-1">/月</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">月に合計5回まで利用可能</p>
                    {!subscriptionStatus.isPremium && (
                      <button
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-default"
                        disabled
                      >
                        現在のプラン
                      </button>
                    )}
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
                      <span className="text-4xl font-bold text-gray-900">¥4,980</span>
                      <span className="text-lg text-gray-600 ml-1">/月</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">個人・小規模法人向け</p>
                    {!subscriptionStatus.isPremium && (
                      <button
                        className="w-full px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
                        onClick={async () => {
                          if (!user) {
                            alert('ログインが必要です');
                            return;
                          }
                          try {
                            const priceId = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1SG3ioR8rkVVzR7nNRHLEzoD';
                            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                              body: {
                                priceId: priceId,
                                userId: user.id,
                                returnUrl: window.location.origin
                              }
                            });
                            if (error) throw error;
                            if (data?.url) {
                              window.location.href = data.url;
                            }
                          } catch (err: any) {
                            console.error('Upgrade error:', err);
                            let errorMessage = 'アップグレード処理中にエラーが発生しました';

                            if (err.message?.includes('already') || err.message?.includes('non-2xx')) {
                              errorMessage = 'すでにベーシックプランをご利用中です。ページを更新してください。';
                            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                              errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
                            } else if (err.message?.includes('unauthorized') || err.message?.includes('401')) {
                              errorMessage = 'セッションの有効期限が切れました。再度ログインしてください。';
                            }

                            alert(errorMessage);
                          }
                        }}
                      >
                        <Crown className="h-5 w-5 inline-block mr-2" />
                        今すぐアップグレード
                      </button>
                    )}
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
                    <p className="text-sm text-gray-500 mb-4">法人・プロ投資家向け</p>
                    <button
                      className="w-full px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                      disabled
                    >
                      Coming Soon
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 bg-white">
                <td className="p-4 text-gray-700 font-semibold text-lg border-r border-gray-200">AI市場分析</td>
                <td className="p-4 text-center text-gray-600 font-semibold bg-white">月/合計5回</td>
                <td className="p-4 text-center bg-blue-50 font-bold text-blue-600 border-x border-gray-200">月/100回</td>
                <td className="p-4 text-center bg-purple-50">
                  <CheckCircle className="h-5 w-5 text-purple-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 bg-white">
                <td className="p-4 text-gray-700 font-semibold text-lg border-r border-gray-200">収益シミュレーション</td>
                <td className="p-4 text-center text-gray-600 font-semibold bg-white">月/合計5回</td>
                <td className="p-4 text-center bg-blue-50 border-x border-gray-200">
                  <div className="font-bold text-blue-600">回数/無制限</div>
                  <div className="text-xs text-gray-600">物件登録数50件</div>
                </td>
                <td className="p-4 text-center bg-purple-50 font-bold text-purple-600">無制限</td>
              </tr>
              <tr className="border-b border-gray-200 bg-white">
                <td className="p-4 text-gray-700 font-semibold text-lg border-r border-gray-200">公示地価検索</td>
                <td className="p-4 text-center text-gray-600 font-semibold bg-white">月/合計5回</td>
                <td className="p-4 text-center bg-blue-50 font-bold text-blue-600 border-x border-gray-200">月/100回</td>
                <td className="p-4 text-center bg-purple-50">
                  <CheckCircle className="h-5 w-5 text-purple-500 mx-auto" />
                </td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 text-gray-700 font-semibold text-lg border-r border-gray-200">
                  <div>
                    AI事業計画書
                    <span className="ml-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">※ 現在開発中です。</div>
                </td>
                <td className="p-4 text-center bg-white">
                  <div className="text-gray-400 text-sm">−</div>
                </td>
                <td className="p-4 text-center bg-blue-50 border-x border-gray-200">
                  <CheckCircle className="h-5 w-5 text-blue-600 mx-auto" />
                </td>
                <td className="p-4 text-center bg-purple-50">
                  <CheckCircle className="h-5 w-5 text-purple-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
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
                無料プランで基本機能をお試しいただけます。ベーシックプランの全機能を体験したい場合は、ご契約が必要です。
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

      {/* 解約確認モーダル */}
      <CancelSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelSubscription}
        cancelDate={formatCancelDate(subscription?.cancel_at || subscription?.current_period_end)}
        remainingDays={calculateRemainingDays(subscription?.cancel_at || subscription?.current_period_end)}
        isLoading={isCanceling}
      />

      {/* アップグレードモーダル */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default PremiumPlan;