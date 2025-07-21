# Service Role Key セキュリティポリシー

## 概要
このドキュメントでは、Supabase Edge FunctionsでのService Role Keyの適切な使用について説明します。

## SEC-040: Service Role Key使用の制限

### 問題点
Service Role Keyは全てのRLS（Row Level Security）をバイパスする強力な権限を持つため、不適切に使用すると重大なセキュリティリスクとなります。

### 推奨される対策

#### 1. 最小権限の原則

**現在の実装（推奨されない）**
```typescript
// Service Role Keyを使用（全権限）
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)
```

**推奨される実装**
```typescript
// 1. 可能な限りAnon Keyを使用
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. 必要最小限の操作のみService Role Keyを使用
const adminClient = createClient(supabaseUrl, supabaseServiceKey)
// admin操作のみに限定
```

#### 2. Service Role Keyが必要な操作

以下の操作にのみService Role Keyを使用：
- `supabase.auth.admin.*` メソッド（管理者機能）
- RLSで保護されたテーブルへの管理操作
- システムレベルの更新

#### 3. 代替アプローチ

**Database Functionsの活用**
```sql
-- Supabase側で権限を制限した関数を作成
CREATE OR REPLACE FUNCTION send_invitation_email(
  p_invitation_id UUID,
  p_email TEXT
) RETURNS VOID AS $$
BEGIN
  -- 権限チェック
  IF NOT auth.jwt() IS NOT NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- メール送信処理
  -- ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 実装ガイドライン

#### 1. 権限の分離
```typescript
// 通常のクライアント（Anon Key使用）
const publicClient = createClient(
  supabaseUrl, 
  Deno.env.get('SUPABASE_ANON_KEY')!
)

// 管理用クライアント（Service Role Key使用）
const adminClient = createClient(
  supabaseUrl,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// 使い分け
try {
  // 通常の操作はpublicClientを使用
  const { data, error } = await publicClient
    .from('share_invitations')
    .select('*')
    .eq('id', invitationId)
    
  // 管理操作のみadminClientを使用
  const { error: adminError } = await adminClient
    .auth.admin.inviteUserByEmail(email)
} catch (error) {
  // エラーハンドリング
}
```

#### 2. 監査ログの実装
```typescript
// Service Role Key使用時は必ず監査ログを記録
async function logAdminAction(
  action: string,
  details: Record<string, any>
) {
  await adminClient
    .from('admin_audit_logs')
    .insert({
      action,
      details,
      performed_by: 'edge-function',
      performed_at: new Date().toISOString()
    })
}
```

### セキュリティチェックリスト

- [ ] Service Role Keyは環境変数から取得
- [ ] 最小限の操作にのみ使用
- [ ] 使用箇所を明確にコメント
- [ ] 監査ログの実装
- [ ] エラー時に機密情報を漏洩しない
- [ ] 定期的な権限レビュー

### ベストプラクティス

1. **環境変数の管理**
   - Service Role Keyは絶対にコードに直書きしない
   - Supabaseダッシュボードで定期的にローテーション

2. **最小権限の実装**
   - 可能な限りAnon Keyを使用
   - RLSポリシーで権限を制御
   - Database Functionsで権限を委譲

3. **監査とモニタリング**
   - Service Role Key使用を監査ログに記録
   - 異常な使用パターンを検知
   - 定期的なセキュリティレビュー

### Edge Function設計パターン

#### パターン1: 権限分離型
```typescript
// publicClient: 一般的な読み取り操作
// adminClient: 管理操作のみ
```

#### パターン2: Database Function委譲型
```typescript
// Edge FunctionはAnon Keyのみ使用
// 権限が必要な操作はDatabase Functionで実行
```

#### パターン3: JWT検証型
```typescript
// リクエストのJWTを検証
// ユーザーの権限に基づいて操作を制限
```