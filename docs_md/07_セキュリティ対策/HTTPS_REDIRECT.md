# HTTPSリダイレクト実装ガイド

## 概要

HTTP通信を自動的にHTTPSへリダイレクトし、通信の暗号化を保証する実装を行いました。

## 実装内容

### 1. HTTPSリダイレクトミドルウェア (`https_redirect.py`)

#### 主な機能
- **自動リダイレクト**: HTTP接続をHTTPSへ308 Permanent Redirectで転送
- **プロキシ対応**: X-Forwarded-Proto、CF-Visitorヘッダーをサポート
- **HSTSヘッダー**: HTTP Strict Transport Securityの自動設定
- **ホストヘッダー検証**: ホストヘッダーインジェクション攻撃対策

#### 環境変数設定
```bash
# HTTPSリダイレクトを有効化（デフォルト: true）
FORCE_HTTPS=true

# リダイレクトステータスコード（デフォルト: 308）
HTTPS_REDIRECT_CODE=308

# 許可するホスト（カンマ区切り）
ALLOWED_HOSTS=example.com,www.example.com

# HSTSの有効期限（秒）デフォルト: 31536000（1年）
HSTS_MAX_AGE=31536000

# サブドメインを含める（デフォルト: true）
HSTS_INCLUDE_SUBDOMAINS=true

# HSTSプリロードリストへの登録（デフォルト: true）
HSTS_PRELOAD=true
```

### 2. リダイレクトの仕組み

#### プロトコル判定の優先順位
1. `X-Forwarded-Proto` ヘッダー（リバースプロキシ経由）
2. `CF-Visitor` ヘッダー（Cloudflare経由）
3. リクエストURLのスキーム

#### リダイレクト処理
```python
# HTTPリクエストの例
GET http://example.com/api/simulate?param=value

# リダイレクトレスポンス
HTTP/1.1 308 Permanent Redirect
Location: https://example.com/api/simulate?param=value
```

### 3. HSTSヘッダー

HTTPS接続時に以下のヘッダーが自動的に追加されます：

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

これにより：
- ブラウザは指定期間中、HTTPSでのみ接続を試みます
- サブドメインも含めてHTTPSが強制されます
- HSTSプリロードリストへの登録が可能になります

## デプロイメント設定

### 1. 開発環境

開発環境では通常HTTPSリダイレクトを無効化します：

```bash
# .env.development
FORCE_HTTPS=false
```

### 2. 本番環境（ロードバランサー使用時）

AWS ALB、GCP LB、Nginx等のロードバランサーを使用する場合：

```bash
# .env.production
FORCE_HTTPS=true
ALLOWED_HOSTS=api.example.com,example.com
```

#### Nginxの設定例
```nginx
server {
    listen 80;
    server_name example.com;
    
    # Nginxでリダイレクトする場合
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    # FastAPIアプリケーションへのプロキシ
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Cloudflare使用時

Cloudflareを使用する場合の設定：

1. **Cloudflareダッシュボード**
   - SSL/TLS → Edge Certificates → Always Use HTTPS を有効化
   - SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS) を設定

2. **アプリケーション設定**
```bash
# Cloudflareがリダイレクトを処理するため、アプリ側は無効化
FORCE_HTTPS=false
```

### 4. Heroku/Railway等のPaaS

多くのPaaSはX-Forwarded-Protoヘッダーを設定します：

```bash
# アプリケーション側でリダイレクトを処理
FORCE_HTTPS=true
# ホストは動的に割り当てられるため指定しない
ALLOWED_HOSTS=
```

## セキュリティ考慮事項

### 1. ホストヘッダーインジェクション対策

`ALLOWED_HOSTS`を設定して、許可されたホストのみを受け入れます：

```python
# 不正なリクエスト
Host: evil.com

# レスポンス：デフォルトホストへリダイレクト
Location: https://example.com/
```

### 2. プロトコルダウングレード攻撃対策

HSTSヘッダーにより、一度HTTPS接続したクライアントはHTTPへのダウングレードを防げます。

### 3. Mixed Content対策

すべてのリソース（画像、スクリプト、スタイルシート等）もHTTPSで配信する必要があります：

```html
<!-- ❌ 危険 -->
<img src="http://example.com/image.jpg">

<!-- ✅ 安全 -->
<img src="https://example.com/image.jpg">
<!-- または相対パス -->
<img src="/image.jpg">
```

## トラブルシューティング

### 1. リダイレクトループ

**症状**: ブラウザが「リダイレクトが多すぎます」エラーを表示

**原因と対策**:
- ロードバランサーとアプリケーション両方でリダイレクトしている
  → どちらか一方でのみリダイレクトを設定
- X-Forwarded-Protoヘッダーが正しく設定されていない
  → プロキシ設定を確認

### 2. HSTSが効かない

**症状**: HTTPアクセスが継続される

**原因と対策**:
- 初回アクセスがHTTPで行われた
  → HSTSプリロードリストへの登録を検討
- max-ageが短すぎる
  → 最低でも6ヶ月（15768000秒）以上に設定

### 3. 開発環境でHTTPSが強制される

**症状**: localhostでHTTPSリダイレクトが発生

**対策**:
```bash
# 開発環境では明示的に無効化
export FORCE_HTTPS=false
# または
python -m uvicorn app:app --env-file .env.development
```

## HTTPSステータス確認

実装したエンドポイントで現在の設定を確認できます：

```bash
curl https://api.example.com/api/https-status
```

レスポンス例：
```json
{
  "url_scheme": "https",
  "forwarded_proto": "https",
  "cloudflare_https": false,
  "is_secure": true,
  "force_https_enabled": true,
  "hsts_enabled": true,
  "hsts_max_age": 31536000,
  "headers": {
    "Host": "api.example.com",
    "X-Forwarded-Proto": "https",
    "CF-Visitor": ""
  }
}
```

## ベストプラクティス

1. **段階的な導入**
   - まず短いHSTS期間（300秒）でテスト
   - 問題がなければ徐々に延長

2. **監視の実装**
   - HTTPリクエスト数の監視
   - リダイレクト率の追跡
   - エラー率の確認

3. **証明書の管理**
   - Let's Encryptによる自動更新
   - 証明書の有効期限監視
   - 証明書の透明性ログ確認

## 参考資料

- [MDN - HTTP Strict Transport Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [OWASP - HTTP Strict Transport Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
- [hstspreload.org](https://hstspreload.org/) - HSTSプリロードリスト登録