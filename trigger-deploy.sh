#!/bin/bash
# 手動デプロイトリガー用スクリプト

echo "🚀 手動デプロイを開始します..."
git commit --allow-empty -m "manual: デプロイ実行 $(date +%Y%m%d_%H%M%S)"
git push origin develop
echo "✅ デプロイがトリガーされました。GitHub Actionsを確認してください。"