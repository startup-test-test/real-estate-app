// API設定
export const getApiUrl = () => {
  // ブランチや環境に応じてAPIを切り替え
  const isDevelopment = import.meta.env.MODE === 'development';
  const currentBranch = import.meta.env.VITE_GIT_BRANCH || 'develop';

  // 開発環境でViteプロキシを使用
  if (isDevelopment) {
    // Codespacesの場合はプロキシ経由
    if (window.location.hostname.includes('github.dev') || window.location.hostname.includes('app.github.dev')) {
      return '';  // Viteプロキシ経由で/apiにアクセス
    }
    // ローカル環境の場合
    return 'http://localhost:8000';
  }

  if (currentBranch === 'main' || import.meta.env.PROD) {
    // 本番環境
    return import.meta.env.VITE_API_URL_PROD || 'https://property-develop.onrender.com';
  } else {
    // ステージング環境
    return import.meta.env.VITE_API_URL_DEV || 'https://property-develop.onrender.com';
  }
};

export const API_URL = getApiUrl();