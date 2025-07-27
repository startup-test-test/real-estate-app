# XserverでBasic認証を設定する方法

## 概要
開発環境（dev.ooya.tech）へのアクセスを制限するため、Basic認証を設定します。

## 設定手順

### 1. Xserverのサーバーパネルにログイン
1. [Xserverアカウント](https://www.xserver.ne.jp/login_info.php)にログイン
2. サーバーパネルにアクセス

### 2. アクセス制限設定
1. **ホームページ** セクションの「アクセス制限」をクリック
2. ドメイン選択画面で「ooya.tech」を選択
3. フォルダ一覧から「public_html/dev.ooya.tech」を探す

### 3. Basic認証の設定
1. 対象フォルダの「アクセス制限」をクリック
2. 「アクセス制限設定」画面で以下を設定：
   - **アクセス制限**: ONにする
   - **ユーザー設定**: 「ユーザー追加」をクリック

### 4. ユーザーの追加
1. Basic認証用のユーザー情報を入力：
   - **ユーザーID**: 任意のID（例: dev_admin）
   - **パスワード**: 安全なパスワードを設定
2. 「確認画面へ進む」→「追加する」

### 5. 設定の反映
- 設定は即座に反映されます
- ブラウザでdev.ooya.techにアクセスすると認証ダイアログが表示されます

## 自動生成されるファイル

Xserverが以下のファイルを自動生成します：

### .htaccess（追記される内容）
```apache
AuthUserFile /home/[サーバーID]/ooya.tech/public_html/dev.ooya.tech/.htpasswd
AuthGroupFile /dev/null
AuthName "Please enter your ID and password"
AuthType Basic
require valid-user
```

### .htpasswd
```
dev_admin:$apr1$xxxxxx$xxxxxxxxxxxxxxxxxx
```
（パスワードは暗号化されて保存）

## 注意事項

1. **GitHubへのコミット禁止**
   - .htpasswdファイルは絶対にGitにコミットしない
   - .gitignoreに追加済みか確認

2. **FTPデプロイとの共存**
   - GitHub Actionsでのデプロイ時、.htaccessが上書きされる可能性
   - deploy-configs/dev/.htaccessにBasic認証設定を追加する必要あり

3. **パスワード管理**
   - Basic認証のID/パスワードは安全に管理
   - 開発チームメンバーに共有する際は安全な方法で

## 設定確認方法

1. ブラウザのプライベートモードで https://dev.ooya.tech/ にアクセス
2. 認証ダイアログが表示されることを確認
3. 正しいID/パスワードでアクセスできることを確認

## トラブルシューティング

### 認証ダイアログが表示されない場合
- ブラウザキャッシュをクリア
- .htaccessファイルが正しく配置されているか確認
- Xserverの設定画面で「アクセス制限」がONになっているか確認

### 認証後も403エラーが出る場合
- .htaccessの記述順序を確認
- DirectoryIndexの設定が正しいか確認

## GitHub Actionsとの連携

デプロイ時にBasic認証設定を維持するため、以下の対応が必要：

### deploy-configs/dev/.htaccessに追記
```apache
# Basic認証設定（Xserverで自動生成される内容をコピー）
AuthUserFile /home/[サーバーID]/ooya.tech/public_html/dev.ooya.tech/.htpasswd
AuthGroupFile /dev/null
AuthName "Please enter your ID and password"
AuthType Basic
require valid-user

# 既存のSPA設定
DirectoryIndex index.html index.php
# ... 以下既存の設定
```

ただし、.htpasswdファイルのパスは環境依存のため、Xserverで生成された正確なパスを使用すること。

---
作成日: 2025年7月27日