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
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85
  } = options;

  return new Promise((resolve, reject) => {
    console.log('🔄 画像リサイズ開始:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      maxWidth,
      maxHeight,
      quality
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 元の画像サイズ
      let { width, height } = img;
      console.log('📐 元の画像サイズ: width=' + width + ', height=' + height);

      // サイズが0の場合はエラー
      if (width === 0 || height === 0) {
        console.error('❌ 画像サイズが0です');
        reject(new Error('画像サイズの取得に失敗しました'));
        return;
      }

      // アスペクト比を保持してリサイズ
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      console.log('📐 リサイズ後のサイズ: width=' + width + ', height=' + height);

      // キャンバスサイズを設定
      canvas.width = width;
      canvas.height = height;

      // 画像を描画
      if (!ctx) {
        console.error('❌ Canvas 2D context を取得できません');
        reject(new Error('Canvas 2D context を取得できませんでした'));
        return;
      }

      // 白背景で塗りつぶし（透過PNG対策）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height);
      console.log('✅ Canvas に描画完了');

      // 出力形式を決定（JPEG推奨、PNGも対応）
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      console.log('📦 出力形式:', outputType);

      // Blobに変換
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            console.log('✅ Blob変換成功: size=' + blob.size + ', type=' + blob.type);
            const resizedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            console.error('❌ Blob変換失敗: blobがnullまたはサイズ0');
            // フォールバック：元のファイルをそのまま返す
            console.log('⚠️ フォールバック：元ファイルを使用');
            resolve(file);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = (e) => {
      console.error('❌ 画像の読み込みエラー:', e);
      reject(new Error('画像の読み込みに失敗しました'));
    };

    const objectUrl = URL.createObjectURL(file);
    console.log('🔗 画像読み込み用URL:', objectUrl);
    img.src = objectUrl;
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
 * ファイルサイズチェック
 */
export const isValidFileSize = (file: File, maxSizeInMB: number = 1): boolean => {
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

  if (!isValidFileSize(file, 1)) {
    return {
      isValid: false,
      error: 'ファイルサイズは1MB以下にしてください'
    };
  }

  return { isValid: true };
};

/**
 * ファイルサイズをMB単位で取得
 */
export const getFileSizeInMB = (file: File): number => {
  return Number((file.size / (1024 * 1024)).toFixed(2));
};