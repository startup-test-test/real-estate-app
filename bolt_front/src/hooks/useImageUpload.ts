import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { resizeImage, validateImageFileAsync } from '../utils/imageUtils';
import { performSecurityValidation, generateSecureFileName } from '../utils/fileSecurityValidator';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  imageUrl: string | null;
}

// Base64フォールバック関数
const saveImageAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        console.log('✅ Base64保存成功');
        resolve(reader.result);
      } else {
        reject(new Error('Base64変換に失敗しました'));
      }
    };
    reader.onerror = () => reject(new Error('ファイル読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
};

export const useImageUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    imageUrl: null
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // ファイル検証（SEC-010対応: マジックナンバーチェックを含む）
      const validation = await validateImageFileAsync(file);
      if (!validation.isValid) {
        setUploadState(prev => ({ ...prev, error: validation.error || 'ファイルが無効です' }));
        return null;
      }

      // SEC-006: 追加のセキュリティ検証
      const securityValidation = await performSecurityValidation(file);
      if (!securityValidation.isValid) {
        setUploadState(prev => ({ ...prev, error: securityValidation.error || 'セキュリティ検証に失敗しました' }));
        return null;
      }
      
      // 警告がある場合はコンソールに出力
      if (securityValidation.warnings) {
        console.warn('ファイルアップロードの警告:', securityValidation.warnings);
      }

      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        imageUrl: null
      });

      // 画像をリサイズ・圧縮
      setUploadState(prev => ({ ...prev, progress: 30 }));
      const resizedFile = await resizeImage(file, {
        maxWidth: 600,
        maxHeight: 400,
        quality: 0.7
      });

      // SEC-006: セキュアなファイル名を生成
      const secureFileName = generateSecureFileName(resizedFile.name);
      const fileName = `property-images/${secureFileName}`;

      setUploadState(prev => ({ ...prev, progress: 60 }));

      // Supabase Storageにアップロード
      if (!supabase) {
        throw new Error('Supabaseクライアントが初期化されていません');
      }

      console.log('🔑 Supabaseクライアント確認:', {
        exists: !!supabase,
        hasStorage: !!supabase.storage,
        hasAuth: !!supabase.auth
      });

      // バケット確認（作成はスキップしてエラー回避）
      console.log('🔍 既存バケット確認中...');
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log('📋 利用可能なバケット:', buckets);
      
      let targetBucket = 'property-images';
      const propertyImagesExists = buckets?.some((bucket: any) => bucket.name === 'property-images');
      
      if (!propertyImagesExists) {
        console.log('⚠️ property-imagesバケットが存在しません');
        
        // 代替案1: 他の既存バケットを使用
        if (buckets && buckets.length > 0) {
          targetBucket = buckets[0].name;
          console.log(`🔄 代替バケットを使用: ${targetBucket}`);
        } else {
          // 代替案2: ローカルBase64保存（Supabaseを使わない）
          console.log('💡 ローカルBase64保存にフォールバック');
          setUploadState(prev => ({ ...prev, progress: 90 }));
          const base64Url = await saveImageAsBase64(resizedFile);
          
          setUploadState({
            isUploading: false,
            progress: 100,
            error: null,
            imageUrl: base64Url
          });
          
          return base64Url;
        }
      } else {
        console.log('✅ property-imagesバケットを使用');
      }

      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, resizedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`アップロードに失敗しました: ${error.message}`);
      }

      setUploadState(prev => ({ ...prev, progress: 90 }));

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        imageUrl: publicUrl
      });

      return publicUrl;

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました';
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        imageUrl: null
      });

      return null;
    }
  };

  const resetUploadState = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      imageUrl: null
    });
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      if (!supabase) {
        throw new Error('Supabaseクライアントが初期化されていません');
      }

      // URLからファイルパスを抽出
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `property-images/${fileName}`;

      const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return {
    uploadState,
    uploadImage,
    resetUploadState,
    deleteImage
  };
};