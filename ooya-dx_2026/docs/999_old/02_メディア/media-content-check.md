# メディア記事 コンテンツ確認チェックリスト

作成日: 2026-01-13

## 概要

localhost と本番（https://ooya.tech/media/）の記事内容が一致しているかを確認する。

---

## 確認URL一覧

### 不動産投資の基礎知識 (base) - 10記事

| # | 記事名 | localhost | 本番 | 確認状態 |
|---|--------|-----------|------|----------|
| 1 | レントロール雛形 | [localhost](http://localhost:3002/media/base/rent-roll-template) | [本番](https://ooya.tech/media/base/rent-roll-template/) | ✅ 確認済み |
| 2 | 見積もりシミュレーション | [localhost](http://localhost:3002/media/base/estimate-simulation) | [本番](https://ooya.tech/media/base/estimate-simulation/) | ✅ 確認済み |
| 3 | 会計ソフト7選 | [localhost](http://localhost:3002/media/base/accounting-software) | [本番](https://ooya.tech/media/base/accounting-software/) | ✅ 確認済み |
| 4 | 失敗2ch | [localhost](http://localhost:3002/media/base/failure-2ch) | [本番](https://ooya.tech/media/base/failure-2ch/) | ⬜ 未確認 |
| 5 | やめとけ2ch | [localhost](http://localhost:3002/media/base/bad-2ch) | [本番](https://ooya.tech/media/base/bad-2ch/) | ⬜ 未確認 |
| 6 | 実需とは | [localhost](http://localhost:3002/media/base/end-user-real-estate) | [本番](https://ooya.tech/media/base/end-user-real-estate/) | ⬜ 未確認 |
| 7 | プロフィールシート | [localhost](http://localhost:3002/media/base/profile-sheet-template) | [本番](https://ooya.tech/media/base/profile-sheet-template/) | ⬜ 未確認 |
| 8 | スプレッドシート | [localhost](http://localhost:3002/media/base/spreadsheet) | [本番](https://ooya.tech/media/base/spreadsheet/) | ⬜ 未確認 |
| 9 | エクセルテンプレート | [localhost](http://localhost:3002/media/base/excel-template) | [本番](https://ooya.tech/media/base/excel-template/) | ⬜ 未確認 |
| 10 | 根抵当権 | [localhost](http://localhost:3002/media/base/neteitou_yabai) | [本番](https://ooya.tech/media/base/neteitou_yabai/) | ⬜ 未確認 |

### ボロ戸建て投資 (kodate) - 3記事

| # | 記事名 | localhost | 本番 | 確認状態 |
|---|--------|-----------|------|----------|
| 11 | 自己資金 | [localhost](http://localhost:3002/media/kodate/zikoshikin) | [本番](https://ooya.tech/media/kodate/zikoshikin/) | ⬜ 未確認 |
| 12 | 公庫融資 | [localhost](http://localhost:3002/media/kodate/kouko) | [本番](https://ooya.tech/media/kodate/kouko/) | ⬜ 未確認 |
| 13 | リフォーム費用 | [localhost](http://localhost:3002/media/kodate/reform) | [本番](https://ooya.tech/media/kodate/reform/) | ⬜ 未確認 |

### カテゴリページ

| # | ページ名 | localhost | 本番 | 確認状態 |
|---|----------|-----------|------|----------|
| 14 | メディアトップ | [localhost](http://localhost:3002/media) | [本番](https://ooya.tech/media/) | ⬜ 未確認 |
| 15 | 基礎知識カテゴリ | [localhost](http://localhost:3002/media/base) | [本番](https://ooya.tech/media/base/) | ⬜ 未確認 |
| 16 | ボロ戸建カテゴリ | [localhost](http://localhost:3002/media/kodate) | [本番](https://ooya.tech/media/kodate/) | ⬜ 未確認 |

---

## 確認項目

各記事で以下を確認：

- [ ] タイトルが一致
- [ ] 本文が一致
- [ ] 見出し構造が一致
- [ ] 画像が表示される
- [ ] リンクが正しく動作

---

## 確認記録

### 1. レントロール雛形 (rent-roll-template)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ✅ | 一致 |
| 本文 | ✅ | 一致 |
| 見出し | ✅ | 一致 |
| 画像 | ✅ | サムネイル表示OK |
| リンク | ⚠️ | target="_blank" 修正必要 |

**確認日**: 2026-01-13
**確認者**: -
**結果**: ✅ OK（リンク修正必要）

---

### 2. 見積もりシミュレーション (estimate-simulation)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ✅ | 一致 |
| 本文 | ✅ | 一致 |
| 見出し | ✅ | 一致 |
| 画像 | ✅ | サムネイル表示OK |
| リンク | ✅ | target="_blank" 修正済み |

**確認日**: 2026-01-13
**確認者**: -
**結果**: ✅ OK

---

### 3. 会計ソフト7選 (accounting-software)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ✅ | 一致 |
| 本文 | ✅ | 一致 |
| 見出し | ✅ | 一致 |
| 画像 | ✅ | サムネイル表示OK |
| リンク | ✅ | target="_blank" 修正済み |

**確認日**: 2026-01-13
**確認者**: -
**結果**: ✅ OK

---

### 4. 失敗2ch (failure-2ch)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 5. やめとけ2ch (bad-2ch)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 6. 実需とは (end-user-real-estate)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 7. プロフィールシート (profile-sheet-template)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 8. スプレッドシート (spreadsheet)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 9. エクセルテンプレート (excel-template)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 10. 根抵当権 (neteitou_yabai)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 11. 自己資金 (zikoshikin)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 12. 公庫融資 (kouko)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

### 13. リフォーム費用 (reform)

| 項目 | 状態 | 備考 |
|------|------|------|
| タイトル | ⬜ | - |
| 本文 | ⬜ | - |
| 見出し | ⬜ | - |
| 画像 | ⬜ | - |
| リンク | ⬜ | - |

**確認日**: -
**確認者**: -
**結果**: 未確認

---

## 進捗サマリー

| カテゴリ | 総数 | 確認済み | 未確認 |
|----------|------|----------|--------|
| base | 10 | 3 | 7 |
| kodate | 3 | 0 | 3 |
| カテゴリページ | 3 | 0 | 3 |
| **合計** | **16** | **3** | **13** |

---

## 修正が必要な項目

| 記事 | 項目 | 内容 |
|------|------|------|
| 全記事 | リンク | target="_blank" 追加 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-13 | 初版作成、rent-roll-template 確認完了 |
