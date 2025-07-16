import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PropertyShare, ShareInvitation } from '../types';
import { useSupabaseAuth } from './useSupabaseAuth';
import { handleEmailError, withLoadingState, SHARE_ERROR_MESSAGES } from '../utils/shareErrorHandler';
import { useShareCRUD } from './useShareCRUD';

export function useShareInvitation() {
  const { user } = useSupabaseAuth();
  const { fetchShare } = useShareCRUD();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * マジックリンクでメール送信（新規・既存ユーザー両方対応）
   */
  const sendInvitationEmail = async (
    invitation: ShareInvitation,
    email: string,
    role: string,
    userType: string,
    message?: string,
    shareToken?: string
  ): Promise<boolean> => {
    console.log('🚀 sendInvitationEmail開始（マジックリンク方式）', {
      invitationId: invitation.id,
      email,
      role,
      userType,
      invitationToken: invitation.invitation_token,
      shareToken
    });

    try {
      // 招待情報付きのログインページURLを生成
      const inviterName = encodeURIComponent(user?.email?.split('@')[0] || 'ユーザー');
      const finalShareUrl = shareToken 
        ? `${window.location.origin}/simple-collaboration/${shareToken}`
        : `${window.location.origin}/collaboration/${invitation.invitation_token}`;
      
      const loginPageUrl = `${window.location.origin}/login?invitation=true&from=${inviterName}&redirect=${encodeURIComponent(finalShareUrl)}`;
      
      console.log('🔗 生成されたURL:', {
        招待URL: `${window.location.origin}/collaboration/${invitation.invitation_token}`,
        ログインページURL: loginPageUrl,
        最終リダイレクト先: finalShareUrl
      });
      
      // マジックリンクでメール送信（ログインページに誘導）
      console.log('📤 Supabase signInWithOtp (ログインページ誘導) 呼び出し中...');
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: loginPageUrl, // 招待情報付きログインページへ
          data: {
            invitation_type: 'property_share',
            invitation_id: invitation.id,
            inviter_name: user?.email || 'ユーザー',
            property_name: '投資物件シミュレーション',
            role: role,
            user_type: userType,
            message: message || '',
            is_invitation: true,
            share_token: shareToken
          }
        }
      });

      if (error) {
        handleEmailError(error, setError);
        return false;
      }

      console.log('✅ マジックリンクメール送信成功:', data);
      console.log('📧 使用されたテンプレート: Magic Link');
      console.log('🔗 ログインページURL:', loginPageUrl);
      console.log('📨 メール内容: SupabaseのMagic Linkテンプレートが使用されます');
      
      return true;
    } catch (error) {
      console.error('❌ メール送信エラー:', error);
      handleEmailError(error, setError);
      return false;
    }
  };

  /**
   * 招待を送信
   */
  const sendInvitation = async (
    shareId: string,
    email: string,
    role: string,
    userType: string,
    message?: string
  ): Promise<boolean> => {
    return withLoadingState(async () => {
      console.log('📧 sendInvitation開始:', { shareId, email, role, userType });

      if (!user?.id) {
        throw new Error(SHARE_ERROR_MESSAGES.UNAUTHORIZED);
      }

      // 招待レコードを作成
      const { data: invitation, error: invitationError } = await supabase
        .from('share_invitations')
        .insert({
          share_id: shareId,
          email,
          role,
          user_type: userType,
          invited_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (invitationError) {
        console.error('❌ 招待レコード作成失敗:', invitationError);
        throw new Error(`${SHARE_ERROR_MESSAGES.INVITATION_SEND_FAILED}: ${invitationError.message}`);
      }

      console.log('✅ 招待レコード作成成功:', invitation);

      // 共有のshare_tokenを取得
      const share = await fetchShare(shareId);
      const shareToken = share?.share_token;

      console.log('🔗 取得したshare_token:', shareToken);

      // メール送信
      const emailSent = await sendInvitationEmail(
        invitation,
        email,
        role,
        userType,
        message,
        shareToken
      );

      if (!emailSent) {
        // メール送信失敗時は招待レコードを削除
        await supabase
          .from('share_invitations')
          .delete()
          .eq('id', invitation.id);
        
        throw new Error(SHARE_ERROR_MESSAGES.INVITATION_SEND_FAILED);
      }

      console.log('✅ 招待送信完了');
      return true;
    }, setLoading, setError, '招待の送信') !== null;
  };

  /**
   * 招待を承認
   */
  const acceptInvitation = async (invitationToken: string): Promise<boolean> => {
    return withLoadingState(async () => {
      console.log('✅ acceptInvitation called with token:', invitationToken);

      if (!user?.id) {
        throw new Error(SHARE_ERROR_MESSAGES.UNAUTHORIZED);
      }

      const { data, error } = await supabase
        .from('share_invitations')
        .update({
          status: 'accepted',
          accepted_by: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('invitation_token', invitationToken)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        console.error('❌ 招待承認失敗:', error);
        if (error.code === 'PGRST116') {
          throw new Error('招待が見つからないか、既に処理済みです');
        }
        throw error;
      }

      console.log('✅ 招待承認成功:', data);
      return true;
    }, setLoading, setError, '招待の承認') !== null;
  };

  /**
   * 招待トークンから共有を取得
   */
  const fetchShareByInvitationToken = async (invitationToken: string): Promise<PropertyShare | null> => {
    return withLoadingState(async () => {
      console.log('🔍 fetchShareByInvitationToken called with:', invitationToken);

      // 招待情報を取得
      const { data: invitation, error: invitationError } = await supabase
        .from('share_invitations')
        .select('share_id')
        .eq('invitation_token', invitationToken)
        .single();

      if (invitationError) {
        console.error('❌ 招待情報取得失敗:', invitationError);
        if (invitationError.code === 'PGRST116') {
          return null;
        }
        throw invitationError;
      }

      // 共有情報を取得
      const { data: share, error: shareError } = await supabase
        .from('property_shares')
        .select('*')
        .eq('id', invitation.share_id)
        .single();

      if (shareError) {
        console.error('❌ 共有情報取得失敗:', shareError);
        if (shareError.code === 'PGRST116') {
          return null;
        }
        throw shareError;
      }

      console.log('✅ 招待トークンから共有取得成功:', share);
      return share;
    }, setLoading, setError, '招待からの共有取得');
  };

  return {
    // State
    loading,
    error,
    
    // Invitation Operations
    sendInvitation,
    sendInvitationEmail,
    acceptInvitation,
    fetchShareByInvitationToken
  };
}