import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PropertyShare } from '../types';
import { useSupabaseAuth } from './useSupabaseAuth';
import { withLoadingState } from '../utils/shareErrorHandler';

export function useShareUtils() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetchShareTokenFromSimulationの無限ループ防止
  const fetchTokenCallCounts = new Map<string, number>();
  const TOKEN_FETCH_MAX_CALLS = 5;
  const TOKEN_FETCH_TIMEOUT = 30000; // 30秒

  /**
   * ユーザーアクセスをログに記録
   */
  const logAccess = async (shareId: string, accessType: 'view' | 'comment' | 'reaction' = 'view'): Promise<void> => {
    try {
      await supabase
        .from('share_access_logs')
        .insert({
          share_id: shareId,
          user_id: user?.id || null,
          access_type: accessType,
          user_agent: navigator.userAgent,
          accessed_at: new Date().toISOString()
        });
      
      console.log(`📊 Access logged: ${accessType} for share ${shareId}`);
    } catch (error) {
      // アクセスログの失敗は致命的でないため、エラーを表示するが処理は続行
      console.warn('⚠️ Failed to log access:', error);
    }
  };

  /**
   * シミュレーションデータからshare_tokenを取得するフォールバック
   */
  const fetchShareTokenFromSimulation = async (propertyId: string): Promise<string | null> => {
    return withLoadingState(async () => {
      console.log('🔄 fetchShareTokenFromSimulation called with propertyId:', propertyId);

      // 無限ループ防止: 呼び出し回数をカウント
      const currentCount = fetchTokenCallCounts.get(propertyId) || 0;
      
      if (currentCount >= TOKEN_FETCH_MAX_CALLS) {
        console.warn(`⚠️ fetchShareTokenFromSimulation: 最大呼び出し回数(${TOKEN_FETCH_MAX_CALLS})に達しました`);
        return null;
      }

      fetchTokenCallCounts.set(propertyId, currentCount + 1);

      // タイムアウト後にカウンターをリセット
      setTimeout(() => {
        fetchTokenCallCounts.delete(propertyId);
        console.log('🧹 Call count reset for propertyId:', propertyId);
      }, TOKEN_FETCH_TIMEOUT);

      if (!user?.id) {
        // SEC-049: 認証状態をログに出力しない
        return null;
      }

      // simulation_resultsテーブルから最新のシミュレーション結果を取得
      const { data: simulationData, error: simulationError } = await supabase
        .from('simulation_results')
        .select('share_token')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (simulationError) {
        // SEC-049: エラー詳細をログに出力しない
        return null;
      }

      if (simulationData?.share_token) {
        // SEC-049: トークンをログに出力しない
        return simulationData.share_token;
      }

      // SEC-049: デバッグ情報を削除
      return null;
    }, setLoading, setError, 'シミュレーションからのトークン取得');
  };

  /**
   * 共有の有効期限チェック
   */
  const isShareValid = (share: PropertyShare): boolean => {
    if (!share.expires_at) {
      return true; // 期限なしの場合は有効
    }

    const expirationDate = new Date(share.expires_at);
    const now = new Date();
    
    return expirationDate > now;
  };

  /**
   * 共有URLの生成
   */
  const generateShareUrl = (shareToken: string, type: 'simple' | 'full' = 'full'): string => {
    const basePath = type === 'simple' ? '/simple-collaboration' : '/collaboration';
    return `${window.location.origin}${basePath}/${shareToken}`;
  };

  /**
   * 招待URLの生成
   */
  const generateInviteUrl = (invitationToken: string): string => {
    return `${window.location.origin}/collaboration/${invitationToken}`;
  };

  /**
   * デバッグ情報の取得
   */
  const getDebugInfo = () => {
    return {
      user: user ? { id: user.id, email: user.email } : null,
      fetchTokenCallCounts: Object.fromEntries(fetchTokenCallCounts),
      timestamp: new Date().toISOString()
    };
  };

  /**
   * キャッシュのクリア
   */
  const clearCache = () => {
    fetchTokenCallCounts.clear();
    console.log('🧹 Share utils cache cleared');
  };

  return {
    // State
    loading,
    error,
    
    // Utility Operations
    logAccess,
    fetchShareTokenFromSimulation,
    isShareValid,
    generateShareUrl,
    generateInviteUrl,
    getDebugInfo,
    clearCache
  };
}