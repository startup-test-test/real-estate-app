import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ShareComment {
  id: string;
  share_id: string;
  user_id: string;
  content: string;
  tags?: string[];
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export function useShareComments(shareToken: string) {
  const [comments, setComments] = useState<ShareComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);

  // 共有トークンから直接コメントを取得
  const fetchComments = async () => {
    if (!shareToken) {
      console.log('⚠️ No share token provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 Fetching comments for share token:', shareToken);

      // まず、このトークンに対応するproperty_shareを探す
      const { data: shareData, error: shareError } = await supabase
        .from('property_shares')
        .select('id')
        .eq('share_token', shareToken)
        .single();

      if (shareError || !shareData) {
        console.log('⚠️ No property_share found for token:', shareToken);
        setComments([]);
        return;
      }

      console.log('✅ Found property_share:', shareData.id);
      setShareId(shareData.id); // share_idを保存

      // share_idを使ってコメントを取得（usersテーブルとの結合なし）
      const { data, error } = await supabase
        .from('share_comments')
        .select('*')
        .eq('share_id', shareData.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching comments:', error);
        throw error;
      }

      console.log('✅ Comments fetched:', data?.length || 0);
      console.log('📋 Raw comment data:', data);
      
      // コメントデータにuser情報を追加（user_idから手動で設定）
      const commentsWithUser = (data || []).map((comment: any) => ({
        ...comment,
        user_email: 'ユーザー' // 外部キー関係がないため、一旦「ユーザー」と表示
      }));
      
      setComments(commentsWithUser);
    } catch (err: any) {
      console.error('❌ Fetch comments error:', err);
      setError(err.message || 'コメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // リアルタイムサブスクリプションの設定
  useEffect(() => {
    if (!shareId) return;

    console.log('🔔 Setting up realtime subscription for share_id:', shareId);

    // share_commentsテーブルの変更を監視
    const channel = supabase
      .channel(`share-comments-${shareId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE全てを監視
          schema: 'public',
          table: 'share_comments',
          filter: `share_id=eq.${shareId}`
        },
        (payload: any) => {
          console.log('🔄 Realtime event received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // 新しいコメントを追加
            const newComment = {
              ...payload.new,
              user_email: 'ユーザー'
            } as ShareComment;
            setComments(prev => [...prev, newComment]);
          } else if (payload.eventType === 'DELETE') {
            // コメントを削除
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            // コメントを更新
            setComments(prev => prev.map(c => 
              c.id === payload.new.id 
                ? { ...payload.new, user_email: 'ユーザー' } as ShareComment
                : c
            ));
          }
        }
      )
      .subscribe();

    // クリーンアップ
    return () => {
      console.log('🔕 Unsubscribing from realtime');
      channel.unsubscribe();
    };
  }, [shareId]);

  // トークンが変わったらコメントを再取得
  useEffect(() => {
    if (shareToken) {
      fetchComments();
    }
  }, [shareToken]);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments
  };
}