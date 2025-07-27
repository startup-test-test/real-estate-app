# Render API 仕様書

## 概要
不動産投資シミュレーターのバックエンドAPIです。FastAPIで構築され、Render.comでホスティングされています。

## API エンドポイント

### ベースURL
- 開発環境: `https://real-estate-simulator-dev.onrender.com`
- 本番環境: `https://real-estate-simulator-prod.onrender.com`

## エンドポイント一覧

### 1. ヘルスチェック
```http
GET /
```

**レスポンス:**
```json
{
  "message": "大家DX API",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. 投資シミュレーション
```http
POST /api/simulate
```

**リクエストボディ:**
```json
{
  "propertyPrice": 50000000,        // 物件価格（円）
  "downPaymentRatio": 10,           // 頭金比率（%）
  "loanAmount": 45000000,           // 借入金額（円）
  "loanInterestRate": 2.5,          // 借入金利（%）
  "loanTermYears": 35,              // 借入期間（年）
  "monthlyRent": 250000,            // 月額賃料（円）
  "annualExpenses": 1500000,        // 年間経費（円）
  "vacancy": 10,                    // 空室率（%）
  "propertyTax": 600000,            // 固定資産税（円）
  "managementFee": 5,               // 管理費率（%）
  "otherExpenses": 300000,          // その他経費（円）
  "appreciationRate": 1.0,          // 価格上昇率（%）
  "yearsToHold": 10                 // 保有年数
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "initialInvestment": 5500000,
    "totalCashFlow": 15000000,
    "netIncome": 12000000,
    "cashOnCashReturn": 8.5,
    "roi": 45.2,
    "monthlyDetails": [...],
    "yearlyDetails": [...]
  }
}
```

### 3. 市場分析
```http
POST /api/market-analysis
```

**リクエストボディ:**
```json
{
  "location": "東京都港区",
  "propertyType": "マンション",
  "yearBuilt": 2015,
  "area": 75.5
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "averagePrice": 85000000,
    "pricePerSqm": 1126490,
    "marketTrend": "上昇傾向",
    "similarProperties": [...]
  }
}
```

## エラーレスポンス

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "details": {
    "propertyPrice": "Must be a positive number"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## 認証・セキュリティ

### CORS設定
現在は全てのオリジンからのアクセスを許可しています：
```python
allow_origins=["*"]
```

**推奨設定（本番環境）:**
```python
allow_origins=[
    "https://ooya.tech",
    "https://dev.ooya.tech"
]
```

### レート制限
現在は実装されていません。以下の実装を推奨：
- 1分間に10リクエストまで
- 1時間に100リクエストまで

### 認証
現在は認証なしの公開APIです。必要に応じて以下を実装可能：
- Supabase JWTトークン認証
- APIキー認証

## 環境変数

Renderの環境変数として設定：
```bash
# OpenAI API（AI機能を使用する場合）
OPENAI_API_KEY=sk-xxxxx

# 不動産情報API（外部データ取得用）
REAL_ESTATE_API_KEY=xxxxx
```

## デプロイ情報

### Renderの設定
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **環境**: Python 3.9+
- **プラン**: Free（無料プラン）

### 自動デプロイ
GitHubのmainブランチにpushすると自動デプロイされます。

## 利用上の注意

1. **無料プランの制限**
   - 15分間アクセスがないとスリープ状態になります
   - 初回アクセス時は起動に30秒程度かかる場合があります

2. **データの永続性**
   - このAPIはステートレスです
   - データの保存はSupabase側で行います

3. **パフォーマンス**
   - 複雑な計算は最大10秒程度かかる場合があります
   - タイムアウトは30秒に設定されています