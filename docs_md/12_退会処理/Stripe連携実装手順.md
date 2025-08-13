# Stripe連携で実際に課金を停止する実装手順

## 🎯 目的
現在の簡易版Edge Functionを、Stripe APIと連携する本番版に置き換えて、実際に課金を停止できるようにする。

---

## Step 1: Stripe APIキーの取得

### 1.1 Stripeダッシュボードにログイン
- https://dashboard.stripe.com にアクセス
- ログイン

### 1.2 APIキーを取得
1. 左メニューの **Developers** → **API keys**
2. **Secret key** をコピー
   - テスト環境: `sk_test_...` で始まるキー
   - 本番環境: `sk_live_...` で始まるキー

⚠️ **重要**: Secret keyは絶対に公開しないでください

---

## Step 2: Supabaseで環境変数を設定

### 2.1 Supabaseダッシュボードにアクセス
1. https://supabase.com/dashboard
2. プロジェクト `gtnzhnsbdmkadfawuzmc` を選択

### 2.2 Edge Functionの環境変数を設定
1. **Edge Functions** タブを開く
2. **cancel-subscription** 関数をクリック
3. **Settings** タブを開く
4. **Environment Variables** セクションで **Add Variable** をクリック
5. 以下を追加：
   - Name: `STRIPE_SECRET_KEY`
   - Value: コピーしたStripeのSecret key
6. **Save** をクリック

---

## Step 3: Edge FunctionをStripe連携版に更新

### 3.1 Supabaseダッシュボードで関数を編集
1. **Edge Functions** → **cancel-subscription**
2. **Edit** ボタンをクリック
3. 現在のコードを全て削除
4. 以下のStripe連携版コードを貼り付け：

```javascript
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

    // ⭐ Stripeで実際に解約処理を実行
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
        // Stripeは更新されたが、DBエラーの場合
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
        stripe_canceled: true // Stripeで実際に解約されたことを示す
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
      
      // Stripeのエラーを判別
      if (stripeError.type === 'StripeInvalidRequestError') {
        if (stripeError.message.includes('No such subscription')) {
          // テストデータの場合
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

5. **Deploy** ボタンをクリック

---

## Step 4: 動作確認

### 4.1 ブラウザでテスト
1. プレミアムプランページで「プランを解約」をクリック
2. 成功メッセージを確認

### 4.2 Stripeダッシュボードで確認
1. https://dashboard.stripe.com
2. **Customers** → 該当顧客を検索
3. **Subscriptions** タブを確認
4. ステータスが「Canceling」になっていることを確認

### 4.3 Edge Functionのログ確認
1. Supabase → Edge Functions → cancel-subscription → Logs
2. 「✅ Stripe subscription updated」のログを確認

---

## ⚠️ 注意事項

### テストデータの場合
- `sub_test_...` で始まるサブスクリプションIDはStripeに存在しません
- エラー：「Stripeにサブスクリプションが見つかりません」が表示されます
- 本番のStripeサブスクリプションIDが必要です

### 本番環境での注意
- 必ず `sk_live_...` のキーを使用
- 一度解約すると、再度有効化はできません（新規契約が必要）
- 解約は期間終了時に実行されます（即座ではありません）

---

## 🔧 トラブルシューティング

| エラー | 原因 | 対処法 |
|--------|------|--------|
| Stripe設定エラー | 環境変数未設定 | STRIPE_SECRET_KEYを設定 |
| No such subscription | テストデータ | 実際のStripeサブスクリプションを作成 |
| Invalid API Key | キーが間違っている | 正しいキーを再設定 |
| 認証エラー | トークン期限切れ | 再ログイン |

---

## ✅ 実装完了チェックリスト

- [ ] Stripe APIキーを取得
- [ ] Supabaseに環境変数を設定
- [ ] Edge Functionをデプロイ
- [ ] ブラウザで解約テスト
- [ ] Stripeダッシュボードで確認
- [ ] エラーがないことを確認