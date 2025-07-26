# Supabaseデータベース管理

## データベース関連ファイル

### database-scripts/
データベース管理用のSQLスクリプト：
- `add_user_info_columns.sql` - ユーザー情報カラムの追加
- `fix_database.sql` - データベース修正スクリプト

### その他のSQLファイル
- `schema.sql` - メインスキーマ定義
- `properties_table.sql` - 物件テーブル定義
- `simulations_schema_fix.sql` - シミュレーションスキーマ修正
- `re_enable_rls.sql` - RLS再有効化
- `safe_debug_policies.sql` - デバッグ用ポリシー

## 使用方法

### Supabaseダッシュボードでの実行
1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. 左サイドバーの「SQL Editor」をクリック
4. 必要なSQLファイルの内容をコピー＆ペースト
5. 「Run」ボタンをクリックして実行

### データベース修正時の注意
- 本番環境での実行前に必ずバックアップを取る
- RLSポリシーの変更は慎重に行う
- トランザクション内で実行することを推奨

## archiveフォルダ
過去のデータベース修正スクリプトのアーカイブ：
- `fix_constraints.sql` - 制約修正
- `fix_rls_policies.sql` - RLSポリシー修正