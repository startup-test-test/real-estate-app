import { useState } from 'react';
import { usePropertyShare } from './usePropertyShare';
import { PropertyShare } from '../types';

interface InvitationResult {
  success: boolean;
  invitationUrl?: string;
  errorMessage?: string;
}

interface UseInvitationSenderOptions {
  onShareCreated?: (share: PropertyShare) => void;
}

export const useInvitationSender = ({ onShareCreated }: UseInvitationSenderOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createShare, sendInvitation } = usePropertyShare();

  const generateInvitationUrl = (token: string, type: 'collaboration' | 'simple' = 'collaboration'): string => {
    const basePath = type === 'collaboration' ? '/collaboration' : '/simple-collaboration';
    return `${window.location.origin}${basePath}/${token}`;
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const createOrGetShare = async (
    propertyId: string,
    shareTitle: string,
    shareDescription: string,
    existingShare?: PropertyShare
  ): Promise<PropertyShare | null> => {
    if (existingShare) {
      return existingShare;
    }

    const newShare = await createShare(propertyId, shareTitle, shareDescription);
    if (newShare && onShareCreated) {
      onShareCreated(newShare);
    }
    return newShare;
  };

  const sendInvitationEmail = async (
    propertyId: string,
    email: string,
    propertyName: string,
    shareTitle: string,
    shareDescription: string,
    existingShare?: PropertyShare
  ): Promise<InvitationResult> => {
    if (!email.trim()) {
      return {
        success: false,
        errorMessage: 'メールアドレスを入力してください'
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 共有を作成または取得
      const currentShare = await createOrGetShare(propertyId, shareTitle, shareDescription, existingShare);
      
      if (!currentShare) {
        return {
          success: false,
          errorMessage: '共有の作成に失敗しました。データベース設定を確認してください。'
        };
      }

      console.log('🚀 送信する招待情報:', {
        shareId: currentShare.id,
        email,
        propertyName,
        shareToken: currentShare.share_token
      });

      // 2. 招待を作成してメール送信
      console.log('📧 sendInvitation関数を呼び出し中...');
      const invitation = await sendInvitation(
        currentShare.id,
        email,
        'commenter', // 全員コメント可能に固定
        'general',   // ユーザータイプは汎用に固定
        undefined
      );

      console.log('📊 sendInvitation結果:', invitation);

      if (invitation) {
        // 成功時の処理
        const invitationUrl = generateInvitationUrl(invitation.invitation_token, 'collaboration');
        const copied = await copyToClipboard(invitationUrl);
        
        const successMessage = copied 
          ? `🎉 招待リンクをクリップボードにコピーしました！\n\n${email} に以下をお送りください：\n\n「不動産投資シミュレーションの検討にご招待します。\nこちらのリンクからご確認ください：\n${invitationUrl}\n\n※リンクの有効期限は7日間です。」`
          : `🎉 招待リンクを生成しました！\n\n以下のリンクを ${email} にお送りください：\n\n${invitationUrl}\n\n※リンクの有効期限は7日間です。`;

        return {
          success: true,
          invitationUrl,
          errorMessage: successMessage
        };
      } else {
        // メール送信失敗時のフォールバック
        const fallbackUrl = generateInvitationUrl(currentShare.share_token, 'simple');
        return {
          success: false,
          invitationUrl: fallbackUrl,
          errorMessage: `⚠️ 招待処理でエラーが発生しました。\n\n代替として招待リンクを生成しました：\n${fallbackUrl}\n\nこのリンクを ${email} に手動で送信してください。`
        };
      }

    } catch (err) {
      console.error('Invitation error:', err);
      
      // エラー時のフォールバック処理
      const errorResult: InvitationResult = {
        success: false,
        errorMessage: '❌ 招待処理でエラーが発生しました。しばらく時間をおいて再度お試しください。'
      };

      // 共有が作成済みの場合はフォールバックURLを提供
      try {
        const fallbackShare = await createOrGetShare(propertyId, shareTitle, shareDescription, existingShare);
        if (fallbackShare) {
          const fallbackUrl = generateInvitationUrl(fallbackShare.share_token, 'simple');
          errorResult.invitationUrl = fallbackUrl;
          errorResult.errorMessage = `❌ 招待処理でエラーが発生しました。\n\n代替手段として招待リンクを生成しました:\n${fallbackUrl}\n\nこのリンクを ${email} に手動で送信してください。`;
        }
      } catch (fallbackError) {
        console.error('Fallback share creation failed:', fallbackError);
      }

      const errorMessage = err instanceof Error ? err.message : errorResult.errorMessage;
      setError(errorMessage);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendInvitationEmail,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};