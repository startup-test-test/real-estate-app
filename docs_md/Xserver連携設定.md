# Xserver連携設定ガイド

## ブランチ別FTPサーバー設定

### 1. GitHub Secretsの設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定：

#### 本番環境（mainブランチ）
- `PROD_FTP_SERVER`: 本番FTPサーバーアドレス（例: your-domain.xserver.jp）
- `PROD_FTP_USERNAME`: 本番FTPユーザー名
- `PROD_FTP_PASSWORD`: 本番FTPパスワード

#### 開発環境（developブランチ）
- `DEV_FTP_SERVER`: 開発FTPサーバーアドレス（例: dev.your-domain.xserver.jp）
- `DEV_FTP_USERNAME`: 開発FTPユーザー名
- `DEV_FTP_PASSWORD`: 開発FTPパスワード

#### ステージング環境（stagingブランチ）
- `STAGING_FTP_SERVER`: ステージングFTPサーバーアドレス
- `STAGING_FTP_USERNAME`: ステージングFTPユーザー名
- `STAGING_FTP_PASSWORD`: ステージングFTPパスワード

### 2. デプロイ先ディレクトリ構成

```
/home/username/
├── public_html/          # 本番環境（main）
│   └── index.html
├── public_html/dev/      # 開発環境（develop）
│   └── index.html
└── public_html/staging/  # ステージング環境（staging）
    └── index.html
```

### 3. Xserverでの設定

#### サブドメインの作成（オプション）
1. Xserverサーバーパネルにログイン
2. 「ドメイン設定」→「サブドメイン設定」
3. 以下のサブドメインを作成：
   - `dev.your-domain.com` → `/home/username/public_html/dev/`
   - `staging.your-domain.com` → `/home/username/public_html/staging/`

#### FTPアカウントの分離（推奨）
1. 「FTPアカウント設定」から環境別アカウントを作成
2. 各アカウントに適切なディレクトリ権限を設定

### 4. 環境別URL

- **本番**: https://your-domain.com
- **開発**: https://dev.your-domain.com
- **ステージング**: https://staging.your-domain.com

### 5. 手動デプロイコマンド

```bash
# 開発環境へデプロイ
./scripts/deploy-to-xserver.sh develop

# 本番環境へデプロイ
./scripts/deploy-to-xserver.sh main

# ステージング環境へデプロイ
./scripts/deploy-to-xserver.sh staging
```

### 6. 環境変数の管理

各環境で異なるAPIエンドポイントを使用する場合：

```javascript
// .env.production
VITE_API_URL=https://api.your-domain.com

// .env.development
VITE_API_URL=https://dev-api.your-domain.com

// .env.staging
VITE_API_URL=https://staging-api.your-domain.com
```

### 7. デプロイフロー

1. **開発**: developブランチにプッシュ → 自動的に開発環境へデプロイ
2. **テスト**: developからstagingへPR → マージ後ステージング環境へデプロイ
3. **本番**: stagingからmainへPR → マージ後本番環境へデプロイ

### 8. トラブルシューティング

#### FTP接続エラー
- Xserverのファイアウォール設定を確認
- FTPSを使用する場合はポート21が開いているか確認

#### パーミッションエラー
```bash
# デプロイ後に実行権限を付与
chmod 755 /home/username/public_html/
chmod 644 /home/username/public_html/*.html
```

#### キャッシュの問題
- CloudflareやXserverのキャッシュをクリア
- ブラウザのハードリロード（Ctrl+F5）

---
作成日: 2025年7月27日