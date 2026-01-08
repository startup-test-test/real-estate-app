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

## 📊 現在のデータベース仕様

### テーブル構造

#### 1. **usersテーブル**（ユーザープロファイル）
```sql
- id (UUID) - auth.usersと連携、主キー
- email (TEXT) - メールアドレス（ユニーク）
- full_name (TEXT) - フルネーム
- avatar_url (TEXT) - アバター画像URL
- created_at (TIMESTAMPTZ) - 作成日時
- updated_at (TIMESTAMPTZ) - 更新日時
```

#### 2. **propertiesテーブル**（物件情報）
```sql
- id (UUID) - 主キー
- user_id (UUID) - ユーザーID（外部キー）
- property_name (VARCHAR) - 物件名
- location (VARCHAR) - 所在地
- purchase_price (NUMERIC) - 購入価格
- monthly_rent (NUMERIC) - 月額賃料
- building_area (NUMERIC) - 建物面積
- land_area (NUMERIC) - 土地面積
- year_built (INTEGER) - 築年
- property_type (VARCHAR) - 物件タイプ（デフォルト：区分マンション）
- created_at (TIMESTAMPTZ) - 作成日時
- updated_at (TIMESTAMPTZ) - 更新日時
```

#### 3. **simulationsテーブル**（シミュレーション結果）
- シミュレーション結果の保存用
- 物件情報と紐付けて管理

### 🔒 セキュリティ設定

#### Row Level Security（RLS）
- **全テーブルでRLSが有効**
- 基本ポリシー：`auth.uid() = user_id`
- ユーザーは自分のデータのみアクセス可能

#### 認証
- Supabase Authを使用
- メール/パスワード認証
- パスワードリセット機能

### 🔧 システムの特徴

1. **シンプルなMVP構成**
   - ユーザーごとのデータ分離
   - 基本的なCRUD操作のみ

2. **削除された機能**
   - 共有機能（share関連テーブル）
   - コメント機能
   - 招待機能

3. **将来の拡張性**
   - Edge Functions用のディレクトリ確保
   - マイグレーション管理による段階的な機能追加

### 📝 主な用途

1. **物件管理**: ユーザーが自分の物件情報を登録・管理
2. **シミュレーション保存**: 不動産投資シミュレーション結果の保存
3. **ユーザープロファイル**: 基本的なユーザー情報の管理