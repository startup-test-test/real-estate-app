# Basic認証とNeon Auth の仕様・制限事項（localhost vs サーバー環境）

## 概要

Basic認証を使用している環境（localhost / Vercelプレビュー）では、Neon Authとの間でAuthorizationヘッダーの衝突が発生する。
現在、API routeで回避策を適用済みのため、Basic認証環境でもNeon Authは正常に動作する。

## 問題の発生条件

| 環境 | Basic認証 | Neon Auth | ログアウト等 | 備考 |
|------|-----------|-----------|-------------|------|
| localhost | あり（.env） | 正常 | OK | 開発サーバーでProxyコードが正常動作 |
| Vercelプレビュー | あり | 制限あり | NG（403） | 本番ビルドでProxyコードが機能しない |
| 本番 (独自ドメイン) | なし推奨 | 正常 | OK | Basic認証がないので問題なし |

**注意**: `.env` に `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` が設定されている場合、localhostでもBasic認証がかかる。

### localhost vs Vercelの動作差異

同じBasic認証設定でも、localhostとVercelプレビューで動作が異なる：

- **localhost**: Next.js開発サーバーでは、API routeに実装したProxyパターンによるヘッダー除去が正常に動作
- **Vercelプレビュー**: 本番ビルドでは同じProxyパターンが機能せず、403エラーが発生

これはNext.jsの開発サーバーと本番ビルドでのJavaScript実行環境の違いによるもの。

## 技術的な原因

### 1. Basic認証の仕組み

1. ユーザーがプレビューURLにアクセス
2. middleware.tsがBasic認証を要求
3. ユーザーが認証情報を入力
4. **ブラウザが `Authorization: Basic xxxx` ヘッダーを記憶**
5. 以降、同じドメインへの全リクエストにこのヘッダーが自動付与される

### 2. Neon Authとの衝突

```
ブラウザ → /api/auth/sign-out
         ├── Cookie: session_token=xxx (Neon Auth用)
         └── Authorization: Basic xxxx (Basic認証の残骸)
                    ↓
         Neon Authサーバーが受信
                    ↓
         「Authorization」ヘッダーを認証試行と解釈
                    ↓
         Basic認証の資格情報は無効 → 403 Forbidden
```

### 3. 影響を受けるAPI

- `POST /api/auth/sign-out` - ログアウト
- `POST /api/auth/sign-up/email` - メール登録
- `POST /api/auth/sign-in/email` - メールログイン
- `GET /api/auth/get-session` - セッション取得
- その他すべての `/api/auth/*` エンドポイント

## 解決策

### 方法1: 本番環境ではBasic認証を使用しない（推奨）

本番デプロイ時は、Vercelの環境変数から以下を削除する：

- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASSWORD`

### 方法2: Vercel Deployment Protectionを使用

Vercelの標準機能「Deployment Protection」を使用する。

- **設定場所**: Vercel Dashboard → Settings → Deployment Protection
- **利点**: `Authorization`ヘッダーではなくクッキー(`_vercel_jwt`)で保護するため、Neon Authと衝突しない

### 方法3: API Routeでヘッダーを除去（回避策）

`app/api/auth/[...all]/route.ts` でBasic認証ヘッダーを除去する処理を追加。

```typescript
async function stripBasicAuthHeader(request: NextRequest): Promise<NextRequest> {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Basic ")) {
    const clonedRequest = request.clone();
    const newHeaders = new Headers(clonedRequest.headers);
    newHeaders.delete("authorization");
    // ... 新しいリクエストを作成
  }
  return request;
}
```

**注意**: starter packのコードを改変することになる。

## ローカル開発での確認事項

| 機能 | ローカルで確認可能 | 備考 |
|------|-------------------|------|
| ログイン | OK | Basic認証環境でも動作 |
| ログアウト | OK | Basic認証環境でも動作 |
| 新規登録 | OK | Basic認証環境でも動作 |
| パスワードリセット | OK | Basic認証環境でも動作 |
| セッション管理 | OK | |
| 認証UI表示 | OK | |
| Python API | 要外部接続 | Render等にデプロイが必要 |
| Stripeウェブフック | 要Stripe CLI | `stripe listen --forward-to` で代用 |
| メール送信 | 実送信される | Resend経由で実際に送信 |

**現在の環境変数設定（.env）**:
```
BASIC_AUTH_USER=preview
BASIC_AUTH_PASSWORD=preview
```

## 推奨運用フロー

```
開発 (localhost)
    ↓ Basic認証あり、全機能テスト可能（Proxyコードが動作）
    ↓ → ログイン/ログアウト/新規登録など全てテスト可能

プレビュー (Vercel develop)
    ↓ Basic認証あり、Auth機能は制限あり
    ↓ → UI/レイアウト確認用と割り切る
    ↓ → ログアウト等は403エラーになる（仕様）

本番 (独自ドメイン)
    ↓ Basic認証なし、全機能動作
```

## 関連ファイル

- `middleware.ts` - Basic認証の実装
- `app/api/auth/[...all]/route.ts` - Neon Auth APIハンドラー
- `.env` / `.env.local` - 環境変数設定

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-10 | 初版作成 |
