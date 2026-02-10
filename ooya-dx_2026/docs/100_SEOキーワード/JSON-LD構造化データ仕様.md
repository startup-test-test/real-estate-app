# JSON-LD 構造化データ仕様書

**最終更新:** 2026-02-10
**目的:** E-E-A-T（経験・専門性・権威性・信頼性）チェーンの構築

---

## 1. 全体構成

```
全ページ（layout.tsx）
  └── Organization @id + founder → Person @id

/profile ページ
  └── Person 全データ（著者の正本）

/company ページ
  └── Organization 全データ（会社の正本）

記事ページ（/media/[category]/[slug]）
  ├── author → Person @id 参照
  └── publisher → Organization @id 参照

計算ツール（/tools/*）30ページ
  ├── SoftwareApplication + author → Person @id
  ├── WebPage + author + publisher
  ├── BreadcrumbList
  └── FAQPage（一部ツール）

ガイド記事（/tools/brokerage/guide）
  ├── Article + author → Person @id + publisher → Organization @id
  └── BreadcrumbList
```

---

## 2. 定義ファイル

**`lib/eeat.ts`** - 共有定数（全ページから参照）

| エクスポート名 | 型 | 用途 |
|---------------|---|------|
| `personJsonLd` | Person | `/profile` ページに埋め込む全データ |
| `organizationDetailJsonLd` | Organization | `/company` ページに埋め込む全データ |
| `articleAuthorRef` | Person（@id参照） | 記事・ツールの author フィールド |
| `articlePublisherRef` | Organization（@id参照） | 記事・ツールの publisher フィールド |

---

## 3. Person JSON-LD（著者情報）

**埋め込み先:** `/profile` ページ
**@id:** `https://ooya.tech/profile#person`

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://ooya.tech/profile#person",
  "name": "Tetsuro Togo",
  "url": "https://ooya.tech/profile",
  "image": "https://ooya.tech/images/profile/profile.jpg",
  "jobTitle": "代表取締役",
  "description": "開発ディレクター / マーケッター / 不動産オーナー...",
  "worksFor": {
    "@type": "Organization",
    "@id": "https://ooya.tech/company#organization",
    "name": "株式会社StartupMarketing"
  },
  "knowsAbout": [
    "不動産投資", "賃貸経営", "Webマーケティング",
    "開発ディレクション", "不動産収支シミュレーション"
  ],
  "sameAs": []
}
```

### sameAs に追加候補（Person）

| URL | サービス | 備考 |
|-----|---------|------|
| `https://offers.jp/media/sidejob/workstyle/a_1862` | Offers（overflow社） | インタビュー記事 |
| `https://www.shibuyamov.com/interviews/webyour-times.html` | 渋谷ヒカリエ MOV | インタビュー記事 |
| `https://www.freelance-jp.org/talents/12828` | フリーランス協会 | 会員プロフィール |
| （X / Twitter URL） | X | あれば追加 |
| （LinkedIn URL） | LinkedIn | あれば追加 |

---

## 4. Organization JSON-LD（会社情報）

**埋め込み先:** `/company` ページ（詳細版）、`layout.tsx`（簡易版・全ページ共通）
**@id:** `https://ooya.tech/company#organization`

### /company ページ（詳細版）

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://ooya.tech/company#organization",
  "name": "株式会社StartupMarketing",
  "alternateName": "大家DX",
  "url": "https://ooya.tech",
  "logo": "https://ooya.tech/img/logo_250709_2.png",
  "description": "不動産オーナー向けの業務効率化ツール「大家DX」の開発・運営...",
  "foundingDate": "2020-09-29",
  "address": {
    "@type": "PostalAddress",
    "postalCode": "330-9501",
    "addressRegion": "埼玉県",
    "addressLocality": "さいたま市大宮区",
    "streetAddress": "桜木町2丁目3番地 大宮マルイ7階",
    "addressCountry": "JP"
  },
  "founder": {
    "@type": "Person",
    "@id": "https://ooya.tech/profile#person",
    "name": "Tetsuro Togo"
  },
  "numberOfEmployees": { "@type": "QuantitativeValue", "value": 1 }
}
```

### layout.tsx（簡易版・全ページ共通）

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://ooya.tech/company#organization",
  "name": "大家DX",
  "url": "https://ooya.tech",
  "logo": "https://ooya.tech/img/logo_250709_2.png",
  "description": "賃貸経営のためのシミュレーションツール・計算ツールを提供",
  "founder": {
    "@type": "Person",
    "@id": "https://ooya.tech/profile#person",
    "name": "Tetsuro Togo"
  },
  "sameAs": []
}
```

### sameAs に追加候補（Organization）

| URL | サービス | 信頼度 |
|-----|---------|-------|
| `https://www.tokyo-cci.or.jp/shachonet/profile/2454.html` | 東京商工会議所 | 高（公的機関） |
| `https://www.saitamadx.com/dx-partner/solution/348/` | 埼玉県DXパートナー | 高（県認定） |
| `https://www.amatias.com/asp/navi.asp?s_code=S0006864` | さいたま商工会議所 | 高（公的機関） |
| `https://stib.jp/member/name-list/?s=StartupMarketing` | さいたま観光国際協会 | 中 |
| `https://www.city.saitama.lg.jp/006/007/002/008/p062519.html` | さいたま市CS・SDGs | 高（市公式） |
| `https://www.jutaku-s.com/newsp/id/0000064588` | 住宅新報社 | 高（業界メディア） |
| `https://saitama.publishing.3rd-in.co.jp/article/2aa1cd40-a89a-11f0-88f0-9ca3ba0a67df` | saitamaDays | 中 |

---

## 5. 記事ページの @id 参照

**対象:** `/media/[category]/[slug]/page.tsx`

```json
{
  "@type": "Article",
  "author": {
    "@type": "Person",
    "@id": "https://ooya.tech/profile#person",
    "name": "Tetsuro Togo",
    "url": "https://ooya.tech/profile"
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://ooya.tech/company#organization",
    "name": "大家DX",
    "url": "https://ooya.tech",
    "logo": { "@type": "ImageObject", "url": "https://ooya.tech/img/logo_250709_2.png" }
  }
}
```

---

## 6. 計算ツールの @id 参照

**対象:** 全30+ツールページ（`ToolStructuredData.tsx` で一括管理）

```json
{
  "@type": "SoftwareApplication",
  "author": { "@type": "Person", "@id": "...#person" },
  "provider": { "@type": "Organization", "@id": "...#organization" }
}
```

---

## 7. WebSite JSON-LD（全ページ共通）

**埋め込み先:** `layout.tsx`

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "大家DX",
  "url": "https://ooya.tech",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ooya.tech/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

---

## 8. 今後の改善候補

| 項目 | 説明 | 優先度 |
|------|------|--------|
| **sameAs 追加** | Person / Organization に外部URLを追加して実在性を証明 | 高 |
| **ContactPoint** | Organization にメール・電話の問い合わせ先を追加 | 中 |
| **FAQPage 拡充** | まだFAQを入れていないツールページに追加 | 中 |
| **HowTo** | ツール使い方ガイドにリッチリザルト表示 | 低 |
| **メディア画像直接埋め込み** | フジテレビ出演画像等をページに直接表示 | 低 |
| **.htaccess リダイレクト修正** | startup-marketing.co.jp → /profile への直接リダイレクト | 低（別途対応） |

---

## 9. E-E-A-T チェーン図

```
┌─────────────────────────────────────────────────────┐
│  全ページ (layout.tsx)                                │
│  Organization @id ─── founder ──→ Person @id         │
└─────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────────┐
│  /company        │          │  /profile            │
│  Organization    │◄─────────│  Person              │
│  全データ（正本） │  worksFor │  全データ（正本）     │
│  住所/設立日/etc │          │  経歴/専門/実績       │
└─────────────────┘          └─────────────────────┘
         ▲                              ▲
         │ publisher                    │ author
┌─────────────────────────────────────────────────────┐
│  記事ページ / 計算ツール / ガイド                      │
│  author → @id: /profile#person                      │
│  publisher/provider → @id: /company#organization    │
└─────────────────────────────────────────────────────┘
```
