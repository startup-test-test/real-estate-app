# 🏢 不動産投資プラットフォーム

AI搭載の総合不動産投資プラットフォーム

## 📋 プロジェクト構成

### Backend APIs
- **simulator-api**: 投資シミュレーション・市場分析
- **property-api**: 物件検索・情報管理 (開発予定)
- **auth-api**: 認証・ユーザー管理 (開発予定)
- **payment-api**: 決済・サブスクリプション (開発予定)

### Frontend
- **simulator**: 投資シミュレーター画面
- **property-search**: 物件検索画面 (開発予定)
- **dashboard**: ユーザーダッシュボード (開発予定)
- **auth**: 認証画面 (開発予定)

## 🚀 デプロイ状況

### ✅ 稼働中
- **Simulator API**: https://real-estate-app-1-iii4.onrender.com
- **Simulator Frontend**: `/frontend/simulator/index.html`

### 🔄 開発予定
- Property API
- Auth API
- Payment API
- 統合フロントエンド

## 📁 フォルダ構成

```
real-estate-platform/
├── backend/
│   ├── shared/              # 共通モジュール
│   ├── simulator-api/       # 投資シミュレーター (稼働中)
│   ├── property-api/        # 物件検索API (開発予定)
│   ├── auth-api/           # 認証API (開発予定)
│   └── payment-api/        # 決済API (開発予定)
├── frontend/
│   ├── shared/             # 共通フロントエンド
│   ├── simulator/          # シミュレーター (稼働中)
│   ├── property-search/    # 物件検索 (開発予定)
│   ├── dashboard/          # ダッシュボード (開発予定)
│   └── auth/              # 認証画面 (開発予定)
├── docs/                   # ドキュメント
└── scripts/               # 開発スクリプト
```

## 🛠️ 開発環境

### 必要な環境変数
```bash
# Simulator API
REAL_ESTATE_API_KEY=your_key
OPENAI_API_KEY=your_key

# Firebase (開発予定)
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_key

# Stripe (開発予定)
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_secret
```

## 📖 使用技術

### Backend
- FastAPI
- Python 3.11+
- Render (デプロイ)

### Frontend
- HTML5 / CSS3 / JavaScript
- 将来的にReact/Vue.js移行検討

### 外部API
- 国土交通省不動産取引価格情報API
- OpenAI GPT API
- Firebase Auth (予定)
- Stripe API (予定)

## 🎯 機能一覧

### ✅ 実装済み
- 投資シミュレーション計算
- 市場分析・価格評価
- キャッシュフロー予測
- レスポンシブデザイン

### 🔄 開発予定
- ユーザー認証・管理
- 物件検索・フィルタリング
- お気に入り物件管理
- 月額サブスクリプション
- 詳細レポート出力

## 📞 サポート

開発に関する質問は Issue を作成してください。