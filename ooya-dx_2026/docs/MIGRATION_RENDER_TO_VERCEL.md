# Render から Vercel への Python API 移行ガイド

## 概要

このドキュメントでは、FastAPI（Render）から Vercel Python Serverless Functions への移行手順を説明します。

## 移行のメリット

| 項目 | Render | Vercel |
|------|--------|--------|
| コスト | 無料枠制限あり、有料プラン必要 | 無料枠が充実 |
| 管理 | フロントとバックエンド別々 | 1つのリポジトリで完結 |
| デプロイ | 別々にデプロイ | 同時にデプロイ |
| CORS | 設定が必要 | 同一ドメインで不要 |
| コールドスタート | あり（無料枠で顕著） | あり（エッジで軽減） |

## アーキテクチャ変更

### Before（現在）
```
┌─────────────────┐      API呼び出し      ┌─────────────────┐
│  Next.js        │ ─────────────────────▶│  FastAPI        │
│  (Vercel)       │                       │  (Render)       │
│  ooya.tech      │                       │  render.com     │
└─────────────────┘                       └─────────────────┘
```

### After（移行後）
```
┌─────────────────────────────────────────┐
│              Vercel                      │
│  ┌─────────────────┐  ┌──────────────┐  │
│  │  Next.js        │  │  Python API  │  │
│  │  (Frontend)     │  │  /api/*      │  │
│  └─────────────────┘  └──────────────┘  │
│              ooya.tech                   │
└─────────────────────────────────────────┘
```

## ディレクトリ構成

```
ooya-dx_2026/
├── app/                    # Next.js App Router
├── api/                    # Vercel Python Functions
│   ├── simulate.py         # シミュレーションAPI
│   ├── health.py           # ヘルスチェック
│   └── requirements.txt    # Python依存関係
├── components/
├── lib/
└── ...
```

## 移行手順

### Step 1: Python依存関係の設定

`api/requirements.txt` を作成：
```txt
numpy>=1.24.0
pydantic>=2.0.0
```

### Step 2: シミュレーションAPIの作成

`api/simulate.py` を作成：
```python
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)

        # シミュレーションロジック
        result = run_simulation(data)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
```

### Step 3: フロントエンドのAPI設定更新

`lib/config/api.ts` を更新：
```typescript
// Vercel統合後はシンプルに
export const API_ENDPOINTS = {
  SIMULATE: '/api/simulate',
  HEALTH: '/api/health',
} as const;
```

### Step 4: vercel.json の設定

```json
{
  "functions": {
    "api/*.py": {
      "runtime": "python3.9",
      "maxDuration": 30
    }
  }
}
```

## Vercel Python の制限事項

| 項目 | Hobby（無料） | Pro |
|------|---------------|-----|
| 実行時間 | 10秒 | 60秒 |
| メモリ | 1024MB | 3008MB |
| ペイロード | 4.5MB | 4.5MB |

## テスト方法

### ローカルテスト
```bash
# Vercel CLI でローカル実行
vercel dev
```

### デプロイ後テスト
```bash
curl -X POST https://ooya.tech/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"purchasePrice": 5000, ...}'
```

## ロールバック手順

問題が発生した場合：
1. `lib/config/api.ts` を元のRender URLに戻す
2. デプロイ

```typescript
// ロールバック時
const API_URLS = {
  [Environment.LOCAL]: 'https://real-estate-app-rwf1.onrender.com',
  [Environment.PRODUCTION]: 'https://real-estate-app-1-iii4.onrender.com',
};
```

## 移行完了後のクリーンアップ

1. Renderダッシュボードでサービスを停止
2. 必要に応じてRenderアカウントを解約
3. 古いAPI設定コードを削除

## 参考リンク

- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

最終更新: 2026-01-06
