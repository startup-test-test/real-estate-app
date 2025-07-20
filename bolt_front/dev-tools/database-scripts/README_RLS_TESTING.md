# RLS（Row Level Security）テスト環境について

## 重要な注意事項

⚠️ **本番環境でRLSを無効化することは絶対に行わないでください**

RLSはデータベースレベルのセキュリティ機能で、ユーザーが自分のデータのみにアクセスできることを保証します。

## 開発環境でのテスト方法

### 1. テスト専用ユーザーを使用する方法（推奨）

```sql
-- テスト用ユーザーを作成
INSERT INTO auth.users (id, email) VALUES 
  ('test-user-1', 'test1@example.com'),
  ('test-user-2', 'test2@example.com');

-- テストデータを作成
INSERT INTO property_shares (id, user_id, property_data) VALUES 
  ('test-share-1', 'test-user-1', '{"test": true}'),
  ('test-share-2', 'test-user-2', '{"test": true}');
```

### 2. 一時的なRLSポリシーを追加する方法

```sql
-- 開発環境専用の一時的なポリシーを作成
CREATE POLICY "temp_dev_policy" ON share_comments
  FOR ALL
  USING (current_setting('app.environment') = 'development');

-- テスト後は必ず削除
DROP POLICY "temp_dev_policy" ON share_comments;
```

### 3. サービスロールキーを使用する方法

開発環境では、Supabaseのサービスロールキーを使用してRLSをバイパスできます：

```javascript
// 開発環境のみ
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

## なぜRLS無効化ファイルを削除したのか

1. **セキュリティリスク**: 誤って本番環境で実行される可能性
2. **悪用の危険性**: 攻撃者がこのファイルを利用する可能性
3. **より安全な代替手段**: 上記の方法で同じことが安全に実現可能

## 本番環境でのRLS確認方法

```sql
-- RLSが有効になっているかを確認
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public' 
  AND tablename IN ('share_comments', 'property_shares', 'share_invitations');
```

すべてのテーブルで `rowsecurity = true` であることを確認してください。