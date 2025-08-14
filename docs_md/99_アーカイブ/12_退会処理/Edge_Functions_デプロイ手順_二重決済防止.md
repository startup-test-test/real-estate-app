# Edge Functions デプロイ手順（二重決済防止システム）

## 前提条件
- Supabase CLIがインストール済み
- Supabaseプロジェクトにアクセス権限がある

## デプロイ手順

### 1. Supabaseにログイン
```bash
npx supabase login
```

### 2. プロジェクトをリンク
```bash
npx supabase link --project-ref <your-project-ref>
```

### 3. Edge Functionsをデプロイ

#### resume-subscription（解約取り消し）
```bash
npx supabase functions deploy resume-subscription
```

#### cancel-subscription（解約処理）
```bash
npx supabase functions deploy cancel-subscription
```

#### create-checkout-session（購入処理）
```bash
npx supabase functions deploy create-checkout-session
```

### 4. 環境変数の設定

Supabaseダッシュボードで以下の環境変数を設定：

1. **Edge Functions > 設定**に移動
2. 以下の環境変数を追加：

```
STRIPE_SECRET_KEY=sk_live_xxxxx（またはsk_test_xxxxx）
DEV_STRIPE_SECRET_KEY=sk_test_xxxxx
DEV_STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 5. データベースマイグレーションの適用

```bash
# マイグレーションファイルの確認
cat supabase/migrations/20250814_add_unique_subscription_constraint.sql

# マイグレーションの適用
npx supabase db push
```

### 6. デプロイ確認

#### Supabaseダッシュボードで確認
1. **Edge Functions**セクションに移動
2. 以下の関数が表示されることを確認：
   - `resume-subscription`
   - `cancel-subscription`
   - `create-checkout-session`

#### ログの確認
```bash
# 各関数のログを確認
npx supabase functions logs resume-subscription
npx supabase functions logs cancel-subscription
npx supabase functions logs create-checkout-session
```

## テスト手順

### 1. 解約と解約取り消しのテスト

1. プレミアムプランに登録済みのユーザーでログイン
2. プレミアムプランページで「プランを解約」をクリック
3. 解約確認モーダルで「解約する」を選択
4. 「解約を取り消す」ボタンが表示されることを確認
5. 「解約を取り消す」をクリック
6. プランが継続されることを確認

### 2. 重複購入防止のテスト

1. プレミアム会員でログイン
2. 別のブラウザタブを開く
3. プレミアムプランページにアクセス
4. 購入ボタンが表示されない、または無効化されていることを確認

### 3. データベースの確認

```sql
-- アクティブなサブスクリプションを確認
SELECT 
    user_id,
    stripe_subscription_id,
    status,
    cancel_at_period_end,
    cancel_at,
    current_period_end
FROM subscriptions
WHERE status = 'active';

-- UNIQUE制約が適用されているか確認
\d subscriptions
```

## トラブルシューティング

### エラー: "Edge Function returned a non-2xx status code"

1. Edge Functionのログを確認
```bash
npx supabase functions logs <function-name> --tail
```

2. 環境変数が正しく設定されているか確認
3. Stripe APIキーが有効か確認

### エラー: "すでにプレミアムプランに登録されています"

これは正常な動作です。重複購入防止が機能しています。

### エラー: "解約予定のプランが見つかりません"

解約していないプランに対して解約取り消しを実行しようとしています。

## ロールバック手順

問題が発生した場合：

1. 以前のバージョンにロールバック
```bash
git checkout <previous-commit-hash>
```

2. Edge Functionsを再デプロイ
```bash
npx supabase functions deploy <function-name>
```

3. UNIQUE制約を削除（必要な場合）
```sql
DROP INDEX IF EXISTS idx_one_active_subscription_per_user;
```

## 関連ドキュメント

- [二重決済防止システム仕様書](./二重決済防止システム仕様書.md)
- [プラン解約機能の統合実装仕様書](./統合実装仕様書_プラン解約機能.md)
- [Edge Function デプロイ手順](./Edge_Function_デプロイ手順.md)