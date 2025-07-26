# Supabaseデータベース管理

## 📁 ディレクトリ構造

### migrations/
スキーママイグレーションファイル（番号順に実行）：
- `001_initial_schema.sql` - 初期スキーマ定義
- `002_properties_table.sql` - 物件テーブル定義
- `003_simulations_fix.sql` - シミュレーションスキーマ修正
- `004_complete_update.sql` - 完全なスキーマ更新

### policies/
RLS（Row Level Security）ポリシー関連：
- `README.md` - RLSポリシー管理ドキュメント
- `enable_rls.sql` - RLS有効化スクリプト
- `debug_policies.sql` - デバッグ用ポリシー

### scripts/
ユーティリティスクリプト：
- `add_user_columns.sql` - ユーザー情報カラム追加
- `fix_database.sql` - データベース修正

### functions/
Supabase Edge Functions（現在は空）

### archive/
過去のファイルアーカイブ

## 🚀 使用方法

### 新規データベースセットアップ
1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. SQL Editorを開く
4. `migrations/`フォルダ内のファイルを番号順に実行
5. `policies/enable_rls.sql`を実行してRLSを有効化

### メンテナンス・修正
- `scripts/`フォルダ内のスクリプトを必要に応じて実行
- デバッグ時は`policies/debug_policies.sql`を使用

## ⚠️ 注意事項

### データベース修正時
- 本番環境での実行前に必ずバックアップを取る
- RLSポリシーの変更は慎重に行う
- トランザクション内で実行することを推奨
- マイグレーションは番号順に実行する

## 📦 ファイル説明

### マイグレーションファイル
- **001_initial_schema.sql**: 基本テーブル構造
- **002_properties_table.sql**: 物件情報テーブル
- **003_simulations_fix.sql**: シミュレーション関連の修正
- **004_complete_update.sql**: 統合アップデート

### ポリシーファイル
- **enable_rls.sql**: 各テーブルのRLSを有効化
- **debug_policies.sql**: 開発・デバッグ用の緩いポリシー