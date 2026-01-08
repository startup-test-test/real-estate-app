# Stripe 複数サービス設計

**作成日**: 2025年1月7日
**ステータス**: 検討中

---

## 1. 要件

### ビジネス要件
- 1つのアカウントで複数サービスを個別契約できる
- ユーザーは必要なサービスのみ契約可能
- 将来のサービス追加に対応

### サービス一覧（予定）
| サービス名 | 月額料金 | Price ID | 状態 |
|------------|----------|----------|------|
| シミュレーター | ¥1,000 | `price_1SjwexBKdvisvdVlavZIUFwn` | 設定済み |
| AI市場分析 | 未定 | 未設定 | 将来 |
| 公示地価検索 | 未定 | 未設定 | 将来 |

---

## 2. DBスキーマ変更

### 現在のスキーマ
```prisma
model Subscription {
  id                     String               @id @default(cuid())
  userId                 String               @unique  // ← 1ユーザー1契約のみ
  stripeCustomerId       String               @unique
  stripeSubscriptionId   String               @unique
  status                 SubscriptionStatus
  currentPeriodEnd       DateTime?
  cancelAt               DateTime?
  cancelAtPeriodEnd      Boolean              @default(false)
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt
}
```

### 変更後のスキーマ
```prisma
model Subscription {
  id                     String               @id @default(cuid())
  userId                 String               // @uniqueを削除
  serviceName            String               // 追加: "simulator", "ai_analysis", "land_price"
  stripeCustomerId       String
  stripeSubscriptionId   String               @unique
  status                 SubscriptionStatus
  currentPeriodEnd       DateTime?
  cancelAt               DateTime?
  cancelAtPeriodEnd      Boolean              @default(false)
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt

  @@unique([userId, serviceName])  // 1ユーザー × 1サービス = 1契約
  @@index([userId])                // 検索高速化
}
```

### 変更点
| 項目 | 現在 | 変更後 |
|------|------|--------|
| userId | `@unique` | 複数可 |
| serviceName | なし | 追加 |
| stripeCustomerId | `@unique` | 複数可（同じ顧客が複数契約） |
| 制約 | 1ユーザー1契約 | 1ユーザー×1サービス=1契約 |

---

## 3. API変更

### /api/stripe/checkout
```typescript
// 変更前
POST /api/stripe/checkout
{ priceId: "price_xxx" }

// 変更後
POST /api/stripe/checkout
{
  priceId: "price_xxx",
  serviceName: "simulator"  // 追加
}
```

### /api/stripe/subscription
```typescript
// 変更前: 単一契約を返す
GET /api/stripe/subscription
→ { subscription: {...} }

// 変更後: サービス別に取得
GET /api/stripe/subscription?serviceName=simulator
→ { subscription: {...} }

// または全契約を返す
GET /api/stripe/subscriptions
→ { subscriptions: [{...}, {...}] }
```

### /api/stripe/webhook
```typescript
// メタデータにserviceNameを含める
metadata: {
  userId: "user_xxx",
  serviceName: "simulator"  // 追加
}
```

---

## 4. Stripe側の設定

### 商品の作成（Stripeダッシュボード）
1. **シミュレーター**
   - 商品名: 大家DX シミュレーター
   - Price ID: `price_1SjwexBKdvisvdVlavZIUFwn`
   - 月額: ¥1,000

2. **AI市場分析**（将来）
   - 商品名: 大家DX AI市場分析
   - Price ID: 新規作成
   - 月額: 未定

3. **公示地価検索**（将来）
   - 商品名: 大家DX 公示地価検索
   - Price ID: 新規作成
   - 月額: 未定

---

## 5. フロントエンド変更

### ダッシュボード
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ シミュレーター │ │ AI市場分析   │ │ 公示地価検索 │
│  月額1,000円  │ │  月額500円   │ │  月額300円   │
│  ✅ 契約中   │ │  ⬜ 未契約   │ │  ⬜ 未契約   │
│ [管理する]   │ │ [契約する]   │ │ [契約する]   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 料金ページ
- 各サービスの料金を個別表示
- 個別の契約ボタン

### 課金管理ページ (/billing)
- 契約中のサービス一覧
- 各サービスの解約ボタン
- 請求履歴

---

## 6. アクセス制御

### サービス利用前のチェック
```typescript
// 例: シミュレーターページ
const hasSimulatorAccess = await checkSubscription(userId, "simulator");
if (!hasSimulatorAccess) {
  redirect("/billing?service=simulator");
}
```

### 権限チェック関数
```typescript
async function checkSubscription(userId: string, serviceName: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      serviceName,
      status: "active"
    }
  });
  return !!subscription;
}
```

---

## 7. 検証項目

### 機能テスト
- [ ] 新規契約（1つ目のサービス）
- [ ] 追加契約（2つ目のサービス）
- [ ] 契約解約（1つのみ）
- [ ] 全契約解約
- [ ] 再契約
- [ ] Webhookの正常受信

### エッジケース
- [ ] 同時に複数サービス契約
- [ ] 決済失敗時の処理
- [ ] 期限切れ後の再契約

---

## 8. 実装ステップ

### Phase 1: DB変更
1. [ ] schema.prismaの更新
2. [ ] マイグレーション実行
3. [ ] 既存データの移行（serviceName追加）

### Phase 2: API変更
1. [ ] /api/stripe/checkout 修正
2. [ ] /api/stripe/webhook 修正
3. [ ] /api/stripe/subscription 修正

### Phase 3: フロントエンド
1. [ ] 料金ページ更新
2. [ ] 課金管理ページ更新
3. [ ] アクセス制御実装

### Phase 4: 検証
1. [ ] サンドボックス環境でテスト
2. [ ] 本番環境へデプロイ

---

## 9. 注意事項

- 既存の契約データがある場合、マイグレーション時に`serviceName`のデフォルト値を設定
- Stripeの顧客ID（stripeCustomerId）は同じユーザーで共有可能
- 請求は各サブスクリプションごとに別々にStripeから発行される
