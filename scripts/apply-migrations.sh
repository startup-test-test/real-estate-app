#!/bin/bash

# Supabaseマイグレーション適用スクリプト
# 使用方法: ./scripts/apply-migrations.sh [dev|prod]

ENV=${1:-dev}

# 環境に応じてSupabase URLとキーを設定
if [ "$ENV" = "prod" ]; then
    SUPABASE_URL=${PROD_SUPABASE_URL}
    SUPABASE_SERVICE_KEY=${PROD_SUPABASE_SERVICE_KEY}
    echo "🚀 本番環境にマイグレーションを適用します"
else
    SUPABASE_URL=${DEV_SUPABASE_URL}
    SUPABASE_SERVICE_KEY=${DEV_SUPABASE_SERVICE_KEY}
    echo "🔧 開発環境にマイグレーションを適用します"
fi

# マイグレーションファイルを順番に適用
for migration in supabase/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "📝 適用中: $(basename $migration)"
        
        # psqlまたはSupabase CLIで実行
        # Option 1: Supabase CLI使用
        # supabase db push --db-url "postgresql://postgres:$SUPABASE_SERVICE_KEY@$SUPABASE_URL:6543/postgres"
        
        # Option 2: curl使用
        curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
            -H "apikey: $SUPABASE_SERVICE_KEY" \
            -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"query\": \"$(cat $migration | sed 's/"/\\"/g' | tr '\n' ' ')\"}"
    fi
done

echo "✅ マイグレーション完了！"