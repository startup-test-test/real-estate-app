# Render API CORS設定 実装仕様書

**作成日**: 2025年8月16日  
**実装完了日**: 2025年8月16日  
**対象API**: Real Estate Simulator API (Render)  
**実装者**: セキュリティチーム  
**ステータス**: ✅ 本番環境適用済み

## 📋 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [Before/After 詳細比較](#beforeafter-詳細比較)
3. [実装の詳細仕様](#実装の詳細仕様)
4. [過去の失敗理由の分析](#過去の失敗理由の分析)
5. [テスト結果](#テスト結果)
6. [今後のメンテナンス](#今後のメンテナンス)

## 📌 エグゼクティブサマリー

### 実装の目的
Render上で稼働するSimulator APIへの不正アクセスを防止するため、CORS（Cross-Origin Resource Sharing）設定を実装し、特定のドメインからのみアクセスを許可する。

### 達成した成果
- ✅ 悪意のあるサイトからのAPI利用をブロック
- ✅ 開発環境（Codespaces）での作業継続性を維持
- ✅ シンプルな実装で保守性を確保
- ✅ 過去の失敗を踏まえた確実な実装

## 🔄 Before/After 詳細比較

### Before（実装前の状態）

#### ファイル: `/backend/simulator-api/app.py`

**行番号**: 5-6行目（インポート部分）
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
```

**行番号**: 26-33行目（CORS設定部分）
```python
# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 全てのドメインを許可（セキュリティリスク）
    allow_credentials=True,    
    allow_methods=["*"],       # 全てのHTTPメソッドを許可
    allow_headers=["*"],       # 全てのヘッダーを許可
)
```

#### セキュリティ状態
| 項目 | 状態 | リスクレベル |
|------|------|-------------|
| アクセス制御 | なし（全ドメイン許可） | 🔴 高 |
| 認証 | なし | 🔴 高 |
| レート制限 | なし | 🟡 中 |
| ログ記録 | 基本的なアクセスログのみ | 🟡 中 |

#### 実際のリスク
```javascript
// 悪意のあるサイト（evil.com）から
fetch('https://real-estate-app-rwf1.onrender.com/api/simulate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        purchasePrice: 10000000,
        monthlyRent: 100000
    })
})
// 結果: ✅ 成功（問題あり - 誰でも使える）
```

### After（実装後の状態）

#### ファイル: `/backend/simulator-api/app.py`

**行番号**: 5-6行目（インポート部分）
```python
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware  # ← Starletteに変更
from fastapi.responses import JSONResponse
```

**行番号**: 26-34行目（CORS設定部分）
```python
# CORS設定 - 特定のドメインのみ許可（セキュリティ向上）
# 許可するドメイン: localhost, 127.0.0.1, Codespaces (*.app.github.dev), dev.ooya.tech, ooya.tech
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(https?://localhost(:[0-9]+)?|https?://127\.0\.0\.1(:[0-9]+)?|https?://[a-z0-9-]+\.app\.github\.dev|https://dev\.ooya\.tech|https://ooya\.tech)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # 必要なメソッドのみ
    allow_headers=["Content-Type", "Authorization"],  # 必要なヘッダーのみ
)
```

#### セキュリティ状態
| 項目 | 状態 | リスクレベル |
|------|------|-------------|
| アクセス制御 | 特定ドメインのみ許可 | 🟢 低 |
| 認証 | なし（将来実装可能） | 🟡 中 |
| レート制限 | なし（将来実装可能） | 🟡 中 |
| ログ記録 | 基本的なアクセスログのみ | 🟡 中 |

#### 実際の動作
```javascript
// 悪意のあるサイト（evil.com）から
fetch('https://real-estate-app-rwf1.onrender.com/api/simulate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        purchasePrice: 10000000,
        monthlyRent: 100000
    })
})
// 結果: ❌ CORSエラー（正常にブロック）
// Access to fetch at '...' from origin 'https://evil.com' has been blocked by CORS policy
```

### 変更の詳細

#### 1. インポートの変更
```diff
- from fastapi.middleware.cors import CORSMiddleware
+ from starlette.middleware.cors import CORSMiddleware
```
**理由**: StarletteのCORSMiddlewareは`allow_origin_regex`パラメータをネイティブサポート

#### 2. CORS設定パラメータの変更
| パラメータ | Before | After |
|-----------|--------|-------|
| allow_origins | `["*"]` | - （削除） |
| allow_origin_regex | - （なし） | 正規表現パターン（追加） |
| allow_methods | `["*"]` | `["GET", "POST", "OPTIONS"]` |
| allow_headers | `["*"]` | `["Content-Type", "Authorization"]` |

#### 3. 正規表現パターンの詳細
```regex
^(
  https?://localhost(:[0-9]+)?|           # localhost（任意のポート）
  https?://127\.0\.0\.1(:[0-9]+)?|       # 127.0.0.1（任意のポート）
  https?://[a-z0-9-]+\.app\.github\.dev|  # Codespaces
  https://dev\.ooya\.tech|                 # 開発環境
  https://ooya\.tech                       # 本番環境
)$
```

## 📐 実装の詳細仕様

### 技術仕様

#### 使用ライブラリ
- **FastAPI**: 0.99.1
- **Starlette**: 0.27.0（FastAPIに同梱）
- **Python**: 3.11

#### CORSMiddlewareの動作原理
1. **Preflightリクエスト（OPTIONS）の処理**
   - ブラウザが送信するOPTIONSリクエストを受信
   - Originヘッダーを正規表現でチェック
   - マッチする場合、適切なCORSヘッダーを返す

2. **実際のリクエスト（GET/POST）の処理**
   - Originヘッダーを検証
   - 許可されたドメインの場合、`Access-Control-Allow-Origin`ヘッダーを付与
   - 許可されていない場合、ヘッダーを付与しない（ブラウザがブロック）

### 許可されるアクセスパターン

| Origin | 環境 | アクセス可否 | 用途 |
|--------|------|-------------|------|
| http://localhost:5173 | ローカル開発 | ✅ | Vite開発サーバー |
| http://127.0.0.1:5173 | ローカル開発 | ✅ | IPアドレス経由 |
| https://*.app.github.dev | Codespaces | ✅ | GitHub開発環境 |
| https://dev.ooya.tech | ステージング | ✅ | テスト環境 |
| https://ooya.tech | 本番 | ✅ | 本番環境 |
| その他のドメイン | - | ❌ | ブロック |

## 🔍 過去の失敗理由の分析

### 失敗事例1: 2025年7月24日の実装

#### コミット情報
- **コミットID**: 95f0fd2
- **メッセージ**: "fix: CORS設定を統一し、重複するミドルウェアを削除"
- **変更規模**: 67行の変更（18行追加、49行削除）

#### 失敗の原因

##### 1. 過度な複雑性
```python
# 失敗例：カスタムミドルウェアの実装
@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin and allowed_origin_regex.match(origin):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = origin
        # ... 複雑な処理が続く
    return response

# さらに標準のCORSMiddlewareも併用
app.add_middleware(
    CORSMiddleware,
    # ... 設定が競合
)
```

**問題点**:
- 複数のミドルウェアが競合
- 処理の順序が不明確
- デバッグが困難

##### 2. 誤った技術的仮定
| 仮定 | 実際 |
|------|------|
| FastAPI 0.99.1は`allow_origin_regex`未対応 | ❌ Starletteは最初から対応 |
| カスタム実装が必要 | ❌ 標準機能で十分 |
| 複雑な正規表現が必要 | ❌ シンプルなパターンで十分 |

##### 3. テスト不足
```bash
# 当時のテスト状況
✅ ローカルテスト → 実施
❌ Codespacesテスト → 未実施
❌ 段階的デプロイ → 未実施
❌ ロールバック計画 → 未準備
```

### 失敗事例2: 2025年7月16日のセキュリティ対策

#### 問題の経緯
1. Supabase Edge Functionsで過度なCORS制限を実装
2. 本番環境でシステム障害発生
3. 緊急ロールバック実施

#### 失敗の原因
- 影響範囲の過小評価
- 段階的な実装を行わなかった
- フロントエンドとバックエンドの連携不足

### 教訓と改善点

#### 1. シンプルさの重要性
```python
# ❌ 悪い例（67行の変更）
複雑なカスタムミドルウェア + 標準ミドルウェア + エラーハンドリング

# ✅ 良い例（6行の変更）
標準のCORSMiddlewareのみ使用
```

#### 2. 段階的なアプローチ
| ステップ | 過去（失敗） | 今回（成功） |
|----------|------------|-------------|
| 1. 調査 | 不十分 | ChatGPT、過去の履歴を詳細調査 |
| 2. 設計 | 過度に複雑 | シンプルな設計 |
| 3. 実装 | 一度に大量変更 | 最小限の変更 |
| 4. テスト | 本番で直接テスト | ローカル→Codespaces→本番 |
| 5. デプロイ | 即座に本番適用 | 段階的に確認 |

#### 3. ドキュメントの重要性
- 過去：実装のみでドキュメントなし
- 今回：詳細な仕様書、検証ドキュメント、実装手順書を作成

## 🧪 テスト結果

### ローカル環境テスト

#### テスト実施日時: 2025年8月16日 14:37

```bash
# テストコマンド
curl -X OPTIONS http://localhost:8001/api/simulate \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v

# 結果
< access-control-allow-origin: http://localhost:5173
< access-control-allow-methods: GET, POST, OPTIONS
< access-control-allow-credentials: true
```
**結果**: ✅ 成功

### Codespaces環境テスト

#### テスト実施日時: 2025年8月16日 14:38

```bash
# テストコマンド
curl -X OPTIONS http://localhost:8001/api/simulate \
  -H "Origin: https://ominous-happiness-q7r697r6gq93xjxq-5173.app.github.dev" \
  -v

# 結果
< access-control-allow-origin: https://ominous-happiness-q7r697r6gq93xjxq-5173.app.github.dev
```
**結果**: ✅ 成功

### 不正ドメインブロックテスト

#### テスト実施日時: 2025年8月16日 14:39

```bash
# テストコマンド
curl -X OPTIONS http://localhost:8001/api/simulate \
  -H "Origin: https://evil.com" \
  -v

# 結果
（access-control-allow-originヘッダーなし）
```
**結果**: ✅ 正常にブロック

### 本番環境テスト

#### テスト実施日時: 2025年8月16日 14:45

- **環境**: Codespaces
- **API URL**: https://real-estate-app-rwf1.onrender.com
- **テスト内容**: シミュレーター画面で実際の計算を実行
- **結果**: ✅ 正常動作確認

## 🔧 今後のメンテナンス

### 追加可能なセキュリティ対策

#### Phase 1: レート制限（推奨度: 高）
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/simulate")
@limiter.limit("10/minute")
async def simulate():
    # 処理
```

#### Phase 2: APIキー認証（推奨度: 中）
```python
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header()):
    if x_api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API Key")
```

#### Phase 3: 詳細なログ記録（推奨度: 中）
```python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Origin: {request.headers.get('origin')}, Time: {process_time}")
    return response
```

### ドメイン追加の手順

新しいドメインを追加する場合：

1. **正規表現パターンの更新**
```python
# 例：staging.ooya.techを追加
allow_origin_regex=r"^(https?://localhost(:[0-9]+)?|https?://127\.0\.0\.1(:[0-9]+)?|https?://[a-z0-9-]+\.app\.github\.dev|https://dev\.ooya\.tech|https://staging\.ooya\.tech|https://ooya\.tech)$"
```

2. **テスト実施**
3. **デプロイ**

### 監視項目

| 項目 | 監視方法 | 頻度 |
|------|---------|------|
| APIアクセス数 | Renderダッシュボード | 日次 |
| エラー率 | Renderログ | 週次 |
| 不正アクセス試行 | CORSブロックログ | 月次 |
| レスポンス時間 | Renderメトリクス | 週次 |

## 📚 関連ドキュメント

- [render_cors検証_250816.md](./render_cors検証_250816.md) - 検証と実装手順
- [render_ハードコーディングを削除_250816.md](./render_ハードコーディングを削除_250816.md) - ハードコーディング問題の分析
- [chatGPTに質問.md](./chatGPTに質問.md) - 技術的な調査内容

## 🏆 成功要因のまとめ

### なぜ今回は成功したか

1. **シンプルな実装**
   - 標準機能の活用
   - 最小限の変更（6行のみ）
   - 明確な設定

2. **十分な事前調査**
   - 過去の失敗分析
   - ChatGPTへの相談
   - Starletteドキュメントの確認

3. **段階的なテスト**
   - ローカル → Codespaces → 本番
   - 各段階で動作確認
   - ロールバック計画の準備

4. **適切なドキュメント化**
   - 実装前に仕様書作成
   - テスト手順の明文化
   - 失敗時の対応策準備

## ✅ 承認と履歴

| 日時 | 作業内容 | 実施者 | 承認者 |
|------|---------|--------|--------|
| 2025/08/16 14:30 | 仕様書作成 | セキュリティチーム | - |
| 2025/08/16 14:35 | 実装 | セキュリティチーム | - |
| 2025/08/16 14:40 | テスト実施 | セキュリティチーム | - |
| 2025/08/16 14:45 | 本番適用 | セキュリティチーム | ユーザー確認済み |
| 2025/08/16 14:50 | 動作確認完了 | ユーザー | - |

---

**作成者**: セキュリティチーム  
**最終更新**: 2025年8月16日  
**次回レビュー予定**: 2025年9月16日