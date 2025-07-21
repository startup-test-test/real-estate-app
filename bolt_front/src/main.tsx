import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandler } from './utils/secureErrorHandler';
import { replaceConsoleWithSecureLogger, setupSecureErrorHandler } from './utils/logger';

// SEC-069: グローバルエラーハンドラーを設定
setupGlobalErrorHandler();

// SEC-023: 本番環境でのログ出力を無効化
replaceConsoleWithSecureLogger();
setupSecureErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
