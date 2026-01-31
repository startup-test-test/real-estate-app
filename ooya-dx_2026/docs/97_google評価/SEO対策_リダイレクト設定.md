# SEO対策: リダイレクト設定

## 概要

Google Search Consoleで検出された古いURL構造に対して、301リダイレクトを設定しました。

## 問題の背景

2026年2月1日時点で、以下の古いURLがGoogleにインデックスされていましたが、現在は404エラーを返していました：

| 古いURL | 問題 |
|---------|------|
| `/media/category/base/` | カテゴリ構造が変更された |
| `/media/category/reform/` | カテゴリ構造が変更された |
| `/media/company/` | 会社ページが `/company` に移動 |
| `/media/2025/04/` | 日付アーカイブ機能が廃止 |

## 対応内容

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

## リダイレクトの種類

- **301 (permanent: true)**: 永久リダイレクト。SEO評価を新URLに引き継ぐ
- **302 (permanent: false)**: 一時リダイレクト。SEO評価は引き継がない

## デバッグ方法

### 1. ローカルでのテスト

```bash
# 開発サーバー起動
npm run dev

# curlでリダイレクトを確認
curl -I http://localhost:3000/media/category/base/

# 期待される出力:
# HTTP/1.1 308 Permanent Redirect
# Location: /media/base/
```

### 2. 本番環境でのテスト

```bash
# 本番URLでテスト
curl -I https://ooya.tech/media/category/base/

# または、ブラウザの開発者ツール > Network タブで確認
```

### 3. Google Search Consoleでの確認

1. **URL検査ツール**
   - 古いURLを入力
   - 「ページはインデックスに登録されていません」→「リダイレクトされました」と表示されればOK

2. **ページレポート**
   - 数週間後、リダイレクト済みURLが「除外」に移動することを確認

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

## 参考リンク

- [Next.js Redirects Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)
- [Google: 301リダイレクトのベストプラクティス](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
