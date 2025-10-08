/**
 * 使用状況表示バーコンポーネント
 * ダッシュボード上部に表示される利用回数の状態表示
 */

import React, { useState } from 'react';
import { AlertCircle, Calendar, Sparkles, Crown, ChevronRight, RefreshCw } from 'lucide-react';
import { useUsageStatus, getUsageStatusMessage, getUsageStatusColor } from '../hooks/useUsageStatus';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';

interface UsageStatusBarProps {
  onUpgradeClick?: () => void;
}

export const UsageStatusBar: React.FC<UsageStatusBarProps> = ({ onUpgradeClick }) => {
  const { usage, loading, error, refetch } = useUsageStatus();
  const { user } = useAuthContext();
  const [isResuming, setIsResuming] = useState(false);

  // ローディング中は表示しない
  if (loading || !usage) {
    return null;
  }

  // エラー時は表示しない（サービス継続性優先）
  if (error) {
    console.error('UsageStatusBar error:', error);
    return null;
  }

  // 解約取り消し処理
  const handleResumeSubscription = async () => {
    if (!user) return;
    
    setIsResuming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('セッションが見つかりません');
      }

      const response = await supabase.functions.invoke('resume-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw response.error;
      }

      // 成功時は使用状況を再取得
      await refetch();
      alert('ベーシックプランを継続します');
    } catch (error) {
      console.error('解約取り消しエラー:', error);
      alert('解約取り消しに失敗しました。サポートにお問い合わせください。');
    } finally {
      setIsResuming(false);
    }
  };

  const statusColor = getUsageStatusColor(usage);
  const statusMessage = getUsageStatusMessage(usage);
  const remaining = usage.limit - usage.currentCount;
  const isWarning = remaining === 1 && !usage.isSubscribed;
  const isError = remaining <= 0 && !usage.isSubscribed;

  // カラー設定
  const colorClasses = {
    purple: {
      bg: 'bg-gradient-to-r from-purple-50 to-blue-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: 'text-purple-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      icon: 'text-gray-600'
    }
  };

  const colors = colorClasses[statusColor as keyof typeof colorClasses] || colorClasses.gray;

  // ベーシックプランの場合
  if (usage.isSubscribed) {
    // 解約予定の場合の残り日数計算
    const daysRemaining = usage.cancelAtPeriodEnd && usage.currentPeriodEnd
      ? Math.ceil((usage.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <div className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-r from-yellow-50 via-yellow-100 to-orange-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto">
          {/* SP版: 縦積みレイアウト */}
          <div className="sm:hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <span className="text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                ベーシックプラン
              </span>
            </div>
            <p className="text-sm text-gray-700 font-medium mb-2">
              全機能が無制限でご利用いただけます
            </p>
            
            {/* 解約予定の場合の表示 */}
            {usage.cancelAtPeriodEnd && usage.currentPeriodEnd && (
              <div className="bg-orange-100 px-2 py-2 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-orange-800">
                    解約予定
                  </span>
                  <span className="text-sm text-orange-700">
                    {new Date(usage.currentPeriodEnd).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric'
                    })}まで
                  </span>
                  <span className="text-sm font-bold text-orange-800">
                    (あと{daysRemaining}日)
                  </span>
                </div>
                <button
                  onClick={handleResumeSubscription}
                  disabled={isResuming}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-orange-700 font-semibold text-sm rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-300"
                >
                  <RefreshCw className={`h-4 w-4 ${isResuming ? 'animate-spin' : ''}`} />
                  <span>解約を取り消す</span>
                </button>
              </div>
            )}
          </div>
          
          {/* PC版: 横並びレイアウト */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <span className="text-base font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  ベーシックプラン
                </span>
              </div>
              <span className="text-sm text-gray-700 font-medium">
                全機能が無制限でご利用いただけます
              </span>
              
              {/* 解約予定の場合の表示 */}
              {usage.cancelAtPeriodEnd && usage.currentPeriodEnd && (
                <div className="flex items-center gap-3 bg-orange-100 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-orange-800">
                      解約予定
                    </span>
                    <div className="flex items-center gap-3 text-sm text-orange-700">
                      <span>
                        利用期限：{new Date(usage.currentPeriodEnd).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="font-medium">
                        あと{daysRemaining}日利用可能
                      </span>
                    </div>
                    <button
                      onClick={handleResumeSubscription}
                      disabled={isResuming}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white text-orange-700 font-medium rounded hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isResuming ? 'animate-spin' : ''}`} />
                      <span>解約を取り消す</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 無料プランの場合
  return (
    <div className={`w-full px-4 py-4 ${colors.bg} border-b ${colors.border}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* 左側：使用状況表示 */}
          <div className="flex items-center gap-4">
            {/* アイコンと利用状況 */}
            <div className="flex items-center gap-3">
              <AlertCircle className={`h-6 w-6 ${colors.icon}`} />
              <div className="flex items-center gap-4">
                <span className={`text-base font-semibold ${colors.text}`}>
                  {statusMessage}
                </span>
                
                {/* プログレスバー（制限到達時以外） */}
                {!isError && (
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWarning ? 'bg-yellow-500' : 
                          isError ? 'bg-red-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${(usage.currentCount / usage.limit) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {usage.currentCount}/{usage.limit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* リセット日表示 */}
            {usage.periodEndDate && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  毎月1日にリセット
                </span>
              </div>
            )}
          </div>

          {/* 右側：アップグレード促進 */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-base font-semibold text-gray-800">
                月額4,980円で無制限
              </span>
            </div>
            <button
              onClick={onUpgradeClick}
              className={`px-5 py-2 text-base font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm ${
                isError 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : isWarning
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <Crown className="h-5 w-5" />
              <span>今すぐアップグレード</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 追加メッセージ（エラー時） */}
        {isError && (
          <div className="mt-2 text-sm font-medium text-red-600">
            <button 
              onClick={onUpgradeClick}
              className="underline hover:no-underline cursor-pointer"
            >
              ベーシックプランにアップグレード
            </button>
            して、引き続きご利用ください
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageStatusBar;