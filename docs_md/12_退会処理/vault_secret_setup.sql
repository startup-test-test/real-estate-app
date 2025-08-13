-- Supabase Vault を使用してシークレットを設定
-- SQL Editorで実行

-- 1. Vaultにシークレットを作成
SELECT vault.create_secret(
  'sk_test_ここにあなたのStripeキーを入力',
  'STRIPE_SECRET_KEY',
  'Stripe API Secret Key for cancel-subscription function'
);

-- 2. 作成されたシークレットを確認
SELECT * FROM vault.secrets WHERE name = 'STRIPE_SECRET_KEY';

-- 注意: 実際のキーは表示されません（セキュリティのため）