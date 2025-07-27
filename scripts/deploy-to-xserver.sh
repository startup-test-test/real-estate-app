#!/bin/bash

# Xserverデプロイスクリプト
# 使用前に実行権限を付与: chmod +x scripts/deploy-to-xserver.sh
# 使用方法: ./scripts/deploy-to-xserver.sh [環境名]
# 例: ./scripts/deploy-to-xserver.sh develop

# 環境を引数から取得（デフォルトはdevelop）
ENV=${1:-develop}

# 環境変数を読み込み
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 環境に応じて設定を切り替え
case $ENV in
    "main"|"production")
        FTP_HOST=${PROD_FTP_SERVER}
        FTP_USER=${PROD_FTP_USERNAME}
        FTP_PASS=${PROD_FTP_PASSWORD}
        REMOTE_DIR="/home/${FTP_USER}/public_html"
        echo "🚀 本番環境へのデプロイを開始します..."
        ;;
    "develop"|"development")
        FTP_HOST=${DEV_FTP_SERVER}
        FTP_USER=${DEV_FTP_USERNAME}
        FTP_PASS=${DEV_FTP_PASSWORD}
        REMOTE_DIR="/home/${FTP_USER}/public_html/dev"
        echo "🚀 開発環境へのデプロイを開始します..."
        ;;
    "staging")
        FTP_HOST=${STAGING_FTP_SERVER}
        FTP_USER=${STAGING_FTP_USERNAME}
        FTP_PASS=${STAGING_FTP_PASSWORD}
        REMOTE_DIR="/home/${FTP_USER}/public_html/staging"
        echo "🚀 ステージング環境へのデプロイを開始します..."
        ;;
    *)
        echo "❌ 不明な環境: $ENV"
        echo "使用可能な環境: main, develop, staging"
        exit 1
        ;;
esac

# 必須環境変数のチェック
if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo "❌ エラー: FTP認証情報が設定されていません"
    echo "📝 .envファイルに以下の環境変数を設定してください:"
    echo "   - ${ENV^^}_FTP_SERVER"
    echo "   - ${ENV^^}_FTP_USERNAME"
    echo "   - ${ENV^^}_FTP_PASSWORD"
    exit 1
fi

LOCAL_DIR="bolt_front/dist"

# ビルド
echo "📦 アプリケーションをビルド中..."
cd bolt_front
npm run build
cd ..

# FTPでデプロイ（lftp使用）
echo "📤 ファイルをアップロード中..."
echo "   サーバー: $FTP_HOST"
echo "   ユーザー: $FTP_USER"
echo "   転送先: $REMOTE_DIR"

# lftpがインストールされているか確認
if ! command -v lftp &> /dev/null; then
    echo "❌ lftpがインストールされていません"
    echo "インストール: sudo apt-get install lftp"
    exit 1
fi

# FTPアップロード実行
lftp -c "
set ftp:ssl-allow no
set ftp:passive-mode yes
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
mirror -R --delete --verbose --exclude .git --exclude node_modules --exclude .env $LOCAL_DIR $REMOTE_DIR
bye
"

if [ $? -eq 0 ]; then
    echo "✅ デプロイが完了しました！"
    echo "🌐 URL: https://$FTP_HOST"
else
    echo "❌ デプロイに失敗しました"
    exit 1
fi