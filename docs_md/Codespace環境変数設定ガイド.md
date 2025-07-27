# Codespace環境変数設定ガイド

## セキュアな環境変数の設定方法

### 1. Codespaceシークレットの設定（推奨）

1. GitHubの設定ページへアクセス
   - `https://github.com/settings/codespaces`

2. 「Codespace secrets」セクションで「New secret」をクリック

3. 以下のシークレットを追加：
   ```
   # 本番環境FTP
   PROD_FTP_SERVER
   PROD_FTP_USERNAME
   PROD_FTP_PASSWORD
   
   # 開発環境FTP
   DEV_FTP_SERVER
   DEV_FTP_USERNAME
   DEV_FTP_PASSWORD
   
   # ステージング環境FTP
   STAGING_FTP_SERVER
   STAGING_FTP_USERNAME
   STAGING_FTP_PASSWORD
   ```

4. リポジトリを選択して保存

### 2. ローカル.envファイルの使用（開発時のみ）

1. `.env`ファイルを作成（.gitignoreに追加済み）
   ```bash
   cp .env.example .env
   ```

2. 実際の値を設定
   ```bash
   # .env
   PROD_FTP_SERVER=your-actual-server.xserver.jp
   PROD_FTP_USERNAME=your-actual-username
   PROD_FTP_PASSWORD=your-actual-password
   ```

### 3. セキュリティベストプラクティス

#### ❌ やってはいけないこと
- パスワードをコードに直接記述
- .envファイルをGitにコミット
- MDファイルに認証情報を記載

#### ✅ 推奨される方法
- Codespaceシークレット使用
- .envファイルは.gitignoreに追加
- パスワードは定期的に変更

### 4. 環境変数の確認方法

```bash
# 環境変数が設定されているか確認（値は表示しない）
echo "PROD_FTP_SERVER: ${PROD_FTP_SERVER:+[SET]}"
echo "PROD_FTP_USERNAME: ${PROD_FTP_USERNAME:+[SET]}"
echo "PROD_FTP_PASSWORD: ${PROD_FTP_PASSWORD:+[SET]}"
```

### 5. トラブルシューティング

#### 環境変数が読み込まれない場合
```bash
# Codespaceを再起動
# または
source ~/.bashrc
```

#### .envファイルの権限設定
```bash
chmod 600 .env  # 所有者のみ読み書き可能
```

---
作成日: 2025年7月27日