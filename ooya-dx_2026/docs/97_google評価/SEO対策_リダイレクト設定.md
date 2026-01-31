# SEO対策: リダイレクト設定

## 概要

Google Search Consoleで検出されたSEO課題に対して、リダイレクト設定と正規化を実施しました。

---

## 課題1: WordPress移行による古いURL構造

### 問題の背景

2026年2月1日時点で、WordPressから移行した際の古いURLがGoogleにインデックスされていましたが、現在は404エラーを返していました。

| 古いURL | 問題 |
|---------|------|
| `/media/category/base/` | カテゴリ構造が変更された |
| `/media/category/reform/` | カテゴリ構造が変更された |
| `/media/company/` | 会社ページが `/company` に移動 |
| `/media/2025/04/` | 日付アーカイブ機能が廃止 |

### 原因

- WordPressからNext.jsへの移行時にURL構造が変更された
- 古いURLへのリダイレクト設定がなかった
- 外部サイトや検索エンジンが古いURLを参照していた

### 対応内容

`next.config.mjs` に301永久リダイレクトを追加：

```javascript
async redirects() {
  return [
    {
      source: '/media/category/base/:path*',
      destination: '/media/base/:path*',
      permanent: true,
    },
    {
      source: '/media/category/reform/:path*',
      destination: '/media/kodate/:path*',
      permanent: true,
    },
    {
      source: '/media/company/:path*',
      destination: '/company/:path*',
      permanent: true,
    },
    {
      source: '/media/2025/:path*',
      destination: '/media',
      permanent: true,
    },
  ];
}
```

### 確認方法

```bash
# 本番環境でテスト
curl -I https://ooya.tech/media/category/base/

# 期待される出力:
# HTTP/1.1 308 Permanent Redirect
# Location: /media/base/
```

---

## 課題2: 末尾スラッシュの不統一（重複コンテンツ）

### 問題の背景

同じページが2つのURLでインデックスされていました：

| スラッシュなし | スラッシュあり |
|--------------|--------------|
| `/media/base/excel-template` | `/media/base/excel-template/` |
| `/media/kodate/reform` | `/media/kodate/reform/` |

### 原因

- WordPressはデフォルトで末尾スラッシュあり（`/page/`）
- Next.jsはデフォルトでスラッシュなし（`/page`）
- 移行時に両方のURLがGoogleにインデックスされた
- 内部リンクの記述が統一されていなかった

### 問題点

- 重複コンテンツとしてSEO評価が分散する
- Googleがどちらを正規URLとして扱うか不明確

### 対応内容

`next.config.mjs` に `trailingSlash: false` を設定：

```javascript
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false, // URLの末尾スラッシュを統一（なしに統一）
  // ...
};
```

### 効果

- `/page/` にアクセス → `/page` に308リダイレクト
- サイト全体で統一されたURL構造
- サイトマップもスラッシュなしで生成

### 確認方法

```bash
# 本番環境でテスト
curl -I https://ooya.tech/media/base/excel-template/

# 期待される出力:
# HTTP/1.1 308 Permanent Redirect
# Location: /media/base/excel-template
```

---

## リダイレクトの種類

| コード | Next.js設定 | 用途 |
|-------|------------|------|
| 301 | `permanent: true` | 永久リダイレクト。SEO評価を新URLに引き継ぐ |
| 302 | `permanent: false` | 一時リダイレクト。SEO評価は引き継がない |
| 308 | Next.js自動 | trailingSlash設定による自動リダイレクト |

---

## デバッグ方法

### 1. ローカルでのテスト

```bash
# 開発サーバー起動
npm run dev

# curlでリダイレクトを確認
curl -I http://localhost:3000/media/category/base/
curl -I http://localhost:3000/media/base/excel-template/
```

### 2. 本番環境でのテスト

```bash
# 本番URLでテスト
curl -I https://ooya.tech/media/category/base/
curl -I https://ooya.tech/media/base/excel-template/

# または、ブラウザの開発者ツール > Network タブで確認
```

### 3. Google Search Consoleでの確認

1. **URL検査ツール**
   - 古いURLを入力
   - 「ページはインデックスに登録されていません」→「リダイレクトされました」と表示されればOK

2. **ページレポート**
   - 数週間後、リダイレクト済みURLが「除外」に移動することを確認

---

## 今後の対応

### 新しい404が発生した場合

1. Google Search Console > ページ > クロール済み - インデックス未登録 を確認
2. 404のURLを特定
3. 適切なリダイレクト先を決定
4. `next.config.mjs` に追加

### リダイレクトの追加例

```javascript
{
  source: '/old-path/:slug',
  destination: '/new-path/:slug',
  permanent: true,
}
```

### 内部リンクの統一

今後、内部リンクを記述する際は末尾スラッシュなしで統一：

```jsx
// ✅ 正しい
<Link href="/media/base/article-slug">記事</Link>

// ❌ 避ける
<Link href="/media/base/article-slug/">記事</Link>
```

---

## 参考リンク

- [Next.js Redirects Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)
- [Next.js trailingSlash Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash)
- [Google: 301リダイレクトのベストプラクティス](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google: 重複コンテンツの処理](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
