# Playwright 実行方法ガイド

## 📝 概要
このフォルダには、検証項目シートに基づいたPlaywrightテストが含まれています。

## 🚀 クイックスタート（3ステップ）

### Step 1: 準備
```bash
# 1. このフォルダに移動
cd /workspaces/real-estate-app/docs_md/13_検証項目/playwright_tests

# 2. Playwrightをインストール
npm install
npx playwright install chromium
```

### Step 2: サーバー起動（別ターミナル）
```bash
# フロントエンドサーバーを起動
cd /workspaces/real-estate-app/bolt_front
npm run dev
```

### Step 3: テスト実行
```bash
# 簡単なテストを実行してみる
npm run test:simple

# すべてのテストを実行
npm test

# ブラウザを表示しながら実行（デバッグ用）
npm run test:headed
```

## 📁 テストファイル一覧

| ファイル | 内容 | コマンド |
|---------|------|---------|
| 00_簡単テスト例.spec.ts | 基本的な動作確認 | `npm run test:simple` |
| 01_認証機能テスト.spec.ts | ログイン・認証関連 | `npm run test:auth` |

## 🎯 実行コマンド集

### 基本的な実行
```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npx playwright test 00_簡単テスト例

# 特定のテスト名で実行
npx playwright test -g "ログイン"
```

### デバッグモード
```bash
# UIモード（インタラクティブ）
npm run test:ui

# デバッグモード（ステップ実行）
npm run test:debug

# ブラウザを表示して実行
npm run test:headed
```

### レポート確認
```bash
# テスト実行後、レポートを表示
npm run report
```

## 📸 スクリーンショット・動画

テスト実行後、以下の場所に保存されます：
- スクリーンショット: `test-results/*/screenshot.png`
- 動画: `test-results/*/video.webm`
- トレース: `test-results/*/trace.zip`

## 🔍 テスト結果の見方

### コンソール出力
```
✅ L001: 正常ログイン - PASS
✅ L002: 無効なメールアドレス - PASS
⚠️ L003: 未実装の機能
❌ L004: テスト失敗
```

### HTMLレポート
```bash
# レポートを開く
npm run report
```
ブラウザで詳細な結果、スクリーンショット、トレースを確認できます。

## 📝 検証項目シートとの対応

各テストは検証項目シートのIDと対応しています：

例：
- `L001` → ログイン機能の項目001
- `S004` → サインアップ機能の項目004
- `P001` → パスワードリセット機能の項目001

## ⚠️ トラブルシューティング

### サーバーが起動していない
```
Error: page.goto: net::ERR_CONNECTION_REFUSED
```
→ フロントエンドサーバーを起動してください

### Playwrightがインストールされていない
```
Error: browserType.launch: Executable doesn't exist
```
→ `npx playwright install chromium` を実行

### タイムアウトエラー
```
Error: page.goto: Timeout 30000ms exceeded
```
→ サーバーの起動を待つか、タイムアウト時間を延長

## 🎓 初心者向けTips

1. **最初は簡単なテストから**
   ```bash
   npm run test:simple
   ```

2. **UIモードで視覚的に確認**
   ```bash
   npm run test:ui
   ```
   ブラウザでテストの実行を見ながら確認できます

3. **1つずつテスト**
   ```bash
   npx playwright test -g "トップページ"
   ```
   特定のテストだけ実行して問題を切り分け

4. **スクリーンショットで確認**
   テスト後、`test-results`フォルダ内の画像で
   実際の画面を確認

## 📚 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/docs/intro)
- [検証項目シート](../00_検証項目総合インデックス.md)