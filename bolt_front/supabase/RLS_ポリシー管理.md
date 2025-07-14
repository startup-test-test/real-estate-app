# RLS（Row Level Security）ポリシー管理ガイド

## 概要
Supabaseでは、Row Level Security（RLS）によってデータベースのテーブルレベルでアクセス制御を行います。
本プロジェクトでは、招待機能とコメント機能に関するRLSポリシーを段階的に改善してきました。

## テーブル構成
- **property_shares**: 物件共有情報（招待機能のメイン）
- **share_comments**: 共有に対するコメント
- **share_invitations**: 招待メール管理

## RLSポリシーの変遷

### 1. 初期の問題
```sql
-- 問題: property_id が NOT NULL制約でエラー
-- 原因: 招待機能専用レコードで property_id = null が必要だった
```

### 2. データベース構造修正（fix_invitation_shares.sql）
```sql
-- property_id を nullable に変更
ALTER TABLE property_shares 
ALTER COLUMN property_id DROP NOT NULL;

-- 招待機能対応の作成ポリシー
CREATE POLICY "Users can create shares" ON property_shares
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    (
      property_id IS NULL OR  -- 招待機能専用
      EXISTS (
        SELECT 1 FROM properties
        WHERE id = property_shares.property_id
        AND user_id = auth.uid()
      )
    )
  );
```

### 3. デバッグ用安全ポリシー（safe_debug_policies.sql）
RLSを無効化する代わりに、安全で緩いポリシーを適用：

```sql
-- 基本的なアクセス権限
CREATE POLICY "Debug: Allow basic property_shares access" ON property_shares
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = owner_id OR
      share_token IS NOT NULL  -- 招待トークンがある場合は閲覧可能
    )
  );

-- コメントアクセス権限
CREATE POLICY "Debug: Allow share_comments access" ON share_comments  
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM property_shares ps 
        WHERE ps.id = share_comments.share_id 
        AND (ps.owner_id = auth.uid() OR ps.share_token IS NOT NULL)
      )
    )
  );
```

### 4. 一時的な緩いポリシー（re_enable_rls.sql）
最終的に動作確認用の最も緩いポリシー：

```sql
-- 認証済みユーザーは全て読み取り可能
CREATE POLICY "Allow authenticated users to read property_shares" ON property_shares
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 認証済みユーザーは全て作成可能（自分のレコードのみ）
CREATE POLICY "Allow authenticated users to create property_shares" ON property_shares  
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

## 現在のポリシー状態

### property_shares テーブル
- ✅ **読み取り**: 認証済みユーザー全て
- ✅ **作成**: 自分がオーナーのレコードのみ
- ✅ **property_id**: nullable（招待機能用にnull許可）

### share_comments テーブル
- ✅ **読み取り**: 認証済みユーザー全て
- ✅ **作成**: 自分のコメントのみ

## 危険なファイル（使用禁止）

### temp_disable_rls.sql ⚠️【削除済み】
```sql
-- ⚠️ 本番環境では絶対に実行禁止
ALTER TABLE property_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE share_comments DISABLE ROW LEVEL SECURITY;
```
**理由**: RLSを完全に無効化するため、セキュリティリスクが高い

## デバッグ手順

### 1. 問題発生時
```sql
-- 現在のポリシー確認
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('property_shares', 'share_comments');
```

### 2. 安全なデバッグ
```bash
# 安全なデバッグポリシーを適用
psql -f supabase/safe_debug_policies.sql

# 問題解決後、適切なポリシーに戻す
psql -f supabase/re_enable_rls.sql
```

### 3. 緊急時のみ
```sql
-- 最後の手段：RLS一時無効化（開発環境のみ）
ALTER TABLE property_shares DISABLE ROW LEVEL SECURITY;
-- 必ず再有効化すること
ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;
```

## ベストプラクティス

### ✅ 推奨
- デバッグ時は `safe_debug_policies.sql` を使用
- 段階的にポリシーを厳しくしていく
- ファイル名に用途を明記（debug, temp, production等）

### ❌ 非推奨
- RLSの完全無効化
- 本番環境での緩いポリシー
- 一時ファイルのGitコミット

## トラブルシューティング

### 「有効な共有が作成できませんでした」エラー
**原因**: property_shares作成時のポリシー制限
**解決**: `fix_invitation_shares.sql`を実行

### コメント投稿エラー
**原因**: share_comments作成時のポリシー制限
**解決**: `safe_debug_policies.sql`または`re_enable_rls.sql`を実行

### 認証エラー
**原因**: auth.uid()がnullまたは不正
**確認**: ユーザーのログイン状態とJWTトークン

---

**最終更新**: 2025年07月14日  
**作成者**: Claude  
**ステータス**: 現在のポリシーは動作確認済み