#!/bin/bash

# 日本語フォントのインストールスクリプト
# Playwrightでの文字化けを防ぐため

echo "日本語フォントをインストールしています..."

# パッケージリストを更新
sudo apt-get update

# 日本語フォントをインストール
sudo apt-get install -y \
  fonts-ipafont-gothic \
  fonts-ipafont-mincho \
  fonts-noto-cjk \
  fonts-noto-color-emoji

# フォントキャッシュを更新
fc-cache -fv

echo "日本語フォントのインストールが完了しました"

# インストール済みの日本語フォントを確認
echo "インストール済みの日本語フォント:"
fc-list :lang=ja | head -10