# バックエンドAPI仕様書

## 概要

ChatGPT APIを安全に使用するためのバックエンドAPI仕様です。

## 🏗️ アーキテクチャ

```
フロントエンド → 自社API → OpenAI API
                  ↑
              - 認証・認可
              - レート制限
              - コスト管理
              - ログ・監視
```

## 🔐 認証

全てのAPIエンドポイントはJWT認証が必要です。

```
Authorization: Bearer <jwt_token>
```

## 📋 APIエンドポイント

### 1. 物件分析API

**POST** `/api/ai/property-analysis`

```json
{
  "propertyData": {
    "propertyName": "品川区投資物件",
    "location": "東京都品川区",
    "purchasePrice": 69800000,
    "monthlyRent": 250000,
    "expenses": 50000,
    "propertyType": "戸建",
    "buildYear": 1987
  },
  "analysisType": "comprehensive",
  "includeMarketComparison": true,
  "includeRiskAssessment": true
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "overallGrade": "A",
    "surfaceYield": 8.44,
    "netYield": 6.2,
    "cashFlow": 32000,
    "irr": 16.94,
    "risks": ["築年数が古い", "人口減少エリア"],
    "recommendations": ["IRRが高く魅力的", "10年保有推奨"],
    "marketComparison": {
      "averagePrice": 54.81,
      "priceAdvantage": -5.7
    },
    "summary": "この物件は高い収益性を持つ優良案件です..."
  },
  "usage": {
    "tokensUsed": 1250,
    "cost": 0.075
  }
}
```

### 2. 市場分析API

**POST** `/api/ai/market-analysis`

```json
{
  "location": "東京都品川区西五反田",
  "analysisDepth": "detailed"
}
```

### 3. 取引事例分析API

**POST** `/api/ai/transaction-analysis`

```json
{
  "transactions": [
    {
      "address": "東京都品川区西五反田2丁目",
      "price": 8500,
      "date": "2024年10月"
    }
  ]
}
```

### 4. レポート生成API

**POST** `/api/ai/generate-report`

```json
{
  "analysisData": {
    "propertyAnalysis": {...},
    "marketAnalysis": {...},
    "transactionAnalysis": {...}
  },
  "format": "pdf",
  "language": "ja"
}
```

### 5. 使用量確認API

**GET** `/api/ai/usage`

```json
{
  "success": true,
  "data": {
    "used": 2,
    "limit": 5,
    "resetDate": "2024-02-01T00:00:00Z",
    "plan": "free"
  }
}
```

## 🛡️ セキュリティ対策

### 1. レート制限

```javascript
// プランごとの制限
const RATE_LIMITS = {
  free: { daily: 5, monthly: 50 },
  pro: { daily: 50, monthly: 500 },
  enterprise: { daily: 200, monthly: 2000 }
};
```

### 2. コスト制限

```javascript
// トークン数制限
const TOKEN_LIMITS = {
  free: 500,
  pro: 1000,
  enterprise: 2000
};
```

### 3. 入力検証

```javascript
// 入力データの検証
const validatePropertyData = (data) => {
  if (!data.propertyName || data.propertyName.length > 100) {
    throw new Error('物件名が無効です');
  }
  if (!data.purchasePrice || data.purchasePrice <= 0) {
    throw new Error('購入価格が無効です');
  }
  // その他の検証...
};
```

## 🔧 実装例（Node.js/Express）

```javascript
import express from 'express';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// レート制限ミドルウェア
const aiRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24時間
  max: (req) => {
    const userPlan = req.user.plan;
    return RATE_LIMITS[userPlan].daily;
  },
  message: 'AI分析の日次制限に達しました',
});

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'アクセストークンが必要です' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無効なトークンです' });
    }
    req.user = user;
    next();
  });
};

// 物件分析エンドポイント
app.post('/api/ai/property-analysis', 
  authenticateToken, 
  aiRateLimit, 
  async (req, res) => {
    try {
      const { propertyData } = req.body;
      
      // 入力検証
      validatePropertyData(propertyData);
      
      // OpenAI API呼び出し
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `あなたは不動産投資分析の専門家です。
            以下の物件データを分析し、JSON形式で回答してください：
            - 総合評価（A-E）
            - 表面利回り
            - 実質利回り
            - 月間キャッシュフロー
            - IRR
            - リスク要因（配列）
            - 推奨事項（配列）
            - 市場比較
            - 総合コメント`
          },
          {
            role: "user",
            content: `物件分析をお願いします：${JSON.stringify(propertyData)}`
          }
        ],
        max_tokens: TOKEN_LIMITS[req.user.plan],
        temperature: 0.3,
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      
      // 使用量記録
      await recordUsage(req.user.id, completion.usage);
      
      res.json({
        success: true,
        data: analysis,
        usage: {
          tokensUsed: completion.usage.total_tokens,
          cost: calculateCost(completion.usage)
        }
      });

    } catch (error) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({
        success: false,
        error: 'AI分析に失敗しました'
      });
    }
  }
);

app.listen(3000, () => {
  console.log('AI API Server running on port 3000');
});
```

## 💰 コスト管理

### 料金計算
```javascript
const calculateCost = (usage) => {
  const inputCost = (usage.prompt_tokens / 1000) * 0.03;
  const outputCost = (usage.completion_tokens / 1000) * 0.06;
  return inputCost + outputCost;
};
```

### 月次制限
```javascript
const checkMonthlyCost = async (userId) => {
  const monthlyCost = await getMonthlyCost(userId);
  const limit = COST_LIMITS[user.plan];
  
  if (monthlyCost >= limit) {
    throw new Error('月次コスト制限に達しました');
  }
};
```

## 📊 監視・ログ

### 使用量ログ
```javascript
const recordUsage = async (userId, usage) => {
  await db.aiUsage.create({
    userId,
    tokensUsed: usage.total_tokens,
    cost: calculateCost(usage),
    timestamp: new Date()
  });
};
```

### アラート設定
```javascript
// 高額使用時のアラート
if (dailyCost > 100) {
  await sendAlert(`高額AI使用: $${dailyCost}`);
}
```