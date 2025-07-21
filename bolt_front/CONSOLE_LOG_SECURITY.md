# Console.log セキュリティガイド

## 概要
このドキュメントでは、console.logによる情報漏洩を防ぐためのベストプラクティスについて説明します。

## SEC-049: console.logによる情報漏洩対策

### 現在の実装状況

#### 1. 本番環境での自動無効化（実装済み）
`src/main.tsx`で本番環境では全てのconsoleメソッドを無効化：
```typescript
if (import.meta.env.PROD) {
  console.log = () => {};
  console.error = () => {};
  // ... 他のメソッドも無効化
}
```

#### 2. SecureLogger（実装済み）
`src/utils/logger.ts`でセキュアなログシステムを提供：
- 機密情報の自動マスキング
- 環境別のログレベル制御
- バッファリングとバッチ出力

### 推奨される実装パターン

#### 1. 開発時のログ
```typescript
import { logger } from '@/utils/logger';

// ❌ 避けるべき実装
console.log('User token:', authToken);
console.log('Password:', password);

// ✅ 推奨される実装
logger.debug('Authentication process started');
logger.info('User action', { userId: user.id, action: 'login' });
```

#### 2. エラーハンドリング
```typescript
// ❌ 避けるべき実装
try {
  // ...
} catch (error) {
  console.error('Auth error:', error); // エラー詳細が露出
}

// ✅ 推奨される実装
try {
  // ...
} catch (error) {
  logger.error('Authentication failed', error); // 自動サニタイズ
}
```

#### 3. デバッグ情報
```typescript
// ❌ 避けるべき実装
console.log('API Key:', process.env.API_KEY);
console.log('User data:', userData); // 個人情報を含む可能性

// ✅ 推奨される実装
logger.debug('API configuration loaded');
logger.debug('User data processed', { userId: userData.id });
```

### 機密情報の定義

以下の情報は絶対にログに出力しない：
- パスワード（password, pwd, pass）
- 認証トークン（token, auth, jwt）
- APIキー（key, apikey, secret）
- 個人情報（email, phone, address）
- 支払い情報（card, payment）
- セッション情報（session, cookie）

### 移行ガイド

#### Step 1: logger import
```typescript
import { logger } from '@/utils/logger';
```

#### Step 2: console.log → logger.log
```typescript
// Before
console.log('Processing data...');

// After
logger.log('Processing data...');
```

#### Step 3: console.error → logger.error
```typescript
// Before
console.error('Error:', error);

// After
logger.error('Processing failed', error);
```

### ESLintルールの推奨設定

`.eslintrc.js`に追加：
```javascript
module.exports = {
  rules: {
    'no-console': ['error', { 
      allow: ['warn', 'error'] // 開発時のみ
    }]
  }
};
```

### 監査チェックリスト

- [ ] 本番環境でconsoleメソッドが無効化されている
- [ ] 機密情報を含むログが存在しない
- [ ] SecureLoggerへの移行が完了している
- [ ] ESLintルールが設定されている
- [ ] 定期的なログ監査が実施されている

### 例外的なconsole使用

以下の場合のみconsole使用を許可：
1. ビルドスクリプト
2. 開発ツール
3. エラーバウンダリ（最後の手段）

### トラブルシューティング

#### ログが表示されない
1. 環境変数を確認（`import.meta.env.PROD`）
2. ログレベルを確認
3. SecureLoggerの設定を確認

#### 本番環境でログが必要な場合
1. 外部ログサービスを使用（Sentry等）
2. サーバーサイドログを活用
3. 監査ログテーブルに記録