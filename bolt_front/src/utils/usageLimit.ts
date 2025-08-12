/**
 * 使用制限管理ユーティリティ
 * 月3回制限のフリーミアムモデル対応
 */

import { supabase } from '../lib/supabase';

export interface UsageStatus {
  canUse: boolean;           // 利用可能かどうか
  currentCount: number;       // 現在の利用回数
  limit: number;             // 制限回数（無料:3, プレミアム:-1）
  isSubscribed: boolean;      // プレミアム会員かどうか
  periodEndDate: Date | null; // リセット日
  daysLeft: number;          // 残り日数
}

/**
 * 使用制限をチェック
 */
export const checkUsageLimit = async (userId: string): Promise<UsageStatus> => {
  try {
    // 1. サブスクリプション状態を確認
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .single();

    // プレミアム会員の場合は無制限
    if (subscription?.status === 'active') {
      return {
        canUse: true,
        currentCount: 0,
        limit: -1,
        isSubscribed: true,
        periodEndDate: null,
        daysLeft: -1
      };
    }

    // 2. 無料プランの使用状況を確認（自動リセット込み）
    const { data, error } = await supabase
      .rpc('check_and_reset_usage', { p_user_id: userId });

    if (error) {
      console.error('使用状況確認エラー:', error);
      // エラー時は制限なしとして扱う（サービス継続性優先）
      return {
        canUse: true,
        currentCount: 0,
        limit: 3,
        isSubscribed: false,
        periodEndDate: null,
        daysLeft: 30
      };
    }

    const usage = data?.[0] || { current_count: 0, period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
    const periodEnd = new Date(usage.period_end);
    const daysLeft = Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return {
      canUse: usage.current_count < 3,  // 月3回制限
      currentCount: usage.current_count,
      limit: 3,
      isSubscribed: false,
      periodEndDate: periodEnd,
      daysLeft: Math.max(0, daysLeft)
    };
  } catch (error) {
    console.error('使用制限チェックエラー:', error);
    // エラー時はサービス継続性を優先
    return {
      canUse: true,
      currentCount: 0,
      limit: 3,
      isSubscribed: false,
      periodEndDate: null,
      daysLeft: 30
    };
  }
};

/**
 * 使用回数をインクリメント
 */
export const incrementUsage = async (userId: string, featureType: string): Promise<number> => {
  try {
    // 1. 利用履歴を記録
    await supabase.from('usage_history').insert({
      user_id: userId,
      feature_type: featureType,
      feature_data: { 
        timestamp: new Date().toISOString(),
        feature: featureType
      }
    });

    // 2. カウントをインクリメント
    const { data: currentUsage } = await supabase
      .from('user_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .single();

    const newCount = (currentUsage?.usage_count || 0) + 1;

    // 3. カウントを更新
    const { error } = await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        usage_count: newCount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('使用回数更新エラー:', error);
      return currentUsage?.usage_count || 0;
    }

    return newCount;
  } catch (error) {
    console.error('使用回数インクリメントエラー:', error);
    return 0;
  }
};

/**
 * 使用履歴を取得
 */
export const getUsageHistory = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('usage_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('使用履歴取得エラー:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('使用履歴取得エラー:', error);
    return [];
  }
};

/**
 * 使用状況をリセット（テスト用）
 */
export const resetUsageCount = async (userId: string) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('リセット機能は開発環境でのみ使用可能です');
    return;
  }

  try {
    const { error } = await supabase
      .from('user_usage')
      .update({
        usage_count: 0,
        period_start_date: new Date().toISOString(),
        period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('使用回数リセットエラー:', error);
    }
  } catch (error) {
    console.error('使用回数リセットエラー:', error);
  }
};