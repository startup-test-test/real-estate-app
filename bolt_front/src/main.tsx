import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandler } from './utils/secureErrorHandler';
import { setupSecureErrorHandler } from './utils/logger';

// SEC-069: グローバルエラーハンドラーを設定
setupGlobalErrorHandler();

// SEC-023: セキュアなエラーハンドリングを設定
// 注: replaceConsoleWithSecureLogger()は本番環境でのみ有効化すべき
// 現在は開発中のため、コメントアウト
// if (import.meta.env.PROD) {
//   replaceConsoleWithSecureLogger();
// }
setupSecureErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
