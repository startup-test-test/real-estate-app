# Edge Functionセキュリティガイド

## 概要
このドキュメントでは、Supabase Edge Functionsでのセキュアなログ出力について説明します。

## SEC-039: 機密情報ログ出力対策

### 実装内容

#### 1. セキュアログユーティリティ
`_shared/secureLogger.ts`にセキュアなログ出力機能を実装：

- **自動マスキング機能**
  - JWTトークン: `eyJ...` → `[MASKED_TOKEN]`
  - メールアドレス: `user@example.com` → `u**r@example.com`
  - APIキー・パスワード: `[MASKED_SENSITIVE_DATA]`

- **エラーサニタイズ**
  - エラーメッセージ内の機密情報を自動マスク
  - 本番環境ではスタックトレースを除外

- **環境別制御**
  - 本番環境ではデバッグログを無効化
  - 開発環境でのみ詳細情報を出力

#### 2. 使用例

```typescript
import { SecureLogger } from '../_shared/secureLogger.ts'

const logger = new SecureLogger({ functionName: 'my-function' })

// 安全なログ出力
logger.info('User action', { userId: 'user123', action: 'login' })

// エラーログ（機密情報は自動マスク）
logger.error('Authentication failed', error)

// デバッグログ（本番環境では出力されない）
logger.debug('Request details', requestData)
```

### セキュリティチェックリスト

- [ ] すべての`console.log/error`を`SecureLogger`に置き換え
- [ ] レスポンスに機密情報（authData等）を含めない
- [ ] エラーメッセージに詳細情報を含めない
- [ ] メールアドレスは部分マスクで記録
- [ ] 本番環境でデバッグログが無効化されているか確認

### 監査ログのベストプラクティス

1. **記録すべき情報**
   - アクション（招待送信、認証等）
   - タイムスタンプ
   - ユーザーID（マスクなし）
   - 結果（成功/失敗）

2. **記録してはいけない情報**
   - パスワード
   - 認証トークン
   - APIキー
   - 完全なメールアドレス
   - 個人情報

3. **ログレベルの使い分け**
   - `info`: 正常な処理フロー
   - `warn`: 注意が必要な状況
   - `error`: エラー発生時
   - `debug`: 開発時のデバッグ情報

### テスト方法

1. **ローカルテスト**
```bash
# Supabase CLIでローカル実行
supabase functions serve send-invitation

# テストリクエスト
curl -X POST http://localhost:54321/functions/v1/send-invitation \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", ...}'
```

2. **ログ確認**
```bash
# ローカルログ確認
supabase functions logs

# 本番ログ確認（Supabaseダッシュボード）
# Functions > Logs で確認
```

### トラブルシューティング

#### ログが出力されない
- `DENO_ENV`環境変数を確認
- ログレベルが適切か確認

#### マスキングが効かない
- データ型を確認（文字列/オブジェクト）
- 正規表現パターンを確認

#### パフォーマンス問題
- 大きなオブジェクトのマスキングは避ける
- 必要な情報のみをログに記録