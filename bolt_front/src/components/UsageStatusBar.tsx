/**
 * 使用状況表示バーコンポーネント
 * ダッシュボード上部に表示される利用回数の状態表示
 */

import React from 'react';
import { AlertCircle, Calendar, Star, Crown, ChevronRight } from 'lucide-react';
import { useUsageStatus, getUsageStatusMessage, getUsageStatusColor } from '../hooks/useUsageStatus';

interface UsageStatusBarProps {
  onUpgradeClick?: () => void;
}

export const UsageStatusBar: React.FC<UsageStatusBarProps> = ({ onUpgradeClick }) => {
  const { usage, loading, error } = useUsageStatus();

  // ローディング中は表示しない
  if (loading || !usage) {
    return null;
  }

  // エラー時は表示しない（サービス継続性優先）
  if (error) {
    console.error('UsageStatusBar error:', error);
    return null;
  }

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

  // プレミアム会員の場合
  if (usage.isSubscribed) {
    return (
      <div className={`w-full px-4 py-3 ${colors.bg} border-b ${colors.border}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Star className={`h-5 w-5 ${colors.icon} fill-current`} />
              <span className={`text-sm font-medium ${colors.text}`}>
                プレミアムプラン
              </span>
            </div>
            <span className="text-sm text-gray-600">
              全機能が無制限でご利用いただけます
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 無料プランの場合
  return (
    <div className={`w-full px-4 py-3 ${colors.bg} border-b ${colors.border}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* アイコンと利用状況 */}
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${colors.icon}`} />
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${colors.text}`}>
                  {statusMessage}
                </span>
                
                {/* プログレスバー（制限到達時以外） */}
                {!isError && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWarning ? 'bg-yellow-500' : 
                          isError ? 'bg-red-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${(usage.currentCount / usage.limit) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {usage.currentCount}/{usage.limit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* リセット日表示（制限到達時以外） */}
            {!isError && usage.periodEndDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>
                  次回リセット: {usage.periodEndDate.toLocaleDateString('ja-JP')}
                  （あと{usage.daysLeft}日）
                </span>
              </div>
            )}
          </div>

          {/* アップグレードボタン（警告・エラー時） */}
          {(isWarning || isError) && (
            <button
              onClick={onUpgradeClick}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${
                isError 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              <Crown className="h-4 w-4" />
              <span>プレミアムプランで無制限利用</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 追加メッセージ（エラー時） */}
        {isError && (
          <div className="mt-2 text-xs text-red-600">
            プレミアムプランにアップグレードして、引き続きご利用ください
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageStatusBar;