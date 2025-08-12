/**
 * 管理者用ユーティリティ関数
 * 開発・テスト環境でのみ使用
 */

import { supabase } from '../lib/supabase';

/**
 * 特定ユーザーの使用回数をリセット
 * @param userId ユーザーID
 * @returns 成功/失敗
 */
export const resetUserUsage = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .update({
        usage_count: 0,
        period_start_date: new Date().toISOString(),
        period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    
    console.log('✅ 使用回数をリセットしました');
    return { success: true, data };
  } catch (error) {
    console.error('❌ リセットエラー:', error);
    return { success: false, error };
  }
};

/**
 * 特定ユーザーの使用回数を設定
 * @param userId ユーザーID
 * @param count 設定する回数
 * @returns 成功/失敗
 */
export const setUserUsageCount = async (userId: string, count: number) => {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .update({
        usage_count: count,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    
    console.log(`✅ 使用回数を${count}回に設定しました`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ 設定エラー:', error);
    return { success: false, error };
  }
};

/**
 * ユーザーの使用状況を取得
 * @param userId ユーザーID
 * @returns 使用状況
 */
export const getUserUsageInfo = async (userId: string) => {
  try {
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (usageError && usageError.code !== 'PGRST116') throw usageError;

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') throw subError;

    return {
      success: true,
      data: {
        usage: usage || { usage_count: 0 },
        subscription: subscription || null,
        isSubscribed: !!subscription
      }
    };
  } catch (error) {
    console.error('❌ 取得エラー:', error);
    return { success: false, error };
  }
};

/**
 * デバッグ用: コンソールから使用可能な管理関数
 * ブラウザのコンソールで以下のように使用:
 * window.adminUtils.resetMyUsage()
 */
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).adminUtils = {
    // 現在のユーザーの使用回数をリセット
    resetMyUsage: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('ログインしていません');
        return;
      }
      return resetUserUsage(user.id);
    },
    
    // 現在のユーザーの使用回数を設定
    setMyUsage: async (count: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('ログインしていません');
        return;
      }
      return setUserUsageCount(user.id, count);
    },
    
    // 現在のユーザーの使用状況を確認
    checkMyUsage: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('ログインしていません');
        return;
      }
      const result = await getUserUsageInfo(user.id);
      if (result.success) {
        console.table(result.data);
      }
      return result;
    }
  };
  
  console.log('🔧 管理ユーティリティが利用可能です:');
  console.log('  window.adminUtils.resetMyUsage() - 使用回数をリセット');
  console.log('  window.adminUtils.setMyUsage(2) - 使用回数を2回に設定');
  console.log('  window.adminUtils.checkMyUsage() - 現在の使用状況を確認');
}