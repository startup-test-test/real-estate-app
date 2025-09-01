# Playwright E2Eテスト環境

## 概要
このディレクトリには、大家DXアプリケーションのE2Eテストが含まれています。

## セットアップ

### 初回セットアップ（Codespace/新環境）

```bash
# 1. 日本語フォントのインストール（スクリーンショットの文字化け防止）
chmod +x setup-fonts.sh
sudo ./setup-fonts.sh

# 2. 依存関係のインストール
npm install

# 3. Playwrightブラウザのインストール
npx playwright install chromium
```

### テスト用認証情報の設定

1. `.env.example` を `.env` にコピー
```bash
cp .env.example .env
```

2. `.env` ファイルに認証情報を設定
```
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password
```

## テストの実行

### すべてのテストを実行
```bash
npm test
```

### 特定のテストファイルを実行
```bash
npm test 00_簡単テスト例.spec.ts
```

### 特定のテストのみ実行
```bash
npm test -- -g "トップページが表示される"
```

### ヘッドレスモードを無効化（ブラウザを表示）
```bash
npm test -- --headed
```

## テストファイル

- `00_簡単テスト例.spec.ts` - 基本的な動作確認テスト
- `01_認証機能テスト.spec.ts` - 認証機能の検証
- `02_ログイン成功テスト.spec.ts` - ログイン成功シナリオ（要認証情報）

## スクリーンショット

テスト実行時のスクリーンショットは以下に保存されます：
- `../テスト結果_スクリーンショット/`

## トラブルシューティング

### 文字化けする場合
```bash
# 日本語フォントを再インストール
sudo ./setup-fonts.sh
```

### ブラウザが起動しない場合
```bash
# Playwrightブラウザを再インストール
npx playwright install chromium
npx playwright install-deps
```

### テストがタイムアウトする場合
`playwright.config.ts` でタイムアウト設定を調整してください。

## 注意事項

⚠️ **重要**: ブラウザを自動起動する際は、必ずヘッドレスモード（`headless: true`）を使用してください。詳細は `../ブラウザ自動起動防止ガイドライン.md` を参照。

## Codespace自動セットアップ

`../setup.sh` スクリプトにより、新しいCodespace起動時に自動的に：
- 日本語フォントがインストールされます
- Playwrightがセットアップされます
- 依存関係がインストールされます

手動実行が必要な場合：
```bash
bash /workspaces/real-estate-app/docs_md/13_検証項目/setup.sh
```