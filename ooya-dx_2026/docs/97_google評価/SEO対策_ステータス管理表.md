# SEO対策 ステータス管理表

最終更新: 2026年2月1日

---

## 完了済み対策

| # | 対策項目 | 状態 | 対応日 | 備考 |
|---|---------|------|-------|------|
| 1 | サイトマップ作成 | ✅ 完了 | 2026-02-01 | 全ページを動的生成 |
| 2 | robots.txt作成 | ✅ 完了 | 2026-02-01 | クロール制御設定 |
| 3 | WordPress移行リダイレクト | ✅ 完了 | 2026-02-01 | 4件の301リダイレクト |
| 4 | 末尾スラッシュ統一 | ✅ 完了 | 2026-02-01 | trailingSlash: false |
| 5 | 構造化データ（Organization） | ✅ 完了 | 2026-02-01 | 会社情報 |
| 6 | 構造化データ（WebSite） | ✅ 完了 | 2026-02-01 | サイト情報 |
| 7 | .gitignore整備 | ✅ 完了 | 2026-02-01 | .envファイル除外 |

---

## 未対応・検討中の対策

| # | 対策項目 | 優先度 | 状態 | 効果 | 工数 |
|---|---------|-------|------|------|------|
| 8 | 構造化データ（FAQPage） | 中 | 📋 未着手 | FAQ展開表示 | 小 |
| 9 | 構造化データ（HowTo） | 低 | 📋 未着手 | 手順ステップ表示 | 中 |
| 10 | Canonical URL明示 | 中 | 📋 未着手 | 重複コンテンツ対策 | 小 |
| 11 | 画像最適化（WebP） | 中 | 📋 未着手 | ページ速度向上 | 中 |
| 12 | Core Web Vitals改善 | 中 | 📋 未着手 | LCP/FID/CLS改善 | 大 |
| 13 | 内部リンク強化 | 低 | 📋 未着手 | クロール効率向上 | 中 |
| 14 | メタディスクリプション確認 | 低 | 📋 未着手 | CTR向上 | 小 |
| 15 | OGP画像最適化 | 低 | 📋 未着手 | SNS共有時の表示 | 中 |

---

## 対応詳細

### 1. サイトマップ作成
- ファイル: `app/sitemap.ts`
- URL: https://ooya.tech/sitemap.xml
- 内容: 記事、ツール、用語集、会社情報等を動的生成

### 2. robots.txt作成
- ファイル: `app/robots.ts`
- URL: https://ooya.tech/robots.txt
- 設定:
  - Allow: /
  - Disallow: /mypage/, /api/, /auth/, /_next/, /test-error

### 3. WordPress移行リダイレクト
- ファイル: `next.config.mjs`
- リダイレクト一覧:
  | 旧URL | 新URL |
  |-------|-------|
  | /media/category/base/* | /media/base/* |
  | /media/category/reform/* | /media/kodate/* |
  | /media/company/* | /company/* |
  | /media/2025/* | /media |

### 4. 末尾スラッシュ統一
- ファイル: `next.config.mjs`
- 設定: `trailingSlash: false`
- 効果: /page/ → /page に308リダイレクト

### 5-6. 構造化データ
- ファイル: `app/layout.tsx`
- 種類:
  - Organization: 会社情報
  - WebSite: サイト情報とサイト内検索

---

## 効果測定

### Google Search Console指標

| 指標 | 対策前 (2026-02-01) | 目標 | 現在 |
|-----|-------------------|------|------|
| インデックス済みページ数 | 31 | 100+ | - |
| クロール済みページ数 | - | - | - |
| 平均掲載順位 | - | - | - |
| クリック数 | - | - | - |

※ 効果は1〜4週間後に反映される

---

## 次回アクション

1. [ ] 1週間後にインデックス数を確認
2. [ ] Google Search Consoleでクロールエラーを確認
3. [ ] FAQページに構造化データ追加を検討
4. [ ] Core Web Vitals測定

---

## 参考リンク

- [Google Search Console](https://search.google.com/search-console)
- [リッチリザルトテスト](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org](https://schema.org/)
