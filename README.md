# 🏢 大家DX - 不動産投資SaaSプラットフォーム

AI搭載の包括的不動産投資プラットフォーム

---

## ⚠️ 【重要なお知らせ】機能の一時メンテナンスについて

サービス品質向上のため、以下の機能を一時的にメンテナンス中とさせていただいております。

- **AI市場分析** - メンテナンス中
- **公示地価検索** - メンテナンス中
- **有料プラン（ベーシックプラン）** - 現在無料プランのみ提供しております

※ **収益シミュレーター**は通常通りご利用いただけます

---

## 📋 プロジェクト構成

### アーキテクチャ概要
- **フロントエンド**: React + TypeScript + Vite (bolt_front)
- **バックエンド**: FastAPI + Streamlit (backend)
- **認証**: Supabase Auth（モック対応）
- **外部API**: 国土交通省不動産情報ライブラリ、OpenAI

## 🚀 デプロイ状況

### ✅ 稼働中
- **Simulator API**: https://real-estate-app-1-iii4.onrender.com
- **フロントエンドアプリ**: React SPA (Vite開発サーバー)
- **不動産検索ツール**: Streamlit アプリ

## 📁 フォルダ構成

```
real-estate-app/
├── bolt_front/                      # メインフロントエンドアプリ
│   ├── src/
│   │   ├── components/              # 共通コンポーネント
│   │   ├── pages/                   # ページコンポーネント
│   │   ├── hooks/                   # カスタムフック
│   │   ├── types/                   # TypeScript型定義
│   │   ├── utils/                   # ユーティリティ関数
│   │   ├── constants/               # 定数・設定データ
│   │   └── lib/                     # ライブラリ設定
│   ├── dev-tools/                   # 開発・デバッグツール
│   ├── test-data/                   # テストデータ・自動テスト
│   ├── supabase/                    # データベーススキーマ
│   │   └── archive/                 # 過去のスキーマファイル
│   ├── package.json
│   ├── vite.config.ts              # 最適化済みビルド設定
│   └── .env                        # 環境変数
├── backend/
│   ├── simulator-api/              # FastAPIメインアプリ
│   │   ├── app.py                  # シミュレーションAPI
│   │   └── requirements.txt
│   ├── property-api/               # 不動産データ検索
│   │   ├── streamlit_app.py        # Streamlitアプリ
│   │   └── real_estate_client.py   # 不動産APIクライアント
│   └── shared/                     # 共通設定
│       └── config/settings.py
├── docs/                           # API仕様書・管理シート
└── 参考キャプチャー/                 # UI設計参考資料
```

## 🛠️ 開発環境セットアップ

### 前提条件
- Node.js 18+
- Python 3.11+
- npm または yarn

### フロントエンド起動
```bash
cd bolt_front
npm install
npm run dev
```

### バックエンドAPI起動
```bash
cd backend/simulator-api
pip install -r requirements.txt
uvicorn app:app --reload
```

### 不動産検索ツール起動
```bash
cd backend/property-api
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## ⚙️ 環境変数設定

### フロントエンド (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### バックエンド
```
OPENAI_API_KEY=your_openai_key
REAL_ESTATE_API_KEY=your_real_estate_api_key
```

## 🎯 主要機能

### ✅ 実装済み
- **投資シミュレーション**: IRR、CCR、DSCR等の指標計算
- **市場分析**: 人口動態・駅別利用者数分析
- **取引価格検索**: 国土交通省データ連携
- **キャッシュフロー分析**: 年次詳細シミュレーション
- **ユーザー管理**: Supabase認証（モック対応）
- **レスポンシブUI**: モバイルファーストデザイン

### 🔄 継続改善
- パフォーマンス最適化
- ユーザビリティ向上
- 新機能追加

## 📖 技術スタック

### フロントエンド
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite（最適化済み）
- **UI**: Tailwind CSS + Lucide React
- **データ可視化**: Chart.js + react-chartjs-2
- **ルーティング**: React Router
- **認証**: Supabase Auth

### バックエンド
- **API**: FastAPI + Python 3.11
- **ツール**: Streamlit
- **デプロイ**: Render
- **データベース**: Supabase（設定済み）

### 外部連携
- 国土交通省不動産情報ライブラリ
- OpenAI API

## 🚀 デプロイ

### フロントエンド
- GitHub Pages / Vercel / Netlify 対応
- 最適化済みビルド設定（チャンク分割、minify済み）

### バックエンド
- Render でのPythonアプリデプロイ
- 自動CI/CDパイプライン

## 🔧 技術的特徴

### パフォーマンス最適化
- Vite手動チャンク分割でキャッシュ効率向上
- バンドルサイズ最適化（624kB → 163kB）
- Tree shaking & Dead code elimination

### 型安全性
- 統合TypeScript型定義
- 実用的な日本語ベース型システム
- Supabaseスキーマ連携準備済み

### 開発効率
- 最新のフロントエンド開発環境
- ホットリロード対応
- ESLint・Prettier設定準備

## 📞 サポート

開発に関する質問は Issue を作成してください。

## 📝 ライセンス

Private - All rights reserved