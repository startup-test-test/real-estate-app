# Stripe 課金システム設計

**最終更新:** 2026年1月8日

---

## 概要

大家DXでは、Stripeを利用した月額サブスクリプション課金を採用。
1ヶ月の無料トライアル後、自動で月額課金に移行する仕組み。

---

## 料金プラン

| プラン | 料金 | トライアル |
|--------|------|-----------|
| プレミアムプラン | 月額980円（税込） | 1ヶ月無料 |

---

## システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                        ユーザー                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    大家DX アプリケーション                    │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  /mypage/    │    │  /mypage/    │    │    API       │  │
│  │  simulator   │    │  billing     │    │  /stripe/*   │  │
│  │  (有料機能)   │    │  (課金管理)   │    │              │  │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘  │
│         │                                        │          │
│         ▼                                        │          │
│  ┌──────────────┐                               │          │
│  │ アクセス制御  │                               │          │
│  │ status確認   │                               │          │
│  └──────┬───────┘                               │          │
│         │                                        │          │
└─────────┼────────────────────────────────────────┼──────────┘
          │                                        │
          ▼                                        ▼
┌─────────────────────┐              ┌─────────────────────────┐
│   Neon PostgreSQL   │◄─────────────│        Stripe           │
│                     │   Webhook    │                         │
│  ┌───────────────┐  │              │  - Checkout Session     │
│  │ Subscription  │  │              │  - Customer Portal      │
│  │ テーブル       │  │              │  - Webhook Events       │
│  └───────────────┘  │              │  - 自動課金              │
└─────────────────────┘              └─────────────────────────┘
```

---

## データベース設計

### Subscription テーブル

```prisma
model Subscription {
  id                     String               @id @default(cuid())
  userId                 String               @unique
  stripeCustomerId       String               @unique
  stripeSubscriptionId   String               @unique
  status                 SubscriptionStatus
  currentPeriodEnd       DateTime?
  cancelAt               DateTime?
  cancelAtPeriodEnd      Boolean              @default(false)
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt
}

enum SubscriptionStatus {
  active
  trialing
  past_due
  canceled
  incomplete
  unpaid
}
```

### status の意味

| status | 意味 | アクセス許可 |
|--------|------|-------------|
| `active` | 有効な契約 | ✅ 許可 |
| `trialing` | 無料トライアル中 | ✅ 許可 |
| `past_due` | 支払い遅延（猶予期間） | ⚠️ 要検討 |
| `canceled` | 解約済み | ❌ 拒否 |
| `incomplete` | 決済未完了 | ❌ 拒否 |
| `unpaid` | 未払い | ❌ 拒否 |

---

## ユーザーフロー

### 新規登録フロー

```
1. ユーザーがアカウント作成（無料）
   └── Neon Auth でユーザー登録

2. シミュレーターにアクセス
   └── アクセス制御でブロック → 課金ページへ

3. 課金ページで「今すぐ登録」をクリック
   └── POST /api/stripe/checkout
   └── Stripe Checkout Session 作成
   └── Stripe の決済ページにリダイレクト

4. カード情報入力（トライアルなので0円）
   └── Stripe が処理

5. 決済完了
   └── /mypage/billing?success=true にリダイレクト
   └── Stripe から Webhook 送信

6. Webhook 受信
   └── POST /api/stripe/webhook
   └── checkout.session.completed イベント
   └── DB に Subscription レコード作成
   └── status = "trialing"

7. シミュレーター利用可能に
```

### トライアル終了→課金フロー

```
1. トライアル期間終了（30日後）
   └── Stripe が自動で課金処理

2. 課金成功
   └── invoice.payment_succeeded Webhook
   └── status = "active" に更新
   └── currentPeriodEnd = 次回更新日

3. 以降、毎月自動更新
```

### 解約フロー

```
1. ユーザーが /mypage/billing へ
   └── 「サブスクリプションを管理」クリック

2. Stripe Customer Portal が開く
   └── POST /api/stripe/portal
   └── ポータルURLにリダイレクト

3. ユーザーがポータルで解約
   └── 「期間終了時にキャンセル」を選択

4. Webhook 受信
   └── customer.subscription.updated
   └── cancelAtPeriodEnd = true

5. 期間終了日まで利用可能

6. 期間終了後
   └── customer.subscription.deleted Webhook
   └── status = "canceled"
   └── アクセス不可に
```

---

## API エンドポイント

### 課金関連

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/api/stripe/checkout` | POST | Checkout Session 作成 |
| `/api/stripe/portal` | POST | Customer Portal URL 取得 |
| `/api/stripe/subscription` | GET | サブスク情報取得 |
| `/api/stripe/webhook` | POST | Stripe Webhook 受信 |
| `/api/stripe/refresh` | POST | サブスク情報の強制同期 |
| `/api/stripe/sync` | POST | Session ID からの同期 |

### Webhook で処理するイベント

| イベント | 処理内容 |
|---------|---------|
| `checkout.session.completed` | Subscription レコード作成 |
| `customer.subscription.created` | status 更新 |
| `customer.subscription.updated` | status, cancelAt 等更新 |
| `customer.subscription.deleted` | status = canceled |
| `invoice.payment_succeeded` | status, currentPeriodEnd 更新 |
| `invoice.payment_failed` | status 更新、通知検討 |

---

## アクセス制御

### 制御対象ページ

| ページ | アクセス制御 |
|--------|-------------|
| `/` | なし（公開） |
| `/simulator` | なし（LP、公開） |
| `/tools/*` | なし（無料ツール） |
| `/mypage` | ログイン必須 |
| `/mypage/billing` | ログイン必須 |
| `/mypage/simulator` | **サブスク必須** |

### 実装方法（サーバーサイド）

```typescript
// /mypage/simulator/page.tsx

import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export default async function SimulatorPage() {
  // 1. ユーザー認証確認
  const user = await getServerUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // 2. サブスクリプション確認
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id }
  });

  // 3. active または trialing でなければ課金ページへ
  const hasAccess =
    subscription?.status === 'active' ||
    subscription?.status === 'trialing';

  if (!hasAccess) {
    redirect('/mypage/billing');
  }

  // 4. アクセス許可
  return <SimulatorClient />;
}
```

### アクセス制御フローチャート

```
アクセス要求
    │
    ▼
┌─────────────┐
│ ログイン済み？│
└──────┬──────┘
       │
   ┌───┴───┐
   No      Yes
   │        │
   ▼        ▼
ログイン  ┌─────────────┐
ページへ  │ DBからサブスク│
          │ 情報取得     │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │ status確認   │
          └──────┬──────┘
                 │
       ┌─────────┼─────────┐
       │         │         │
    active   trialing   その他
       │         │         │
       └────┬────┘         │
            │              │
            ▼              ▼
      シミュレーター    課金ページへ
         表示
```

---

## Stripe 設定（ダッシュボード）

### 商品・料金設定

1. **商品作成**
   - 商品名: 大家DX プレミアムプラン
   - 説明: 不動産賃貸経営シミュレーション

2. **料金設定**
   - 料金: 980円/月
   - トライアル期間: 30日
   - 請求間隔: 毎月

3. **Price ID**
   - 現在: `price_1SjwexBKdvisvdVlavZIUFwn`（テスト）
   - 本番: 別途設定必要

### Webhook 設定

- エンドポイント: `https://your-domain.com/api/stripe/webhook`
- イベント:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### Customer Portal 設定

- 設定 → Billing → Customer Portal
- 機能有効化:
  - プラン変更
  - 支払い方法変更
  - 請求履歴表示
  - サブスクリプションキャンセル

---

## 環境変数

```env
# Stripe API キー
STRIPE_SECRET_KEY=sk_test_xxx          # サーバー用
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # クライアント用

# 商品の Price ID
STRIPE_PRICE_ID=price_xxx

# Webhook 署名シークレット
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 本番リリース時のチェックリスト

- [ ] Stripe を本番モード（Live mode）に切り替え
- [ ] 本番用 API キーを取得・設定
- [ ] 本番用 Price ID を作成・設定
- [ ] 本番用 Webhook エンドポイント設定
- [ ] 本番用 Webhook Secret を設定
- [ ] Customer Portal を本番用に設定
- [ ] テスト決済の実施
- [ ] 解約フローのテスト

---

## 今後の拡張予定

### 複数サービス対応

現在は1サービス（シミュレーター）のみだが、将来的に複数サービスを個別契約可能にする。

詳細: `docs/Stripe複数サービス設計.md` 参照

### 年額プラン

月額980円 × 12ヶ月 = 11,760円 のところ、年額9,800円（2ヶ月分お得）などの設定。

---

## 参考リンク

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe Docs - Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Docs - Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Docs - Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
