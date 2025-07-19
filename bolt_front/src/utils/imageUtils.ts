/**
 * 画像処理ユーティリティ
 * リサイズ、圧縮、ファイル検証など
 */

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0
}

/**
 * 画像ファイルをリサイズ・圧縮する
 */
export const resizeImage = (
  file: File, 
  options: ImageResizeOptions = {}
): Promise<File> => {
  const { 
    maxWidth = 600, 
    maxHeight = 400, 
    quality = 0.7 
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 元の画像サイズ
      let { width, height } = img;

      // アスペクト比を保持してリサイズ
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // キャンバスサイズを設定
      canvas.width = width;
      canvas.height = height;

      // 画像を描画
      ctx?.drawImage(img, 0, 0, width, height);

      // Blobに変換
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('画像の圧縮に失敗しました'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * ファイルが画像かどうかチェック
 */
export const isImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

/**
 * ファイルのマジックナンバーを検証（SEC-010対応）
 * 実際のファイル内容を確認して、偽装されたファイルを検出
 */
export const validateImageMagicNumber = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onloadend = (e) => {
      if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
        resolve(false);
        return;
      }
      
      const arr = new Uint8Array(e.target.result);
      
      // 各画像形式のマジックナンバーをチェック
      // JPEG: FF D8 FF
      if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
        resolve(true);
        return;
      }
      
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47 &&
          arr[4] === 0x0D && arr[5] === 0x0A && arr[6] === 0x1A && arr[7] === 0x0A) {
        resolve(true);
        return;
      }
      
      // WebP: RIFF...WEBP
      if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
          arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) {
        resolve(true);
        return;
      }
      
      // マジックナンバーが一致しない場合は偽装ファイル
      resolve(false);
    };
    
    reader.onerror = () => {
      resolve(false);
    };
    
    // ファイルの最初の12バイトを読み込む（WebPの判定に必要）
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
};

/**
 * 安全な画像ファイル検証（MIMEタイプとマジックナンバーの両方をチェック）
 */
export const isSecureImageFile = async (file: File): Promise<{
  isValid: boolean;
  error?: string;
}> => {
  // まずMIMEタイプをチェック
  if (!isImageFile(file)) {
    return {
      isValid: false,
      error: 'サポートされていないファイル形式です。JPEG、PNG、WebPのみ対応しています。'
    };
  }
  
  // 次にマジックナンバーをチェック
  const hasValidMagicNumber = await validateImageMagicNumber(file);
  if (!hasValidMagicNumber) {
    return {
      isValid: false,
      error: 'ファイルの内容が画像形式と一致しません。正しい画像ファイルをアップロードしてください。'
    };
  }
  
  return { isValid: true };
};

/**
 * ファイルサイズチェック
 */
export const isValidFileSize = (file: File, maxSizeInMB: number = 2): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * ファイル検証（サイズ＋形式）
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!isImageFile(file)) {
    return {
      isValid: false,
      error: 'JPEG、PNG、WebP形式の画像ファイルのみアップロード可能です'
    };
  }

  if (!isValidFileSize(file, 2)) {
    return {
      isValid: false,
      error: 'ファイルサイズは2MB以下にしてください'
    };
  }

  return { isValid: true };
};

/**
 * 非同期版の画像ファイル検証（SEC-010対応でマジックナンバーチェックを含む）
 */
export const validateImageFileAsync = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // まず同期的な検証を実施
  const basicValidation = validateImageFile(file);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // 次にマジックナンバーの検証を実施
  const secureValidation = await isSecureImageFile(file);
  return secureValidation;
};

/**
 * ファイルサイズをMB単位で取得
 */
export const getFileSizeInMB = (file: File): number => {
  return Number((file.size / (1024 * 1024)).toFixed(2));
};