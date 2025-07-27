# Xserver本番環境デプロイ完全ガイド

## 概要
このドキュメントでは、不動産投資シミュレーターアプリケーションをXserverの本番環境にデプロイする完全な手順を説明します。

## 前提条件
- Node.js（v18以上）がインストールされていること
- Gitがインストールされていること
- Xserverのアカウント情報（FTP情報）を持っていること
- FTPクライアント（FileZilla等）がインストールされていること

## アップロード対象ファイル一覧

### 📦 ビルドが必要なもの

#### 1. フロントエンド（React/Vite）
```bash
# ビルドコマンド
cd bolt_front
npm install  # 初回のみ
npm run build
```

**ビルド後に生成されるファイル：**
```
bolt_front/dist/
├── index.html          # エントリーポイント
└── assets/             # ビルドされたJS/CSSファイル
    ├── index-xxxxx.js  # メインアプリケーション
    ├── index-xxxxx.css # スタイルシート
    ├── vendor-xxxxx.js # ライブラリ
    ├── charts-xxxxx.js # チャート機能
    └── supabase-xxxxx.js # Supabase関連
```

### 📸 手動でアップロードが必要なもの

#### 2. 画像ファイル
```
bolt_front/img/
├── background_001.jpg
├── background_002.jpg
├── kakushin_img01.png
├── logo_250709_2.png
├── main_250710_1.png
├── people_1.png
├── people_2.png
├── people_3.png
└── people_4.png
```
**注意**: 画像ファイルはビルドに含まれないため、手動でアップロードが必要です。

### ⚙️ 新規作成が必要なもの

#### 3. 環境変数ファイル（.env）
```bash
# Xserver上で直接作成
# フロントエンド用の環境変数
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-api-server.com
```

#### 4. アクセス制御ファイル（.htaccess）
```apache
# SPAのルーティング設定
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

# セキュリティ設定
<Files ~ "^\.env">
    Order allow,deny
    Deny from all
</Files>

# セキュリティヘッダー
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

### ❌ アップロード不要なもの

- **バックエンドAPI**（外部サービスで運用）
  - `backend/property-api/` → Render等でデプロイ
  - `backend/simulator-api/` → Render等でデプロイ
- **開発用ファイル**
  - `node_modules/`
  - `.git/`
  - `src/`フォルダ
  - 各種設定ファイル（vite.config.ts等）

## 📂 最終的なXserverのディレクトリ構造

```
public_html/
├── index.html          # distフォルダから
├── assets/             # distフォルダから
│   └── *.js, *.css
├── img/                # 手動でアップロード
│   └── *.jpg, *.png
├── .env                # Xserver上で作成
└── .htaccess           # アップロード
```

## 🚀 デプロイ手順

### ステップ1: ビルド実行
```bash
cd /workspaces/real-estate-app/bolt_front
npm install  # 初回のみ
npm run build
```

### ステップ2: FTP接続設定
1. FileZillaを起動
2. サイトマネージャーで新規サイトを作成
   - ホスト: `ftp.your-domain.com`
   - ユーザー: Xserverのユーザー名
   - パスワード: Xserverのパスワード
   - ポート: 21

### ステップ3: ファイルのアップロード

#### 3.1 既存ファイルのバックアップ（推奨）
```
public_html_backup_YYYYMMDD/
```

#### 3.2 アップロード順序
1. **フロントエンドファイル**
   - `dist/`フォルダの中身 → `public_html/`

2. **画像ファイル**
   - `img/`フォルダ → `public_html/img/`

3. **設定ファイル**
   - `.htaccess` → `public_html/`

### ステップ4: Xserver上での作業

#### 4.1 .envファイルの作成
1. Xserverのファイルマネージャーにログイン
2. `public_html`ディレクトリで新規ファイル作成
3. `.env`という名前で保存
4. 環境変数を記入

#### 4.2 パーミッションの設定
```bash
# .envファイルのパーミッション
chmod 600 .env

# その他のファイル
chmod 644 *.html *.css *.js
chmod 755 ディレクトリ
```

### ステップ5: 動作確認

#### 5.1 基本的な確認
- [ ] https://your-domain.com でページが表示される
- [ ] ブラウザのコンソールにエラーがない
- [ ] 画像が正しく表示される

#### 5.2 機能の確認
- [ ] ページ遷移が正常に動作する
- [ ] APIとの通信が成功する
- [ ] フォームが正しく動作する

#### 5.3 セキュリティの確認
- [ ] HTTPSでアクセスできる
- [ ] .envファイルに直接アクセスできない
- [ ] 不要なファイルが公開されていない

## 🔧 トラブルシューティング

### 500 Internal Server Error
1. `.htaccess`の記述を確認
2. ファイルのパーミッションを確認
3. Xserverのエラーログを確認

### 404 Not Found
1. ファイルパスが正しいか確認
2. `.htaccess`のRewriteRuleを確認
3. ファイルが正しくアップロードされているか確認

### 画像が表示されない
1. imgフォルダが正しい場所にあるか確認
2. 画像ファイルのパスが正しいか確認
3. 大文字小文字の違いがないか確認

### APIが動作しない
1. 環境変数（VITE_API_BASE_URL）が正しく設定されているか
2. CORSの設定が適切か
3. 外部APIサーバーが稼働しているか

## 📋 デプロイチェックリスト

### デプロイ前
- [ ] ローカルで動作確認済み
- [ ] ビルドが成功する
- [ ] 環境変数の値を準備

### デプロイ中
- [ ] 既存ファイルのバックアップ
- [ ] 正しいディレクトリにアップロード
- [ ] .envファイルの作成

### デプロイ後
- [ ] 全ページの動作確認
- [ ] APIとの通信確認
- [ ] セキュリティ設定の確認
- [ ] SSL証明書の確認

## 🔐 セキュリティ注意事項

1. **環境変数の管理**
   - `.env`ファイルは絶対にGitにコミットしない
   - 本番用の値のみを使用する
   - 定期的に値を更新する

2. **アクセス制限**
   - 不要なファイルは公開しない
   - .htaccessで適切に制限する

3. **HTTPS強制**
   - 必ずHTTPS接続を使用する
   - HTTPからの自動リダイレクトを設定

## まとめ

Xserverへのデプロイは以下の流れで行います：

1. **ビルド**: `npm run build`でフロントエンドをビルド
2. **アップロード**: FTPで必要なファイルをアップロード
3. **設定**: .envと.htaccessを適切に設定
4. **確認**: 全機能の動作確認とセキュリティチェック

バックエンドAPIは外部サービスを利用し、Xserverは静的ファイルのホスティングに特化させることで、安定した運用が可能です。