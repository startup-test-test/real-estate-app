# メール送信機能の設定ガイド

## 📧 概要

招待メール送信機能が実装されました！Resend APIを使用してSupabase Edge Functionsでメール送信を行います。

## 🚀 設定手順

### 1. Resend APIキーの取得

1. [Resend.com](https://resend.com) にアクセス
2. アカウント作成またはログイン
3. API Keys → Create API Key
4. キーをコピー（後で使用）

### 2. Supabase環境変数の設定

Supabaseダッシュボードで以下の環境変数を設定：

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

### 3. Edge Functionのデプロイ

```bash
# Supabase CLIでEdge Functionをデプロイ
supabase functions deploy send-invitation

# 環境変数を設定
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

### 4. 送信者ドメインの設定

`supabase/functions/send-invitation/index.ts` の40行目を変更：

```typescript
from: 'noreply@yourdomain.com', // 実際のドメインに変更
```

## 💌 メール内容

### 送信内容
- **件名**: 【不動産投資シミュレーター】{物件名}の投資検討にご招待
- **デザイン**: HTMLメール（スタイル付き）
- **内容**: 
  - 招待者名
  - 物件情報
  - 権限説明
  - 招待リンク
  - 使い方ガイド

### 機能
- ✅ 自動招待リンク生成
- ✅ 権限管理（コメント可能に固定）
- ✅ 有効期限（7日間）
- ✅ エラーハンドリング（フォールバックリンク）

## 🧪 テスト方法

1. アプリにログイン
2. シミュレーション画面で「メールで招待・共有」をクリック
3. メールアドレスを入力して送信
4. コンソールでエラーを確認

## ⚠️ トラブルシューティング

### エラー「RESEND_API_KEY not found」
→ Supabaseの環境変数設定を確認

### メール送信失敗
→ フォールバックとして招待リンクが表示されます

### Edge Function未デプロイ
→ `supabase functions deploy send-invitation` を実行

## 📊 動作フロー

```
1. ユーザーがメールアドレス入力
   ↓
2. PropertyShare作成
   ↓
3. ShareInvitation作成
   ↓
4. Edge FunctionでResend API呼び出し
   ↓
5. メール送信完了
   ↓
6. ユーザーに成功通知
```

## 🔧 カスタマイズ

### メールテンプレート
`supabase/functions/send-invitation/index.ts` の39-84行目

### 送信者情報
- 送信者名: システム設定で変更可能
- 送信者メール: ドメイン認証後に変更

### 有効期限
`collaboration_schema.sql` で変更可能（デフォルト7日）