# SEO対策 ステータス管理表

最終更新: 2026年2月1日

---

## 完了済み対策

| # | 対策項目 | 状態 | 対応日 | 確認結果 | 備考 |
|---|---------|------|-------|---------|------|
| 1 | サイトマップ作成 | ✅ 完了 | 2026-02-01 | ✅ 本番確認済み | 全ページを動的生成 |
| 2 | robots.txt作成 | ✅ 完了 | 2026-02-01 | ✅ 本番確認済み | クロール制御設定 |
| 3 | WordPress移行リダイレクト | ✅ 完了 | 2026-02-01 | ✅ 本番確認済み | 4件の301リダイレクト |
| 4 | 末尾スラッシュ統一 | ✅ 完了 | 2026-02-01 | ✅ 本番確認済み | trailingSlash: false |
| 5 | 構造化データ（Organization） | ✅ 完了 | 2026-02-01 | ✅ Google確認済み | 会社情報 |
| 6 | 構造化データ（WebSite） | ✅ 完了 | 2026-02-01 | ✅ Google確認済み | サイト情報 |
| 7 | .gitignore整備 | ✅ 完了 | 2026-02-01 | ✅ 確認済み | .envファイル除外 |
| 8 | ツール・会社ページ日付表示 | ✅ 完了 | 2026-02-01 | ✅ 本番確認済み | 全34ページに更新日表示 |

---

## 確認結果詳細

### サイトマップ確認
- URL: https://ooya.tech/sitemap.xml
- 確認日時: 2026-02-01 08:41
- 結果: 正常に生成、全ページ含む

### robots.txt確認
- URL: https://ooya.tech/robots.txt
- 確認日時: 2026-02-01 08:47
- 結果:
  ```
  User-Agent: *
  Allow: /
  Disallow: /mypage/
  Disallow: /api/
  Disallow: /auth/
  Disallow: /_next/
  Disallow: /test-error
  Sitemap: https://ooya.tech/sitemap.xml
  ```

### リダイレクト確認
- 確認日時: 2026-02-01 08:35
- 結果:
  | テストURL | リダイレクト先 | ステータス |
  |----------|--------------|-----------|
  | /media/category/base/ | /media/base | ✅ 308 |
  | /media/company/ | /company | ✅ 308 |
  | /media/2025/04/ | /media | ✅ 308 |

### 末尾スラッシュ確認
- 確認日時: 2026-02-01 08:41
- テストURL: /media/base/excel-template/
- 結果: /media/base/excel-template へ308リダイレクト ✅

### 構造化データ確認（Googleリッチリザルトテスト）
- 確認日時: 2026-02-01 10:03
- URL: https://ooya.tech
- 結果:
  | 項目 | 状態 |
  |-----|------|
  | 有効なアイテム | ✅ 1件（組織） |
  | クロール許可 | ✅ はい |
  | ページ取得 | ✅ 成功 |
  | インデックス登録許可 | ✅ はい |
  | ユーザーエージェント | Google検査ツール（スマートフォン） |

---

## 未対応・検討中の対策

| # | 対策項目 | 優先度 | 状態 | 効果 | 工数 |
|---|---------|-------|------|------|------|
| 9 | 構造化データ（FAQPage） | 中 | 📋 未着手 | FAQ展開表示 | 小 |
| 10 | 構造化データ（HowTo） | 低 | 📋 未着手 | 手順ステップ表示 | 中 |
| 11 | Canonical URL明示 | 中 | 📋 未着手 | 重複コンテンツ対策 | 小 |
| 12 | 画像最適化（WebP） | 中 | 📋 未着手 | ページ速度向上 | 中 |
| 13 | Core Web Vitals改善 | 中 | 📋 未着手 | LCP/FID/CLS改善 | 大 |
| 14 | 内部リンク強化 | 低 | 📋 未着手 | クロール効率向上 | 中 |
| 15 | メタディスクリプション確認 | 低 | 📋 未着手 | CTR向上 | 小 |
| 16 | OGP画像最適化 | 低 | 📋 未着手 | SNS共有時の表示 | 中 |

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

### 8. ツール・会社ページ日付表示
- 管理ファイル: `lib/navigation.ts`
- 対象:
  - ツールページ: 22ページ（各種計算ツール）
  - 会社情報ページ: 12ページ（会社概要、CSR、SDGs等）
- 表示形式: カテゴリバッジの横に「2025年1月15日」形式で表示
- 更新方法: `lib/navigation.ts`の`lastUpdated`フィールドを更新
- 効果: コンテンツの鮮度をGoogleと利用者に明示

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
