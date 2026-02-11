# SEO Skills 概要（marketingskills マーケットプレイス）

> **ソース**: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
> **インストール**: `/plugin marketplace add coreyhaines31/marketingskills`
> **ステータス**: 未インストール

---

## 1. seo-audit（SEO監査）

サイト全体のSEO問題を体系的に診断するスキル。

### 監査の流れ（優先度順）

1. **クロール・インデックス** — robots.txt、サイトマップ、サイト構造
2. **テクニカルSEO** — Core Web Vitals、モバイル対応、HTTPS、URL構造
3. **オンページSEO** — title、meta description、見出し階層、内部リンク、キーワード配置
4. **コンテンツ品質** — E-E-A-T評価、コンテンツの網羅性
5. **権威性シグナル** — 被リンク、信頼性

### 参考ファイル（スキル内蔵）

- `references/aeo-geo-patterns.md` — AEO/GEOパターン
- `references/ai-writing-detection.md` — AI生成コンテンツ検出対策

### このプロジェクトでの活用案

- [ ] 各計算ツールページのtitle/h1/meta最適化
- [ ] E-E-A-T構造化データの抜け漏れチェック
- [ ] Core Web Vitals改善ポイントの特定

---

## 2. programmatic-seo（プログラマティックSEO）

テンプレート＋データで大量のSEOページを効率的に生成するスキル。

### 5つの原則

1. 各ページに**固有の価値**が必要（変数差し替えだけはNG）
2. **独自データ**があるほど競争優位
3. サブドメインよりサブフォルダ（`/tools/xxx`）推奨
4. 検索意図とページ内容を一致させる
5. **量より質**（薄いページ1万より良質100ページ）

### 12のテンプレート戦略

| 戦略 | 説明 |
|------|------|
| Templates | テンプレートベースの量産 |
| Curation | キュレーション型 |
| Conversions | コンバージョン最適化型 |
| Comparisons | 比較型 |
| Examples | 事例・サンプル型 |
| Locations | ロケーション別 |
| Personas | ペルソナ別 |
| Integrations | 連携・統合型 |
| Glossary | 用語集型 |
| Translations | 多言語型 |
| Directory | ディレクトリ型 |
| Profiles | プロフィール型 |

### 参考ファイル（スキル内蔵）

- `references/playbooks.md` — 各戦略の詳細プレイブック

### このプロジェクトでの活用案

- [ ] エリア別利回りシミュレーションページ量産
- [ ] 物件種別の税金計算ページ生成
- [ ] 不動産用語集ページの体系的作成

---

## 3. schema-markup（構造化データ）

JSON-LDの追加・最適化に特化したスキル。

### 対応スキーマ一覧

| スキーマ | 用途 | 必須プロパティ |
|---------|------|--------------|
| Organization | 会社情報 | name, url, logo |
| WebSite | サイト全体 | name, url |
| Article | ブログ・記事 | headline, author, datePublished |
| Product | 商品・サービス | name, description |
| SoftwareApplication | ツール・アプリ | name, applicationCategory |
| FAQPage | よくある質問 | mainEntity |
| HowTo | 手順解説 | name, step |
| BreadcrumbList | パンくず | itemListElement |
| LocalBusiness | 地域ビジネス | name, address |
| Event | イベント | name, startDate |

### 技術ポイント

- **推奨形式**: JSON-LD（Googleも推奨）
- **Next.js**: SSRで出力が必須（クライアントサイドレンダリングではクロールされない場合あり）
- **複合スキーマ**: `@graph` で複数スキーマを1つのscriptタグに結合可能
- **検証ツール**: Google Rich Results Test、Schema.org Validator、Search Console

### 参考ファイル（スキル内蔵）

- `references/schema-examples.md` — 各スキーマの実装例

### このプロジェクトでの活用案

- [ ] 既存E-E-A-T JSON-LD（Person/Organization）の検証・改善
- [ ] 各計算ツールにSoftwareApplicationスキーマ追加
- [ ] FAQPageスキーマの追加
- [ ] BreadcrumbListの最適化

---

## 4. competitor-alternatives（競合比較ページ）

競合サービスとの比較・代替ページを作成するスキル。

### 4つのページ形式

| URL形式 | 内容 | 検索意図 |
|---------|------|---------|
| `/alternatives/[競合]` | なぜ代替を探すのか＋乗り換え方法 | 「○○ 代替」 |
| `/alternatives/[競合]-alternatives` | 4〜7つの選択肢を比較基準付きで紹介 | 「○○ alternatives」 |
| `/vs/[競合]` | 自社 vs 競合の直接比較 | 「○○ vs △△」 |
| `/compare/[A]-vs-[B]` | 他社同士の比較で検索流入を獲得 | 「A vs B」 |

### 重要原則

- 競合の強みも**正直に認める**
- 機能表だけでなく**実質的な分析**を提供
- TL;DR、詳細比較、価格、推奨ユーザー層、移行ガイドを含める
- **四半期ごと**に価格更新、**年次**で包括的リフレッシュ

### 参考ファイル（スキル内蔵）

- `references/content-architecture.md` — コンテンツ構造設計
- `references/templates.md` — ページテンプレート

### このプロジェクトでの活用案

- [ ] 他社不動産投資シミュレーターとの比較ページ
- [ ] 「楽待 vs 健美家」等の比較コンテンツ
- [ ] 不動産投資ツール比較ディレクトリ

---

## 優先度（推奨）

| 優先度 | スキル | 理由 |
|--------|--------|------|
| **高** | schema-markup | 既存E-E-A-T作業と直結、すぐ活用可能 |
| **高** | seo-audit | 全ページの品質底上げ |
| **中** | programmatic-seo | ページ量産フェーズで活用 |
| **低** | competitor-alternatives | コンテンツマーケティングフェーズで活用 |
