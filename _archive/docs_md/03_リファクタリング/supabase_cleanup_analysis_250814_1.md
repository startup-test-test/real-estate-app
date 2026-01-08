# Supabaseフォルダ内のテストファイル分析

**作成日**: 2025年8月14日  
**対象**: /workspaces/real-estate-app/supabase/

## 📊 削除候補ファイル

### 1. テストファイル（削除推奨）

#### functions/create-checkout-session/ 内
```
index.test.ts        - 今日作成したテストファイル
test-url-config.js   - 今日作成したテストファイル  
url-config.test.js   - 今日作成したテストファイル
```
**理由**: 本番環境では不要。テスト完了済み。

#### functions/ 内
```
trigger.txt          - デプロイトリガー用の空ファイル
```
**理由**: GitHub Actionsのトリガー用。内容は空。

### 2. アーカイブファイル（保持検討）

#### archive/ フォルダ
```
fix_constraints.sql  - 過去の制約修正
fix_rls_policies.sql - 過去のRLS修正
README.md           - アーカイブの説明
```
**判定**: 保持推奨（履歴として価値あり）

### 3. デバッグ・テスト用SQL（削除検討）

#### migrations/ 内
```
reset_usage_for_testing.sql     - テスト用リセットSQL
20240812_check_tables.sql       - テーブル確認用（デバッグ）
20250813_check_all_rls_status.sql - RLS状態確認（デバッグ）
```
**判定**: 削除可能だが、開発中は有用

#### policies/ 内
```
debug_policies.sql   - ポリシーデバッグ用
```
**判定**: 開発中は保持推奨

#### scripts/ 内
```
fix_database.sql    - データベース修正スクリプト
```
**判定**: 保持（将来使用する可能性）

### 4. ドキュメント（保持推奨）
```
table.md            - テーブル仕様書
README.md           - Supabase説明
```
**判定**: 保持（ドキュメントとして重要）

## 🎯 削除推奨ファイル（4ファイル）

| ファイルパス | 理由 | 影響 |
|-------------|------|------|
| `functions/create-checkout-session/index.test.ts` | 今日作成のテスト | なし |
| `functions/create-checkout-session/test-url-config.js` | 今日作成のテスト | なし |
| `functions/create-checkout-session/url-config.test.js` | 今日作成のテスト | なし |
| `functions/trigger.txt` | 空のトリガーファイル | なし |

## 📝 削除コマンド

```bash
# Supabaseフォルダ内のテストファイル削除
cd /workspaces/real-estate-app/supabase

# テストファイルを削除
rm -f functions/create-checkout-session/index.test.ts \
      functions/create-checkout-session/test-url-config.js \
      functions/create-checkout-session/url-config.test.js \
      functions/trigger.txt
```

## ⚠️ 保持推奨ファイル

### 開発に有用
- `migrations/reset_usage_for_testing.sql` - 開発テスト用
- `migrations/20240812_check_tables.sql` - 構造確認用
- `policies/debug_policies.sql` - ポリシーデバッグ用

### アーカイブ（履歴）
- `archive/` フォルダ全体 - 過去の修正履歴として価値

### ドキュメント
- `table.md` - 重要な仕様書
- 各種 `README.md` - 説明書

## 📊 影響評価

| 観点 | 評価 |
|------|------|
| **本番環境への影響** | なし |
| **開発環境への影響** | なし |
| **CI/CDへの影響** | なし |
| **ドキュメントへの影響** | なし |

## 🔍 追加確認事項

1. **migrations内のチェック用SQL**
   - 開発中は有用なので保持推奨
   - 本番リリース前に再検討

2. **archive フォルダ**
   - 過去の問題解決履歴として価値あり
   - 容量も小さいので保持推奨

## 結論

**即座に削除可能**: 4ファイル（すべて今日作成のテストファイル）
**保持推奨**: その他すべて（開発・履歴・ドキュメントとして価値あり）