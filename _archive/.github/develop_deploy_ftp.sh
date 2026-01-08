#!/bin/bash
# ========================================================================
# develop_deploy_ftp.sh - Develop環境への手動FTPデプロイトリガー
# ========================================================================
#
# 【概要】
# developブランチへの空コミットを作成し、GitHub ActionsのFTPデプロイを
# 手動でトリガーするためのユーティリティスクリプト
#
# 【用途】
# - コード変更なしでdevelop環境への再デプロイを実行したい場合
# - GitHub Actionsのワークフローを手動で起動したい場合
# - デプロイの動作確認を行いたい場合
#
# 【デプロイフロー】
# 1. このスクリプトを実行
# 2. 空のコミットがdevelopブランチにプッシュされる
# 3. GitHub Actions (.github/workflows/deploy-to-xserver-dev.yml) が起動
# 4. FTP-Deploy-Actionを使用してXserver開発環境へデプロイ
#
# 【デプロイ先】
# - 開発環境: dev.ooya-dx.com (Xserver開発サーバー)
# - FTPプロトコルを使用した自動アップロード
#
# 【使用方法】
# $ bash .github/develop_deploy_ftp.sh
#
# 【注意事項】
# - developブランチで実行してください
# - GitHub Secrets に FTP認証情報が設定されている必要があります
#   - DEV_FTP_HOST
#   - DEV_FTP_USERNAME
#   - DEV_FTP_PASSWORD
#   - DEV_FTP_PORT
#
# ========================================================================

echo "🚀 Develop環境への手動FTPデプロイを開始します..."
echo "📍 現在のブランチ: $(git branch --show-current)"
echo ""

# 現在のブランチがdevelopかチェック
if [ "$(git branch --show-current)" != "develop" ]; then
    echo "⚠️  警告: 現在のブランチがdevelopではありません。"
    echo "developブランチに切り替えてから実行してください。"
    echo ""
    echo "実行例:"
    echo "$ git checkout develop"
    echo "$ bash .github/develop_deploy_ftp.sh"
    exit 1
fi

# 空コミットを作成してプッシュ
git commit --allow-empty -m "manual: Develop環境へのFTPデプロイ実行 $(date +%Y%m%d_%H%M%S)"
git push origin develop

echo ""
echo "✅ デプロイがトリガーされました！"
echo "📊 進捗確認: https://github.com/startup-test-test/real-estate-app/actions"
echo "🌐 デプロイ先: https://dev.ooya-dx.com"
echo ""
echo "※ デプロイ完了まで数分かかります。GitHub Actionsで進捗を確認してください。"