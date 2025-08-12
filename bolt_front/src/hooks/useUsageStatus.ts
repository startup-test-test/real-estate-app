/**
 * 使用状況管理用カスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { checkUsageLimit, incrementUsage, type UsageStatus } from '../utils/usageLimit';

interface UseUsageStatusReturn {
  usage: UsageStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  executeWithLimit: (callback: () => Promise<void>, featureType?: string) => Promise<boolean>;
}

export const useUsageStatus = (): UseUsageStatusReturn => {
  const { user } = useAuthContext();
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用状況を取得
  const fetchUsageStatus = useCallback(async () => {
    if (!user) {
      setUsage(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const status = await checkUsageLimit(user.id);
      setUsage(status);
    } catch (err) {
      console.error('使用状況取得エラー:', err);
      setError('使用状況の取得に失敗しました');
      // エラー時でもデフォルト値を設定
      setUsage({
        canUse: true,
        currentCount: 0,
        limit: 5,
        isSubscribed: false,
        periodEndDate: null,
        daysLeft: 30
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 制限チェック付き実行
  const executeWithLimit = useCallback(async (
    callback: () => Promise<void>,
    featureType: string = 'simulator'
  ): Promise<boolean> => {
    if (!user || !usage) {
      console.warn('ユーザーまたは使用状況が未取得');
      return false;
    }

    // プレミアム会員は制限なし
    if (usage.isSubscribed) {
      await callback();
      return true;
    }

    // 無料プランの制限チェック
    if (!usage.canUse) {
      console.log('使用制限に到達しています');
      return false;
    }

    try {
      // 機能を実行
      await callback();
      
      // 使用回数をインクリメント
      await incrementUsage(user.id, featureType);
      
      // 使用状況を再取得
      await fetchUsageStatus();
      
      return true;
    } catch (err) {
      console.error('実行エラー:', err);
      throw err;
    }
  }, [user, usage, fetchUsageStatus]);

  // 初回ロード
  useEffect(() => {
    fetchUsageStatus();
  }, [fetchUsageStatus]);

  // 5分ごとに自動更新（キャッシュ対策）
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUsageStatus();
    }, 5 * 60 * 1000); // 5分

    return () => clearInterval(interval);
  }, [user, fetchUsageStatus]);

  return {
    usage,
    loading,
    error,
    refetch: fetchUsageStatus,
    executeWithLimit
  };
};

/**
 * 使用状況表示用のヘルパー関数
 */
export const getUsageStatusMessage = (usage: UsageStatus | null): string => {
  if (!usage) return '';
  
  if (usage.isSubscribed) {
    return 'プレミアム会員 - 無制限利用可能';
  }
  
  const remaining = usage.limit - usage.currentCount;
  
  if (remaining <= 0) {
    return '無料利用枠（月5回）を使い切りました';
  }
  
  if (remaining === 1) {
    return `⚠️ 残り${remaining}回（最後の1回）`;
  }
  
  return `今月の利用状況: ${usage.currentCount}/${usage.limit}回`;
};

/**
 * 使用状況の色を取得
 */
export const getUsageStatusColor = (usage: UsageStatus | null): string => {
  if (!usage) return 'gray';
  
  if (usage.isSubscribed) {
    return 'purple'; // プレミアム
  }
  
  const remaining = usage.limit - usage.currentCount;
  
  if (remaining <= 0) {
    return 'red'; // 制限到達
  }
  
  if (remaining === 1) {
    return 'yellow'; // 警告
  }
  
  return 'blue'; // 通常
};