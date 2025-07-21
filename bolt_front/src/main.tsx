import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandler } from './utils/secureErrorHandler';
import { setupSecureErrorHandler, replaceConsoleWithSecureLogger, LogLevel } from './utils/logger';

// SEC-069: グローバルエラーハンドラーを設定
setupGlobalErrorHandler();

// SEC-023/SEC-008: セキュアなログシステムとエラーハンドリングを設定
// 環境に応じたログ設定
const loggerConfig = {
  // 本番環境では ERROR レベルのみ、開発環境では DEBUG レベルまで
  logLevel: import.meta.env.PROD ? LogLevel.ERROR : LogLevel.DEBUG,
  // 本番環境では機密情報マスキングを必須に
  maskSensitiveData: true,
  // 開発環境では特定カテゴリのみ有効化（ノイズ削減）
  enabledCategories: import.meta.env.DEV ? ['auth', 'api', 'error', 'security'] : undefined,
  // 本番環境ではログ出力自体を制限
  enabledInProduction: false,
  enabledInDevelopment: true
};

// すべてのconsole呼び出しをSecureLoggerに置き換え
replaceConsoleWithSecureLogger(loggerConfig);

// セキュアなエラーハンドリングを設定
setupSecureErrorHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
