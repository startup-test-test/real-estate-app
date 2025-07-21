# テストツールセキュリティガイド

## 概要
このドキュメントでは、本番環境でのテストツール実行を防ぐセキュリティ対策について説明します。

## セキュリティ対策（SEC-043）

### 1. 自動テストスクリプトの環境チェック
`test-data/auto-test.mjs`には以下の本番環境チェックが実装されています：

```javascript
// 環境チェック
if (process.env.NODE_ENV === 'production' || process.env.VITE_ENV === 'production') {
  console.error('❌ Error: This test script cannot be executed in production environment');
  console.error('This script is for development purposes only.');
  process.exit(1);
}
```

### 2. ビルド設定での除外
`vite.config.ts`で以下のパターンを本番ビルドから除外：
- `/test-data/.*` - テストデータディレクトリ
- `.*\.test\.(js|ts|jsx|tsx)$` - テストファイル
- `.*\.spec\.(js|ts|jsx|tsx)$` - スペックファイル
- `/__tests__/.*` - テストディレクトリ

### 3. 本番環境での実行防止策

#### ⚠️ 重要な注意事項
1. **test-dataディレクトリは開発環境専用**
   - 本番デプロイ時はこのディレクトリを含めない
   - CI/CDパイプラインで除外設定を行う

2. **環境変数の適切な設定**
   - 本番環境では必ず`NODE_ENV=production`を設定
   - `VITE_ENV`も同様に設定

3. **デプロイ前チェックリスト**
   - [ ] test-dataディレクトリが除外されているか確認
   - [ ] 本番ビルドにテストファイルが含まれていないか確認
   - [ ] 環境変数が正しく設定されているか確認

## デプロイ設定例

### Dockerfile
```dockerfile
# ビルド時にテストファイルを除外
COPY --chown=node:node . .
RUN rm -rf test-data __tests__ **/*.test.* **/*.spec.*
```

### .dockerignore
```
test-data/
**/__tests__/
**/*.test.*
**/*.spec.*
```

### CI/CD設定（GitHub Actions例）
```yaml
- name: Remove test files
  run: |
    rm -rf test-data
    find . -name "*.test.*" -delete
    find . -name "*.spec.*" -delete
    find . -type d -name "__tests__" -exec rm -rf {} +
```

## トラブルシューティング

### テストスクリプトが本番で実行された場合
1. 即座にプロセスが終了し、エラーメッセージが表示される
2. ログに記録されるので、監視システムで検知可能
3. 実際の処理は実行されない

### ビルドエラーが発生した場合
1. `vite.config.ts`の`external`設定を確認
2. 正規表現パターンが正しいか検証
3. 必要に応じてパターンを調整

## セキュリティ監査チェックリスト

- [ ] auto-test.mjsに環境チェックが実装されている
- [ ] vite.config.tsでテストファイルが除外されている
- [ ] 本番デプロイスクリプトでtest-dataが除外されている
- [ ] 環境変数による制御が機能している
- [ ] ドキュメントが最新の状態に保たれている