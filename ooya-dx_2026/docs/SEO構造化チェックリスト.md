# SEO構造化チェックリスト

## 概要
大家DXサイトのSEO構造化データ実装状況と改善項目をまとめたチェックリストです。

---

## 1. 全ページ一覧

| ページ | URL | title | description | OGP | Twitter | 構造化データ | パンくず |
|--------|-----|-------|-------------|-----|---------|-------------|---------|
| トップ | `/` | ✓ | ✓ | ✓ | ✓ | WebSite, Organization | - |
| シミュレーター | `/simulator` | ✓ | ✓ | ✓ | ✓ | BreadcrumbList | ✓ |
| ツール一覧 | `/tools` | ✓ | ✓ | ✓ | ✓ | BreadcrumbList | ✓ |
| 仲介手数料 | `/tools/brokerage` | ✓ | ✓ | ✓ | ✓ | WebApplication, BreadcrumbList | ✓ |
| media一覧 | `/media` | ✓ | ✓ | ✓ | ✓ | BreadcrumbList | ✓ |
| media記事 | `/media/[category]/[slug]` | ✓ | ✓ | ✓ | ✓ | Article, BreadcrumbList | ✓ |

---

## 2. 基本メタデータ詳細

### 2.1 トップページ (`/`)
```
title: 大家DX - 不動産投資シミュレーション
description: AI搭載の包括的不動産投資プラットフォーム...
OGP: ✓
Twitter Card: ✓
構造化データ: WebSite, Organization
ファイル: app/page.tsx
```

### 2.2 シミュレーター (`/simulator`)
```
title: 賃貸経営シミュレーター | 大家DX
description: 不動産投資の収益性をシミュレーション。IRR、CCR、DSCR...
OGP: ✓
Twitter Card: ✓
構造化データ: BreadcrumbList
ファイル: app/simulator/page.tsx
```

### 2.3 ツール一覧 (`/tools`)
```
title: 不動産計算ツール一覧 | 大家DX
description: 不動産取引に必要な税金・費用を簡単計算...
OGP: ✓
Twitter Card: ✓
構造化データ: BreadcrumbList
ファイル: app/tools/page.tsx
```

### 2.4 仲介手数料 (`/tools/brokerage`)
```
title: 仲介手数料シミュレーター | 大家DX
description: 不動産売買の仲介手数料を無料で計算...
OGP: ✓
Twitter Card: ✓
構造化データ: WebApplication, BreadcrumbList
ファイル: app/tools/brokerage/page.tsx
```

### 2.5 media一覧 (`/media`)
```
title: 大家DXジャーナル｜不動産投資の実践ノウハウ
description: 不動産投資の基礎知識から実践的なノウハウまで...
OGP: ✓
Twitter Card: ✓
構造化データ: BreadcrumbList
ファイル: app/media/page.tsx
```

### 2.6 media記事 (`/media/[category]/[slug]`)
```
title: ${記事タイトル}｜大家DXジャーナル
description: 各記事のfrontmatterから動的生成
OGP: ✓
Twitter Card: ✓
構造化データ: Article, BreadcrumbList
ファイル: app/media/[category]/[slug]/page.tsx
```

---

## 3. OGP設定状況

| ページ | og:title | og:description | og:image | og:type | og:url |
|--------|----------|----------------|----------|---------|--------|
| `/` | ✓ | ✓ | ✓ | website | ✓ |
| `/simulator` | ✓ | ✓ | ✓ | website | ✓ |
| `/tools` | ✓ | ✓ | ✓ | website | ✓ |
| `/tools/brokerage` | ✓ | ✓ | ✓ | website | ✓ |
| `/media` | ✓ | ✓ | ✓ | website | ✓ |
| `/media/[category]/[slug]` | ✓ | ✓ | ✓ | article | ✓ |

---

## 4. Twitter Card設定状況

| ページ | card | title | description | image |
|--------|------|-------|-------------|-------|
| `/` | summary_large_image | ✓ | ✓ | ✓ |
| `/simulator` | summary_large_image | ✓ | ✓ | ✓ |
| `/tools` | summary_large_image | ✓ | ✓ | ✓ |
| `/tools/brokerage` | summary_large_image | ✓ | ✓ | ✓ |
| `/media` | summary_large_image | ✓ | ✓ | ✓ |
| `/media/[category]/[slug]` | summary_large_image | ✓ | ✓ | ✓ |

---

## 5. 構造化データ (JSON-LD)

### 5.1 パンくずリスト (BreadcrumbList)

| ページ | URL | HTML表示 | JSON-LD | 状態 |
|--------|-----|----------|---------|------|
| トップ | `/` | - | - | 不要（最上位） |
| シミュレーター | `/simulator` | ✓ | ✓ | OK |
| ツール一覧 | `/tools` | ✓ | ✓ | OK |
| 仲介手数料 | `/tools/brokerage` | ✓ | ✓ | OK |
| media一覧 | `/media` | ✓ | ✓ | OK |
| media記事 | `/media/[category]/[slug]` | ✓ | ✓ | OK |

**実装箇所：**
- `/simulator` → `app/simulator/SimulatorLPClient.tsx` 137-150行目
- `/tools` → `app/tools/page.tsx` 98-105行目
- `/tools/brokerage` → `app/tools/brokerage/page.tsx`
- `/media` → `app/media/page.tsx` 51-64行目
- `/media/[category]/[slug]` → `app/media/[category]/[slug]/page.tsx` 169-177行目

### 5.2 その他の構造化データ

| 種類 | 対象ページ | 状態 | ファイル |
|------|-----------|------|----------|
| WebSite | `/` | ✓ | app/page.tsx |
| Organization | `/` | ✓ | app/page.tsx |
| Article | `/media/[category]/[slug]` | ✓ | app/media/[category]/[slug]/page.tsx |
| SoftwareApplication | `/simulator` | 検討中 | - |
| FAQPage | FAQ | 検討中 | - |

---

## 6. 見出し構造 (h1〜h3)

| ページ | h1 | h2 | h3 | 状態 |
|--------|----|----|----| -----|
| `/` | 1つ（賃貸経営を、もっとスマートに） | 複数 | 複数 | OK |
| `/simulator` | 1つ | 複数 | - | OK |
| `/tools` | 1つ（不動産計算ツール） | 複数 | - | OK |
| `/media` | 1つ | 複数 | - | OK |
| `/media/[category]/[slug]` | 1つ(タイトル) | 複数(本文) | 複数(本文) | OK |

**ルール:**
- h1は1ページに1つのみ
- h2→h3の順序を守る（h2を飛ばしてh3を使わない）
- 見出しは論理的な階層構造を維持

---

## 7. 改善優先度

### 高優先度（完了）
- [x] トップページにWebSite構造化データ追加
- [x] トップページにOrganization構造化データ追加
- [x] トップページにOGP追加
- [x] トップページにTwitter Card追加
- [x] 全ページにパンくずリスト追加

### 中優先度（完了）
- [x] `/simulator` にOGP・Twitter Card追加
- [x] `/tools` にOGP・Twitter Card追加
- [x] `/media` にOGP・Twitter Card追加
- [x] `/tools/brokerage` にOGP・Twitter Card追加

### 低優先度
- [ ] FAQページにFAQPage構造化データ追加
- [ ] シミュレーターにSoftwareApplication構造化データ追加
- [ ] 全ページにcanonical設定追加

---

## 8. BASE_URL設定一覧

| ファイル | BASE_URL | 状態 |
|----------|----------|------|
| `app/page.tsx` | `https://ooya.tech` | ✓ OK |
| `app/simulator/page.tsx` | `https://ooya.tech` | ✓ OK |
| `app/tools/page.tsx` | `https://ooya.tech` | ✓ OK |
| `app/tools/brokerage/page.tsx` | `https://ooya.tech` | ✓ OK |
| `app/media/page.tsx` | `https://ooya.tech` | ✓ OK |
| `app/media/[category]/[slug]/page.tsx` | `https://ooya.tech` | ✓ OK |

---

## 9. 共通化の推奨

### 9.1 SEO設定の共通化案

以下の設定を共通化することを推奨：

```typescript
// lib/seo.ts (新規作成推奨)
export const BASE_URL = 'https://ooya.tech';
export const SITE_NAME = '大家DX';

export const defaultOgImage = `${BASE_URL}/images/media/hero-media.jpeg`;

export const generateOgMetadata = (title: string, description: string, url: string, image?: string) => ({
  openGraph: {
    title,
    description,
    url,
    siteName: SITE_NAME,
    type: 'website',
    images: [{ url: image || defaultOgImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [image || defaultOgImage],
  },
});
```

### 9.2 構造化データの共通化案

```typescript
// lib/structured-data.ts (新規作成推奨)
export const generateBreadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
```

---

## 10. 実装済みファイル一覧

| ファイル | 実装内容 |
|----------|----------|
| `app/page.tsx` | OGP, Twitter Card, WebSite, Organization |
| `app/simulator/page.tsx` | BreadcrumbList (JSON-LD) |
| `app/simulator/SimulatorLPClient.tsx` | パンくず (HTML) |
| `app/tools/page.tsx` | BreadcrumbList (HTML + JSON-LD) |
| `app/tools/brokerage/page.tsx` | BreadcrumbList (HTML + JSON-LD) |
| `app/media/page.tsx` | BreadcrumbList (HTML + JSON-LD) |
| `app/media/[category]/[slug]/page.tsx` | OGP, Twitter Card, Article, BreadcrumbList |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-14 | 初版作成 |
| 2026-01-14 | simulator, tools, mediaにBreadcrumbList追加 |
| 2026-01-14 | トップページにOGP, Twitter Card, WebSite, Organization追加 |
| 2026-01-14 | 全ページチェックリスト追加 |
| 2026-01-14 | /simulator, /tools, /media, /tools/brokerageにOGP・Twitter Card追加 |
