# 大家DX 移行プロジェクト進捗

**最終更新:** 2026-01-06

---

## 概要

Vite + Supabase + Render 構成から、Next.js + Neon + Vercel 構成への移行プロジェクト。

---

## アーキテクチャ変更

### Before（旧構成）
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Render    │    │  Supabase   │
│  (Vite)     │───▶│  (FastAPI)  │    │  (DB/Auth)  │
│ bolt_front  │    │  Python API │    │  Storage    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### After（新構成）
```
┌─────────────────────────────────────┐    ┌─────────────┐
│              Vercel                  │    │    Neon     │
│  ┌──────────┐  ┌──────┐  ┌───────┐  │    │ ┌─────────┐ │
│  │ Next.js  │  │Python│  │ Blob  │  │───▶│ │PostgreSQL│ │
│  │ Frontend │  │ API  │  │ 画像  │  │    │ │Neon Auth│ │
│  └──────────┘  └──────┘  └───────┘  │    │ └─────────┘ │
└─────────────────────────────────────┘    └─────────────┘
```

---

## コスト比較

| 項目 | 旧構成 | 新構成 |
|------|--------|--------|
| Vercel | 無料（Hobby） | **$20/月（Pro）** |
| Render | 無料〜有料 | **不要** |
| Supabase | 無料 | **不要** |
| Neon | - | **無料** |
| **合計** | 変動 | **$20/月** |

---

## 進捗状況

### ✅ 完了

#### 1. Next.js プロジェクト作成
- startpack テンプレートをベースに `ooya-dx_2026` フォルダを作成
- Neon Auth 対応の認証基盤を含む

#### 2. コード移植
- 全ページファイルを移植（app/ ディレクトリ）
- 全コンポーネントを移植（components/）
- hooks, lib, types を移植

#### 3. Next.js 対応修正
- `react-router-dom` → `next/navigation` に変換
- `import.meta.env` → `process.env` に変換
- SSRエラー修正（window/localStorage/document）
- Supabase関連フックは `@ts-nocheck` で一時無効化

#### 4. API設定
- ローカル/Vercel環境でRender開発APIを使用するよう設定
- `lib/config/api.ts` でAPI URLを管理

#### 5. Basic認証実装
- Vercelプレビュー環境用のBasic認証をMiddlewareに実装
- `ooya.tech` / `localhost` ではスキップ
- 環境変数: `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`

#### 6. Vercelデプロイ
- プロジェクト接続完了
- **URL:** https://real-estate-nsf66mvj1-ooya-techs-projects.vercel.app/
- Basic認証: `preview` / `preview`
- シミュレーター動作確認済み（Render API使用）

---

### ⏳ 未完了

#### 1. Python API移行（Render → Vercel）
**目的:** RenderのFastAPIをVercel Python Functionsに移行

**対象ファイル:**
- `backend/simulator-api/app.py`
- `backend/simulator-api/shared/calculations.py`
- `backend/simulator-api/validations.py`

**移行先:**
```
ooya-dx_2026/
└── api/
    ├── simulate.py
    ├── market-analysis.py
    └── requirements.txt
```

#### 2. Neon Auth実装
**目的:** Supabase AuthからNeon Authへ移行

**作業内容:**
- `useSupabaseAuth.ts` → Neon Auth用に書き換え
- AuthProvider設定
- ログイン/サインアップページ対応
- セッション管理

#### 3. Vercel Blob で画像保存
**目的:** Supabase StorageからVercel Blobへ移行

**作業内容:**
- `useImageUpload.ts` → Vercel Blob用に書き換え
- Base64フォールバック削除
- 画像URLをDBに保存

#### 4. データ移行
**目的:** SupabaseのデータをNeonに移行

**対象テーブル:**
- users
- simulations
- 他

#### 5. 本番ドメイン切り替え
**目的:** `ooya.tech` を新プロジェクトに向ける

**手順:**
1. 新プロジェクトで全機能動作確認
2. Vercelで `ooya.tech` ドメインを新プロジェクトに追加
3. 旧プロジェクトからドメインを削除

---

## 環境変数一覧

### 必須
| 変数名 | 説明 | 設定状況 |
|--------|------|----------|
| `DATABASE_URL` | Neon接続文字列 | ✅ |
| `NEXT_PUBLIC_NEON_AUTH_URL` | Neon Auth URL | ✅ |
| `BASIC_AUTH_USER` | プレビュー認証ユーザー | ✅ |
| `BASIC_AUTH_PASSWORD` | プレビュー認証パスワード | ✅ |

### オプション（後で設定）
| 変数名 | 説明 | 設定状況 |
|--------|------|----------|
| `NEON_API_TOKEN` | 退会機能用 | ⏳ |
| `NEON_PROJECT_ID` | 退会機能用 | ⏳ |
| `STRIPE_SECRET_KEY` | 決済機能 | ⏳ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 決済機能 | ⏳ |
| `RESEND_API_KEY` | メール送信 | ⏳ |

---

## ファイル構成

```
ooya-dx_2026/
├── app/                      # Next.js App Router
│   ├── page.tsx              # トップページ
│   ├── simulator/            # シミュレーター
│   ├── dashboard/            # マイページ
│   ├── auth/                 # 認証ページ
│   ├── billing/              # 決済ページ
│   └── api/                  # APIルート（Next.js）
├── components/               # UIコンポーネント
├── hooks/                    # カスタムフック
├── lib/                      # ユーティリティ
│   ├── auth/                 # 認証ロジック
│   ├── config/               # 設定ファイル
│   └── utils/                # ヘルパー関数
├── types/                    # TypeScript型定義
├── prisma/                   # DBスキーマ
├── docs/                     # ドキュメント
├── middleware.ts             # Basic認証等
└── .env                      # 環境変数（gitignore）
```

---

## 参考リンク

- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Neon Auth ドキュメント](https://neon.tech/docs/guides/neon-authorize)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

---

## 次のアクション

1. **Python API移行** - シミュレーションAPIをVercelに移行
2. **Neon Auth実装** - ログイン機能を有効化
3. **動作テスト** - 全機能の動作確認
4. **ドメイン切り替え** - ooya.tech を新プロジェクトに
