# ChatGPT API セキュリティガイド

## ⚠️ 重要な警告

**ChatGPT/OpenAI APIキーは絶対にフロントエンドで使用しないでください！**

## 🔴 危険な例（絶対にやってはいけない）

```bash
# ❌ 超危険！絶対にダメ！
VITE_OPENAI_API_KEY=sk-proj-xxx
VITE_CHATGPT_API_KEY=sk-xxx
```

**なぜ危険？**
- 従量課金制（使った分だけ課金）
- 悪用されると高額請求（月数万円〜数十万円）
- レート制限なし（無制限に使用される可能性）
- 公開用キーが存在しない

## ✅ 正しいアーキテクチャ

### 1. バックエンドAPI経由

```
フロントエンド → 自社API → OpenAI API
                  ↑
              ここでAPIキーを管理
              レート制限・認証も実装
```

### 2. 実装例

#### フロントエンド（安全）
```typescript
// ✅ 安全：自社API経由
const analyzeWithAI = async (propertyData: any) => {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`, // ユーザー認証
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(propertyData)
  });
  
  return response.json();
};
```

#### バックエンド（Node.js/Express例）
```javascript
// ✅ 安全：サーバーサイドでAPIキー管理
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // サーバーの環境変数
});

app.post('/api/ai/analyze', authenticateUser, async (req, res) => {
  try {
    // レート制限チェック
    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    // OpenAI API呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "不動産投資分析の専門家として回答してください"
        },
        {
          role: "user",
          content: `この物件を分析してください: ${JSON.stringify(req.body)}`
        }
      ],
      max_tokens: 1000, // コスト制限
    });
    
    res.json({ analysis: completion.choices[0].message.content });
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'AI分析に失敗しました' });
  }
});
```

## 🛡️ セキュリティ対策

### 1. レート制限
```javascript
// ユーザーごとの使用制限
const rateLimits = {
  free: { daily: 5, monthly: 50 },
  pro: { daily: 50, monthly: 500 },
  enterprise: { daily: 200, monthly: 2000 }
};
```

### 2. コスト制限
```javascript
// トークン数制限
const maxTokens = {
  free: 500,
  pro: 1000,
  enterprise: 2000
};
```

### 3. 認証・認可
```javascript
// ユーザー認証必須
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !verifyJWT(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
```

## 📊 コスト管理

### OpenAI API 料金（2024年1月時点）
- GPT-4: $0.03/1K tokens (入力), $0.06/1K tokens (出力)
- GPT-3.5-turbo: $0.001/1K tokens (入力), $0.002/1K tokens (出力)

### 月額コスト例
```
無料プラン: 月50回 × 500tokens = 約$1.5
プロプラン: 月500回 × 1000tokens = 約$15
```

## 🔧 実装手順

### 1. バックエンドAPI作成
```bash
# Express.js + OpenAI
npm install express openai jsonwebtoken
```

### 2. 環境変数設定（サーバーサイド）
```bash
# .env（サーバー用）
OPENAI_API_KEY=sk-proj-xxx
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
```

### 3. フロントエンド実装
```typescript
// 自社API経由でAI機能を呼び出し
const useAIAnalysis = () => {
  const analyzeProperty = async (data: any) => {
    return await secureApiRequest('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };
  
  return { analyzeProperty };
};
```

## 🚨 緊急時の対応

### APIキーが漏洩した場合
1. **即座にOpenAIダッシュボードでキーを無効化**
2. **新しいキーを生成**
3. **使用量・請求額を確認**
4. **必要に応じてOpenAIサポートに連絡**

## 📞 サポート

OpenAI APIの使用に関する質問：
- OpenAI公式ドキュメント: https://platform.openai.com/docs
- 料金ページ: https://openai.com/pricing