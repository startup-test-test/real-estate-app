import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { withLoadingState, SHARE_ERROR_MESSAGES } from '../utils/shareErrorHandler';

export function useShareReactions() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * リアクションを切り替え（追加/削除）
   */
  const toggleReaction = async (commentId: string, reaction: string): Promise<boolean> => {
    return withLoadingState(async () => {
      console.log('👍 toggleReaction called with:', { commentId, reaction, userId: user?.id });

      if (!user?.id) {
        throw new Error(SHARE_ERROR_MESSAGES.UNAUTHORIZED);
      }

      // 既存のリアクションを確認
      const { data: existingReaction, error: checkError } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('reaction', reaction)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ リアクション確認失敗:', checkError);
        throw checkError;
      }

      if (existingReaction) {
        // 既存のリアクションを削除
        console.log('🗑️ Removing existing reaction:', existingReaction.id);
        
        const { error: deleteError } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          console.error('❌ リアクション削除失敗:', deleteError);
          throw deleteError;
        }

        console.log('✅ リアクション削除成功');
      } else {
        // 新しいリアクションを追加
        console.log('➕ Adding new reaction');
        
        const { error: insertError } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction
          });

        if (insertError) {
          console.error('❌ リアクション追加失敗:', insertError);
          throw insertError;
        }

        console.log('✅ リアクション追加成功');
      }

      return true;
    }, setLoading, setError, 'リアクションの処理') !== null;
  };

  /**
   * コメントのリアクション数を取得
   */
  const getReactionCounts = async (commentId: string): Promise<Record<string, number>> => {
    return withLoadingState(async () => {
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('reaction')
        .eq('comment_id', commentId);

      if (error) {
        console.error('❌ リアクション数取得失敗:', error);
        throw error;
      }

      // リアクション別の集計
      const counts: Record<string, number> = {};
      data?.forEach(({ reaction }) => {
        counts[reaction] = (counts[reaction] || 0) + 1;
      });

      return counts;
    }, setLoading, setError, 'リアクション数の取得') || {};
  };

  /**
   * ユーザーのリアクション状態を取得
   */
  const getUserReactions = async (commentId: string): Promise<string[]> => {
    return withLoadingState(async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('comment_reactions')
        .select('reaction')
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ ユーザーリアクション取得失敗:', error);
        throw error;
      }

      return data?.map(({ reaction }) => reaction) || [];
    }, setLoading, setError, 'ユーザーリアクションの取得') || [];
  };

  return {
    // State
    loading,
    error,
    
    // Reaction Operations
    toggleReaction,
    getReactionCounts,
    getUserReactions
  };
}