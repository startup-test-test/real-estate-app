/**
 * 使用状況管理用カスタムフック
 * 完全無料プラン（無制限）
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
      // エラー時でもデフォルト値を設定（無制限）
      setUsage({
        canUse: true,
        currentCount: 0,
        limit: -1,
        isSubscribed: false,
        periodEndDate: null,
        daysLeft: -1
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 制限チェック付き実行（完全無料プランでは常に実行可能）
  const executeWithLimit = useCallback(async (
    callback: () => Promise<void>,
    featureType: string = 'simulator'
  ): Promise<boolean> => {
    if (!user || !usage) {
      console.warn('ユーザーまたは使用状況が未取得');
      return false;
    }

    // 完全無料プラン: 常に実行可能
    try {
      // 機能を実行
      await callback();

      // 使用回数をインクリメント（統計目的）
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

  // 完全無料プラン
  return '無料プラン - 無制限利用可能';
};

/**
 * 使用状況の色を取得
 */
export const getUsageStatusColor = (usage: UsageStatus | null): string => {
  if (!usage) return 'gray';

  // 完全無料プラン
  return 'blue'; // 常に通常状態
};