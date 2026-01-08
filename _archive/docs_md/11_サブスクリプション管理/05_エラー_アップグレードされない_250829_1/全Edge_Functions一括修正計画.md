# 全Edge Functions 一括修正計画

## 🚨 現状：技術的負債の蓄積

### エラー状況まとめ
```
4つのEdge Function全てで問題発生：
- handle-stripe-webhook: 致命的エラー（決済反映されない）
- cancel-subscription: 警告エラー（動作はOK）
- resume-subscription: 警告エラー（動作はOK）  
- create-checkout-session: 未確認（おそらく同じ）
```

### 根本原因
```typescript
// 全Functionで共通の古い設定
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'  // 古い
import Stripe from 'https://esm.sh/stripe@13.x.x?target=deno'  // 古い
// cryptoProvider未設定
```

## ✅ 一括修正方針

### 統一すべき設定
```typescript
// すべてのFunctionで統一
import { serve } from 'https://deno.land/std@0.177.1/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'

// Webhook検証が必要な場合
const cryptoProvider = Stripe.createSubtleCryptoProvider()
```

## 📝 修正作業計画（所要時間：30分）

### Step 1: バックアップ（5分）
```bash
# 現在のコードをバックアップ
cd supabase/functions
for func in handle-stripe-webhook cancel-subscription resume-subscription create-checkout-session; do
  cp $func/index.ts $func/index_backup_$(date +%Y%m%d).ts
done
```

### Step 2: 各Functionの修正（15分）

#### 1. handle-stripe-webhook（最優先）
- constructEventAsync + cryptoProvider
- stripe_price_id コメントアウト
- onConflict: 'user_id'

#### 2. cancel-subscription
- バージョン統一のみ

#### 3. resume-subscription  
- バージョン統一のみ

#### 4. create-checkout-session
- バージョン統一のみ

### Step 3: 一括デプロイ（10分）
```bash
# dev環境へデプロイ
supabase functions deploy handle-stripe-webhook --project-ref [DEV_ID]
supabase functions deploy cancel-subscription --project-ref [DEV_ID]
supabase functions deploy resume-subscription --project-ref [DEV_ID]
supabase functions deploy create-checkout-session --project-ref [DEV_ID]

# テスト後、本番環境へ
# 同じコマンドを[PROD_ID]で実行
```

## 🎯 期待される結果

### 修正前
```
❌ handle-stripe-webhook: 決済が反映されない
⚠️ 他Functions: event loop errorでログが汚れる
⚠️ 将来的な互換性リスク
```

### 修正後
```
✅ handle-stripe-webhook: 決済が正常に反映
✅ 全Functions: クリーンなログ
✅ 最新バージョンで安定動作
✅ 将来のアップデートにも対応
```

## 📊 リスク評価

| リスク | 発生確率 | 影響度 | 対策 |
|--------|----------|--------|------|
| デプロイ失敗 | 低 | 中 | バックアップから復元 |
| 一時的なダウンタイム | 低 | 高 | 順次デプロイで回避 |
| 新バージョンの非互換 | 極低 | 低 | dev環境でテスト |

## ✅ 実施判断

### 修正すべき理由
1. **決済機能の復旧**（最重要）
2. **技術的負債の解消**
3. **将来のトラブル防止**
4. **30分で全解決**

### 修正しない場合のリスク
1. **決済が永続的に失敗**
2. **Supabaseアップデート時に全停止**
3. **エラーログでデバッグ困難**
4. **ユーザー離脱**

## 🚀 アクションプラン

```
優先順位：
1. [即座] handle-stripe-webhook修正・デプロイ
2. [本日中] 他3つのFunction統一
3. [明日] 本番環境へ展開
4. [今週中] 監視・ログ確認
```

## 結論

**30分の作業で全問題解決可能**
- 決済機能の復旧
- エラーの完全解消
- 将来の安定性確保

今すぐ実施することを強く推奨します。