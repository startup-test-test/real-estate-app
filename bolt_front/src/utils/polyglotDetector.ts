/**
 * SEC-027: ポリグロットファイル攻撃対策
 * 画像ファイルに埋め込まれた悪意のあるコードを検出
 */

/**
 * ポリグロットファイルの検出結果
 */
export interface PolyglotDetectionResult {
  isClean: boolean;
  threats: string[];
  confidence: number; // 0-100
}

/**
 * HTMLタグパターンを検出
 */
const detectHTMLPatterns = (buffer: ArrayBuffer): string[] => {
  const threats: string[] = [];
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(buffer).toLowerCase();
  
  // 危険なHTMLタグパターン
  const dangerousPatterns = [
    // スクリプトタグ
    /<script[\s>]/,
    /<\/script>/,
    
    // イベントハンドラ
    /\bon\w+\s*=/,
    /javascript:/,
    /vbscript:/,
    
    // iframe/embed/object
    /<iframe[\s>]/,
    /<embed[\s>]/,
    /<object[\s>]/,
    
    // フォームタグ
    /<form[\s>]/,
    /<input[\s>]/,
    
    // メタタグ（リダイレクト）
    /<meta[^>]+http-equiv/,
    
    // base64エンコードされたデータURL
    /data:text\/html/,
    /data:application\/javascript/,
  ];
  
  dangerousPatterns.forEach((pattern, index) => {
    if (pattern.test(text)) {
      threats.push(`危険なHTMLパターンが検出されました (Type ${index + 1})`);
    }
  });
  
  return threats;
};

/**
 * PHPコードパターンを検出
 */
const detectPHPPatterns = (buffer: ArrayBuffer): string[] => {
  const threats: string[] = [];
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(buffer);
  
  // PHPコードパターン
  const phpPatterns = [
    /<\?php/,
    /<\?=/,
    /<\?/,
    /eval\s*\(/,
    /system\s*\(/,
    /exec\s*\(/,
    /shell_exec\s*\(/,
    /passthru\s*\(/,
    /\$_GET/,
    /\$_POST/,
    /\$_REQUEST/,
    /\$_SESSION/,
    /\$_COOKIE/,
  ];
  
  phpPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      threats.push('PHPコードパターンが検出されました');
      return; // 一つ見つかれば十分
    }
  });
  
  return threats;
};

/**
 * 実行可能ファイルのシグネチャを検出
 */
const detectExecutableSignatures = (buffer: ArrayBuffer): string[] => {
  const threats: string[] = [];
  const arr = new Uint8Array(buffer);
  
  // 実行可能ファイルのマジックナンバー
  // PE (Windows実行ファイル): MZ
  if (arr[0] === 0x4D && arr[1] === 0x5A) {
    threats.push('Windows実行ファイルのシグネチャが検出されました');
  }
  
  // ELF (Linux実行ファイル): 7F 45 4C 46
  if (arr[0] === 0x7F && arr[1] === 0x45 && arr[2] === 0x4C && arr[3] === 0x46) {
    threats.push('Linux実行ファイルのシグネチャが検出されました');
  }
  
  // Mach-O (macOS実行ファイル): CE FA ED FE
  if ((arr[0] === 0xCE && arr[1] === 0xFA && arr[2] === 0xED && arr[3] === 0xFE) ||
      (arr[0] === 0xCF && arr[1] === 0xFA && arr[2] === 0xED && arr[3] === 0xFE)) {
    threats.push('macOS実行ファイルのシグネチャが検出されました');
  }
  
  // ZIP/JAR: PK
  if (arr[0] === 0x50 && arr[1] === 0x4B) {
    threats.push('ZIPアーカイブのシグネチャが検出されました');
  }
  
  return threats;
};

/**
 * 画像ファイルの構造を検証
 */
const validateImageStructure = (buffer: ArrayBuffer, fileType: string): string[] => {
  const threats: string[] = [];
  const arr = new Uint8Array(buffer);
  
  if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
    // JPEGの終端マーカー（FF D9）を探す
    let foundEnd = false;
    for (let i = arr.length - 2; i >= 0; i--) {
      if (arr[i] === 0xFF && arr[i + 1] === 0xD9) {
        foundEnd = true;
        // 終端マーカーの後にデータがある場合は疑わしい
        if (i < arr.length - 10) { // 10バイト以上のデータがある
          const extraData = arr.length - i - 2;
          threats.push(`JPEG終端マーカーの後に${extraData}バイトの不審なデータが存在します`);
        }
        break;
      }
    }
    if (!foundEnd) {
      threats.push('JPEGの終端マーカーが見つかりません');
    }
  }
  
  if (fileType === 'image/png') {
    // PNGの終端チャンク（IEND）を探す
    const iendSignature = [0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82];
    let foundEnd = false;
    
    for (let i = arr.length - iendSignature.length; i >= 0; i--) {
      let match = true;
      for (let j = 0; j < iendSignature.length; j++) {
        if (arr[i + j] !== iendSignature[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        foundEnd = true;
        if (i < arr.length - iendSignature.length - 10) {
          const extraData = arr.length - i - iendSignature.length;
          threats.push(`PNG終端チャンクの後に${extraData}バイトの不審なデータが存在します`);
        }
        break;
      }
    }
    if (!foundEnd) {
      threats.push('PNGの終端チャンク（IEND）が見つかりません');
    }
  }
  
  return threats;
};

/**
 * コメント領域の悪意のあるコードを検出
 */
const detectMaliciousComments = (buffer: ArrayBuffer): string[] => {
  const threats: string[] = [];
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(buffer);
  
  // EXIFコメントやその他のメタデータ内の疑わしいパターン
  const suspiciousPatterns = [
    /<!--[\s\S]*?-->/g, // HTMLコメント
    /\/\*[\s\S]*?\*\//g, // CSSコメント
    /\/\/.*$/gm, // JavaScriptコメント
  ];
  
  suspiciousPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // コメント内に実行可能コードがないかチェック
        if (/<script|javascript:|eval\(|system\(|exec\(/i.test(match)) {
          threats.push('画像のメタデータ内に疑わしいコードが検出されました');
        }
      });
    }
  });
  
  return threats;
};

/**
 * ポリグロットファイルを検出
 */
export const detectPolyglotFile = async (
  file: File
): Promise<PolyglotDetectionResult> => {
  const threats: string[] = [];
  
  try {
    // ファイル全体を読み込む（最大10MB）
    const maxSize = 10 * 1024 * 1024;
    const fileToRead = file.size > maxSize ? file.slice(0, maxSize) : file;
    
    // FileReader を使用してarrayBufferを読み込む
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(fileToRead);
    });
    
    // 各種検出を実行
    threats.push(...detectHTMLPatterns(buffer));
    threats.push(...detectPHPPatterns(buffer));
    threats.push(...detectExecutableSignatures(buffer));
    threats.push(...validateImageStructure(buffer, file.type));
    threats.push(...detectMaliciousComments(buffer));
    
    // ファイル名の検証
    const suspiciousExtensions = ['.php', '.exe', '.js', '.html', '.htm', '.jsp', '.asp'];
    const lowerFileName = file.name.toLowerCase();
    suspiciousExtensions.forEach(ext => {
      if (lowerFileName.includes(ext)) {
        threats.push(`ファイル名に疑わしい拡張子が含まれています: ${ext}`);
      }
    });
    
    // 二重拡張子の検出
    const extensionCount = (file.name.match(/\./g) || []).length;
    if (extensionCount > 1) {
      threats.push('二重拡張子が検出されました（例: image.php.jpg）');
    }
    
    // 信頼度スコアの計算
    let confidence = 100;
    if (threats.length > 0) {
      confidence = Math.max(0, 100 - (threats.length * 20));
    }
    
    return {
      isClean: threats.length === 0,
      threats,
      confidence
    };
  } catch (error) {
    console.error('ポリグロットファイルの検出中にエラーが発生しました:', error);
    return {
      isClean: false,
      threats: ['ファイルの検証中にエラーが発生しました'],
      confidence: 0
    };
  }
};

/**
 * 安全な画像ファイルかどうかを総合的に判定
 */
export const isSecureImageFileWithPolyglotCheck = async (
  file: File
): Promise<{
  isValid: boolean;
  error?: string;
  details?: PolyglotDetectionResult;
}> => {
  // ポリグロット検出を実行
  const polyglotResult = await detectPolyglotFile(file);
  
  if (!polyglotResult.isClean) {
    return {
      isValid: false,
      error: `セキュリティリスクが検出されました: ${polyglotResult.threats[0]}`,
      details: polyglotResult
    };
  }
  
  return {
    isValid: true,
    details: polyglotResult
  };
};