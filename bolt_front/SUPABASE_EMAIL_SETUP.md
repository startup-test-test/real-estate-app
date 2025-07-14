# Supabaseメール設定ガイド

## 🚨 現在の問題

エラー: `net::ERR_CONNECTION_CLOSED`
原因: Supabaseのメールサービスが設定されていない

## 📧 必要な設定手順

### 1. Supabaseダッシュボードでの設定

1. **Supabaseダッシュボード**にアクセス
   - https://supabase.com/dashboard

2. **Authentication** → **Settings** → **Email**

3. **SMTP設定**（以下から選択）:

#### オプション A: Gmail SMTP（推奨・無料）
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-gmail@gmail.com
SMTP Password: アプリパスワード（2段階認証必要）
```

#### オプション B: SendGrid（プロ向け）
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: SendGrid APIキー
```

#### オプション C: Resend（推奨・モダン）
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: Resend APIキー
```

### 2. メールテンプレートの設定

**Authentication** → **Email Templates** で以下を設定：

#### A. 招待メールテンプレート
- **Subject**: `【不動産投資シミュレーター】{{.PropertyName}}の投資検討にご招待`
- **Body**: 
```html
<h2>🏡 不動産投資の検討にご招待</h2>

<p><strong>{{.InviterName}}</strong>さんから、不動産投資シミュレーションの検討にご招待いただきました。</p>

<div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>📋 招待詳細</h3>
  <ul>
    <li><strong>物件:</strong> {{.PropertyName}}</li>
    <li><strong>権限:</strong> {{.Role}}</li>
  </ul>
</div>

<p>
  <a href="{{.ConfirmationURL}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    📊 シミュレーション結果を確認する
  </a>
</p>

<p><small>このリンクは7日間有効です。</small></p>
```

## 🔧 簡単な代替案

メール設定が複雑な場合は、**招待リンクを生成してユーザーが手動で送信**する方法に変更可能：

```typescript
// 招待リンクのみ生成（メール送信なし）
const invitationUrl = `${window.location.origin}/collaboration/${shareToken}`;
alert(`招待リンクをコピーして送信してください:\n${invitationUrl}`);
```

## 📋 設定確認方法

1. **テストメール送信**
   - Authentication → Users → Invite User でテスト

2. **ログ確認**
   - Supabaseダッシュボード → Logs → Auth logs

## ⚡ 今すぐできる対応

どちらを選択しますか？

**A. Supabaseメール設定を完了する**
- Gmail/SendGrid/Resendのどれかを設定
- 本格的なメール送信機能

**B. 招待リンク生成のみに変更**
- 設定不要ですぐ使用可能
- ユーザーが手動でリンク送信

どちらがよろしいでしょうか？