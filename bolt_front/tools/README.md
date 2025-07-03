# 開発ツール

このディレクトリには開発・保守用のスクリプトとツールが含まれています。

## ディレクトリ構成

### check-scripts/
データベースの状態確認や検証用のスクリプト
- `check_*.mjs` - 各種データベーステーブルの状態確認
- `create_simple_table.mjs` - シンプルなテーブル作成スクリプト

### database-scripts/
データベース管理用のSQLスクリプト
- `add_user_info_columns.sql` - ユーザー情報カラム追加
- `disable_rls_temp.sql` - RLS一時無効化
- `fix_database.sql` - データベース修正
- `simple_comments.sql` - シンプルコメント機能
- `temp_disable_rls.sql` - RLS一時無効化（別版）

## 使用方法

これらのスクリプトは開発・デバッグ目的で使用されます。本番環境では使用しないでください。