# セキュリティヘッダー設定ガイド

## 概要

SEC-009対策として、Webアプリケーションのセキュリティを強化するためのHTTPセキュリティヘッダーを実装しました。

## 開発環境での設定

`vite.config.ts`にセキュリティヘッダープラグインを実装済みです。

```bash
npm run dev
```

開発サーバー起動時に自動的に以下のヘッダーが設定されます。

## 本番環境での設定

### Nginx設定例

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL設定
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # X-Content-Type-Options
    add_header X-Content-Type-Options "nosniff" always;

    # X-Frame-Options
    add_header X-Frame-Options "DENY" always;

    # X-XSS-Protection
    add_header X-XSS-Protection "1; mode=block" always;

    # Referrer-Policy
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Permissions-Policy
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

    # Content-Security-Policy
    set $csp "default-src 'self'; ";
    set $csp "${csp}script-src 'self' 'unsafe-inline' 'unsafe-eval'; ";
    set $csp "${csp}style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ";
    set $csp "${csp}font-src 'self' https://fonts.gstatic.com; ";
    set $csp "${csp}img-src 'self' data: https: blob:; ";
    set $csp "${csp}connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co; ";
    set $csp "${csp}frame-ancestors 'none'; ";
    set $csp "${csp}base-uri 'self'; ";
    set $csp "${csp}form-action 'self'; ";
    set $csp "${csp}object-src 'none'; ";
    set $csp "${csp}upgrade-insecure-requests";
    add_header Content-Security-Policy $csp always;

    # その他のセキュリティ設定
    add_header X-Permitted-Cross-Domain-Policies "none" always;
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache設定例

```apache
<VirtualHost *:443>
    ServerName example.com
    DocumentRoot /var/www/html

    # SSL設定
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    # セキュリティヘッダー
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()"
    
    # Content-Security-Policy
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests"

    <Directory /var/www/html>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Vercel設定例

`vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=(), payment=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests"
        }
      ]
    }
  ]
}
```

## セキュリティヘッダーの説明

### 1. Strict-Transport-Security (HSTS)
- HTTPSの使用を強制
- 中間者攻撃を防止
- `max-age=31536000`: 1年間有効
- `includeSubDomains`: すべてのサブドメインに適用
- `preload`: ブラウザのHSTSプリロードリストに登録

### 2. X-Content-Type-Options
- `nosniff`: MIMEタイプスニッフィングを防止
- IEやChromeがContent-Typeを無視して実行することを防ぐ

### 3. X-Frame-Options
- `DENY`: iframe内での表示を完全に禁止
- クリックジャッキング攻撃を防止

### 4. X-XSS-Protection
- `1; mode=block`: XSS攻撃を検出したらページ表示をブロック
- レガシーブラウザ向けのXSS保護

### 5. Referrer-Policy
- `strict-origin-when-cross-origin`: 同一オリジンには完全なリファラー、クロスオリジンにはオリジンのみ
- プライバシー保護とセキュリティのバランス

### 6. Permissions-Policy
- 各種ブラウザ機能の使用を制限
- 不要な機能を無効化してセキュリティリスクを低減

### 7. Content-Security-Policy (CSP)
- コンテンツの読み込み元を制限
- XSS攻撃の防止に最も効果的

## CSPの調整が必要な場合

### Google Analytics等の外部サービスを使用する場合

```nginx
# script-srcに追加
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;

# connect-srcに追加
connect-src 'self' https://www.google-analytics.com;
```

### 外部CDNを使用する場合

```nginx
# 例: CDNからjQueryを読み込む場合
script-src 'self' 'unsafe-inline' https://code.jquery.com;
```

## セキュリティヘッダーのテスト

### 1. コマンドラインでのテスト

```bash
# ヘッダーの確認
curl -I https://example.com

# 詳細な確認
curl -s -D- https://example.com -o /dev/null
```

### 2. オンラインツール

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

### 3. ブラウザでの確認

1. Chrome DevToolsを開く
2. Networkタブを選択
3. ページをリロード
4. レスポンスヘッダーを確認

## トラブルシューティング

### CSPエラーが発生する場合

1. ブラウザのコンソールでCSP違反を確認
2. 必要なソースをCSPディレクティブに追加
3. Report-Onlyモードでテスト

```nginx
# テスト用のReport-Onlyモード
add_header Content-Security-Policy-Report-Only $csp always;
```

### 特定の機能が動作しない場合

1. Permissions-Policyの設定を確認
2. 必要な権限を許可

```nginx
# 例: カメラを許可する場合
add_header Permissions-Policy "camera=(self)" always;
```

## 注意事項

1. **段階的な導入**: まずReport-Onlyモードでテストしてから本番適用
2. **定期的な見直し**: 新機能追加時はセキュリティヘッダーも更新
3. **互換性の確認**: 古いブラウザでの動作も確認
4. **パフォーマンス**: ヘッダーサイズが大きくなりすぎないよう注意

## 参考リンク

- [MDN Web Docs - HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Content Security Policy (CSP) Quick Reference Guide](https://content-security-policy.com/)