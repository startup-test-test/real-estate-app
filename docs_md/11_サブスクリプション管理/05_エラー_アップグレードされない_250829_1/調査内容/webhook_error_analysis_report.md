# Stripe Webhook エラー分析レポート

## エラー概要
**発生日時**: 2025年8月27日〜28日
**環境**: 本番環境 (dev.ooya.tech)
**症状**: Stripe決済は成功するが、アプリケーション上でプレミアムプランとして認識されない

## 主要なエラー

### 1. 🔴 致命的エラー: Webhook署名検証の失敗
```
Webhook signature verification failed: Error: SubtleCryptoProvider cannot be used in a synchronous context.
Use `await constructEventAsync(...)` instead of `constructEvent(...)`
```

**発生頻度**: 複数回（決済のたびに発生）
**影響**: Webhookイベントが処理されず、サブスクリプション情報がデータベースに保存されない

### 2. ⚠️ データベースエラー: stripe_price_idカラムが見つからない
```
Error saving subscription: {
  code: "PGRST204",
  message: "Could not find the 'stripe_price_id' column of 'subscriptions' in the schema cache"
}
```

**発生時刻**: 
- 2025-08-27 21:50:21 (1756377421501000)
- 2025-08-27 21:43:41 (1756376621444000)
- 2025-08-27 21:37:42 (1756376462224000)

**影響**: 一部のサブスクリプション情報の保存に失敗

### 3. 🟡 環境エラー: Deno.core.runMicrotasks()
```
event loop error: Error: Deno.core.runMicrotasks() is not supported in this environment
```

**発生頻度**: 断続的
**影響**: Edge Functionの動作が不安定になる可能性

## 根本原因の分析

### なぜ過去は動作していたのか

1. **初期実装（commit: 93decec）**
   - `constructEventAsync()`を使用（非同期検証）
   - 環境変数: `DEV_STRIPE_SECRET_KEY`, `DEV_STRIPE_WEBHOOK_SECRET`
   - Deno std@0.168.0を使用

2. **正常に動作していた時期のイベント処理**
   ```
   Processing webhook event: checkout.session.completed
   Checkout completed for user: [user_id]
   Subscription created/updated for user: [user_id]
   ```

### 現在のエラーの原因

1. **commit 6bdb1a4での変更（最新）**
   - `constructEvent()`に変更（同期検証）← **これが問題**
   - コメント: "Denoの互換性のため"
   - しかし、実際にはDeno環境で同期的な署名検証がサポートされていない

2. **データベーススキーマの不整合**
   - コード上では`stripe_price_id`を保存しようとしている（line 78）
   - しかし、実際のテーブルには`stripe_price_id`カラムが存在しない
   - マイグレーションファイル（20240812_stripe_tables.sql）にも定義がない

## 修正方法

### 1. 即座に必要な修正

#### A. Webhook署名検証を非同期に戻す
```typescript
// 現在（エラー）
event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

// 修正後
event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
```

#### B. stripe_price_idカラムを追加
```sql
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
```

### 2. Edge Function全体の修正版

`supabase/functions/handle-stripe-webhook/index.ts`を以下のように修正：

```typescript
import { serve } from 'https://deno.land/std@0.177.1/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  // CORS対応
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    if (!signature) {
      console.error('No stripe-signature header found')
      return new Response('No signature', { status: 400, headers })
    }

    let event: Stripe.Event
    try {
      // constructEventAsyncを使用して非同期で検証（重要な修正）
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { 
        status: 400,
        headers 
      })
    }

    // 以下は変更なし...
```

### 3. データベースマイグレーション

新しいマイグレーションファイルを作成：
`supabase/migrations/20250828_add_stripe_price_id.sql`

```sql
-- Add missing stripe_price_id column
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_price_id 
ON subscriptions(stripe_price_id);

-- Update comment
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe Price ID for the subscription';
```

## デプロイ手順

1. **Edge Functionの修正をデプロイ**
   ```bash
   supabase functions deploy handle-stripe-webhook
   ```

2. **データベースマイグレーションを実行**
   ```bash
   supabase migration up
   ```

3. **環境変数の確認**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Stripe Dashboardで確認**
   - Webhookエンドポイントの状態
   - 再試行されているイベントをリトライ

## 動作確認チェックリスト

- [ ] Stripe Webhookイベントが200 OKを返すか
- [ ] `subscriptions`テーブルにレコードが作成されるか
- [ ] `stripe_price_id`が正しく保存されるか
- [ ] ユーザーがプレミアムプランとして認識されるか
- [ ] 使用状況が「無制限」と表示されるか

## まとめ

主な問題は、Deno環境での同期的なWebhook署名検証がサポートされていないにも関わらず、`constructEvent()`を使用していたことです。これにより、すべてのWebhookイベントが処理されず、サブスクリプション情報がデータベースに保存されませんでした。

また、データベーススキーマとコードの不整合（`stripe_price_id`カラムの欠落）も一部のエラーの原因となっていました。

上記の修正を適用することで、問題は解決されるはずです。