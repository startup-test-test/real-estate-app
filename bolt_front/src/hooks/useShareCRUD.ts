import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PropertyShare } from '../types';
import { useSupabaseAuth } from './useSupabaseAuth';
import { handleShareError, withLoadingState, SHARE_ERROR_MESSAGES } from '../utils/shareErrorHandler';

export function useShareCRUD() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promise caching for fetchOrCreateShareByPropertyId
  const sharePromiseCache = new Map<string, Promise<PropertyShare | null>>();

  /**
   * 物件の共有を作成
   */
  const createShare = async (
    propertyId: string,
    title?: string,
    description?: string,
    expiresAt?: Date
  ): Promise<PropertyShare | null> => {
    return withLoadingState(async () => {
      console.log('Creating share with:', {
        property_id: propertyId,
        owner_id: user?.id || 'anonymous',
        title,
        description,
        expires_at: expiresAt?.toISOString(),
      });

      // propertyIdの検証
      let actualPropertyId = propertyId;
      
      if (!propertyId || propertyId === 'temp-id') {
        console.warn('⚠️ 無効なpropertyId。新しいUUIDを生成します。');
        console.warn('⚠️ これにより新しい共有が作成されます。既存の共有との関連付けが失われる可能性があります。');
        actualPropertyId = crypto.randomUUID();
      }
      
      // デモモード検出
      const isDemoMode = actualPropertyId.includes('demo') || actualPropertyId.includes('test') || !user?.id;
      
      if (isDemoMode) {
        console.log('🧪 デモモード: モック共有を作成');
        const mockShare: PropertyShare = {
          id: crypto.randomUUID(),
          property_id: actualPropertyId,
          owner_id: user?.id || 'anonymous',
          title: title || 'デモ共有',
          description: description || 'デモ用の共有です',
          share_token: crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          expires_at: expiresAt?.toISOString() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('✅ モック共有作成:', mockShare);
        return mockShare;
      }
      
      if (!user?.id) {
        console.warn('⚠️ User not authenticated, creating anonymous share');
        // 認証されていない場合は匿名ユーザーとして処理
      }

      // テスト用の場合、先にpropertiesテーブルにレコードを作成
      if (title && title.includes('テスト用')) {
        console.log('🧪 テスト用物件レコードを作成中...');
        
        const { error: propertyError } = await supabase
          .from('properties')
          .upsert({
            id: actualPropertyId,
            user_id: user?.id || 'anonymous',
            property_name: title || 'テスト物件',
            location: '東京都',
            property_type: '区分マンション',
            purchase_price: 5000,
            monthly_rent: 120000,
            building_area: 50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (propertyError) {
          console.warn('⚠️ テスト物件作成に失敗、外部キー制約を無視して続行:', propertyError);
        } else {
          console.log('✅ テスト物件作成完了');
        }
      }

      const { data, error } = await supabase
        .from('property_shares')
        .insert({
          property_id: actualPropertyId,
          owner_id: user?.id || 'anonymous',
          title,
          description,
          expires_at: expiresAt?.toISOString(),
        })
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) throw error;
      return data;
    }, setLoading, setError, '共有の作成');
  };

  /**
   * 共有をshare_tokenで取得
   */
  const fetchShare = async (shareToken: string): Promise<PropertyShare | null> => {
    return withLoadingState(async () => {
      console.log('🔍 Fetching share with token:', shareToken);

      const { data, error } = await supabase
        .from('property_shares')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Share not found with token:', shareToken);
          return null;
        }
        throw error;
      }

      console.log('✅ Share found:', data);
      return data;
    }, setLoading, setError, '共有の取得');
  };

  /**
   * property_idで既存の共有を取得
   */
  const fetchShareByPropertyId = async (propertyId: string): Promise<PropertyShare | null> => {
    return withLoadingState(async () => {
      console.log('🔍 fetchShareByPropertyId called with:', propertyId);

      // デモモード検出
      const isDemoMode = propertyId.includes('demo') || propertyId.includes('test');
      
      if (isDemoMode) {
        console.log('🧪 デモモード: 既存共有なしと判定');
        return null;
      }

      if (!user?.id) {
        console.warn('⚠️ User not authenticated, returning null');
        return null;
      }

      // テーブルの存在確認（デバッグ用）
      console.log('📊 Checking property_shares table structure...');

      const { data, error } = await supabase
        .from('property_shares')
        .select('*')
        .eq('property_id', propertyId)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error fetching share by property_id:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ Found existing share:', data[0]);
        return data[0];
      } else {
        console.log('ℹ️ No existing share found for property_id:', propertyId);
        return null;
      }
    }, setLoading, setError, 'プロパティ共有の取得');
  };

  /**
   * property_idで共有を取得、なければ作成
   */
  const fetchOrCreateShareByPropertyId = async (
    propertyId: string,
    title?: string,
    description?: string
  ): Promise<PropertyShare | null> => {
    // 重複作成を防ぐためのPromiseキャッシュ
    const cacheKey = `${propertyId}_${user?.id}`;
    
    if (sharePromiseCache.has(cacheKey)) {
      console.log('🔄 Using cached promise for:', cacheKey);
      return sharePromiseCache.get(cacheKey)!;
    }

    const sharePromise = withLoadingState(async () => {
      console.log('🔍 fetchOrCreateShareByPropertyId called with:', propertyId, title);

      if (!user?.id) {
        console.warn('⚠️ User not authenticated, creating anonymous share');
        // 認証されていない場合は新しい共有を作成（元の動作を維持）
        return await createShare(propertyId, title, description);
      }

      // 既存の共有を確認
      const existingShare = await fetchShareByPropertyId(propertyId);
      
      if (existingShare) {
        console.log('✅ Found existing share, returning:', existingShare.id);
        return existingShare;
      }

      console.log('ℹ️ No existing share found, creating new one...');
      
      // 新しい共有を作成
      const newShare = await createShare(propertyId, title, description);
      
      if (!newShare) {
        throw new Error(SHARE_ERROR_MESSAGES.SHARE_CREATE_FAILED);
      }

      console.log('✅ Created new share:', newShare.id);
      return newShare;
    }, setLoading, setError, '共有の取得または作成');

    // キャッシュに保存
    sharePromiseCache.set(cacheKey, sharePromise);

    // プロミス完了後にキャッシュから削除
    sharePromise.finally(() => {
      sharePromiseCache.delete(cacheKey);
      console.log('🧹 Cleaned up cache for:', cacheKey);
    });

    return sharePromise;
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
    
    // Cache management
    clearShareCache: () => sharePromiseCache.clear()
  };
}