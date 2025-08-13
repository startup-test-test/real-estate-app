# Stripeテスト用サブスクリプション作成手順

## 方法1: Stripe CLIを使用（推奨）

```bash
# Stripe CLIをインストール（未インストールの場合）
# macOS
brew install stripe/stripe-cli/stripe

# Linux/WSL
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# ログイン
stripe login

# テスト顧客を作成
stripe customers create \
  --email="test@example.com" \
  --name="Test User"

# テストサブスクリプションを作成
stripe subscriptions create \
  --customer=[CUSTOMER_ID] \
  --items[0][price]=[PRICE_ID]
```

## 方法2: Stripeダッシュボードで手動作成

1. **Stripeダッシュボード** → **Customers**
2. **+ Add customer** をクリック
3. メールアドレスを入力（例：test@example.com）
4. **Add customer** をクリック

5. 作成した顧客を開く
6. **Subscriptions** タブ → **+ Create subscription**
7. プランを選択
8. **Start subscription** をクリック

9. 作成されたサブスクリプションIDをコピー（`sub_...`）
10. 顧客IDをコピー（`cus_...`）

## 方法3: Supabaseデータベースを更新

作成したStripeデータでSupabaseを更新：

```sql
-- ユーザーIDを確認
SELECT id, email FROM auth.users WHERE email = 'あなたのメール';

-- subscriptionsテーブルを更新
UPDATE subscriptions 
SET 
  stripe_customer_id = 'cus_実際のID',
  stripe_subscription_id = 'sub_実際のID'
WHERE user_id = 'ユーザーID';

-- 確認
SELECT * FROM subscriptions WHERE user_id = 'ユーザーID';
```

## テスト用クレジットカード

Stripeテストモードで使用可能：

| カード番号 | 説明 |
|-----------|------|
| 4242 4242 4242 4242 | 成功するカード |
| 4000 0000 0000 0002 | 拒否されるカード |
| 4000 0025 0000 3155 | 3D認証が必要 |

- 有効期限：任意の未来の日付
- CVC：任意の3桁
- 郵便番号：任意の5桁