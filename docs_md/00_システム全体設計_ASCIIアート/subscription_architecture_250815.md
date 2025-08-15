# 📊 Supabase/Stripe 月額課金システムアーキテクチャ

作成日: 2025-08-15  
最終更新: 2025-08-15

## 🏗️ システム全体アーキテクチャ

```mermaid
graph TB
    subgraph "Frontend (React/Vite)"
        UI[ユーザーインターフェース]
        PlanPage[料金プランページ]
        CancelModal[解約モーダル]
        ResumeBtn[再開ボタン]
    end
    
    subgraph "Supabase"
        Auth[認証]
        DB[(Database)]
        EdgeFunc[Edge Functions]
        
        subgraph "Edge Functions詳細"
            CreateCheckout[create-checkout-session]
            HandleWebhook[handle-stripe-webhook]
            CancelSub[cancel-subscription]
            ResumeSub[resume-subscription]
        end
        
        subgraph "Database Tables"
            Users[users]
            Subscriptions[subscriptions]
            UsageLimits[usage_limits]
            Properties[properties]
        end
    end
    
    subgraph "Stripe"
        StripeAPI[Stripe API]
        Checkout[Checkout Session]
        Customer[Customer]
        Subscription[Subscription]
        Webhook[Webhook Events]
    end
    
    UI --> Auth
    PlanPage --> CreateCheckout
    CancelModal --> CancelSub
    ResumeBtn --> ResumeSub
    
    CreateCheckout --> StripeAPI
    StripeAPI --> Checkout
    Checkout --> Customer
    Customer --> Subscription
    
    Webhook --> HandleWebhook
    HandleWebhook --> DB
    CancelSub --> StripeAPI
    ResumeSub --> StripeAPI
    
    DB --> Users
    DB --> Subscriptions
    DB --> UsageLimits
    DB --> Properties
```

## 💳 新規プラン購入フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as Frontend
    participant S as Supabase
    participant E as Edge Function
    participant ST as Stripe
    participant W as Webhook
    
    U->>F: プラン選択
    F->>S: 認証確認
    S-->>F: ユーザー情報
    F->>E: create-checkout-session呼び出し
    Note over E: プラン情報設定<br/>success_url設定<br/>cancel_url設定
    E->>ST: チェックアウトセッション作成
    ST-->>E: セッションURL
    E-->>F: リダイレクトURL
    F->>U: Stripe決済画面へリダイレクト
    
    U->>ST: カード情報入力・決済
    ST->>W: payment_intent.succeeded
    W->>E: handle-stripe-webhook
    E->>S: subscriptionsテーブル更新
    E->>S: usage_limitsテーブル更新
    Note over S: ステータス: active<br/>制限値更新
    
    ST->>U: 決済完了画面
    U->>F: success_urlへリダイレクト
    F->>S: プラン情報取得
    S-->>F: 最新のプラン情報
    F->>U: プラン変更完了表示
```

## 🔄 月次更新フロー

```mermaid
sequenceDiagram
    participant ST as Stripe
    participant W as Webhook
    participant E as Edge Function
    participant DB as Database
    participant F as Frontend
    participant U as ユーザー
    
    Note over ST: 月次請求日
    ST->>W: invoice.payment_succeeded
    W->>E: handle-stripe-webhook
    E->>DB: subscriptions更新
    Note over DB: current_period_end更新<br/>current_period_start更新
    
    E->>DB: usage_limits更新
    Note over DB: monthly_count = 0<br/>reset_date = 今月の日付
    
    Note over F,U: 次回ログイン時
    U->>F: ダッシュボードアクセス
    F->>DB: check_and_reset_usage()
    DB-->>F: リセット済み制限値
    F->>U: 新しい月の利用可能数表示
```

## ❌ 解約フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as Frontend
    participant M as 解約モーダル
    participant E as Edge Function
    participant ST as Stripe
    participant DB as Database
    
    U->>F: 設定ページ
    F->>M: 解約モーダル表示
    Note over M: 解約理由選択<br/>確認メッセージ
    U->>M: 解約確認
    M->>E: cancel-subscription
    E->>ST: subscription.update
    Note over ST: cancel_at_period_end: true
    ST-->>E: 更新完了
    
    E->>DB: subscriptions更新
    Note over DB: status: 'canceling'<br/>cancel_at_period_end: true<br/>canceled_at: now
    
    DB-->>E: 更新完了
    E-->>M: 解約予定設定完了
    M->>U: 期間終了まで利用可能表示
    
    Note over U: 期間終了日
    ST->>E: subscription.deleted
    E->>DB: subscriptions更新
    Note over DB: status: 'canceled'
    E->>DB: usage_limits更新
    Note over DB: 無料プランに戻す
```

## 🔄 解約取り消しフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as Frontend
    participant E as Edge Function
    participant ST as Stripe
    participant DB as Database
    
    Note over U: 解約予定期間中
    U->>F: 設定ページ
    F->>F: 解約取り消しボタン表示
    U->>F: 解約取り消しクリック
    F->>E: resume-subscription
    E->>ST: subscription.update
    Note over ST: cancel_at_period_end: false
    ST-->>E: 更新完了
    
    E->>DB: subscriptions更新
    Note over DB: status: 'active'<br/>cancel_at_period_end: false<br/>canceled_at: null
    
    DB-->>E: 更新完了
    E-->>F: プラン継続設定完了
    F->>U: プラン継続確認表示
```

## 📊 データベース構造

```mermaid
erDiagram
    users ||--o{ properties : owns
    users ||--o| subscriptions : has
    users ||--o| usage_limits : has
    
    users {
        uuid id PK
        string email
        timestamp created_at
        timestamp updated_at
    }
    
    subscriptions {
        uuid id PK
        uuid user_id FK
        string stripe_customer_id
        string stripe_subscription_id
        string status
        string price_id
        timestamp current_period_end
        timestamp current_period_start
        boolean cancel_at_period_end
        timestamp canceled_at
        timestamp created_at
        timestamp updated_at
    }
    
    usage_limits {
        uuid id PK
        uuid user_id FK
        string plan_type
        integer max_properties
        integer monthly_count
        timestamp reset_date
        timestamp created_at
        timestamp updated_at
    }
    
    properties {
        uuid id PK
        uuid user_id FK
        string name
        json data
        timestamp created_at
        timestamp updated_at
    }
```

## 🔐 セキュリティ構成

```mermaid
graph TD
    subgraph "認証レイヤー"
        JWT[JWT Token]
        RLS[Row Level Security]
    end
    
    subgraph "Edge Functions"
        CORS[CORS設定]
        Auth[認証チェック]
        Validation[入力検証]
    end
    
    subgraph "Stripe"
        WebhookSig[Webhook署名検証]
        APIKey[API Key管理]
    end
    
    subgraph "環境変数"
        SupabaseKeys[SUPABASE_ANON_KEY]
        StripeKeys[STRIPE_SECRET_KEY]
        WebhookSecret[STRIPE_WEBHOOK_SECRET]
    end
    
    JWT --> RLS
    JWT --> Auth
    CORS --> Auth
    Auth --> Validation
    WebhookSig --> WebhookSecret
    APIKey --> StripeKeys
```

## 🎯 プラン別制限管理

| プラン | 月額料金 | 物件登録数 | シミュレーション | リセット |
|-------|---------|-----------|---------------|---------|
| **無料プラン** | ¥0 | 3件まで | 制限なし | 月初 |
| **ベーシック** | ¥500 | 10件まで | 制限なし | 月初 |
| **プレミアム** | ¥1,500 | 無制限 | 制限なし | - |

### 制限チェックフロー

```mermaid
graph TD
    Start[物件登録開始] --> Check{ユーザープラン確認}
    Check -->|無料| Free[max_properties: 3]
    Check -->|ベーシック| Basic[max_properties: 10]
    Check -->|プレミアム| Premium[max_properties: 999999]
    
    Free --> Count{現在の登録数}
    Basic --> Count
    Premium --> Count
    
    Count -->|制限内| Allow[登録許可]
    Count -->|制限超過| Deny[登録拒否]
    
    Deny --> Upgrade[アップグレード促進]
    Allow --> Save[物件保存]
    
    Save --> UpdateCount[monthly_count++]
```

## 🚨 エラーハンドリング

```mermaid
graph TD
    subgraph "Frontend エラー"
        NetworkError[ネットワークエラー]
        AuthError[認証エラー]
        ValidationError[検証エラー]
    end
    
    subgraph "Edge Function エラー"
        StripeError[Stripe APIエラー]
        DBError[データベースエラー]
        WebhookError[Webhook検証エラー]
    end
    
    subgraph "エラー処理"
        Retry[リトライ処理]
        Logging[エラーログ記録]
        UserNotify[ユーザー通知]
        Fallback[フォールバック]
    end
    
    NetworkError --> Retry
    AuthError --> UserNotify
    ValidationError --> UserNotify
    
    StripeError --> Logging
    DBError --> Logging
    WebhookError --> Logging
    
    Logging --> Fallback
    Retry --> Fallback
```

## 📝 重要な実装ポイント

### 1. Webhook処理の冪等性
- 同じイベントが複数回送信されても結果が同じになるよう実装
- イベントIDを記録して重複処理を防ぐ

### 2. 月次リセット処理
- `check_and_reset_usage`関数で自動リセット
- タイムゾーン考慮（JST）

### 3. プラン変更時の日割り計算
- Stripeが自動で日割り計算
- 即座にプラン切り替え

### 4. 解約時の挙動
- 期間終了まで利用可能
- 解約取り消し可能期間の設定

### 5. エラー時のフォールバック
- Stripeエラー時は既存のプラン維持
- ユーザーへの適切なフィードバック

## 🔧 開発・テスト環境

| 環境 | Stripe | Supabase | URL |
|-----|--------|----------|-----|
| **開発** | テストモード | 開発プロジェクト | localhost:5173 |
| **ステージング** | テストモード | 開発プロジェクト | dev.ooya.tech |
| **本番** | 本番モード | 本番プロジェクト | ooya.tech |

## 📚 関連ファイル

### Frontend
- `/src/pages/PricingPlans.tsx` - 料金プランページ
- `/src/components/CancelSubscriptionModal.tsx` - 解約モーダル
- `/src/utils/subscriptionManager.ts` - プラン管理ユーティリティ

### Edge Functions
- `/supabase/functions/create-checkout-session/` - 決済セッション作成
- `/supabase/functions/handle-stripe-webhook/` - Webhook処理
- `/supabase/functions/cancel-subscription/` - 解約処理
- `/supabase/functions/resume-subscription/` - 再開処理

### Database
- `/supabase/migrations/20240812_stripe_tables.sql` - Stripeテーブル定義
- `/supabase/migrations/20250813_fix_monthly_reset.sql` - 月次リセット関数

---

作成者: Claude Code  
レビュー: 未実施