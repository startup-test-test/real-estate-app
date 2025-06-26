# 環境設定ガイド

## 初回セットアップ

1. `.env`ファイルを作成
```bash
cp .env.example .env
```

2. Supabaseの設定
- [Supabase](https://supabase.com)でプロジェクトを作成
- Settings > API から以下の値を取得：
  - Project URL
  - anon public key

3. `.env`ファイルを編集
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## GitHub Codespacesでの永続化

リポジトリのSettings > Secrets > Codespacesで以下を設定：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

これにより、新しいCodespaceでも自動的に環境変数が設定されます。