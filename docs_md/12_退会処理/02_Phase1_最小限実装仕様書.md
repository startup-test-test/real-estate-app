# Phase 1: ダウングレード機能 最小限実装仕様書

## 概要
プレミアムプランの解約機能を最小限の工数で実装するための仕様書。
シンプルで確実に動作する機能を優先し、段階的な改善を前提とする。

作成日: 2025年8月13日  
バージョン: 1.0

---

## 1. 実装スコープ

### 含まれる機能
✅ マイページに「プラン解約」ボタン追加  
✅ 解約確認ダイアログ  
✅ Stripeサブスクリプションの期間終了時キャンセル  
✅ 解約予定の表示  

### 含まれない機能（Phase 2以降）
❌ 解約理由の収集  
❌ 解約の取り消し機能  
❌ 解約前の代替案提示  
❌ メール通知  

---

## 2. UI実装

### 2.1 マイページ（Dashboard.tsx）への追加

```typescript
// プレミアム会員の場合のみ表示
{isPremium && (
  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
    <h3 className="text-lg font-semibold mb-4">プラン管理</h3>
    
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-700">現在のプラン: プレミアムプラン</p>
        <p className="text-sm text-gray-500">月額 ¥2,980</p>
        {subscription?.cancel_at_period_end && (
          <p className="text-sm text-red-600 mt-2">
            {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')} に解約予定
          </p>
        )}
      </div>
      
      {!subscription?.cancel_at_period_end && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
        >
          プランを解約
        </button>
      )}
    </div>
  </div>
)}
```

### 2.2 解約確認モーダル

```typescript
// CancelSubscriptionModal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  periodEndDate: string;
  isLoading: boolean;
}

const CancelSubscriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  periodEndDate,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">プランを解約しますか？</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>ご注意ください：</strong>
          </p>
          <ul className="text-sm text-yellow-800 mt-2 space-y-1">
            <li>• {periodEndDate}まではプレミアム機能をご利用いただけます</li>
            <li>• 解約後は月5回の利用制限に戻ります</li>
            <li>• 作成済みのデータは引き続き閲覧できます</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : '解約する'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 3. バックエンド実装

### 3.1 Supabase Edge Function

```typescript
// supabase/functions/cancel-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    // 認証チェック
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Supabaseクライアント作成
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // ユーザー取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // サブスクリプション取得
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return new Response('No active subscription found', { status: 404 })
    }

    // Stripeでサブスクリプションを期間終了時にキャンセル
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    )

    // DBを更新
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('stripe_subscription_id', subscription.stripe_subscription_id)

    return new Response(
      JSON.stringify({
        success: true,
        cancel_at: new Date(updatedSubscription.current_period_end * 1000).toISOString()
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
```

### 3.2 データベース変更

```sql
-- subscriptionsテーブルに必要なカラムを追加
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;
```

---

## 4. フロントエンド統合

### 4.1 Dashboard.tsxでの実装

```typescript
import { useState, useEffect } from 'react';
import CancelSubscriptionModal from '../components/CancelSubscriptionModal';

const Dashboard = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  // サブスクリプション情報取得
  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .single();
    
    setSubscription(data);
  };

  // 解約処理
  const handleCancelSubscription = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      
      if (error) throw error;
      
      // 成功メッセージ表示
      alert('解約手続きが完了しました。期間終了まではプレミアム機能をご利用いただけます。');
      
      // 画面を更新
      await fetchSubscription();
      setShowCancelModal(false);
    } catch (error) {
      console.error('解約エラー:', error);
      alert('解約処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 既存のダッシュボードコンテンツ */}
      
      {/* プラン管理セクション（上記2.1参照） */}
      
      {/* 解約確認モーダル */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        periodEndDate={subscription?.current_period_end 
          ? new Date(subscription.current_period_end).toLocaleDateString('ja-JP')
          : ''
        }
        isLoading={isLoading}
      />
    </>
  );
};
```

---

## 5. テスト手順

### 5.1 開発環境でのテスト

1. **Stripeテストモードの確認**
   - Stripeダッシュボードでテストモードに切り替え
   - テスト用のAPIキーを使用

2. **テストケース**
   - [ ] プレミアム会員で解約ボタンが表示される
   - [ ] モーダルが正しく開閉する
   - [ ] 解約処理が成功する
   - [ ] 解約予定が表示される
   - [ ] 無料会員では解約ボタンが表示されない

### 5.2 本番環境への適用前チェック

- [ ] Stripe本番APIキーの設定
- [ ] エラーハンドリングの確認
- [ ] ロールバック手順の準備

---

## 6. エラーハンドリング

### シンプルなエラー処理

```typescript
try {
  // 解約処理
} catch (error) {
  if (error.message.includes('network')) {
    alert('ネットワークエラーです。再度お試しください。');
  } else {
    alert('解約処理中にエラーが発生しました。サポートまでご連絡ください。');
  }
}
```

---

## 7. 実装工数見積もり

| タスク | 工数 |
|--------|------|
| UIコンポーネント作成 | 2時間 |
| Edge Function作成 | 2時間 |
| フロントエンド統合 | 1時間 |
| テスト | 1時間 |
| **合計** | **6時間** |

---

## 8. デプロイ手順

1. **Edge Functionのデプロイ**
   ```bash
   supabase functions deploy cancel-subscription
   ```

2. **環境変数の設定**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
   ```

3. **フロントエンドのデプロイ**
   ```bash
   npm run build
   # デプロイコマンド
   ```

---

## 9. 今後の改善点（Phase 2）

- 解約理由の収集と分析
- 解約の取り消し機能
- 解約前の特典提示（割引など）
- メール通知
- 解約率ダッシュボード

---

## 10. 注意事項

- Stripeの本番環境では実際の決済が発生するため、十分なテストを行うこと
- 解約は即座ではなく期間終了時に適用されることを明確に伝える
- サポート問い合わせ先を明記する

---

*このドキュメントは最小限実装のためのガイドです。*  
*実装完了後、Phase 2の機能追加を検討してください。*