/**
 * API設定 - Vercel Python Functions 用
 * 全環境で同一ドメインの /api/* エンドポイントを使用
 */

export const getApiUrl = () => {
  // 全環境で Vercel Python Functions を使用（同一ドメイン）
  // ローカル開発では vercel dev を使用すること
  return '';
};

export const API_URL = getApiUrl();
