# 開発ツール (dev-tools)

このディレクトリには開発・保守用のスクリプトとツールが含まれています。

⚠️ **注意**: 本番環境では使用しないでください。開発・デバッグ専用です。

## ディレクトリ構成

### database-scripts/
データベース管理用のSQLスクリプト
- `add_user_info_columns.sql` - ユーザー情報カラム追加
- `disable_rls_temp.sql` - RLS一時無効化
- `fix_database.sql` - データベース修正
- `simple_comments.sql` - シンプルコメント機能
- `temp_disable_rls.sql` - RLS一時無効化（別版）

## 使用方法

1. **データベーススクリプト実行**:
   ```bash
   # Supabase SQL Editorで実行
   # または psql 経由で実行
   ```

2. **開発環境での利用**:
   - データベース修正時の参考として使用
   - 問題発生時のトラブルシューティング

## 整理履歴

- **2025/07/03**: `tools/` から `dev-tools/` にリネーム（REF-004）
- **目的**: プロジェクト構造の明確化