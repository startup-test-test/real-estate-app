/**
 * 使用制限管理ユーティリティ
 * 完全無料プラン（無制限）
 */

import { supabase } from '../lib/supabase';

export interface UsageStatus {
  canUse: boolean;           // 利用可能かどうか（常にtrue）
  currentCount: number;       // 現在の利用回数
  limit: number;             // 制限回数（-1: 無制限）
  isSubscribed: boolean;      // ベーシック会員かどうか
  periodEndDate: Date | null; // リセット日
  daysLeft: number;          // 残り日数
  cancelAtPeriodEnd?: boolean; // 解約予定かどうか
  currentPeriodEnd?: Date | null; // 現在の請求期間終了日
}

/**
 * 使用制限をチェック
 */
export const checkUsageLimit = async (userId: string): Promise<UsageStatus> => {
  try {
    // 1. サブスクリプション状態を確認
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('status, cancel_at_period_end, current_period_end, cancel_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    const subscription = subscriptions?.[0] || null;

    // 解約予定日を過ぎている場合は無料プランとして扱う
    if (subscription?.cancel_at && new Date(subscription.cancel_at) < new Date()) {
      // 無料プランとして処理を継続
    } else if (subscription?.status === 'active') {
      // ベーシック会員の場合は無制限
      return {
        canUse: true,
        currentCount: 0,
        limit: -1,
        isSubscribed: true,
        periodEndDate: null,
        daysLeft: -1,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : null
      };
    }

    // 2. 完全無料プラン - 無制限で利用可能
    // 使用状況は統計目的のみで記録するが、制限はかけない
    const { data, error } = await supabase
      .rpc('check_and_reset_usage', { p_user_id: userId });

    if (error) {
      console.error('使用状況確認エラー:', error);
    }

    const usage = data?.[0] || { current_count: 0, period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };

    // 完全無料プラン: 常に利用可能
    return {
      canUse: true,  // 常に利用可能
      currentCount: usage.current_count,
      limit: -1,  // 無制限
      isSubscribed: false,
      periodEndDate: null,
      daysLeft: -1
    };
  } catch (error) {
    console.error('使用制限チェックエラー:', error);
    // エラー時もサービス継続性を優先（無制限）
    return {
      canUse: true,
      currentCount: 0,
      limit: -1,
      isSubscribed: false,
      periodEndDate: null,
      daysLeft: -1
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