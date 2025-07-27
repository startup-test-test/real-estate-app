# Xserver仕様確認チェックリスト

## 事前に確認すべきXserverの仕様

### 1. PHPバージョン
- [ ] PHP 7.4以上が利用可能か
- [ ] PHP設定の変更が可能か（php.ini）

### 2. Node.js/npmサポート
- [ ] **重要**: XserverはNode.jsをサポートしていません
- [ ] フロントエンドは事前にビルドする必要があります（静的ファイルのみ）

### 3. 静的ファイルホスティング
- [ ] HTML/CSS/JSファイルのホスティング → ✅ 対応
- [ ] SPAのルーティング対応 → .htaccessで設定可能

### 4. APIサーバー
- [ ] Python/Node.jsのAPIサーバー → ❌ 非対応
- [ ] 外部APIへのアクセス → ✅ 対応（CORS設定必要）

### 5. SSL/HTTPS
- [ ] 無料SSL証明書（Let's Encrypt）→ ✅ 対応
- [ ] 強制HTTPS設定 → .htaccessで設定可能

### 6. ファイルサイズ制限
- [ ] アップロードファイルサイズ上限（通常2MB〜50MB）
- [ ] 総容量制限（プランによる）

### 7. アクセス制限
- [ ] .htaccessによる制御 → ✅ 対応
- [ ] IP制限、Basic認証 → ✅ 対応

## Xserverに適していない機能と対処法

### ❌ 動作しないもの
1. **Node.js/Pythonサーバー**
   - 対処法：外部サービス（Render, Heroku等）を利用

2. **WebSocket接続**
   - 対処法：ポーリングまたは外部サービスを利用

3. **サーバーサイドレンダリング（SSR）**
   - 対処法：静的サイトジェネレーター（SSG）を使用

### ✅ 動作するもの
1. **React SPA（ビルド済み）**
   - dist/フォルダの静的ファイル

2. **外部APIへの通信**
   - fetch/axiosでの外部API呼び出し

3. **クライアントサイドルーティング**
   - React Routerは.htaccess設定で対応可能

## 推奨される構成

```
Xserver（フロントエンド）
├── 静的ファイル（HTML/CSS/JS）
├── 画像ファイル
└── .htaccess（ルーティング設定）

外部サービス（バックエンド）
├── Render.com → simulator-api
├── Heroku → property-api
└── Supabase → データベース
```

## .htaccessの必須設定

```apache
# SPAルーティング対応
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# HTTPSへのリダイレクト
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# セキュリティヘッダー
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

## 確認方法

1. **Xserver管理画面で確認**
   - サーバー情報 → PHP設定
   - .htaccess編集機能
   - SSL設定

2. **サポートに問い合わせ**
   - 特定の機能の可否
   - 推奨される設定方法

## まとめ

Xserverは**静的ファイルホスティング**に適しており、以下の構成が最適：

- ✅ フロントエンド：React（ビルド済み）
- ❌ バックエンド：外部サービスを利用
- ✅ 画像・静的ファイル：直接ホスティング
- ✅ セキュリティ：.htaccessで設定