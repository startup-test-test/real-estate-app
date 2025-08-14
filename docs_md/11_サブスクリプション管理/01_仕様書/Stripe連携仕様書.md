# Stripe連携統合仕様書

作成日: 2025年8月14日  
バージョン: 2.0.0 (統合版)

## 1. 概要

StripeとSupabaseを連携させた包括的な月額課金システムの実装仕様書です。
MVPとして最小限の機能に絞りつつ、確実に動作する決済・解約システムを構築します。

### 1.1 主要機能
- 月額課金システム（2,980円/月）
- 使用制限管理（無料：5回/30日、有料：無制限）
- サブスクリプション解約機能
- Webhook による状態同期
- 二重決済防止システム

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

### 3.1 テーブル構造

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
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancel_at TIMESTAMP,
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

### 3.2 データベース関数

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

### 4.1 Stripeダッシュボード設定

#### 4.1.1 商品（Product）の作成
- 名前: 大家DX プレミアムプラン
- 説明: 全機能が無制限で利用可能

#### 4.1.2 価格（Price）の作成
- 金額: 2,980円
- 請求期間: 月額
- 通貨: JPY

#### 4.1.3 Webhook設定
- エンドポイント: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
- 監視イベント:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 4.2 APIキー取得手順

1. **Stripeダッシュボードにアクセス**
   - https://dashboard.stripe.com にログイン

2. **APIキーを取得**
   - 左メニューの **Developers** → **API keys**
   - **Secret key** をコピー
     - テスト環境: `sk_test_...` で始まるキー
     - 本番環境: `sk_live_...` で始まるキー

⚠️ **重要**: Secret keyは絶対に公開しないでください

### 4.3 環境変数

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

## 6. Supabase Edge Functions

### 6.1 チェックアウトセッション作成

```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

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

### 6.2 サブスクリプション解約

```typescript
// supabase/functions/cancel-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    // Stripe初期化
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not set')
      throw new Error('Stripe設定エラー：管理者に連絡してください')
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Supabase初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 認証確認
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('認証が必要です')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('ユーザー認証に失敗しました')
    }

    console.log('Processing cancellation for user:', user.id)

    // アクティブなサブスクリプションを取得
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      throw new Error('アクティブなプランが見つかりません')
    }

    if (subscription.cancel_at_period_end) {
      throw new Error('すでに解約予定です')
    }

    // Stripeで実際に解約処理を実行
    console.log('Canceling Stripe subscription:', subscription.stripe_subscription_id)
    
    try {
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        { 
          cancel_at_period_end: true, // 期間終了時に解約
          metadata: {
            canceled_by: user.email || user.id,
            canceled_at: new Date().toISOString()
          }
        }
      )

      console.log('✅ Stripe subscription updated - 課金は期間終了時に停止されます')

      // Stripeから実際の解約日を取得
      const cancelAt = new Date(stripeSubscription.current_period_end * 1000)
      const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000)
      
      // データベースを更新
      const { data: updatedSubscription, error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          cancel_at: cancelAt.toISOString(),
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: cancelAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)
        .select()
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        throw new Error('データベース更新に失敗しました。サポートに連絡してください。')
      }

      const remainingDays = Math.ceil(
        (cancelAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const response = {
        success: true,
        cancel_date: cancelAt.toISOString(),
        remaining_days: remainingDays,
        message: `${cancelAt.toLocaleDateString('ja-JP')}まで全機能をご利用いただけます（あと${remainingDays}日）`,
        stripe_status: 'canceled_at_period_end',
        stripe_canceled: true
      }

      return new Response(
        JSON.stringify(response),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200
        }
      )

    } catch (stripeError) {
      console.error('Stripe API error:', stripeError)
      
      if (stripeError.type === 'StripeInvalidRequestError') {
        if (stripeError.message.includes('No such subscription')) {
          throw new Error('Stripeにサブスクリプションが見つかりません。テストデータの可能性があります。')
        }
      }
      
      throw new Error('Stripe解約処理に失敗しました：' + stripeError.message)
    }

  } catch (error) {
    console.error('Cancel subscription error:', error)
    
    let errorMessage = '解約処理中にエラーが発生しました'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('認証')) {
        errorMessage = error.message
        statusCode = 401
      } else if (error.message.includes('見つかりません') || error.message.includes('すでに')) {
        errorMessage = error.message
        statusCode = 400
      } else if (error.message.includes('Stripe')) {
        errorMessage = error.message
        statusCode = 400
      } else {
        errorMessage = error.message || errorMessage
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
```

### 6.3 Webhook処理

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

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
        
        // ユーザーIDをメタデータまたはカスタマーから取得
        let userId = subscription.metadata?.user_id;
        if (!userId) {
          const customer = await stripe.customers.retrieve(subscription.customer);
          userId = customer.metadata?.user_id;
        }

        if (userId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        await supabase.from('subscriptions').update({
          status: 'canceled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString()
        }).eq('stripe_subscription_id', deletedSub.id);
        break;

      case 'invoice.payment_failed':
        const invoice = event.data.object;
        if (invoice.subscription) {
          await supabase.from('subscriptions').update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          }).eq('stripe_subscription_id', invoice.subscription);
        }
        break;

      case 'invoice.payment_succeeded':
        const successInvoice = event.data.object;
        if (successInvoice.subscription) {
          await supabase.from('subscriptions').update({
            status: 'active',
            updated_at: new Date().toISOString()
          }).eq('stripe_subscription_id', successInvoice.subscription);
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

## 7. 実装・デプロイ手順

### 7.1 Stripe設定
1. Stripeアカウント作成・ログイン
2. テスト用商品・価格作成
3. APIキー取得（Secret Key、Publishable Key）
4. Webhook エンドポイント設定

### 7.2 Supabase環境変数設定

#### Supabaseダッシュボードでの設定手順
1. Supabaseダッシュボード → プロジェクト選択
2. **Edge Functions** → 対象関数選択
3. **Settings** → **Environment Variables**
4. 以下を追加：
   - `STRIPE_SECRET_KEY`: Stripeのシークレットキー
   - `STRIPE_WEBHOOK_SECRET`: Webhookシークレット
   - `STRIPE_PRICE_ID`: 価格ID

### 7.3 データベースセットアップ
1. テーブル作成SQL実行
2. RLS設定・ポリシー適用
3. インデックス作成
4. 関数作成

### 7.4 Edge Functions デプロイ
1. `create-checkout-session` 関数デプロイ
2. `cancel-subscription` 関数デプロイ  
3. `stripe-webhook` 関数デプロイ
4. 環境変数設定確認

### 7.5 フロントエンド実装
1. Stripe.js インストール・設定
2. アップグレードモーダル実装
3. 使用制限チェック機能実装
4. 解約機能実装

## 8. テスト手順

### 8.1 開発環境テスト
- [ ] Stripeテストカードで決済テスト
- [ ] 使用回数制限の動作確認
- [ ] 月次リセット機能確認
- [ ] 解約フローテスト
- [ ] Webhook動作確認

### 8.2 エラーハンドリング確認
- [ ] 無効なカード情報でのエラー処理
- [ ] ネットワークエラー時の動作
- [ ] 重複決済防止機能
- [ ] 認証エラー処理

## 9. セキュリティ考慮事項

### 9.1 APIキー管理
- 環境変数での管理
- フロントエンドには公開可能キーのみ
- 本番・テスト環境の分離

### 9.2 Webhook検証
- 署名検証必須
- リプレイアタック対策
- エラー時のログ記録

### 9.3 ユーザー認証
- すべてのAPIでユーザー認証
- RLSによるデータ保護
- セッション管理

## 10. トラブルシューティング

### 10.1 よくある問題と対処法

| エラー | 原因 | 対処法 |
|--------|------|--------|
| Stripe設定エラー | 環境変数未設定 | STRIPE_SECRET_KEYを設定 |
| No such subscription | テストデータ | 実際のStripeサブスクリプションを作成 |
| Invalid API Key | キーが間違っている | 正しいキーを再設定 |
| 認証エラー | トークン期限切れ | 再ログイン |
| Webhookが動作しない | エンドポイントURL/署名シークレット | 設定を確認 |
| 使用回数がリセットされない | タイムゾーン設定 | データベース設定確認 |

### 10.2 本番環境注意事項
- 必ず `sk_live_...` のキーを使用
- 一度解約すると、再度有効化はできません（新規契約が必要）
- 解約は期間終了時に実行されます（即座ではありません）

## 11. 運用・監視

### 11.1 監視項目
- 決済成功率
- サブスクリプション解約率
- エラー発生率
- 使用制限到達率

### 11.2 ログ管理
- Stripe イベントログ
- Edge Functions 実行ログ
- エラーログの集約・分析

## 12. 今後の拡張予定

### 12.1 機能拡張
- 複数プラン対応
- 年額プラン追加
- プラン変更機能
- 請求書発行機能

### 12.2 分析機能
- 利用統計ダッシュボード
- 収益分析レポート
- ユーザー行動分析

---

**実装完了チェックリスト**

### 開発環境
- [ ] Stripeアカウント作成・設定完了
- [ ] テスト用商品・価格作成完了
- [ ] Webhook設定完了
- [ ] 環境変数設定完了

### データベース
- [ ] テーブル作成完了
- [ ] RLS設定完了
- [ ] 関数作成完了
- [ ] 初期データ投入完了

### バックエンド
- [ ] Edge Functions作成・デプロイ完了
- [ ] Webhook処理実装完了
- [ ] エラーハンドリング実装完了

### フロントエンド
- [ ] 使用制限表示実装完了
- [ ] 制限到達時モーダル実装完了
- [ ] 決済フロー実装完了
- [ ] 解約機能実装完了

### テスト
- [ ] 決済フローテスト完了
- [ ] 解約フローテスト完了
- [ ] 使用制限テスト完了
- [ ] エラーハンドリングテスト完了

### 本番環境
- [ ] 本番APIキー設定完了
- [ ] 本番Webhook設定完了
- [ ] 本番環境デプロイ完了
- [ ] 本番環境テスト完了