# Supabaseメール認証設定ガイド

作成日: 2025年8月18日  
対象: 新規会員登録時のメール送信設定

---

## 🔴 重要：Codespacesの問題と対策

### 現在の問題

**GitHub Codespacesは起動するたびにURLが変わります！**

例：
- 今回: `https://ubiquitous-winner-975rr55v7qr4cpvjq-5173.app.github.dev`
- 次回: `https://別のランダム文字列-5173.app.github.dev`

### なぜ問題か？

1. **メール認証リンクが無効になる**
   - Supabaseから送信されるメールには古いURLが含まれる
   - ユーザーがクリックしても404エラー

2. **現在の実装（useSupabaseAuth.ts）**
```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`
// Codespacesだと毎回違うURLになってしまう
```

---

## ✅ 解決策

### 方法1: 本番環境で固定URL使用（推奨）

```typescript
// 環境に応じてURLを切り替え
const getRedirectUrl = () => {
  const host = window.location.hostname;
  
  // 本番環境
  if (host === 'ooya.tech') {
    return 'https://ooya.tech/auth/callback';
  }
  
  // 開発環境
  if (host === 'dev.ooya.tech') {
    return 'https://dev.ooya.tech/auth/callback';
  }
  
  // Codespaces（動的）
  return `${window.location.origin}/auth/callback`;
};
```

### 方法2: Supabaseダッシュボードで設定

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Site URL**: `https://ooya.tech`（本番）
3. **Redirect URLs**: 
   - `https://ooya.tech/auth/callback`
   - `https://dev.ooya.tech/auth/callback`
   - `https://*.app.github.dev/auth/callback`（ワイルドカード）

---

## 📧 メールテンプレートの日本語化

### 設定場所
**Supabase Dashboard** → **Authentication** → **Email Templates**

### 確認メール（Confirm signup）

```html
<h2>大家DXへようこそ</h2>
<p>この度は大家DXにご登録いただき、ありがとうございます。</p>
<p>以下のボタンをクリックして、メールアドレスの確認を完了してください：</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認</a></p>
<p>このリンクは24時間有効です。</p>
<p>心当たりのない場合は、このメールを無視してください。</p>
```

### パスワードリセット（Reset Password）

```html
<h2>パスワードリセットのご案内</h2>
<p>パスワードリセットのリクエストを受け付けました。</p>
<p>以下のボタンをクリックして、新しいパスワードを設定してください：</p>
<p><a href="{{ .ConfirmationURL }}">パスワードをリセット</a></p>
<p>このリンクは1時間有効です。</p>
<p>リクエストに心当たりがない場合は、このメールを無視してください。</p>
```

---

## 🔧 設定手順

### 1. 開発環境でのテスト

```bash
# Codespacesでテストする場合
# 毎回URLが変わることを前提に動作確認
```

### 2. 本番環境への適用

1. **Supabaseプロジェクト設定**
   - Site URL: `https://ooya.tech`
   - Redirect URLs に本番URLを追加

2. **メールテンプレート更新**
   - 日本語テンプレートを適用
   - 送信者名を「大家DX」に変更

3. **環境変数確認**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 📊 動作確認チェックリスト

### 開発環境（Codespaces）
- [ ] 新規登録でメールが送信される
- [ ] メール内のリンクが現在のCodespace URLを含む
- [ ] リンククリックで `/auth/callback` にリダイレクト
- [ ] 認証完了後 `/mypage` に遷移

### 本番環境
- [ ] メール内のリンクが `https://ooya.tech/auth/callback`
- [ ] SSL証明書が有効
- [ ] カスタムドメインからメール送信
- [ ] 日本語メールテンプレート適用

---

## ⚠️ 注意事項

1. **Codespacesでの制限**
   - 毎回URL変更のため、完全なテストは困難
   - ローカル開発環境の検討推奨

2. **本番環境必須設定**
   - 固定URLの設定が必須
   - SPFレコード設定推奨（メール到達率向上）

3. **セキュリティ**
   - メールリンクの有効期限設定
   - 二重登録防止の実装

---

## 🚀 今後の改善案

1. **Magic Link認証の導入**
   - パスワードレス認証
   - より安全で簡単

2. **SendGrid連携**
   - 高い到達率
   - 詳細な送信ログ

3. **メール認証スキップオプション**
   - 開発環境のみ
   - テスト効率化

---

## 📚 参考リンク

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/email-templates)
- [Redirect URLs Configuration](https://supabase.com/docs/guides/auth/redirect-urls)

---

作成: Claude Code Assistant  
最終更新: 2025年8月18日