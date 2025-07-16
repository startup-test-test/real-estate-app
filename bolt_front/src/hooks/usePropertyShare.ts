import { useState } from 'react';
import { PropertyShare, ShareInvitation, ShareComment } from '../types';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useShareCRUD } from './useShareCRUD';
import { useShareInvitation } from './useShareInvitation';
import { useShareComments } from './useShareComments';
import { useShareReactions } from './useShareReactions';
import { useShareUtils } from './useShareUtils';

/**
 * 統合された物件共有フック
 * 全ての共有関連機能を統合し、後方互換性を維持
 */
export function usePropertyShare() {
  const { user } = useSupabaseAuth();
  
  // 分離されたフックを使用
  const crudHook = useShareCRUD();
  const invitationHook = useShareInvitation();
  const commentsHook = useShareComments();
  const reactionsHook = useShareReactions();
  const utilsHook = useShareUtils();
  
  // 統合されたローディング状態
  const loading = crudHook.loading || 
                  invitationHook.loading || 
                  commentsHook.loading || 
                  reactionsHook.loading || 
                  utilsHook.loading;

  // 統合されたエラー状態（最新のエラーを表示）
  const error = crudHook.error || 
                invitationHook.error || 
                commentsHook.error || 
                reactionsHook.error || 
                utilsHook.error;

  // 後方互換性のためのラッパー関数

  /**
   * 物件の共有を作成
   */
  const createShare = async (
    propertyId: string,
    title?: string,
    description?: string,
    expiresAt?: Date
  ): Promise<PropertyShare | null> => {
    return crudHook.createShare(propertyId, title, description, expiresAt);
  };

  /**
   * 共有をshare_tokenで取得
   */
  const fetchShare = async (shareToken: string): Promise<PropertyShare | null> => {
    return crudHook.fetchShare(shareToken);
  };

  /**
   * property_idで既存の共有を取得
   */
  const fetchShareByPropertyId = async (propertyId: string): Promise<PropertyShare | null> => {
    return crudHook.fetchShareByPropertyId(propertyId);
  };

  /**
   * property_idで共有を取得、なければ作成
   */
  const fetchOrCreateShareByPropertyId = async (
    propertyId: string,
    title?: string,
    description?: string
  ): Promise<PropertyShare | null> => {
    return crudHook.fetchOrCreateShareByPropertyId(propertyId, title, description);
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
    return invitationHook.sendInvitation(shareId, email, role, userType, message);
  };

  /**
   * マジックリンクでメール送信
   */
  const sendInvitationEmail = async (
    invitation: ShareInvitation,
    email: string,
    role: string,
    userType: string,
    message?: string,
    shareToken?: string
  ): Promise<boolean> => {
    return invitationHook.sendInvitationEmail(invitation, email, role, userType, message, shareToken);
  };

  /**
   * 招待を承認
   */
  const acceptInvitation = async (invitationToken: string): Promise<boolean> => {
    return invitationHook.acceptInvitation(invitationToken);
  };

  /**
   * 招待トークンから共有を取得
   */
  const fetchShareByInvitationToken = async (invitationToken: string): Promise<PropertyShare | null> => {
    return invitationHook.fetchShareByInvitationToken(invitationToken);
  };

  /**
   * コメントを投稿
   */
  const postComment = async (
    shareId: string,
    content: string,
    tags: string[] = [],
    parentId?: string
  ): Promise<ShareComment | null> => {
    const comment = await commentsHook.postComment(shareId, content, tags, parentId);
    
    // アクセスログを記録
    if (comment) {
      utilsHook.logAccess(shareId, 'comment');
    }
    
    return comment;
  };

  /**
   * テスト用コメント投稿
   */
  const postTestComment = async (shareId: string, content: string, tags: string[]): Promise<ShareComment | null> => {
    return commentsHook.postTestComment(shareId, content, tags);
  };

  /**
   * コメント一覧を取得
   */
  const fetchComments = async (shareId: string): Promise<ShareComment[]> => {
    const comments = await commentsHook.fetchComments(shareId);
    
    // アクセスログを記録
    if (comments.length > 0) {
      utilsHook.logAccess(shareId, 'view');
    }
    
    return comments;
  };

  /**
   * コメントを削除
   */
  const deleteComment = async (commentId: string): Promise<boolean> => {
    return commentsHook.deleteComment(commentId);
  };

  /**
   * コメントを編集
   */
  const editComment = async (
    commentId: string,
    content: string,
    tags: string[]
  ): Promise<ShareComment | null> => {
    return commentsHook.editComment(commentId, content, tags);
  };

  /**
   * リアクションを切り替え
   */
  const toggleReaction = async (commentId: string, reaction: string): Promise<boolean> => {
    const success = await reactionsHook.toggleReaction(commentId, reaction);
    
    // アクセスログを記録（コメントIDからshareIdを取得する必要があるため、簡略化）
    if (success) {
      // utilsHook.logAccess(shareId, 'reaction'); // shareIdが必要
    }
    
    return success;
  };

  /**
   * シミュレーションデータからshare_tokenを取得
   */
  const fetchShareTokenFromSimulation = async (propertyId: string): Promise<string | null> => {
    return utilsHook.fetchShareTokenFromSimulation(propertyId);
  };

  /**
   * ユーザーアクセスをログに記録
   */
  const logAccess = async (shareId: string, accessType: 'view' | 'comment' | 'reaction' = 'view'): Promise<void> => {
    return utilsHook.logAccess(shareId, accessType);
  };

  /**
   * 全キャッシュのクリア
   */
  const clearAllCache = () => {
    crudHook.clearShareCache();
    utilsHook.clearCache();
  };

  /**
   * デバッグ情報の取得
   */
  const getDebugInfo = () => {
    return {
      user: user ? { id: user.id, email: user.email } : null,
      loading: {
        crud: crudHook.loading,
        invitation: invitationHook.loading,
        comments: commentsHook.loading,
        reactions: reactionsHook.loading,
        utils: utilsHook.loading
      },
      errors: {
        crud: crudHook.error,
        invitation: invitationHook.error,
        comments: commentsHook.error,
        reactions: reactionsHook.error,
        utils: utilsHook.error
      },
      utils: utilsHook.getDebugInfo()
    };
  };

  return {
    // State
    loading,
    error,
    
    // CRUD Operations
    createShare,
    fetchShare,
    fetchShareByPropertyId,
    fetchOrCreateShareByPropertyId,
    
    // Invitation Operations
    sendInvitation,
    sendInvitationEmail,
    acceptInvitation,
    fetchShareByInvitationToken,
    
    // Comment Operations
    postComment,
    postTestComment,
    fetchComments,
    deleteComment,
    editComment,
    
    // Reaction Operations
    toggleReaction,
    
    // Utility Operations
    fetchShareTokenFromSimulation,
    logAccess,
    
    // Cache & Debug
    clearAllCache,
    getDebugInfo
  };
}