#!/bin/bash

# RLSポリシー適用スクリプト
# 環境に応じて適切なポリシーを適用します

# 環境変数から環境を判定
ENV=${NODE_ENV:-development}
SUPABASE_DB_URL=${SUPABASE_DB_URL:-}

if [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_DB_URL is not set"
    exit 1
fi

# 環境に応じたポリシーファイルを選択
if [ "$ENV" = "production" ]; then
    POLICY_FILE="production_rls_policies.sql"
    echo "🔒 Applying PRODUCTION RLS policies..."
else
    POLICY_FILE="safe_debug_policies.sql"
    echo "🔧 Applying DEVELOPMENT RLS policies..."
    echo "⚠️  WARNING: Using relaxed policies for development"
fi

# ポリシーを適用
psql "$SUPABASE_DB_URL" -f "$(dirname "$0")/$POLICY_FILE"

if [ $? -eq 0 ]; then
    echo "✅ RLS policies applied successfully"
    echo "Environment: $ENV"
    echo "Policy file: $POLICY_FILE"
else
    echo "❌ Failed to apply RLS policies"
    exit 1
fi