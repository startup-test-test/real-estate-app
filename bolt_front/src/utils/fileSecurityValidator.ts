/**
 * SEC-006: ファイルアップロードのセキュリティ検証
 * サーバー側検証をシミュレートし、追加のセキュリティチェックを実装
 */

// 悪意のあるコンテンツのパターン
const MALICIOUS_PATTERNS = [
  // スクリプトタグ
  /<script[\s>]/i,
  /<\/script>/i,
  // イベントハンドラ
  /\bon\w+\s*=/i,
  // JavaScript URI
  /javascript:/i,
  // データURI（一部の悪意のあるケース）
  /data:.*script/i,
  // SVGの悪意のあるコンテンツ
  /<svg[\s>].*onload/i,
  // PHPタグ
  /<\?php/i,
  /\?>/,
  // その他の実行可能コード
  /<embed/i,
  /<object/i,
  /<iframe/i
];

// 許可される拡張子
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

// 許可されるMIMEタイプ
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

/**
 * ファイル名の検証
 */
export function validateFileName(fileName: string): {
  isValid: boolean;
  error?: string;
} {
  // ファイル名の長さチェック
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'ファイル名が長すぎます（最大255文字）'
    };
  }

  // 危険な文字のチェック
  const dangerousChars = /[<>:"|?*\x00-\x1f\u202e\ufeff]/;
  if (dangerousChars.test(fileName)) {
    return {
      isValid: false,
      error: 'ファイル名に使用できない文字が含まれています'
    };
  }

  // パストラバーサル攻撃の防止
  if (fileName.includes('..') || fileName.includes('./') || fileName.includes('\\')) {
    return {
      isValid: false,
      error: '不正なファイル名です'
    };
  }

  // URLエンコードされたドットを検出
  if (/%2e/i.test(fileName)) {
    return {
      isValid: false,
      error: '不正なファイル名です'
    };
  }

  // 拡張子のチェック
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'サポートされていないファイル形式です'
    };
  }

  // 二重拡張子のチェック（例: image.php.jpg）
  const parts = fileName.split('.');
  if (parts.length > 2) {
    // 疑わしい拡張子のチェック
    const suspiciousExtensions = ['php', 'exe', 'sh', 'bat', 'cmd', 'com', 'js', 'vbs'];
    for (let i = 0; i < parts.length - 1; i++) {
      if (suspiciousExtensions.includes(parts[i].toLowerCase())) {
        return {
          isValid: false,
          error: '不正なファイル名形式です'
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * ファイル内容の詳細検証
 */
export async function validateFileContent(file: File): Promise<{
  isValid: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onloadend = (e) => {
      if (!e.target?.result) {
        resolve({
          isValid: false,
          error: 'ファイルの読み込みに失敗しました'
        });
        return;
      }

      const content = e.target.result.toString();
      
      // 悪意のあるパターンのチェック
      for (const pattern of MALICIOUS_PATTERNS) {
        if (pattern.test(content)) {
          resolve({
            isValid: false,
            error: '不正なコンテンツが検出されました'
          });
          return;
        }
      }

      resolve({ isValid: true });
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'ファイルの検証に失敗しました'
      });
    };

    // ファイルの最初の1MBを読み込んで検証
    const blob = file.slice(0, 1024 * 1024);
    reader.readAsText(blob);
  });
}

/**
 * MIMEタイプの厳密な検証
 */
export function validateMimeType(file: File): {
  isValid: boolean;
  error?: string;
} {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `許可されていないファイルタイプです: ${file.type}`
    };
  }

  return { isValid: true };
}

/**
 * 総合的なファイルセキュリティ検証
 */
export async function performSecurityValidation(file: File): Promise<{
  isValid: boolean;
  error?: string;
  warnings?: string[];
}> {
  const warnings: string[] = [];

  // 1. ファイル名の検証
  const fileNameValidation = validateFileName(file.name);
  if (!fileNameValidation.isValid) {
    return {
      isValid: false,
      error: fileNameValidation.error
    };
  }

  // 2. MIMEタイプの検証
  const mimeTypeValidation = validateMimeType(file);
  if (!mimeTypeValidation.isValid) {
    return {
      isValid: false,
      error: mimeTypeValidation.error
    };
  }

  // 3. ファイルサイズの追加チェック
  const MIN_SIZE = 1024; // 1KB
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  
  if (file.size < MIN_SIZE) {
    warnings.push('ファイルサイズが小さすぎます（1KB未満）');
  }
  
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: 'ファイルサイズが大きすぎます（最大2MB）'
    };
  }

  // 4. ファイル内容の検証（テキストとして読める部分のチェック）
  const contentValidation = await validateFileContent(file);
  if (!contentValidation.isValid) {
    return {
      isValid: false,
      error: contentValidation.error
    };
  }

  // 5. 画像の実際のサイズチェック（追加のセキュリティ）
  try {
    const imageDimensions = await getImageDimensions(file);
    if (imageDimensions.width > 10000 || imageDimensions.height > 10000) {
      return {
        isValid: false,
        error: '画像サイズが大きすぎます（最大10000x10000ピクセル）'
      };
    }
    
    if (imageDimensions.width < 10 || imageDimensions.height < 10) {
      warnings.push('画像サイズが非常に小さいです');
    }
  } catch (error) {
    // 画像サイズの取得に失敗した場合は警告として扱う
    warnings.push('画像サイズの検証をスキップしました');
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * 画像の実際のサイズを取得
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = url;
  });
}

/**
 * セキュアなファイル名の生成
 */
export function generateSecureFileName(originalFileName: string): string {
  // 拡張子を取得（大文字を小文字に変換）
  let extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  
  // 許可された拡張子でない場合はjpgをデフォルトにする
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    extension = 'jpg';
  }
  
  // タイムスタンプとランダム文字列でユニークなファイル名を生成
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedName = `property_${timestamp}_${randomString}.${extension}`;
  
  return sanitizedName;
}

/**
 * SEC-014: ファイルパスのサニタイゼーション
 * パストラバーサル攻撃を防ぐための厳密なパス検証
 */
export function sanitizeFilePath(filePath: string): {
  isValid: boolean;
  sanitizedPath?: string;
  error?: string;
} {
  // 空のパスは無効
  if (!filePath || filePath.trim() === '') {
    return {
      isValid: false,
      error: '空のファイルパスです'
    };
  }

  // パストラバーサル攻撃のパターンを検出
  const dangerousPatterns = [
    /\.\./,           // 親ディレクトリへの参照
    /\.\.\\/, 
    /^\.\//,          // カレントディレクトリへの参照（先頭のみ）
    /^\.\\/, 
    /~/, 
    /%2e%2e/i,        // URLエンコードされた..
    /%252e%252e/i,    // ダブルエンコードされた..
    /%c0%af/i,        // バックスラッシュのバリエーション
    /%c1%9c/i,
    /\x00/,           // NULL文字
    /[\x01-\x1f]/,    // 制御文字
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(filePath)) {
      return {
        isValid: false,
        error: '不正なファイルパスです'
      };
    }
  }

  // Windowsスタイルのパスセパレータを統一
  let normalizedPath = filePath.replace(/\\/g, '/');

  // 複数の連続したスラッシュを単一に
  normalizedPath = normalizedPath.replace(/\/+/g, '/');

  // 先頭と末尾のスラッシュを削除
  normalizedPath = normalizedPath.replace(/^\/+|\/+$/g, '');

  // ファイル名のみを抽出（ディレクトリトラバーサルを防ぐ）
  const fileName = normalizedPath.split('/').pop() || '';

  // ファイル名の検証
  const fileNameValidation = validateFileName(fileName);
  if (!fileNameValidation.isValid) {
    return {
      isValid: false,
      error: fileNameValidation.error
    };
  }

  return {
    isValid: true,
    sanitizedPath: fileName
  };
}

/**
 * URLからセキュアなファイル名を抽出
 */
export function extractSecureFileNameFromUrl(url: string): string | null {
  try {
    // 基本的なURLプロトコルチェック
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }
    
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // ファイル名のサニタイゼーション
    const sanitizationResult = sanitizeFilePath(fileName);
    
    if (sanitizationResult.isValid && sanitizationResult.sanitizedPath) {
      return sanitizationResult.sanitizedPath;
    }
    
    return null;
  } catch (error) {
    // URL解析エラーは静かに処理（ログ出力は本番環境では避ける）
    return null;
  }
}