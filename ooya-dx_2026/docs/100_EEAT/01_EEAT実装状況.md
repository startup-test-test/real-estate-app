# E-E-A-T 実装状況

## 概要

E-E-A-T（Experience, Expertise, Authoritativeness, Trustworthiness）は Google の検索品質評価ガイドラインにおける重要な評価基準。大家DXでは構造化データ（JSON-LD）とページコンテンツの両面で E-E-A-T シグナルを強化している。

## 構造化データチェーン

記事 → Person（著者） → Organization（会社）の参照チェーンを構築。

```
Article (@id)
  └─ author → Person (@id: /profile#person)
       └─ worksFor → Organization (@id: /company#organization)
```

### 実装ファイル

| ファイル | 内容 |
|---------|------|
| `lib/eeat.ts` | 構造化データ定数の一元管理 |
| `app/layout.tsx` | サイト全体の Organization + WebSite JSON-LD |
| `app/company/page.tsx` | 会社詳細の Organization JSON-LD |
| `app/profile/page.tsx` | Person JSON-LD（著者情報） |
| `app/media/[category]/[slug]/page.tsx` | 記事ごとの Article JSON-LD |

## Article（記事）

- **対象ページ**: `/media/[category]/[slug]`
- author → `personJsonLd`（@id参照）
- publisher → `articlePublisherRef`（Organization @id参照）

## Google検証状況

| 日付 | ページ | 結果 |
|------|--------|------|
| 2026-02-10 | / (トップ) | Organization 有効（リッチリザルト対象） |
| 2026-02-10 | /company | Organization 有効 |
| 2026-02-10 | /profile | Person + hasCredential 確認待ち |

## 関連ドキュメント

- [02_プロフィール（Person）](./02_プロフィール.md)
- [03_会社情報（Organization）](./03_会社情報.md)

## 今後の改善候補

- [ ] ファイナンシャルアカデミー・ヤモリの学習実績を Person JSON-LD に追加
- [ ] 記事ページの author 表示を充実（著者プロフィールカード等）
- [ ] レビュー・評価の構造化データ追加検討
