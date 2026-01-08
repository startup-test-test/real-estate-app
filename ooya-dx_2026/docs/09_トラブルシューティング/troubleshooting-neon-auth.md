# Neon Auth トラブルシューティング

## 問題: VercelでGoogle OAuth (Neon Auth) が動作しない

### 症状
- ローカル環境（localhost:3002）では正常にGoogleログインが動作
- Vercel本番環境では `/api/auth/get-session` が 404 エラー
- `/api/auth/sign-in/social` が 405 エラー

### 原因
**catch-allルートのディレクトリ名の不一致**

startpackのオリジナル実装では:
- ディレクトリ名: `app/api/auth/[...all]/`
- パラメータ: `params.all`

誤って `[...path]` に変更したことで、ルートハンドラーのパラメータ参照が一致しなくなった。

### 詳細

#### オリジナル実装 (正しい)
```
app/api/auth/[...all]/route.ts
```

```typescript
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> }
) {
  const params = await context.params;
  return handlers.GET(request, {
    params: Promise.resolve({ path: params.all }),  // params.all を path に変換
  });
}
```

#### 変更後 (動作しない)
```
app/api/auth/[...path]/route.ts
```

この場合、パラメータは `params.path` になるが、コードが `params.all` を参照していたため不整合が発生。

### 解決方法

1. ディレクトリ名を `[...all]` に戻す
2. オリジナルの route.ts を復元

```bash
# startpackのオリジナルをコピー
cp startpack/app/api/auth/[...all]/route.ts ooya-dx_2026/app/api/auth/[...all]/route.ts
```

### 教訓

1. **startpackの構造は理由がある** - 変更する場合は影響範囲を十分に確認
2. **catch-allルートの命名** - Next.js App Routerでは `[...param]` のパラメータ名がコードと一致する必要がある
3. **ローカルとVercelの差異** - ビルドプロセスの違いにより、ローカルで動いてもVercelで動かないケースがある

### 確認事項チェックリスト

- [ ] `app/api/auth/[...all]/route.ts` が存在するか
- [ ] `params.all` が正しく参照されているか
- [ ] Vercel環境変数 `NEXT_PUBLIC_NEON_AUTH_URL` と `NEON_AUTH_BASE_URL` が設定されているか
- [ ] Neon Consoleで許可ドメインが設定されているか
