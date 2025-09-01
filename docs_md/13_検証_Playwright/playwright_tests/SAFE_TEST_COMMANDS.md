# 安全なテスト実行コマンド集

## ⚠️ 重要：大量ブラウザ起動を防ぐために

### 絶対に使用してはいけないコマンド
```bash
# ❌ 危険：全テストをブラウザ表示で実行
npx playwright test --headed

# ❌ 危険：並列実行でブラウザ表示
npx playwright test --headed --workers=4
```

### ✅ 安全なテストコマンド

#### 1. 単一テストファイルの実行（ヘッドレス）
```bash
# 認証機能のみ
npx playwright test 01_認証機能テスト.spec.ts

# 特定のテストケースのみ
npx playwright test --grep "L001"
```

#### 2. デバッグモード（1つのブラウザのみ）
```bash
# UIモードで1つずつ確認
npx playwright test --ui

# デバッグモード（1つのブラウザ）
npx playwright test --debug
```

#### 3. 特定プロジェクトのみ実行
```bash
# Chromiumのみ
npx playwright test --project=chromium

# モバイルテストを除外
npx playwright test --project=chromium
```

#### 4. テスト数を制限
```bash
# 最初の5個のテストのみ
npx playwright test --grep "D001|D002|D003|D004|D005"

# 1つのテストスイートのみ
npx playwright test --grep "ダッシュボード表示"
```

### 🛡️ 追加の安全対策

#### package.jsonにスクリプトを追加
```json
{
  "scripts": {
    "test:safe": "npx playwright test --project=chromium",
    "test:debug": "npx playwright test --debug",
    "test:ui": "npx playwright test --ui",
    "test:single": "npx playwright test --grep"
  }
}
```

### 📊 テスト実行前の確認コマンド
```bash
# テストの数を確認
npx playwright test --list

# ドライラン（実行せずに確認）
npx playwright test --list --grep "D001"
```

### 🚨 緊急時の対処法

もしブラウザが大量に開いた場合：
```bash
# プロセスを強制終了
pkill -f chromium
pkill -f chrome

# またはPlaywrightプロセスを終了
pkill -f playwright
```

### 💡 推奨される実行順序

1. まず`--list`でテスト数を確認
2. 少数のテストで動作確認
3. 必要に応じて範囲を拡大

```bash
# 安全な順序
npx playwright test --list --grep "D001"  # 確認
npx playwright test --grep "D001"          # 1個実行
npx playwright test --grep "D00[1-5]"      # 5個実行
npx playwright test 04_ダッシュボード     # 1ファイル実行
```

## 設定ファイルでの制限

playwright.config.ts で以下を設定済み：
- `workers: 1` - 並列実行を防ぐ
- `headless: true` - ブラウザ非表示
- `maxFailures: 1` - 失敗時に即停止

これらの設定により、意図しない大量ブラウザ起動を防ぎます。