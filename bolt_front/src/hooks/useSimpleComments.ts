import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface SimpleComment {
  id: string;
  share_id: string; // page_idの代わり
  user_id: string;
  content: string;
  tags?: string[];
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user_email?: string; // オプション
}

export function useSimpleComments(pageId: string) {
  const { user } = useSupabaseAuth();
  const [comments, setComments] = useState<SimpleComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 有効なproperty_shareレコードを確保する関数
  const ensureValidPropertyShare = async (token: string): Promise<string | null> => {
    try {
      console.log('🔍 Checking for existing property_share with token:', token);
      
      // まず既存のshareがあるかチェック
      const { data: existingShare, error: fetchError } = await supabase
        .from('property_shares')
        .select('id')
        .eq('share_token', token)
        .single();

      if (existingShare && !fetchError) {
        console.log('✅ Found existing property_share:', existingShare.id);
        return existingShare.id;
      }

      console.log('🔨 Creating new property_share for token:', token);
      
      // 存在しない場合は新規作成
      const { data: newShare, error: createError } = await supabase
        .from('property_shares')
        .insert({
          id: crypto.randomUUID(),
          property_id: token, // tokenをそのままproperty_idとして使用
          owner_id: user!.id,
          share_token: token,
          title: '招待コラボレーション',
          description: 'シンプルコラボレーション機能',
          settings: {
            allow_comments: true,
            allow_download: false
          }
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating property_share:', createError);
        return null;
      }

      console.log('✅ Created new property_share:', newShare.id);
      return newShare.id;
    } catch (err) {
      console.error('❌ Error in ensureValidPropertyShare:', err);
      return null;
    }
  };

  // コメントを取得
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 Fetching comments for page:', pageId);

      // 有効なproperty_shareレコードを確保
      const shareId = await ensureValidPropertyShare(pageId);
      if (!shareId) {
        console.warn('⚠️ No valid share found, skipping database fetch');
        throw new Error('有効な共有が見つかりません');
      }

      console.log('🔍 Fetching comments for share_id:', shareId);

      // 既存のshare_commentsテーブルを使用し、share_idとして有効なIDを使用
      const { data, error } = await supabase
        .from('share_comments')
        .select('*')
        .eq('share_id', shareId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching comments:', JSON.stringify(error, null, 2));
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        throw error;
      }

      console.log('✅ Comments fetched:', data?.length || 0);
      
      // コメントデータにuser情報を追加（現在のユーザー情報から）
      const commentsWithUser = (data || []).map(comment => ({
        ...comment,
        user_email: comment.user_id === user?.id ? user.email : 'ユーザー'
      }));
      
      setComments(commentsWithUser);
    } catch (err: any) {
      console.error('❌ Fetch comments error:', err);
      setError(err.message || 'コメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // コメントを投稿
  const postComment = async (content: string): Promise<SimpleComment | null> => {
    console.log('🚀 Starting comment post process...');
    console.log('📋 Current state:', {
      user: user ? 'EXISTS' : 'NULL',
      userId: user?.id,
      userEmail: user?.email,
      pageId,
      contentLength: content?.length || 0
    });

    if (!user) {
      console.error('❌ User not authenticated');
      setError('ログインが必要です');
      return null;
    }

    if (!content.trim()) {
      console.error('❌ Content is empty');
      setError('コメント内容を入力してください');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📝 Posting comment:', {
        content: content.substring(0, 50) + '...',
        page_id: pageId,
        user_id: user.id,
        user_email: user.email
      });

      // まず有効なproperty_shareレコードを確保
      const shareId = await ensureValidPropertyShare(pageId);
      if (!shareId) {
        throw new Error('有効な共有が作成できませんでした');
      }

      console.log('📝 Using share_id for comment:', shareId);

      // 既存のテーブル構造に合わせてデータを挿入
      const { data, error } = await supabase
        .from('share_comments')
        .insert({
          share_id: shareId, // 有効なshare_idを使用
          user_id: user.id,
          content: content.trim(),
          tags: [] // 空の配列
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error posting comment:', JSON.stringify(error, null, 2));
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        throw error;
      }

      console.log('✅ Comment posted successfully:', data);
      
      // コメントにuser情報を追加
      const commentWithUser = {
        ...data,
        user_email: user.email
      };
      
      // コメントリストを更新
      setComments(prev => [...prev, commentWithUser]);
      
      return commentWithUser;
    } catch (err: any) {
      console.error('❌ Post comment error:', err);
      setError(err.message || 'コメントの投稿に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // コメントを削除
  const deleteComment = async (commentId: string): Promise<boolean> => {
    if (!user) {
      setError('ログインが必要です');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('share_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // 自分のコメントのみ削除可能

      if (error) {
        console.error('❌ Error deleting comment:', error);
        throw error;
      }

      console.log('✅ Comment deleted successfully');
      
      // コメントリストから削除
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      return true;
    } catch (err: any) {
      console.error('❌ Delete comment error:', err);
      setError(err.message || 'コメントの削除に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ページIDが変わったらコメントを再取得
  useEffect(() => {
    if (pageId) {
      fetchComments();
    }
  }, [pageId]);

  return {
    comments,
    loading,
    error,
    postComment,
    deleteComment,
    refetch: fetchComments
  };
}