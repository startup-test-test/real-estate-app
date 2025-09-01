# 検証_Playwright仕様書

作成日: 2025-09-01  
バージョン: 1.0.0  
プロジェクト: 大家DX - 不動産投資SaaSプラットフォーム

---

## 1. 概要

### 1.1 目的
本仕様書は、大家DXプロジェクトにおけるPlaywrightを使用した自動テスト検証の実施方針、手法、管理方法を定義するものです。

### 1.2 スコープ
- E2E（エンドツーエンド）テストの自動化
- 257項目の検証項目のうち150項目の自動化
- 日次/週次でのリグレッションテスト実行
- CI/CDパイプラインへの統合

### 1.3 目標
- **自動化カバレッジ**: 65%（150/257項目）
- **テスト実行時間**: 全自動テスト5分以内
- **成功率**: 95%以上
- **検出率**: クリティカルバグの90%以上を検出

---

## 2. テスト戦略

### 2.1 テストピラミッド

```
         /\
        /E2E\       10% - Playwright（ユーザージャーニー）
       /------\
      /統合テスト\   30% - API/Component（機能間連携）
     /----------\
    /ユニットテスト\ 60% - Vitest（個別機能）
   /--------------\
```

### 2.2 自動化対象の選定基準

#### 自動化すべきテスト ✅
- クリティカルパス（ログイン→決済→解約）
- 頻繁に実行される機能
- リグレッションテスト
- データ駆動型テスト
- 環境間の動作確認

#### 手動テストに留めるべき項目 ❌
- 視覚的なデザイン確認
- 一度きりの設定
- 複雑なセキュリティテスト
- 探索的テスト
- ユーザビリティテスト

### 2.3 優先度マトリクス

| 機能カテゴリ | ビジネス重要度 | 変更頻度 | 自動化優先度 | 目標カバレッジ |
|------------|--------------|---------|------------|--------------|
| 認証機能 | 高 | 低 | 高 | 80% |
| サブスクリプション | 高 | 中 | 高 | 75% |
| シミュレーター | 高 | 高 | 高 | 70% |
| ダッシュボード | 中 | 中 | 中 | 60% |
| セキュリティ | 高 | 低 | 低 | 25% |

---

## 3. テスト環境

### 3.1 環境構成

| 環境 | URL | 用途 | データ | 実行頻度 |
|------|-----|------|--------|---------|
| ローカル | http://localhost:5173 | 開発時テスト | モックデータ | 随時 |
| 開発環境 | https://dev.oyadx.example.com | 結合テスト | テストデータ | 日次 |
| ステージング | https://staging.oyadx.example.com | 本番相当テスト | 本番相当データ | リリース前 |
| 本番環境 | https://oyadx.example.com | スモークテスト | 実データ | リリース後 |

### 3.2 テストデータ管理

```javascript
// テストユーザー生成パターン
const testUser = {
  email: `test_${Date.now()}_${Math.random()}@example.com`,
  password: 'TestPassword123!',
  plan: 'free' | 'premium',
  stripeTestCard: '4242424242424242'
};
```

### 3.3 必要な環境変数

```env
# .env.test
TEST_BASE_URL=http://localhost:5173
TEST_EMAIL=test@example.com
TEST_PASSWORD=TestPassword123!
STRIPE_TEST_KEY=pk_test_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
```

---

## 4. Playwright設定

### 4.1 基本設定（playwright.config.ts）

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }]
  ],
  
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

### 4.2 カスタムフィクスチャ

```typescript
// fixtures/auth.fixture.ts
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_EMAIL);
    await page.fill('[name="password"]', process.env.TEST_PASSWORD);
    await page.click('[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});
```

---

## 5. テストケース設計

### 5.1 テストケース構造

```typescript
test.describe('検証項目ID: L001 - 正常ログイン', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ユーザーは有効な認証情報でログインできる', async ({ page }) => {
    // Arrange（準備）
    const email = 'test@example.com';
    const password = 'ValidPassword123!';
    
    // Act（実行）
    await page.click('text=ログイン');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('[type="submit"]');
    
    // Assert（検証）
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.user-name')).toContainText(email);
  });
});
```

### 5.2 データ駆動型テスト

```typescript
const loginScenarios = [
  { email: 'valid@example.com', password: 'Valid123!', expected: 'success' },
  { email: 'invalid-email', password: 'Valid123!', expected: 'error' },
  { email: '', password: '', expected: 'validation' },
];

for (const scenario of loginScenarios) {
  test(`ログインテスト: ${scenario.expected}`, async ({ page }) => {
    // テスト実装
  });
}
```

---

## 6. フォルダ構造

```
13_検証_Playwright/
├── playwright_tests/
│   ├── tests/
│   │   ├── 01_auth/
│   │   │   ├── login.spec.ts
│   │   │   ├── signup.spec.ts
│   │   │   └── password-reset.spec.ts
│   │   ├── 02_simulator/
│   │   ├── 03_subscription/
│   │   └── e2e/
│   │       └── user-journey.spec.ts
│   ├── fixtures/
│   ├── utils/
│   └── playwright.config.ts
└── {日付}_テスト実行/
    ├── 検証項目シート（01-06）.md
    ├── スクリーンショット/
    ├── playwright-report/
    └── 実行ログ.md
```

---

## 7. 実行コマンド

### 7.1 基本コマンド

```bash
# 全テスト実行
npm test

# 特定カテゴリのみ
npm test -- --grep "認証"

# 特定ブラウザのみ
npm test -- --project=chromium

# ヘッドレスモードOFF（デバッグ用）
npm test -- --headed

# 並列実行数指定
npm test -- --workers=5

# 失敗したテストのみ再実行
npm test -- --last-failed
```

### 7.2 レポート生成

```bash
# HTMLレポート表示
npx playwright show-report

# Allureレポート生成
npm run test:allure

# カバレッジレポート
npm run test:coverage
```

---

## 8. CI/CD統合

### 8.1 GitHub Actions設定

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # 毎日午前0時

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 8.2 テスト結果通知

```typescript
// Slack通知設定
if (testResults.failed > 0) {
  await sendSlackNotification({
    channel: '#test-results',
    text: `⚠️ テスト失敗: ${testResults.failed}件`,
    attachments: failedTests
  });
}
```

---

## 9. メトリクス・KPI

### 9.1 追跡指標

| メトリクス | 目標値 | 現在値 | 測定方法 |
|-----------|--------|--------|---------|
| 自動化率 | 65% | 5.3% | 自動化済み項目/総項目数 |
| テスト実行時間 | <5分 | 45秒 | CI/CD実行時間 |
| 成功率 | >95% | 82.4% | 成功テスト/総テスト数 |
| 不具合検出率 | >90% | - | 検出バグ/総バグ数 |
| テストメンテナンス時間 | <2h/週 | - | 週次工数記録 |

### 9.2 レポーティング

- **日次**: テスト実行結果サマリー
- **週次**: カバレッジ進捗、失敗分析
- **月次**: KPI達成状況、改善提案

---

## 10. トラブルシューティング

### 10.1 よくある問題と対策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| タイムアウト | 要素の読み込み遅延 | waitForSelector使用、タイムアウト延長 |
| セレクタ不一致 | UI変更 | data-testid属性の利用 |
| 並列実行時の競合 | データ競合 | テストごとにユニークデータ生成 |
| 環境差異 | 設定不一致 | 環境変数の統一管理 |

### 10.2 デバッグ方法

```bash
# デバッグモード起動
npx playwright test --debug

# 特定のテストのみデバッグ
npx playwright test example.spec.ts:10 --debug

# トレース確認
npx playwright show-trace trace.zip
```

---

## 11. ベストプラクティス

### DO ✅
- Page Object Modelパターンの使用
- data-testid属性でのセレクタ指定
- 明確なテストケース名
- 適切な待機処理
- テストの独立性確保

### DON'T ❌
- ハードコードされた待機時間
- 他のテストに依存
- 実データの使用
- 冗長なアサーション
- コメントアウトされたテスト

---

## 12. 更新履歴

| 日付 | バージョン | 更新内容 | 更新者 |
|------|-----------|---------|--------|
| 2025-09-01 | 1.0.0 | 初版作成 | AI Assistant |

---

## 13. 参考資料

- [Playwright公式ドキュメント](https://playwright.dev)
- [テスト自動化のベストプラクティス](https://testautomationu.applitools.com)
- [大家DX要件定義書](../01_要件定義/)
- [API仕様書](../06_シミュレーター機能/)