import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

interface CollaborationAuthOptions {
  token: string;
  shareTitle?: string;
}

interface AuthRedirectParams {
  inviterName: string;
  shareUrl: string;
  token: string;
  shareTitle: string;
}

export const useCollaborationAuth = ({ token, shareTitle }: CollaborationAuthOptions) => {
  const { user } = useSupabaseAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const generateLoginUrl = ({ inviterName, shareUrl, token, shareTitle }: AuthRedirectParams): string => {
    const loginPageUrl = `${window.location.origin}/login?invitation=true&from=${encodeURIComponent(inviterName)}&redirect=${encodeURIComponent(shareUrl)}`;
    return loginPageUrl;
  };

  const savePendingInvitation = (token: string, title: string) => {
    localStorage.setItem('pendingInvitationToken', token);
    localStorage.setItem('pendingInvitationTitle', title);
  };

  const checkAuthRequired = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('auth');
  };

  const redirectToLogin = (shareData: any) => {
    console.log('🔐 User not authenticated for collaboration view');
    
    // 無限リダイレクト防止チェック
    if (checkAuthRequired()) {
      console.log('Auth flag detected, showing auth required message');
      setRequiresAuth(true);
      setAuthChecked(true);
      return;
    }

    console.log('Setting auth required flag and saving token');
    savePendingInvitation(token, shareData.title || shareTitle || '物件共有');
    
    // リダイレクト用URLを生成
    const inviterName = shareData.owner_id || 'ユーザー';
    const shareUrl = `${window.location.origin}/collaboration/${token}`;
    const loginPageUrl = generateLoginUrl({
      inviterName,
      shareUrl,
      token,
      shareTitle: shareData.title || shareTitle || '物件共有'
    });
    
    console.log('🔗 Redirecting to login with invitation context:', loginPageUrl);
    
    // Magic Link形式でログインページに遷移
    window.location.href = loginPageUrl;
  };

  const checkAuthentication = (shareData: any): boolean => {
    if (!user) {
      redirectToLogin(shareData);
      return false;
    }
    
    console.log('👤 User authenticated:', user.email);
    setAuthChecked(true);
    return true;
  };

  const clearPendingInvitation = () => {
    localStorage.removeItem('pendingInvitationToken');
    localStorage.removeItem('pendingInvitationTitle');
  };

  // 初期化時にauth状態をチェック
  useEffect(() => {
    if (checkAuthRequired() && !user) {
      setRequiresAuth(true);
      setAuthChecked(true);
    }
  }, [user]);

  return {
    user,
    authChecked,
    requiresAuth,
    checkAuthentication,
    clearPendingInvitation,
    isAuthenticated: !!user && authChecked
  };
};