#!/bin/bash

# Claude Codeのインストール（npmを使用）
if ! command -v claude &> /dev/null; then
    echo "Installing Claude Code..."
    npm install -g @anthropics/claude-cli
fi

# PATHに追加（.bashrcに永続化）
if ! grep -q ".npm-global/bin" "$HOME/.bashrc"; then
    echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> "$HOME/.bashrc"
fi

# 現在のセッションでも使えるようにする
export PATH="$HOME/.npm-global/bin:$PATH"

# Claude Codeを自動起動（オプション）
# コメントを外すと自動起動します
# claude