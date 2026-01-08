# Codespace環境でのURL問題の技術的説明

## 問題の構造

```
[ユーザーのブラウザ] 
    ↓ (1) 決済リクエスト
[Codespace App (https://ominous-happiness-xxx.app.github.dev)]
    ↓ (2) API呼び出し
[Supabase Edge Function (Supabaseサーバー上で実行)]
    ↓ (3) Stripe Session作成（リダイレクトURLを含む）
[Stripe]
    ↓ (4) 決済処理
    ↓ (5) リダイレクト
[success_url または cancel_url へ]
```

## 問題点

- ステップ(3)で、Edge FunctionはSupabaseのサーバー上で実行される
- Edge Functionは呼び出し元のCodespace URLを自動的に知ることができない
- `window.location`や`document.location`はサーバー側では使用不可

## 解決策の比較

### 1. ハードコーディング（現在の暫定解決策）
```typescript
success_url: 'https://ominous-happiness-q7r697r6gq93xjxq-5173.app.github.dev/?payment=success'
```
- **メリット**: 即座に動作
- **デメリット**: Codespace再作成時に修正が必要

### 2. 環境変数による解決
```typescript
success_url: `${Deno.env.get('APP_URL')}/?payment=success`
```
- **メリット**: 環境ごとに設定可能
- **デメリット**: Supabaseダッシュボードでの設定が必要

### 3. クライアントからURLを送信（最も柔軟）
```typescript
// クライアント側
const { data } = await supabase.functions.invoke('create-checkout-session', {
  body: { 
    returnUrl: window.location.origin // 現在のURLを送信
  }
})

// Edge Function側
success_url: `${returnUrl}/?payment=success`
```
- **メリット**: 完全に動的、どの環境でも動作
- **デメリット**: セキュリティ考慮が必要（URLの検証）

## 推奨される実装方法

### 開発環境（Codespace）
```typescript
// 環境変数 APP_URL が未設定の場合、クライアントから送信されたURLを使用
const baseUrl = Deno.env.get('APP_URL') || returnUrl || 'https://default-url.com'
success_url: `${baseUrl}/?payment=success`
```

### 本番環境
```bash
# Supabaseダッシュボードで設定
APP_URL=https://ooya.tech
```

### ステージング環境
```bash
APP_URL=https://staging.ooya.tech
```

## セキュリティ考慮事項

クライアントからURLを受け取る場合、以下の検証を追加：

```typescript
// 許可されたドメインのリスト
const allowedDomains = [
  'app.github.dev',  // Codespace
  'ooya.tech',       // 本番
  'staging.ooya.tech', // ステージング
  'localhost'        // ローカル開発
]

// URL検証
function isValidReturnUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return allowedDomains.some(domain => 
      parsedUrl.hostname.includes(domain)
    )
  } catch {
    return false
  }
}

// 使用時
if (returnUrl && !isValidReturnUrl(returnUrl)) {
  throw new Error('Invalid return URL')
}
```

## まとめ

1. **Codespace環境の制約**: Edge FunctionがSupabaseサーバー上で実行されるため、Codespace URLを自動検出できない
2. **短期的解決**: ハードコーディング（現在の実装）
3. **中期的解決**: 環境変数の使用
4. **長期的解決**: クライアントからのURL送信＋セキュリティ検証

この問題は、サーバーレス環境とダイナミックな開発環境の組み合わせによる構造的な課題です。