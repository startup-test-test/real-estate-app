// API設定 - Next.js用に変換
export const getApiUrl = () => {
  // ブランチや環境に応じてAPIを切り替え
  const isDevelopment = process.env.NODE_ENV === 'development';
  const currentBranch = process.env.NEXT_PUBLIC_GIT_BRANCH || 'develop';

  // 開発環境の場合
  if (isDevelopment) {
    // ローカル環境の場合
    return 'http://localhost:8000';
  }

  if (currentBranch === 'main' || process.env.NODE_ENV === 'production') {
    // 本番環境
    return process.env.NEXT_PUBLIC_API_URL_PROD || 'https://property-develop.onrender.com';
  } else {
    // ステージング環境
    return process.env.NEXT_PUBLIC_API_URL_DEV || 'https://property-develop.onrender.com';
  }
};

export const API_URL = getApiUrl();
