# Edge Functions実装ガイド

このドキュメントは、サブスクリプション管理システムで使用するEdge Functionsの包括的な実装・デプロイガイドです。

## 概要

本システムでは以下のEdge Functionsを使用します：

- **create-checkout-session**: 購入処理（二重決済防止機能付き）
- **cancel-subscription**: サブスクリプション解約処理
- **resume-subscription**: サブスクリプション解約取り消し処理

## 前提条件

- Supabase CLIがインストール済み
- Supabaseプロジェクトのアクセストークンを所有
- Stripeアカウントおよび本番・テスト用APIキーを所有
- Node.jsとnpmが利用可能

## デプロイ手順

### 1. Supabase CLIログイン

```bash
npx supabase login
```

### 2. プロジェクトリンク

```bash
npx supabase link --project-ref [your-project-ref]
```

### 3. Edge Functionsデプロイ

以下の順序で各Edge Functionをデプロイします：

#### 購入処理（create-checkout-session）
```bash
npx supabase functions deploy create-checkout-session
```

#### 解約処理（cancel-subscription）
```bash
npx supabase functions deploy cancel-subscription --no-verify-jwt
```

#### 解約取り消し処理（resume-subscription）
```bash
npx supabase functions deploy resume-subscription
```

### 4. 環境変数設定

Supabaseダッシュボードで以下の環境変数を設定：

**Edge Functions > Settings**に移動し、以下を追加：

```
# Stripe関連
STRIPE_SECRET_KEY=sk_live_xxxxx（本番用）
DEV_STRIPE_SECRET_KEY=sk_test_xxxxx（テスト用）
DEV_STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Supabase関連（自動設定済みの場合あり）
SUPABASE_URL=[your-supabase-url]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### 5. データベースマイグレーション適用

二重決済防止のためのUNIQUE制約を適用：

```bash
# マイグレーションファイルの確認
cat supabase/migrations/20250814_add_unique_subscription_constraint.sql

# マイグレーションの適用
npx supabase db push
```

### 6. デプロイ確認

#### 関数一覧の確認
```bash
npx supabase functions list
```

#### 各関数のログ確認
```bash
# 購入処理関数のログ
npx supabase functions logs create-checkout-session

# 解約処理関数のログ  
npx supabase functions logs cancel-subscription

# 解約取り消し関数のログ
npx supabase functions logs resume-subscription
```

#### Supabaseダッシュボードでの確認
1. **Edge Functions**セクションに移動
2. 以下の関数が表示されることを確認：
   - `create-checkout-session`
   - `cancel-subscription` 
   - `resume-subscription`

## テスト手順

### 1. API エンドポイントテスト

#### 購入処理テスト
```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer [your-access-token]" \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_xxxxx"}'
```

#### 解約処理テスト
```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/cancel-subscription \
  -H "Authorization: Bearer [your-access-token]" \
  -H "Content-Type: application/json"
```

#### 解約取り消しテスト
```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/resume-subscription \
  -H "Authorization: Bearer [your-access-token]" \
  -H "Content-Type: application/json"
```

### 2. 統合テスト（UI経由）

#### 購入～解約～解約取り消しフロー
1. 未課金ユーザーでログイン
2. プレミアムプラン購入を実行
3. 決済完了後、プレミアム機能が利用可能になることを確認
4. プレミアムプランページで「プランを解約」をクリック
5. 解約確認モーダルで「解約する」を選択
6. 「解約を取り消す」ボタンが表示されることを確認
7. 「解約を取り消す」をクリック
8. プランが継続されることを確認

#### 二重決済防止テスト
1. プレミアム会員でログイン
2. 別のブラウザタブを開く
3. プレミアムプランページにアクセス
4. 購入ボタンが表示されない、または無効化されていることを確認

### 3. データベース確認

```sql
-- アクティブなサブスクリプション確認
SELECT 
    user_id,
    stripe_subscription_id,
    status,
    cancel_at_period_end,
    cancel_at,
    current_period_end
FROM subscriptions
WHERE status = 'active';

-- UNIQUE制約の適用確認
\d subscriptions
```

## 本番環境デプロイ

### 環境変数の本番設定
1. Stripe本番APIキーに切り替え
2. 本番環境用のWebhook秘密鍵を設定

### デプロイコマンド
```bash
# 本番環境への各関数デプロイ
npx supabase functions deploy create-checkout-session --project-ref [production-project-ref]
npx supabase functions deploy cancel-subscription --no-verify-jwt --project-ref [production-project-ref]  
npx supabase functions deploy resume-subscription --project-ref [production-project-ref]
```

## トラブルシューティング

### CORSエラーが発生する場合
- Edge Function内のCORS設定を確認
- フロントエンドのoriginが許可されているか確認

### 認証エラーが発生する場合
- JWTトークンが正しく送信されているか確認
- Supabaseの認証設定を確認

### Stripe APIエラーが発生する場合
- STRIPE_SECRET_KEYが正しく設定されているか確認
- Stripeダッシュボードでサブスクリプション状態を確認

### Edge Function実行エラー
#### "Edge Function returned a non-2xx status code"
1. Edge Functionのログを確認
```bash
npx supabase functions logs <function-name> --tail
```
2. 環境変数が正しく設定されているか確認
3. Stripe APIキーが有効か確認

#### "すでにプレミアムプランに登録されています"
これは正常な動作です。二重決済防止機能が動作しています。

#### "解約予定のプランが見つかりません"
解約していないプランに対して解約取り消しを実行しようとしています。

## ロールバック手順

問題が発生した場合の復旧手順：

### 1. 以前のバージョンにロールバック
```bash
git checkout <previous-commit-hash>
```

### 2. Edge Functionsを再デプロイ
```bash
npx supabase functions deploy <function-name>
```

### 3. データベース制約の削除（必要時）
```sql
DROP INDEX IF EXISTS idx_one_active_subscription_per_user;
```

## セキュリティ・運用上の注意事項

### セキュリティ
- 本番環境では必ずHTTPS経由でアクセス
- 環境変数は絶対にコードにハードコーディングしない
- APIキーの定期的なローテーション

### テスト
- 本番デプロイ前に必ずステージング環境でテスト
- Stripeのテストモードで動作確認
- 二重決済防止機能の動作確認

### モニタリング
- Edge Functionのログを定期的に確認
- エラー率をモニタリング
- Stripeダッシュボードでの決済状況確認

## 関連ドキュメント

- [二重決済防止仕様書](../01_仕様書/二重決済防止仕様書.md)
- [ダウングレード・解約仕様書](../01_仕様書/ダウングレード・解約仕様書.md)
- [Stripe連携仕様書](../01_仕様書/Stripe連携仕様書.md)
- [環境構築ガイド](./環境構築ガイド.md)