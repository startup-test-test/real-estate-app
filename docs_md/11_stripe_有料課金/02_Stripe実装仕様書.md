# Stripe実装仕様書

作成日: 2025年8月12日  
バージョン: 1.0.0 (MVP版)

## 1. 概要

StripeとSupabaseを連携させて、シンプルな月額課金システムを実装します。
MVPとして最小限の機能に絞り、確実に動作する決済システムを構築します。

## 2. システム構成

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│             │     │              │     │             │
│  Frontend   │────▶│   Supabase   │────▶│   Stripe    │
│   (React)   │     │              │     │             │
│             │◀────│  Edge Func   │◀────│  Webhook    │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 3. データベース設計

### 3.1 必要なテーブル

```sql
-- ユーザー利用状況テーブル
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,  -- 現在の期間の利用回数
  period_start_date TIMESTAMP DEFAULT NOW(),  -- 現在の期間開始日
  period_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),  -- 期間終了日（30日後）
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- サブスクリプション管理テーブル
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive', -- active, canceled, past_due
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 利用履歴テーブル（分析用）
CREATE TABLE usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'simulator', 'market_analysis', etc
  feature_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX idx_usage_history_created_at ON usage_history(created_at);

-- RLS設定
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;

-- ポリシー設定
CREATE POLICY "Users can view own usage" ON user_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history" ON usage_history
  FOR SELECT USING (auth.uid() = user_id);
```

### 3.2 期間チェック・リセット関数

```sql
-- ユーザーごとの期間チェックとリセット（使用時に都度チェック）
CREATE OR REPLACE FUNCTION check_and_reset_usage(p_user_id UUID)
RETURNS TABLE(current_count INTEGER, period_end TIMESTAMP) AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- 現在の使用状況を取得
  SELECT * INTO v_usage FROM user_usage WHERE user_id = p_user_id;
  
  -- レコードが存在しない場合は作成
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, usage_count, period_start_date, period_end_date)
    VALUES (p_user_id, 0, NOW(), NOW() + INTERVAL '30 days')
    RETURNING usage_count, period_end_date INTO current_count, period_end;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- 期間が過ぎていたらリセット
  IF v_usage.period_end_date < NOW() THEN
    UPDATE user_usage 
    SET usage_count = 0,
        period_start_date = NOW(),
        period_end_date = NOW() + INTERVAL '30 days',
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING usage_count, period_end_date INTO current_count, period_end;
  ELSE
    current_count := v_usage.usage_count;
    period_end := v_usage.period_end_date;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
```

## 4. Stripe設定

### 4.1 必要な設定

1. **商品（Product）の作成**
   - 名前: 大家DX プレミアムプラン
   - 説明: 全機能が無制限で利用可能

2. **価格（Price）の作成**
   - 金額: 2,980円
   - 請求期間: 月額
   - 通貨: JPY

3. **Webhook設定**
   - エンドポイント: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
   - 監視イベント:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### 4.2 環境変数

```bash
# .env.local (フロントエンド)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Supabase Edge Functions
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID=price_xxxxx
```

## 5. 実装詳細

### 5.1 使用制限チェック

```typescript
// utils/usageLimit.ts
import { supabase } from '../lib/supabase';

export const checkUsageLimit = async (userId: string): Promise<{
  canUse: boolean;
  currentCount: number;
  limit: number;
  isSubscribed: boolean;
  periodEndDate: Date | null;
  daysLeft: number;
}> => {
  // サブスクリプション状態確認
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single();

  const isSubscribed = subscription?.status === 'active';

  // 有料会員は無制限
  if (isSubscribed) {
    return { 
      canUse: true, 
      currentCount: 0, 
      limit: -1, 
      isSubscribed: true,
      periodEndDate: null,
      daysLeft: -1
    };
  }

  // 期間チェック・リセット関数を呼び出し
  const { data: usageData } = await supabase
    .rpc('check_and_reset_usage', { p_user_id: userId });

  if (!usageData || usageData.length === 0) {
    // エラー時のフォールバック
    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentCount = usage?.usage_count || 0;
    const periodEndDate = usage?.period_end_date ? new Date(usage.period_end_date) : null;
    const daysLeft = periodEndDate ? Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;

    return {
      canUse: currentCount < 5,
      currentCount,
      limit: 5,
      isSubscribed: false,
      periodEndDate,
      daysLeft
    };
  }

  const { current_count, period_end } = usageData[0];
  const periodEndDate = new Date(period_end);
  const daysLeft = Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return {
    canUse: current_count < 5,
    currentCount: current_count,
    limit: 5,
    isSubscribed: false,
    periodEndDate,
    daysLeft
  };
};

export const incrementUsage = async (userId: string, featureType: string) => {
  // 使用履歴記録
  await supabase.from('usage_history').insert({
    user_id: userId,
    feature_type: featureType,
    feature_data: { timestamp: new Date().toISOString() }
  });

  // カウントアップ
  const { data: current } = await supabase
    .from('user_usage')
    .select('usage_count')
    .eq('user_id', userId)
    .single();

  const newCount = (current?.usage_count || 0) + 1;

  await supabase
    .from('user_usage')
    .upsert({
      user_id: userId,
      usage_count: newCount,
      updated_at: new Date().toISOString()
    });

  return newCount;
};
```

### 5.2 決済フロー実装

```typescript
// components/UpgradeModal.tsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Shield, Check } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const UpgradeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      // Supabase Edge Functionを呼び出してCheckout Session作成
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: import.meta.env.VITE_STRIPE_PRICE_ID }
      });

      if (error) throw error;

      // Stripeのチェックアウトページにリダイレクト
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">プレミアムプランにアップグレード</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-medium mb-2">
            今月の無料利用枠（5回）を使い切りました
          </p>
          <p className="text-sm text-blue-600">
            プレミアムプランで全機能を無制限にご利用いただけます
          </p>
        </div>

        <div className="border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">プレミアムプラン</h3>
            <div className="text-right">
              <div className="text-2xl font-bold">¥2,980</div>
              <div className="text-sm text-gray-500">/ 月</div>
            </div>
          </div>

          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>全機能が無制限で利用可能</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>新機能への早期アクセス</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>優先サポート</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>処理中...</span>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>今すぐアップグレード</span>
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800"
        >
          後で
        </button>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>SSL暗号化</span>
          </div>
          <div>Powered by Stripe</div>
        </div>
      </div>
    </div>
  );
};
```

### 5.3 Supabase Edge Functions

```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    const { priceId } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { user } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stripeカスタマー作成または取得
    let customerId;
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // カスタマーIDを保存
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
      });
    }

    // Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/payment-success`,
      cancel_url: `${req.headers.get('origin')}/`,
      metadata: { user_id: user.id },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### 5.4 Webhook処理

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await supabase.from('subscriptions').upsert({
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        await supabase.from('subscriptions').update({
          status: 'canceled',
          stripe_subscription_id: null,
        }).eq('stripe_subscription_id', deletedSub.id);
        break;

      case 'invoice.payment_failed':
        // 支払い失敗時の処理
        const invoice = event.data.object;
        // メール通知など
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

## 6. 実装チェックリスト

### 6.1 開発環境

- [ ] Stripeアカウント作成
- [ ] テスト用APIキー取得
- [ ] テスト用商品・価格作成
- [ ] Webhook設定（ngrok利用）

### 6.2 データベース

- [ ] テーブル作成
- [ ] RLS設定
- [ ] インデックス作成
- [ ] 初期データ投入

### 6.3 フロントエンド

- [ ] 使用回数表示
- [ ] 制限到達時のモーダル
- [ ] 決済フロー
- [ ] 成功/失敗画面

### 6.4 バックエンド

- [ ] Edge Functions作成
- [ ] Webhook処理
- [ ] エラーハンドリング
- [ ] ログ記録

### 6.5 テスト

- [ ] 無料枠のカウント
- [ ] 決済フロー（テストカード）
- [ ] サブスクリプション更新
- [ ] 解約フロー
- [ ] 月次リセット

## 7. セキュリティ考慮事項

1. **APIキーの管理**
   - 環境変数で管理
   - フロントエンドには公開可能キーのみ

2. **Webhook検証**
   - 署名検証必須
   - リプレイアタック対策

3. **ユーザー認証**
   - すべてのAPIでユーザー認証
   - RLSによるデータ保護

4. **エラー情報**
   - 詳細なエラーはログのみ
   - ユーザーには一般的なメッセージ

## 8. トラブルシューティング

### よくある問題

1. **「決済に失敗しました」エラー**
   - Stripeのキーを確認
   - ネットワーク接続を確認

2. **Webhookが動作しない**
   - エンドポイントURLを確認
   - 署名シークレットを確認

3. **使用回数がリセットされない**
   - Cron Job設定を確認
   - タイムゾーン設定を確認

---

**次のステップ**: `03_実装手順書.md`で具体的な実装手順を説明