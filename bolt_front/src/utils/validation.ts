/**
 * バリデーション関連のユーティリティ関数
 */

/**
 * URLの形式が正しいかをバリデーションする
 * @param url 検証するURL文字列
 * @returns エラーメッセージまたはnull（エラーなし）
 */
export const validatePropertyUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // SEC-011対応: 危険なプロトコルをブロック
    const dangerousProtocols = [
      'javascript:',
      'data:',
      'vbscript:',
      'file:',
      'about:',
      'chrome:',
      'chrome-extension:'
    ];
    
    const protocol = parsedUrl.protocol.toLowerCase();
    if (dangerousProtocols.includes(protocol)) {
      return '安全でないURLです。http://またはhttps://で始まるURLを入力してください';
    }
    
    // 許可されたプロトコルのみを受け入れる（ホワイトリスト方式）
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(protocol)) {
      return 'URLはhttp://またはhttps://で始まる必要があります';
    }
    
    return null; // エラーなし
  } catch {
    return 'URLの形式が正しくありません';
  }
};

/**
 * URLを安全にサニタイズする（SEC-011対応）
 * @param url サニタイズするURL
 * @returns サニタイズされたURLまたはnull（無効なURL）
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // 許可されたプロトコルのみを受け入れる
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedUrl.protocol.toLowerCase())) {
      return null;
    }
    
    // URLを再構築して、潜在的な攻撃ベクトルを除去
    return parsedUrl.toString();
  } catch {
    return null;
  }
};

/**
 * リンクを安全に開く（SEC-011対応）
 * @param url 開くURL
 * @param target ターゲット属性（デフォルト: _blank）
 */
export const openUrlSafely = (url: string, target: string = '_blank'): void => {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    console.error('無効なURLです:', url);
    return;
  }
  
  // window.openを使用する場合は、セキュリティ対策を適用
  if (target === '_blank') {
    const newWindow = window.open(sanitized, target, 'noopener,noreferrer');
    if (newWindow) {
      newWindow.opener = null;
    }
  } else {
    window.location.href = sanitized;
  }
};