import { useState } from 'react';
import { usePropertyShare } from './usePropertyShare';
import { createMockProperty, createMockSimulation, createFallbackShareData } from '../utils/collaborationMocks';

interface CollaborationDataResult {
  shareData: any;
  property: any;
  simulation: any;
  canComment: boolean;
}

export const useCollaborationData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    fetchShareByInvitationToken, 
    fetchShare, 
    logAccess,
    acceptInvitation 
  } = usePropertyShare();

  const fetchShareData = async (token: string): Promise<any> => {
    console.log('🔍 Processing invitation token:', token);
    
    // まず招待トークンから共有情報を取得を試行
    try {
      const shareData = await fetchShareByInvitationToken(token);
      console.log('📊 Share data from invitation token:', shareData);
      return shareData;
    } catch (tokenError) {
      console.warn('⚠️ 招待トークンでの取得に失敗、フォールバック処理を実行:', tokenError);
      
      // フォールバック: トークンを直接share_tokenとして試行
      try {
        const shareData = await fetchShare(token);
        console.log('📊 Share data from direct token:', shareData);
        return shareData;
      } catch (directError) {
        console.error('❌ 直接トークンでも取得失敗:', directError);
        
        // 最終フォールバック: モックデータで動作させる
        console.log('🎭 フォールバックモードで動作します');
        return createFallbackShareData(token);
      }
    }
  };

  const processShareData = async (shareData: any, user: any): Promise<CollaborationDataResult> => {
    if (!shareData) {
      throw new Error('共有リンクが無効または期限切れです');
    }

    console.log('🔍 Share details:', {
      id: shareData.id,
      property_id: shareData.property_id,
      share_token: shareData.share_token,
      title: shareData.title
    });

    // アクセスログを記録
    try {
      await logAccess(shareData.id, 'view');
    } catch (logError) {
      console.warn('⚠️ アクセスログの記録に失敗:', logError);
    }

    // 物件情報を生成（模擬データ）
    console.log('Setting up mock property data...');
    const mockProperty = createMockProperty(shareData);

    // シミュレーション情報を生成（模擬データ）
    const mockSimulation = createMockSimulation(shareData);

    // ユーザーの権限を確認
    const canComment = !!user; // 認証されていればコメント可能

    return {
      shareData,
      property: mockProperty,
      simulation: mockSimulation,
      canComment
    };
  };

  const loadCollaborationData = async (token: string, user: any): Promise<CollaborationDataResult | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading collaboration data for token:', token);
      console.log('👤 Current user:', user);
      
      // 共有データを取得
      const shareData = await fetchShareData(token);
      
      // データを処理
      const result = await processShareData(shareData, user);
      
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの読み込みに失敗しました';
      console.error('Error loading share data:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationToken: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await acceptInvitation(invitationToken);
      if (!success) {
        setError('招待の承認に失敗しました');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '招待の承認に失敗しました';
      setError(errorMessage);
      return false;
    }
  };

  return {
    loading,
    error,
    loadCollaborationData,
    handleAcceptInvitation,
    clearError: () => setError(null)
  };
};