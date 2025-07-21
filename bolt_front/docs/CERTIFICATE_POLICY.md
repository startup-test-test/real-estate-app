# Certificate Pinning 代替策実装ガイド

## 概要

SEC-033対策として、ブラウザ環境でのCertificate Pinning代替策を実装しました。

## 実装内容

### 1. 信頼できるドメインリスト管理

```typescript
const TRUSTED_DOMAINS = [
  'supabase.co',
  'supabase.com',
  'fonts.googleapis.com',
  'github.com'
];
```

### 2. セキュアなfetch関数

```typescript
import { secureFetch } from '@/utils/certificatePolicy';

// 信頼できるドメインのみにリクエスト
const response = await secureFetch('https://api.supabase.co/data');
```

### 3. セキュアなWebSocket接続

```typescript
import { createSecureWebSocket } from '@/utils/certificatePolicy';

// WSSプロトコルのみ許可
const ws = createSecureWebSocket('wss://api.supabase.co/realtime');
```

## セキュリティヘッダー設定

サーバー側で以下のヘッダーを設定してください：

### Nginx設定例

```nginx
# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Certificate Transparency
add_header Expect-CT "max-age=86400, enforce" always;

# その他のセキュリティヘッダー
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# CSP
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" always;
```

### Express.js設定例

```javascript
const helmet = require('helmet');

app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Expect-CT
app.use((req, res, next) => {
  res.setHeader('Expect-CT', 'max-age=86400, enforce');
  next();
});
```

## DNS設定

### CAA レコード

```
example.com. IN CAA 0 issue "letsencrypt.org"
example.com. IN CAA 0 issuewild ";"
```

## 監視とアラート

### 1. 証明書の有効期限監視

```bash
# 証明書の有効期限をチェック
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

### 2. Certificate Transparencyログ監視

- [crt.sh](https://crt.sh/) で定期的に証明書を確認
- 予期しない証明書発行をアラート

## テスト方法

### 1. セキュリティヘッダーのテスト

```bash
# セキュリティヘッダーをチェック
curl -I https://example.com
```

### 2. SSL/TLSテスト

- [SSL Labs](https://www.ssllabs.com/ssltest/) でA+評価を確認
- [Security Headers](https://securityheaders.com/) でヘッダーをチェック

## トラブルシューティング

### 証明書エラーが発生した場合

1. ブラウザのコンソールでエラーを確認
2. `handleCertificateError`関数が適切に動作しているか確認
3. サーバー側の証明書設定を確認

### WebSocketが接続できない場合

1. WSSプロトコルを使用しているか確認
2. ドメインが信頼リストに含まれているか確認
3. CSPのconnect-srcディレクティブを確認

## 今後の改善案

1. Service Workerを使用した追加のセキュリティ層
2. SubResource Integrity (SRI) の完全実装
3. Certificate Pinning Reporting APIの活用
4. DANE (DNS-based Authentication of Named Entities) の実装