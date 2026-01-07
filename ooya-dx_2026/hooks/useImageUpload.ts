import { useState } from 'react';
import { resizeImage, validateImageFile } from '../lib/utils/imageUtils';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  imageUrl: string | null;
}

export const useImageUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    imageUrl: null
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // ファイル検証
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setUploadState(prev => ({ ...prev, error: validation.error || 'ファイルが無効です' }));
        return null;
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
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.85
      });

      setUploadState(prev => ({ ...prev, progress: 60 }));

      // Vercel Blobにアップロード
      const formData = new FormData();
      formData.append('file', resizedFile);

      const response = await fetch('/api/blob/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'アップロードに失敗しました');
      }

      const data = await response.json();
      const publicUrl = data.url;

      setUploadState(prev => ({ ...prev, progress: 90 }));

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
      // Vercel Blobの削除はサーバーサイドAPIで行う
      const response = await fetch('/api/blob/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) {
        console.error('Delete failed');
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
