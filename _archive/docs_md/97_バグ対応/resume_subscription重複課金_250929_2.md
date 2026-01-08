# 🚨 バグレポート: resume-subscription関数による追加課金問題

## 📅 発見日時
- **報告日**: 2025年9月29日
- **重要度**: **CRITICAL**
- **影響ユーザー**: ooya.tech2025@gmail.com
- **発生日時**: 2025年9月29日 12:18

---

## 🐛 問題の詳細

### 現象
`resume-subscription`関数（解約キャンセル機能）を実行すると、Stripeが即座に追加課金を作成する

### 影響
```
09/28 19:38 - ¥2,980 - 正常な月次課金
09/29 12:18 - ¥2,980 - resume-subscription実行による追加課金（重複）
```

### 前回の修正では防げなかった理由
- 09/29 11:30に実装された`stripe_events`テーブルによる重複防止は**Webhookイベントの重複処理**を防ぐ
- しかし、`resume-subscription`関数は**新しい課金自体を作成**してしまう（別の問題）

---

## 🔍 根本原因

### 問題のコード（修正前）
```typescript
// /supabase/functions/resume-subscription/index.ts:91-100
const stripeSubscription = await stripe.subscriptions.update(
  subscription.stripe_subscription_id,
  {
    cancel_at_period_end: false,
    metadata: {
      resumed_by: user.email || user.id,
      resumed_at: new Date().toISOString()
    }
  }
)
```

### 原因
- `cancel_at_period_end: false`に変更すると、Stripeが**プロレーション（日割り計算）**を行う
- デフォルトでは、Stripeは即座に差額を課金する
- これにより、月の途中でも新しい課金が発生

---

## ✅ 解決策

### 修正後のコード
```typescript
// /supabase/functions/resume-subscription/index.ts:91-101
const stripeSubscription = await stripe.subscriptions.update(
  subscription.stripe_subscription_id,
  {
    cancel_at_period_end: false,
    proration_behavior: 'none', // 🔑 即座の課金を防ぐ
    metadata: {
      resumed_by: user.email || user.id,
      resumed_at: new Date().toISOString()
    }
  }
)
```

### 修正の効果
- `proration_behavior: 'none'`により、プロレーションを無効化
- サブスクリプションは再開されるが、追加課金は発生しない
- 次回の通常の課金サイクルまで待つ

---

## 📊 影響範囲

### 影響を受けた可能性のあるユーザー
```sql
-- 解約キャンセルを行ったユーザーの特定
SELECT
  u.email,
  s.stripe_subscription_id,
  s.updated_at,
  s.cancel_at_period_end
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.updated_at >= '2025-09-01'
  AND s.status = 'active'
  AND s.cancel_at_period_end = false
  AND s.updated_at::time BETWEEN '11:00:00' AND '14:00:00'
ORDER BY s.updated_at DESC;
```

---

## 🚑 対応策

### 即座の対応
1. ✅ 修正コードの実装（developブランチに適用済み）
2. ⏳ テスト環境での検証
3. ⏳ 本番環境へのデプロイ
4. ⏳ 影響ユーザーへの返金（ooya.tech2025@gmail.com - ¥2,980）

### テスト手順
```bash
# 1. テスト環境でのシミュレーション
# Stripe Test modeで解約→キャンセルのフローを実行

# 2. 課金が発生しないことを確認
# Stripe Dashboardで追加課金がないことを確認

# 3. サブスクリプション状態の確認
# データベースで正しく更新されることを確認
```

---

## 🎯 今後の改善点

### 1. 他のStripe API呼び出しも確認
```bash
grep -r "stripe.subscriptions" --include="*.ts" --include="*.tsx"
```

### 2. プロレーション設定の統一
- すべてのサブスクリプション更新で`proration_behavior`を明示的に設定
- ビジネスルールに基づいて適切な値を選択

### 3. テストカバレッジの向上
- 解約→キャンセルのE2Eテスト追加
- 課金額の検証を含める

---

## 📝 チェックリスト

### デプロイ前
- [x] 修正コードの実装
- [ ] ローカルでのテスト
- [ ] Stripe Test環境での検証
- [ ] コードレビュー

### デプロイ後
- [ ] 本番環境での動作確認
- [ ] 返金処理の実施
- [ ] ユーザーへの連絡
- [ ] モニタリング（24時間）

---

## 🔗 関連情報

### Stripe API ドキュメント
- [Proration behavior](https://stripe.com/docs/api/subscriptions/update#update_subscription-proration_behavior)
- [Subscription updates](https://stripe.com/docs/billing/subscriptions/upgrade-downgrade)

### 関連ファイル
- `/supabase/functions/resume-subscription/index.ts`
- `/supabase/functions/cancel-subscription/index.ts`
- `/docs_md/97_バグ対応/stripe_更新決済が何度もされる_250929_1.md`

---

*このドキュメントは2025年9月29日の追加バグ対応記録です。*