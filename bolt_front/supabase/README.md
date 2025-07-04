# データベース設定手順

## 共有機能のテーブル作成

共有機能を有効にするために、以下のSQLファイルをSupabaseで実行してください：

### 1. Supabaseダッシュボードにアクセス
1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. 左サイドバーの「SQL Editor」をクリック

### 2. SQLファイルの実行
1. `shares_schema.sql`ファイルの内容をコピー
2. SQL Editorに貼り付け
3. 「Run」ボタンをクリックして実行

### 3. テーブルの確認
実行後、以下のテーブルが作成されます：
- `simulation_shares`: 共有データを保存するテーブル

### 4. RLSポリシーの確認
以下のポリシーが自動的に設定されます：
- 誰でも有効な共有データを読める
- ログインユーザーは自分の共有を作成できる
- ユーザーは自分の共有を削除できる
- 閲覧回数を更新できる

## 実装済み機能

### ✅ Phase 1: かんたん共有
- [x] 共有ボタンの追加（シミュレーション結果ページ）
- [x] 共有ボタンの追加（ダッシュボード）
- [x] 一意のURLを生成（7日間有効）
- [x] ワンクリックでコピー機能
- [x] 共有ページ（/share/:id）
- [x] LINEとメールでの共有リンク
- [x] PDF保存機能

### 🔄 Phase 2: 高度な共有オプション（将来実装）
- [ ] パスワード保護オプション
- [ ] 有効期限の選択
- [ ] 閲覧回数制限
- [ ] 共有履歴の管理

## 使用方法

1. **シミュレーション結果から共有**
   - シミュレーション結果ページの「共有」ボタンをクリック
   - 生成されたURLをコピーしてLINEやメールで送信

2. **ダッシュボードから共有**
   - 物件カードの「共有」ボタンをクリック
   - 同様にURLを生成・共有

3. **共有リンクの閲覧**
   - 受け取った人はログイン不要で閲覧可能
   - 7日間有効、閲覧回数が記録される
   - PDF保存も可能

## セキュリティ

- 共有URLは12文字のランダム文字列（推測困難）
- 7日間で自動削除
- 個人情報は共有されない
- HTTPS通信で暗号化