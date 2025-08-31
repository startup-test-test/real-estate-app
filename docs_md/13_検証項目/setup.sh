#!/bin/bash

echo "==========================================
Codespace セットアップを開始します
=========================================="

# 1. 日本語フォントのインストール
echo "📝 日本語フォントをインストール中..."
sudo apt-get update
sudo apt-get install -y \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho \
  fonts-noto-cjk \
  fonts-noto-color-emoji

# フォントキャッシュを更新
fc-cache -fv

echo "✅ 日本語フォントのインストール完了"

# 2. Playwright用の依存関係をインストール
if [ -d "docs_md/13_検証項目/playwright_tests" ]; then
  echo "🎭 Playwrightのセットアップ中..."
  cd docs_md/13_検証項目/playwright_tests
  
  # node_modulesがない場合はインストール
  if [ ! -d "node_modules" ]; then
    npm install
  fi
  
  # Playwrightブラウザをインストール
  npx playwright install chromium
  npx playwright install-deps
  
  echo "✅ Playwrightのセットアップ完了"
  cd /workspaces/real-estate-app
fi

# 3. プロジェクトの依存関係をインストール
if [ -f "bolt_front/package.json" ]; then
  echo "📦 bolt_frontの依存関係をインストール中..."
  cd bolt_front
  npm install
  cd ..
  echo "✅ bolt_frontの依存関係インストール完了"
fi

if [ -f "supabase/package.json" ]; then
  echo "📦 supabaseの依存関係をインストール中..."
  cd supabase
  npm install
  cd ..
  echo "✅ supabaseの依存関係インストール完了"
fi

echo "==========================================
✨ Codespace セットアップ完了！
==========================================

日本語フォント: インストール済み
Playwright: セットアップ済み
依存関係: インストール済み

テストを実行する場合:
cd docs_md/13_検証項目/playwright_tests
npm test
"