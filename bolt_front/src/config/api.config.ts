// API設定
export const getApiUrl = () => {
  // ブランチや環境に応じてAPIを切り替え
  const isDevelopment = import.meta.env.MODE === 'development';
  const currentBranch = import.meta.env.VITE_GIT_BRANCH || 'develop';

  if (currentBranch === 'main' || import.meta.env.PROD) {
    // 本番環境
    return import.meta.env.VITE_API_URL_PROD || 'https://property-develop.onrender.com';
  } else {
    // 開発環境
    return import.meta.env.VITE_API_URL_DEV || 'https://property-develop.onrender.com';
  }
};

export const API_URL = getApiUrl();