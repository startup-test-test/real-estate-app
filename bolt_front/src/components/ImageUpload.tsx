import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import { getFileSizeInMB } from '../utils/imageUtils';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { uploadState, uploadImage, resetUploadState, deleteImage } = useImageUpload();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // プレビュー用のローカルURL生成
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // ファイルアップロード実行
    const uploadedUrl = await uploadImage(file);
    
    if (uploadedUrl) {
      onImageUploaded(uploadedUrl);
      // ローカルプレビューを削除して、アップロード済み画像を表示
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(uploadedUrl);
    } else {
      // アップロード失敗時はプレビューを削除
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(currentImageUrl || null);
    }

    // ファイルインプットをリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      const success = await deleteImage(currentImageUrl);
      if (success) {
        console.log('画像を削除しました');
      }
    }
    
    setPreviewUrl(null);
    onImageRemoved();
    resetUploadState();
  };

  const renderUploadArea = () => {
    if (uploadState.isUploading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-600 mb-2">画像をアップロード中...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{uploadState.progress}%</p>
        </div>
      );
    }

    if (previewUrl) {
      return (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="物件画像プレビュー"
            className="w-full h-40 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
            <button
              onClick={handleRemoveImage}
              disabled={disabled || uploadState.isUploading}
              className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={handleFileSelect}
        disabled={disabled}
        className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg py-8 px-4 text-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            画像をアップロード
          </p>
          <p className="text-xs text-gray-500">
            クリックして画像を選択
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPEG, PNG, WebP (最大2MB)
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <ImageIcon className="w-4 h-4 text-gray-500" />
        <label className="block text-sm font-medium text-gray-700">
          物件画像（任意）
        </label>
      </div>
      
      {renderUploadArea()}
      
      {uploadState.error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{uploadState.error}</p>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        💡 物件写真を保存しておくと、後で物件を見つけやすくなります
      </p>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;