import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandler } from './utils/secureErrorHandler';
import { setupSecureErrorHandler } from './utils/logger';
import { performStartupEnvCheck } from './utils/envChecker';

// SEC-044: 環境変数の起動時チェック
try {
  performStartupEnvCheck();
} catch (error) {
  // 環境変数エラーの場合は起動を停止
  console.error('Failed to start application:', error);
  // これ以降の処理を実行しない
  throw error;
}

// SEC-069: グローバルエラーハンドラーを設定
setupGlobalErrorHandler();

// SEC-023/SEC-008: セキュアなログシステムとエラーハンドリングを設定
// 本番環境でのみconsoleメソッドを無効化
if (import.meta.env.PROD) {
  // 本番環境では全てのconsoleメソッドを無効化
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.table = () => {};
  console.group = () => {};
  console.groupCollapsed = () => {};
  console.groupEnd = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
  console.trace = () => {};
  console.assert = () => {};
  console.count = () => {};
  console.countReset = () => {};
  console.clear = () => {};
}

// セキュアなエラーハンドリングを設定
setupSecureErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
