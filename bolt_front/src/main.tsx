import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 開発環境でのみ管理ユーティリティをロード
if (import.meta.env.DEV) {
  import('./utils/adminUtils').catch(console.error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
