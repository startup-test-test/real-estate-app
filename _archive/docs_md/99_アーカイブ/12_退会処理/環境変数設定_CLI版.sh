#!/bin/bash

# Supabase CLIで環境変数を設定する方法

# 1. Supabase CLIにログイン
npx supabase login

# 2. プロジェクトをリンク
npx supabase link --project-ref gtnzhnsbdmkadfawuzmc

# 3. 環境変数（シークレット）を設定
npx supabase secrets set STRIPE_SECRET_KEY="sk_test_ここにあなたのStripeキーを入力"

# 4. 設定された環境変数を確認
npx supabase secrets list

# 5. Edge Functionを再デプロイ（環境変数を反映）
npx supabase functions deploy cancel-subscription --no-verify-jwt

echo "環境変数の設定が完了しました"