# AI市場分析 Render本番デプロイ設定

## 1. Renderサービス作成

### Web Service設定
- **Repository**: GitHub連携 (`real-estate-app`)
- **Branch**: `main`
- **Runtime**: Python 3
- **Build Command**: `cd backend/property-api && pip install -r requirements.txt`
- **Start Command**: `cd backend/property-api && uvicorn app:app --host 0.0.0.0 --port $PORT`

## 2. 必須環境変数

### API Keys
```
VITE_REAL_ESTATE_API_KEY=your_real_estate_api_key
CHATGPT_REAL_ESTATE_250922=your_openai_api_key
OPENAI_API_KEY=your_openai_api_key (バックアップ)
```

### Database (Supabase)
```
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### その他設定
```
ENVIRONMENT=production
PORT=10000 (Renderが自動設定)
```

## 3. ビルド設定詳細

### ディレクトリ構造
```
real-estate-app/
├── backend/property-api/
│   ├── app.py (メインアプリケーション)
│   ├── requirements.txt
│   ├── Procfile
│   ├── real_estate_client.py
│   └── ml_analysis.py
└── bolt_front/ (フロントエンド)
```

### Build Command詳細
```bash
cd backend/property-api && pip install -r requirements.txt
```

### Start Command詳細
```bash
cd backend/property-api && uvicorn app:app --host 0.0.0.0 --port $PORT
```

## 4. 依存関係 (requirements.txt)

```txt
fastapi==0.99.1
uvicorn[standard]==0.23.2
requests==2.31.0
python-dotenv==1.0.1
openai==0.28.1
pydantic==1.10.13
aiohttp==3.9.1
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
scipy==1.11.1
```

## 5. CORS設定済み

以下ドメインからのアクセスを許可:
- `localhost` (開発環境)
- `*.app.github.dev` (Codespaces)
- `dev.ooya.tech` (ステージング)
- `ooya.tech` (本番)

## 6. API エンドポイント

### 基本機能
- `GET /`: ヘルスチェック
- `GET /docs`: Swagger UI

### 不動産データ
- `GET /api/prefectures`: 都道府県一覧
- `GET /api/cities`: 市区町村一覧
- `GET /api/districts`: 地区一覧
- `POST /api/search`: 物件検索

### AI市場分析
- `POST /api/ai-summary`: AI市場分析サマリー生成
- `POST /api/ml/analysis`: 機械学習分析
- `POST /api/ml/simple-analysis`: シンプルML分析

## 7. デプロイ手順

### Step 1: コード準備
```bash
# 変更をコミット
git add .
git commit -m "feat: AI市場分析本番リリース準備"
git push origin develop

# mainブランチにマージ
git checkout main
git merge develop
git push origin main
```

### Step 2: Render設定
1. Render Dashboard → New Web Service
2. GitHub repository選択
3. 上記設定値を入力
4. Environment Variables設定
5. Deploy

### Step 3: 動作確認
- API Health Check: `https://your-app.onrender.com/`
- Swagger UI: `https://your-app.onrender.com/docs`
- AI市場分析: フロントエンドから接続確認

## 8. 監視・メンテナンス

### ログ確認
- Render Dashboard → Logs
- リアルタイムログ監視
- エラー・パフォーマンス確認

### スケーリング
- Free Tier: 制限あり
- Starter以上: オートスケール対応

### セキュリティ
- HTTPS強制
- CORS制限
- API Key保護
- 環境変数による機密情報管理

## 9. トラブルシューティング

### よくある問題
1. **Build失敗**: requirements.txt確認
2. **Start失敗**: Procfile・パス確認
3. **API Key**: 環境変数設定確認
4. **CORS**: ドメイン設定確認
5. **メモリ**: プラン・最適化確認

### 解決方法
- Render Logs確認
- 環境変数再設定
- 手動Deploy実行
- サポート問い合わせ

---

**設定完了後**: AI市場分析機能が本番環境で動作可能になります。