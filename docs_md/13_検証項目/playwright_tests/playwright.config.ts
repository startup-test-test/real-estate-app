import { defineConfig, devices } from '@playwright/test';

/**
 * 検証項目用 Playwright設定
 */
export default defineConfig({
  // テストファイルの場所
  testDir: './',
  
  // テスト実行設定
  fullyParallel: false, // 順番に実行（検証のため）
  forbidOnly: !!process.env.CI,
  retries: 0, // リトライなし（問題を明確にするため）
  workers: 1, // 1つずつ実行
  
  // レポート設定
  reporter: [
    ['html', { outputFolder: './test-results/html' }],
    ['list'], // コンソールに結果を表示
  ],
  
  // 共通設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:5173',
    
    // トレース（デバッグ用）
    trace: 'on', // 常にトレースを取る
    
    // スクリーンショット
    screenshot: 'on', // 常にスクリーンショットを撮る
    
    // ビデオ録画
    video: 'retain-on-failure', // 失敗時のみビデオを保存
    
    // タイムアウト
    actionTimeout: 10000, // 各アクションのタイムアウト
    navigationTimeout: 30000, // ページ遷移のタイムアウト
  },

  // ブラウザ設定
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // ビューポートサイズ
        viewport: { width: 1280, height: 720 },
      },
    },
    // モバイルテスト用（必要に応じて）
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],

  // 開発サーバーの設定（自動起動しない - 手動で起動済み）
  // webServer: {
  //   command: 'cd ../../bolt_front && npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: true,
  //   timeout: 120 * 1000,
  // },
});