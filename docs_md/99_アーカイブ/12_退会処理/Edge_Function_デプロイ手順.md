# Edge Function デプロイ手順

## 前提条件
- Supabase CLIがインストールされていること
- Supabaseプロジェクトのアクセストークンがあること

## 1. Supabase CLIログイン

```bash
npx supabase login
```

## 2. プロジェクトリンク

```bash
npx supabase link --project-ref [your-project-ref]
```

## 3. Edge Functionのデプロイ

```bash
# cancel-subscription関数をデプロイ
npx supabase functions deploy cancel-subscription --no-verify-jwt
```

## 4. 環境変数の設定

Supabaseダッシュボードで以下の環境変数を設定：

1. **Edge Functions > cancel-subscription > Settings**に移動
2. 以下の環境変数を追加：
   - `STRIPE_SECRET_KEY`: Stripeのシークレットキー（本番用）
   - `SUPABASE_URL`: SupabaseプロジェクトのURL（自動設定済み）
   - `SUPABASE_SERVICE_ROLE_KEY`: サービスロールキー（自動設定済み）

## 5. デプロイ確認

```bash
# 関数の一覧を確認
npx supabase functions list

# ログを確認
npx supabase functions logs cancel-subscription
```

## 6. テスト実行

```bash
# ローカルでテスト
curl -X POST https://[your-project-ref].supabase.co/functions/v1/cancel-subscription \
  -H "Authorization: Bearer [your-access-token]" \
  -H "Content-Type: application/json"
```

## トラブルシューティング

### CORS エラーが発生する場合
- Edge Function内のCORS設定を確認
- フロントエンドのoriginが許可されているか確認

### 認証エラーが発生する場合
- JWTトークンが正しく送信されているか確認
- Supabaseの認証設定を確認

### Stripe API エラーが発生する場合
- STRIPE_SECRET_KEYが正しく設定されているか確認
- Stripeダッシュボードでサブスクリプションの状態を確認

## 本番環境へのデプロイ

```bash
# 本番環境用の環境変数を設定後
npx supabase functions deploy cancel-subscription --no-verify-jwt --project-ref [production-project-ref]
```

## 注意事項

1. **セキュリティ**
   - 本番環境では必ずHTTPS経由でアクセス
   - 環境変数は絶対にコードにハードコーディングしない

2. **テスト**
   - 本番デプロイ前に必ずステージング環境でテスト
   - Stripeのテストモードで動作確認

3. **モニタリング**
   - Edge Functionのログを定期的に確認
   - エラー率をモニタリング