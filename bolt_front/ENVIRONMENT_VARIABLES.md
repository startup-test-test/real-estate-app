# 環境変数設定ガイド

## 概要
このドキュメントでは、アプリケーションで使用される環境変数について説明します。

## 必須環境変数

### Supabase関連
- `VITE_SUPABASE_URL`: SupabaseプロジェクトのURL
  - 形式: `https://<project-ref>.supabase.co`
  - 本番環境ではlocalhostは使用不可
- `VITE_SUPABASE_ANON_KEY`: Supabaseの匿名キー
  - JWT形式のトークン
  - Service Keyは使用しないこと

## オプション環境変数

### 開発・デバッグ関連
- `VITE_ENABLE_MOCK_MODE`: モックモードの有効化 (true/false)
  - 開発環境でモックデータを使用する場合に設定
  - デフォルト: false

### 環境判定
- `NODE_ENV`: 実行環境 (development/production)
  - Viteが自動的に設定
  - 開発: `npm run dev` → development
  - ビルド: `npm run build` → production

## .env.example
```bash
# Supabase設定（必須）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 開発設定（オプション）
VITE_ENABLE_MOCK_MODE=false
```

## セキュリティ上の注意事項

### ⚠️ 重要
1. `.env`ファイルは**絶対にGitにコミットしない**
2. 本番環境では`VITE_ENABLE_MOCK_MODE`を設定しない、または`false`に設定
3. 環境変数には機密情報を含めない（Service Keyなど）

### 環境別の設定

#### 開発環境
```bash
# .env.development
VITE_ENABLE_MOCK_MODE=true
```

#### 本番環境
```bash
# .env.production
# VITE_ENABLE_MOCK_MODE は設定しない
```

## モックモードについて

モックモードが有効な場合（`VITE_ENABLE_MOCK_MODE=true`）：
- 共有機能でモックデータが使用される
- コメント機能でテストデータが使用される
- Supabaseへの実際のデータ保存は行われない

本番環境では必ずモックモードを無効にしてください。

## 環境変数の検証（SEC-044）

### 起動時チェック
アプリケーション起動時に以下の検証が自動的に実行されます：

1. **必須環境変数の存在確認**
   - `VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`が設定されているか
   - 空文字列でないか

2. **形式の検証**
   - Supabase URLが有効なURL形式か
   - Anon KeyがJWT形式か

3. **本番環境での追加チェック**
   - localhostのURLが使用されていないか
   - モックモードが無効になっているか

### エラー時の動作
- **開発環境**: コンソールに詳細なエラーメッセージを表示
- **本番環境**: アプリケーションの起動を停止し、エラー画面を表示

## トラブルシューティング

### 環境変数が読み込まれない
1. `.env`ファイルがプロジェクトルートに存在することを確認
2. 環境変数名が`VITE_`で始まっていることを確認（Viteの要件）
3. 開発サーバーを再起動（`npm run dev`）

### モックモードが意図せず有効になる
1. `VITE_ENABLE_MOCK_MODE`の値を確認
2. 環境変数の優先順位を確認（.env.local > .env）

### 起動時エラー「Invalid configuration」
1. 必須環境変数がすべて設定されているか確認
2. 環境変数の値が正しい形式か確認
3. 本番環境でモックモードが無効になっているか確認