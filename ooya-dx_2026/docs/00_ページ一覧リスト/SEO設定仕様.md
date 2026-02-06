# SEO設定仕様

> 最終更新: 2026-02-06

## 概要

本ドキュメントでは、Google Search Console のインデックス問題を解決するために実装したSEO関連の設定について説明します。

---

## 1. www → non-www リダイレクト

### 目的

`www.ooya.tech` と `ooya.tech` の両方でアクセス可能な場合、Googleが「重複コンテンツ」と判定する問題を解決します。

### 実装

**ファイル:** `middleware.ts`

```typescript
const host = req.headers.get('host') || '';

// www → non-www リダイレクト（SEO正規化）
if (host.startsWith('www.')) {
  const newHost = host.replace('www.', '');
  const url = new URL(req.url);
  url.host = newHost;
  return NextResponse.redirect(url, 301);
}
```

### 動作

| アクセスURL | リダイレクト先 | ステータス |
|------------|--------------|----------|
| `www.ooya.tech/company` | `ooya.tech/company` | 301 |
| `www.ooya.tech/tools/roi` | `ooya.tech/tools/roi` | 301 |
| `ooya.tech/company` | （リダイレクトなし） | 200 |

### 備考

- Vercel の管理画面でも同様のリダイレクト設定済み（二重設定だが問題なし）
- 301リダイレクトはGoogleにとって「恒久的な移転」を意味する

---

## 2. メディア記事の404設定

### 目的

存在しない記事URLにアクセスした際、「ソフト404」ではなく正規の「404 Not Found」を返すようにします。

### 問題の背景

**ソフト404とは:**
- HTTPステータスは `200 OK` を返す
- しかしページ内容は「見つかりません」等のエラー表示
- Googleがこれを「おかしい」と判定

### 実装

**ファイル:** `app/media/[category]/[slug]/page.tsx`

```typescript
// generateStaticParamsに含まれないパスは自動的に404を返す
export const dynamicParams = false;

export async function generateStaticParams() {
  const paths = getAllArticlePaths();
  return paths.map((path) => ({
    category: path.categorySlug,
    slug: path.slug,
  }));
}
```

### 動作

| 状況 | URL例 | HTTPステータス |
|-----|-------|--------------|
| 記事が存在する | `/media/base/failure-2ch` | 200 OK |
| 記事が存在しない | `/media/self-management/report` | 404 Not Found |

### dynamicParams の説明

| 設定値 | 動作 |
|-------|-----|
| `true`（デフォルト） | `generateStaticParams` にないURLでもページ生成を試みる |
| `false` | `generateStaticParams` にないURLは自動的に404を返す |

### 新規記事追加時の影響

1. MDXファイルを `content/` ディレクトリに追加
2. デプロイ（ビルド）を実行
3. `generateStaticParams` が新記事を検出
4. 新記事が正常に公開される

**注意:** デプロイ前に新記事URLにアクセスすると404になります（これは正常な動作です）

---

## 3. 正規URL（Canonical）設定

### 実装箇所

**ファイル:** `app/layout.tsx`

```typescript
const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  // ...
};
```

### 各ページでの設定

```typescript
// 例: app/company/page.tsx
export const metadata: Metadata = {
  alternates: {
    canonical: '/company',  // metadataBaseと結合される
  },
};
```

### 結果

- `metadataBase` + `canonical` = `https://ooya.tech/company`
- HTMLに `<link rel="canonical" href="https://ooya.tech/company">` が出力される

---

## 4. 設定一覧

| 設定項目 | 状態 | 実装ファイル |
|---------|:----:|-------------|
| www → non-www リダイレクト | ✅ | `middleware.ts` |
| metadataBase | ✅ | `app/layout.tsx` |
| BASE_URL（sitemap） | ✅ | `app/sitemap.ts` |
| dynamicParams（メディア記事） | ✅ | `app/media/[category]/[slug]/page.tsx` |

---

## 5. 確認コマンド

### www リダイレクト確認

```bash
curl -I https://www.ooya.tech
# 期待値: HTTP/2 301, location: https://ooya.tech/
```

### 存在しない記事の404確認

```bash
curl -s -o /dev/null -w "%{http_code}" https://ooya.tech/media/test/test
# 期待値: 404
```

---

## 変更履歴

| 日付 | 変更内容 |
|-----|---------|
| 2026-02-06 | www → non-www リダイレクト追加 |
| 2026-02-06 | dynamicParams=false 設定追加 |
