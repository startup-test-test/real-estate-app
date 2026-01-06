'use client';

/**
 * 使用状況表示バーコンポーネント
 * 完全無料プラン移行後も、既存の有料プラン加入者向けには表示
 */

import React, { useState } from 'react';
import { AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
// TODO: 認証移行後に有効化
// import { useUsageStatus } from '@/hooks/useUsageStatus';
// import { supabase } from '@/lib/supabase';
// import { useAuthContext } from '@/components/AuthProvider';

interface UsageStatusBarProps {
  onUpgradeClick?: () => void;
}

export const UsageStatusBar: React.FC<UsageStatusBarProps> = () => {
  // TODO: 認証移行後に有効化
  // const { usage, loading, error, refetch } = useUsageStatus();
  // const { user } = useAuthContext();

  // 仮のモックデータ
  const usage = { isSubscribed: false, cancelAtPeriodEnd: false, currentPeriodEnd: null };
  const loading = false;
  const error = null;
  const refetch = async () => {};
  const user = null;
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

  // 無料プランユーザーには表示しない（完全無料プラン）
  if (!usage.isSubscribed) {
    return null;
  }

  // 解約取り消し処理
  const handleResumeSubscription = async () => {
    if (!user) return;

    setIsResuming(true);
    try {
      // TODO: Neon移行後に有効化
      // const { data: { session } } = await supabase.auth.getSession();
      // if (!session) {
      //   throw new Error('セッションが見つかりません');
      // }

      // const response = await supabase.functions.invoke('resume-subscription', {
      //   headers: {
      //     Authorization: `Bearer ${session.access_token}`
      //   }
      // });

      // if (response.error) {
      //   throw response.error;
      // }

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

  // ベーシックプラン加入者の場合のみ表示
  // 解約予定の場合の残り日数計算
  const daysRemaining = usage.cancelAtPeriodEnd && usage.currentPeriodEnd
    ? Math.ceil((new Date(usage.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
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
            収益シミュレーション無制限
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
              収益シミュレーション無制限
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
};

export default UsageStatusBar;
