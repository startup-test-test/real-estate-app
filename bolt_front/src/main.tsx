import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandler } from './utils/secureErrorHandler';
import { setupSecureErrorHandler, replaceConsoleWithSecureLogger } from './utils/logger';

// SEC-069: グローバルエラーハンドラーを設定
setupGlobalErrorHandler();

// SEC-023: セキュアなエラーハンドリングを設定
// 本番環境でのみconsoleメソッドを無効化
if (import.meta.env.PROD) {
  replaceConsoleWithSecureLogger();
}
setupSecureErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
