# サイトマップ

作成日: 2026-01-08

## 概要

- **総ページ数**: 約40ページ
- **公開ページ**: ランディング、メディア、ツール、法的ページ
- **認証ページ**: ログイン、サインアップ、パスワードリセット
- **会員ページ**: マイページ、シミュレーター、課金

---

## 公開ページ（認証不要）

### トップ・ランディング

| ページ | URL | 説明 |
|--------|-----|------|
| トップページ | `/` | ランディングページ |
| 料金プラン | `/pricing` | 料金・プラン説明 |
| お問い合わせ | `/contact` | お問い合わせフォーム |
| FAQ | `/faq` | よくある質問 |
| 免責事項 | `/disclaimer` | 免責事項 |

### 法的ページ

| ページ | URL | 説明 |
|--------|-----|------|
| 利用規約 | `/legal/terms` | 利用規約 |
| プライバシーポリシー | `/legal/privacy` | プライバシーポリシー |
| 特定商取引法 | `/legal/tokushoho` | 特定商取引法に基づく表記 |

### ツール（公開）

| ページ | URL | 説明 |
|--------|-----|------|
| ツール一覧 | `/tools` | 無料ツール一覧 |
| 仲介手数料計算 | `/tools/brokerage` | 仲介手数料計算機 |
| 仲介手数料（標準） | `/tools/brokerage/standard` | 標準仲介手数料計算 |

---

## メディア（16ページ）

### トップ・カテゴリ

| ページ | URL | 説明 |
|--------|-----|------|
| メディアトップ | `/media` | 全記事一覧 |
| 不動産投資の基礎知識 | `/media/base` | カテゴリページ（10記事） |
| ボロ戸建て投資 | `/media/kodate` | カテゴリページ（3記事） |

### 記事ページ（13記事）

#### 不動産投資の基礎知識 (base)

| タイトル | URL |
|----------|-----|
| レントロール雛形 | `/media/base/rent-roll-template` |
| 見積もりシミュレーション | `/media/base/estimate-simulation` |
| 会計ソフト7選 | `/media/base/accounting-software` |
| 失敗2ch | `/media/base/failure-2ch` |
| やめとけ2ch | `/media/base/bad-2ch` |
| 実需とは | `/media/base/end-user-real-estate` |
| プロフィールシート | `/media/base/profile-sheet-template` |
| スプレッドシート | `/media/base/spreadsheet` |
| エクセルテンプレート | `/media/base/excel-template` |
| 根抵当権 | `/media/base/neteitou_yabai` |

#### ボロ戸建て投資 (kodate)

| タイトル | URL |
|----------|-----|
| 自己資金 | `/media/kodate/zikoshikin` |
| 公庫融資 | `/media/kodate/kouko` |
| リフォーム費用 | `/media/kodate/reform` |

---

## 認証ページ

| ページ | URL | 説明 |
|--------|-----|------|
| ログイン | `/auth/signin` | ログインフォーム |
| 新規登録 | `/auth/signup` | 新規会員登録 |
| パスワードを忘れた | `/auth/forgot-password` | パスワードリセット申請 |
| パスワードリセット | `/auth/neon-password-reset` | パスワード再設定 |
| メール認証完了 | `/auth/email-verified` | メール認証完了画面 |

---

## 会員専用ページ（認証必要）

### マイページ

| ページ | URL | 説明 |
|--------|-----|------|
| マイページトップ | `/mypage` | マイページトップ |
| 使い方ガイド | `/mypage/guide` | シミュレーター使い方 |
| シミュレーター | `/mypage/simulator` | 物件シミュレーター |
| 課金管理 | `/mypage/billing` | サブスクリプション管理 |

### その他会員ページ

| ページ | URL | 説明 |
|--------|-----|------|
| ダッシュボード | `/dashboard` | ダッシュボード |
| シミュレーター（旧） | `/simulator` | 旧シミュレーターURL |
| 課金（旧） | `/billing` | 旧課金URL |

---

## ページ数サマリー

| カテゴリ | ページ数 |
|----------|----------|
| 公開ページ（トップ・法的・ツール） | 11 |
| メディア（トップ+カテゴリ+記事） | 16 |
| 認証ページ | 5 |
| 会員専用ページ | 6 |
| **合計** | **38ページ** |

---

## URL構造

```
/                           # トップ
├── pricing                 # 料金
├── contact                 # お問い合わせ
├── faq                     # FAQ
├── disclaimer              # 免責事項
│
├── legal/
│   ├── terms              # 利用規約
│   ├── privacy            # プライバシー
│   └── tokushoho          # 特商法
│
├── tools/
│   └── brokerage/
│       └── standard       # 仲介手数料
│
├── media/
│   ├── base/              # カテゴリ
│   │   ├── rent-roll-template
│   │   ├── estimate-simulation
│   │   └── ...（10記事）
│   └── kodate/            # カテゴリ
│       ├── zikoshikin
│       ├── kouko
│       └── reform
│
├── auth/
│   ├── signin
│   ├── signup
│   ├── forgot-password
│   ├── neon-password-reset
│   └── email-verified
│
├── mypage/
│   ├── guide
│   ├── simulator
│   └── billing
│
├── dashboard
├── simulator
└── billing
```
