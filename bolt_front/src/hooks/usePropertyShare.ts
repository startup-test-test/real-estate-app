import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  PropertyShare, 
  ShareInvitation, 
  ShareComment, 
  CommentReaction 
} from '../types';
import { useSupabaseAuth } from './useSupabaseAuth';

export function usePropertyShare() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 物件の共有を作成
  const createShare = async (
    propertyId: string,
    title?: string,
    description?: string,
    expiresAt?: Date
  ): Promise<PropertyShare | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Creating share with:', {
        property_id: propertyId,
        owner_id: user?.id,
        title,
        description,
        expires_at: expiresAt?.toISOString(),
      });

      // 一時的にpropertyIdをUUIDとして生成（テスト用）
      let actualPropertyId = propertyId;
      
      if (propertyId === 'temp-id' || !propertyId) {
        // ランダムなUUIDを生成（一時的な解決策）
        actualPropertyId = crypto.randomUUID();
      }

      const { data, error } = await supabase
        .from('property_shares')
        .insert({
          property_id: actualPropertyId,
          owner_id: user?.id,
          title,
          description,
          expires_at: expiresAt?.toISOString(),
        })
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Share creation error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // Supabaseエラーの詳細を取得
      if (err && typeof err === 'object' && 'message' in err) {
        console.error('Error message:', err.message);
      }
      if (err && typeof err === 'object' && 'details' in err) {
        console.error('Error details:', err.details);
      }
      if (err && typeof err === 'object' && 'hint' in err) {
        console.error('Error hint:', err.hint);
      }
      if (err && typeof err === 'object' && 'code' in err) {
        console.error('Error code:', err.code);
      }
      
      const errorMessage = err instanceof Error ? err.message : 
                          (err && typeof err === 'object' && 'message' in err) ? err.message :
                          '共有の作成に失敗しました';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // メール送信機能
  const sendInvitationEmail = async (
    invitation: ShareInvitation,
    email: string,
    role: string,
    userType: string,
    message?: string
  ): Promise<boolean> => {
    try {
      const response = await supabase.functions.invoke('send-invitation', {
        body: {
          invitationId: invitation.id,
          email: email,
          inviterName: user?.email || 'ユーザー',
          propertyName: '投資物件', // 実際の物件名に置き換え
          invitationUrl: `${window.location.origin}/collaboration/${invitation.invitation_token}`,
          role: role,
          userType: userType,
          message: message
        }
      });

      if (response.error) {
        console.error('Email sending failed:', response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  };

  // 招待を送信
  const sendInvitation = async (
    shareId: string,
    email: string,
    role: 'viewer' | 'commenter' | 'editor' = 'commenter',
    userType: 'family' | 'tax_accountant' | 'consultant' | 'general' = 'general',
    message?: string
  ): Promise<ShareInvitation | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('share_invitations')
        .insert({
          share_id: shareId,
          email,
          role,
          user_type: userType,
          invited_by: user?.id,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      
      // 招待作成後、メール送信を実行（一時的に無効化）
      if (data) {
        console.log('招待が正常に作成されました:', data);
        // const emailSent = await sendInvitationEmail(data, email, role, userType, message);
        // if (!emailSent) {
        //   console.warn('Invitation created but email sending failed');
        // }
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '招待の送信に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 招待を承認
  const acceptInvitation = async (
    invitationToken: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // まず招待を取得
      const { data: invitation, error: fetchError } = await supabase
        .from('share_invitations')
        .select('*')
        .eq('invitation_token', invitationToken)
        .eq('status', 'pending')
        .single();

      if (fetchError || !invitation) {
        throw new Error('有効な招待が見つかりません');
      }

      // 招待を承認
      const { error: updateError } = await supabase
        .from('share_invitations')
        .update({
          status: 'accepted',
          accepted_by: user?.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '招待の承認に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // コメントを投稿
  const postComment = async (
    shareId: string,
    content: string,
    tags: string[] = [],
    parentId?: string
  ): Promise<ShareComment | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('share_comments')
        .insert({
          share_id: shareId,
          user_id: user?.id,
          content,
          tags,
          parent_id: parentId,
        })
        .select(`
          *,
          user:auth.users(id, email, raw_user_meta_data)
        `)
        .single();

      if (error) throw error;
      
      // ユーザー情報を整形
      if (data && data.user) {
        data.user = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.raw_user_meta_data?.full_name,
          avatar_url: data.user.raw_user_meta_data?.avatar_url,
        };
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの投稿に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // コメントを取得
  const fetchComments = async (
    shareId: string
  ): Promise<ShareComment[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('share_comments')
        .select(`
          *,
          user:auth.users(id, email, raw_user_meta_data),
          reactions:comment_reactions(
            *,
            user:auth.users(id, email, raw_user_meta_data)
          )
        `)
        .eq('share_id', shareId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // ユーザー情報を整形
      const formattedData = data?.map(comment => ({
        ...comment,
        user: comment.user ? {
          id: comment.user.id,
          email: comment.user.email,
          full_name: comment.user.raw_user_meta_data?.full_name,
          avatar_url: comment.user.raw_user_meta_data?.avatar_url,
        } : undefined,
        reactions: comment.reactions?.map((reaction: any) => ({
          ...reaction,
          user: reaction.user ? {
            id: reaction.user.id,
            email: reaction.user.email,
            full_name: reaction.user.raw_user_meta_data?.full_name,
          } : undefined,
        })),
      })) || [];

      // 親子関係を構築
      const commentMap = new Map<string, ShareComment>();
      formattedData.forEach(comment => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
      });

      const rootComments: ShareComment[] = [];
      formattedData.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies?.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      return rootComments;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの取得に失敗しました');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // リアクションを追加/削除
  const toggleReaction = async (
    commentId: string,
    reaction: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // 既存のリアクションを確認
      const { data: existing } = await supabase
        .from('comment_reactions')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user?.id)
        .eq('reaction', reaction)
        .single();

      if (existing) {
        // 既存の場合は削除
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // 新規の場合は追加
        const { error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user?.id,
            reaction,
          });
        
        if (error) throw error;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リアクションの更新に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 共有情報を取得
  const fetchShare = async (
    shareToken: string
  ): Promise<PropertyShare | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching share with token:', shareToken);
      
      const { data, error } = await supabase
        .from('property_shares')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      console.log('Share fetch result:', { data, error });

      if (error) {
        console.error('Share fetch error:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Failed to fetch share:', err);
      setError(err instanceof Error ? err.message : '共有情報の取得に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // アクセスログを記録
  const logAccess = async (
    shareId: string,
    action: 'view' | 'comment' | 'edit' | 'download'
  ): Promise<void> => {
    try {
      await supabase
        .from('share_access_logs')
        .insert({
          share_id: shareId,
          user_id: user?.id,
          action,
          user_agent: navigator.userAgent,
        });
    } catch (err) {
      console.error('アクセスログの記録に失敗しました:', err);
    }
  };

  // プロパティIDから共有情報を取得
  const fetchShareByPropertyId = async (
    propertyId: string
  ): Promise<PropertyShare | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching share by property ID:', propertyId);
      console.log('🔍 Current user ID:', user?.id);
      
      const { data, error } = await supabase
        .from('property_shares')
        .select('*')
        .eq('property_id', propertyId)
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('📊 Share fetch result:', { data, error, code: error?.code });
      
      // すべての共有を確認（デバッグ用）
      const { data: allShares } = await supabase
        .from('property_shares')
        .select('*')
        .eq('owner_id', user?.id);
      console.log('📋 All user shares:', allShares);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Share fetch error:', error);
        return null;
      }
      
      return data || null;
    } catch (err) {
      console.error('💥 Failed to fetch share by property ID:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createShare,
    sendInvitation,
    acceptInvitation,
    postComment,
    fetchComments,
    toggleReaction,
    fetchShare,
    fetchShareByPropertyId,
    logAccess,
  };
}