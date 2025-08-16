# Render API CORS検証と実装方針

**作成日**: 2025年8月16日  
**対象API**: Real Estate Simulator API (Render)  
**FastAPI Version**: 0.99.1  

## 📋 エグゼクティブサマリー

本ドキュメントは、Render上で稼働するSimulator APIのCORS設定に関する現状分析、問題点、および解決策をまとめたものです。

**主要な課題**:
- 🔴 **セキュリティリスク**: 現在`allow_origins=["*"]`で全ドメインからのアクセスを許可
- 🟡 **開発環境の制約**: GitHub Codespacesの動的URLへの対応が必要
- 🟡 **環境変数の制限**: フロントエンドでのAPI URL管理の困難さ

## 🔍 現状分析

### 現在のCORS設定

**ファイル**: `/workspaces/real-estate-app/backend/simulator-api/app.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 全ドメイン許可（セキュリティリスク）
    allow_credentials=True,    # 認証情報の送信を許可
    allow_methods=["*"],       # 全HTTPメソッド許可
    allow_headers=["*"],       # 全ヘッダー許可
)
```

### APIの認証状態

- **認証機能**: なし（APIキー、トークン認証未実装）
- **レート制限**: なし
- **アクセス制御**: CORS設定のみ

### フロントエンドの現状

**ファイル**: `/workspaces/real-estate-app/bolt_front/src/pages/Simulator.tsx` (Line 793)

```javascript
const API_BASE_URL = 'https://real-estate-app-rwf1.onrender.com';
```

**問題点**:
- API URLがハードコーディングされている
- 環境変数（`VITE_DEV_RENDER_SIMULATOR_API`）が機能しない
- Codespacesでの開発時に毎回手動修正が必要

## 🚨 セキュリティリスクと影響

### 1. 現在のリスク

#### 無制限アクセス
- 誰でもAPIエンドポイントにアクセス可能
- 悪意のあるサイトからの不正利用
- APIリソースの枯渇攻撃

#### 具体的な攻撃シナリオ
```javascript
// 悪意のあるサイト（evil.com）から
fetch('https://real-estate-app-rwf1.onrender.com/api/simulate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({/* 大量のリクエスト */})
})
// CORSが"*"のため、このリクエストが成功する
```

### 2. 影響範囲の詳細分析

#### APIエンドポイントの影響
現在のRender APIには以下のエンドポイントが存在し、すべてがCORS "*"の影響を受けます：

| エンドポイント | メソッド | 機能 | リスクレベル |
|--------------|---------|------|-------------|
| `/` | GET | ヘルスチェック | 低 |
| `/api/simulate` | POST | 収益シミュレーション実行 | **高** |
| `/api/market-analysis` | POST | 市場分析実行 | **高** |

#### フロントエンドの影響箇所
CORS変更により影響を受けるフロントエンドファイル：

1. **直接的な影響（APIを呼び出すファイル）**:
   - `/bolt_front/src/pages/Simulator.tsx` - メインのシミュレーター画面
     - Line 793: ハードコーディングされたAPI URL
     - Line 850-900付近: API呼び出しロジック

2. **間接的な影響（シミュレーター機能を使用）**:
   - `/bolt_front/src/pages/PropertyDetail.tsx` - 物件詳細画面
   - `/bolt_front/src/pages/Dashboard.tsx` - ダッシュボード
   - `/bolt_front/src/components/CashFlowChart.tsx` - キャッシュフロー表示

3. **テストファイルへの影響**:
   - 28個のテストファイルがシミュレーター機能に依存
   - 特に以下のファイルは直接的な影響:
     - `/bolt_front/src/tests/simulator-validation.test.tsx`
     - `/bolt_front/src/tests/security-scenarios.test.tsx`
     - `/bolt_front/src/tests/security-simple.test.tsx`

#### 環境別の影響

| 環境 | 現在の状態 | CORS変更後の影響 |
|------|-----------|------------------|
| **ローカル開発** (localhost:5173) | ✅ 動作中 | ⚠️ 正規表現パターンへの追加が必要 |
| **Codespaces** (*.app.github.dev) | ✅ 動作中 | ✅ 正規表現で対応可能 |
| **開発環境** (dev.ooya.tech) | ✅ 動作中 | ✅ 明示的に許可 |
| **本番環境** (ooya.tech) | ✅ 動作中 | ✅ 明示的に許可 |
| **その他のドメイン** | ⚠️ 現在アクセス可能 | 🚫 ブロックされる |

#### システム間の依存関係

```
┌─────────────────────────────────────────┐
│         フロントエンド (Vite)            │
│   - Simulator.tsx (メイン画面)          │
│   - 環境変数: VITE_DEV_RENDER_*         │
└────────────┬────────────────────────────┘
             │ HTTP POST
             │ CORS Preflight
             ▼
┌─────────────────────────────────────────┐
│      Render API (FastAPI)               │
│   - /api/simulate                       │
│   - /api/market-analysis                │
│   - CORS Middleware                     │
└─────────────────────────────────────────┘
```

#### ビジネスへの影響

- **開発速度**: Codespacesでの開発が一時的に停止する可能性
- **テスト環境**: CIパイプラインでのE2Eテストへの影響
- **外部連携**: 将来的なパートナーAPIアクセスへの制限
- **監視ツール**: 外部監視サービスからのヘルスチェックへの影響

## ✅ 解決方法

### 方法1: Starlette Middleware with allow_origin_regex（推奨）

**メリット**:
- 動的なCodespaces URLに対応可能
- 本番・開発環境を同時にサポート
- FastAPI 0.99.1で動作確認済み

**実装例**:
```python
from starlette.middleware.cors import CORSMiddleware

# 許可するオリジンのパターン（文字列として渡す）
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(https?://localhost(:[0-9]+)?|https?://127\.0\.0\.1(:[0-9]+)?|https?://[a-z0-9-]+\.app\.github\.dev|https://dev\.ooya\.tech|https://ooya\.tech)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # OPTIONSを追加
    allow_headers=["Content-Type", "Authorization"],
)
```

### 方法2: 環境変数による静的設定

**メリット**:
- シンプルな実装
- 環境ごとの設定が明確

**デメリット**:
- Codespacesの動的URLに対応不可

**実装例**:
```python
import os
from dotenv import load_dotenv

load_dotenv()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "https://ooya.tech").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
```

### 方法3: APIキー認証の追加（将来的な実装）

**実装例**:
```python
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header()):
    if x_api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API Key")

@app.post("/cashflow", dependencies=[Depends(verify_api_key)])
async def calculate_cashflow(data: CashflowRequest):
    # 処理
```

## 📝 実装手順

### Phase 1: CORS設定の更新（即座に実施）

#### 1. **事前準備とバックアップ**
```bash
# 作業ディレクトリへ移動
cd /workspaces/real-estate-app

# 現在の状態を確認
git status
git diff backend/simulator-api/app.py

# バックアップ作成
cp backend/simulator-api/app.py backend/simulator-api/app.py.backup
```

#### 2. **app.pyの具体的な修正手順**

**現在のコード（26-33行目）:**
```python
# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**修正後のコード:**
```python
# CORS設定 - 特定のドメインのみ許可
from starlette.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(https?://localhost(:[0-9]+)?|https?://127\.0\.0\.1(:[0-9]+)?|https?://[a-z0-9-]+\.app\.github\.dev|https://dev\.ooya\.tech|https://ooya\.tech)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
```

**注意点:**
- `from fastapi.middleware.cors import CORSMiddleware`を削除
- `from starlette.middleware.cors import CORSMiddleware`を追加
- 正規表現は**文字列として**渡す（re.compileしない）

#### 3. **ローカル環境での動作確認**

```bash
# 1. APIサーバー起動
cd backend/simulator-api
uvicorn app:app --reload --port 8001

# 2. 別ターミナルでフロントエンド起動
cd bolt_front
npm run dev

# 3. ブラウザで http://localhost:5173 にアクセス
# 4. シミュレーター画面で計算を実行
```

#### 4. **Renderへのデプロイ**
```bash
# 変更をコミット
git add backend/simulator-api/app.py
git commit -m "fix: CORS設定を改善 - 特定ドメインのみ許可"
git push origin develop

# Renderのダッシュボードで自動デプロイを確認
# https://dashboard.render.com でデプロイ状況を監視
```

### Phase 2: フロントエンドの環境変数対応

1. **Simulator.tsxの修正**
   ```typescript
   // API URLを環境に応じて切り替え
   const getApiUrl = () => {
     // Codespacesの場合
     if (window.location.hostname.includes('github.dev')) {
       return 'https://real-estate-app-rwf1.onrender.com';
     }
     // 開発環境
     if (window.location.hostname === 'dev.ooya.tech') {
       return 'https://real-estate-app-rwf1.onrender.com';
     }
     // 本番環境
     return 'https://real-estate-app-rwf1.onrender.com';
   };
   
   const API_BASE_URL = getApiUrl();
   ```

## 🧪 テスト方法

### 1. ローカル環境テスト

#### Step 1: APIサーバーの起動と確認
```bash
# APIサーバー起動
cd backend/simulator-api
uvicorn app:app --reload --port 8001

# 別ターミナルでヘルスチェック
curl http://localhost:8001/
# 期待される結果: {"message":"大家DX API","version":"1.0.0","status":"running"}
```

#### Step 2: CORS Preflightテスト
```bash
# OPTIONSリクエストでCORS設定を確認
curl -X OPTIONS http://localhost:8001/api/simulate \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# 期待される応答ヘッダー:
# < Access-Control-Allow-Origin: http://localhost:5173
# < Access-Control-Allow-Methods: GET, POST, OPTIONS
# < Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Step 3: フロントエンドからの実際のテスト
```bash
# フロントエンド起動
cd bolt_front
npm run dev

# ブラウザで http://localhost:5173 を開く
# 1. シミュレーター画面へ移動
# 2. 開発者ツール（F12）のNetworkタブを開く
# 3. 物件価格を入力して「計算する」をクリック
# 4. api/simulate へのリクエストが成功することを確認
```

### 2. Codespaces環境テスト

#### Step 1: Codespaces URLの確認
```bash
# 現在のCodespaces URLを確認
echo $CODESPACE_NAME
# 例: ominous-happiness-q7r697r6gq93xjxq

# フロントエンドのURLを構築
# https://[CODESPACE_NAME]-5173.app.github.dev
```

#### Step 2: CORSテスト用スクリプト
```javascript
// ブラウザコンソールで実行
const testCORS = async () => {
  const apiUrl = 'https://real-estate-app-rwf1.onrender.com/api/simulate';
  const testData = {
    purchasePrice: 10000000,
    monthlyRent: 100000,
    propertyTax: 100000,
    managementFee: 5000
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(testData)
    });
    const data = await response.json();
    console.log('✅ CORS成功:', data);
  } catch (error) {
    console.error('❌ CORSエラー:', error);
  }
};

testCORS();
```

### 3. 不正なドメインからのテスト

#### Step 1: 異なるドメインからのアクセステスト
```javascript
// 例：Google.comを開いてコンソールで実行
fetch('https://real-estate-app-rwf1.onrender.com/api/simulate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        purchasePrice: 10000000,
        monthlyRent: 100000
    })
})
.then(response => console.log('不正アクセス成功（問題あり）'))
.catch(error => console.log('✅ 正常にブロック:', error));

// 期待される結果:
// Access to fetch at '...' from origin 'https://www.google.com' has been blocked by CORS policy
```

### 4. 本番環境テスト

#### Step 1: コマンドラインでのテスト
```bash
# 許可されたドメインからのテスト
curl -X POST https://real-estate-app-rwf1.onrender.com/api/simulate \
  -H "Origin: https://dev.ooya.tech" \
  -H "Content-Type: application/json" \
  -d '{
    "purchasePrice": 10000000,
    "monthlyRent": 100000,
    "propertyTax": 100000,
    "managementFee": 5000
  }' \
  -v

# 許可されていないドメインからのテスト
curl -X POST https://real-estate-app-rwf1.onrender.com/api/simulate \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"purchasePrice": 10000000}' \
  -v

# 期待される結果: 許可されていないドメインはCORSエラー
```

#### Step 2: テスト結果の確認項目
- ✅ localhost:5173 からアクセス可能
- ✅ Codespaces (*.app.github.dev) からアクセス可能
- ✅ dev.ooya.tech からアクセス可能
- ✅ ooya.tech からアクセス可能
- ❌ その他のドメインからはアクセス不可

## 🔄 ロールバック計画

### 問題発生時の即座の対応

1. **症状の確認**
   - CORSエラーの詳細をブラウザコンソールで確認
   - 影響を受けているドメインを特定

2. **一時的な対応**
   ```python
   # app.pyを緊急修正
   allow_origins=["*"]  # 一時的に全許可に戻す
   ```

3. **Renderへの緊急デプロイ**
   ```bash
   git add backend/simulator-api/app.py
   git commit -m "hotfix: CORS設定を一時的にロールバック"
   git push origin develop
   ```

4. **根本原因の調査**
   - 正規表現パターンの検証
   - 環境ごとのOriginヘッダーの確認

### バックアップからの復元

```bash
# バックアップファイルから復元
cp backend/simulator-api/app.py.backup backend/simulator-api/app.py
git add backend/simulator-api/app.py
git commit -m "revert: CORS設定を元に戻す"
git push origin develop
```

## 📊 過去の実装履歴と教訓

### 2025年7月24日の実装（失敗）

**コミット**: `95f0fd2`

**実装内容**:
```python
from starlette.middleware.cors import CORSMiddleware
allowed_origin_regex = re.compile(
    r"^(https?://.*\.app\.github\.dev|https?://.*\.onrender\.com)$"
)
```

**失敗原因**:
- 複数のミドルウェア設定が競合
- 正規表現パターンが複雑すぎた
- テスト不足

**教訓**:
- シンプルな実装から始める
- 段階的にテストを実施
- ロールバック計画を事前に準備

## ⚠️ ChatGPTの指摘と対応

### 重要な修正点

1. **正規表現の渡し方**
   - ❌ `re.compile()`したオブジェクトを渡す
   - ✅ 文字列として正規表現パターンを渡す
   - StarletteのCORSMiddlewareは内部でcompileするため

2. **CORSの限界**
   - CORSは**ブラウザからのアクセスのみ**制御
   - curl、Postman、サーバー間通信は防げない
   - 根本的な解決にはBFF/認証が必要

3. **段階的アプローチの必要性**
   - Phase A: CORS設定（即座の被害低減）
   - Phase B: BFF/Edge Functions（根本対策）
   - Phase C: レート制限・監視（多層防御）

## 🎯 推奨事項とベストプラクティス

### 短期的対応（今すぐ実施）

1. **CORS設定の更新**: allow_origin_regexの実装（文字列として）
2. **監視の強化**: APIアクセスログの確認
3. **ドキュメント化**: 設定変更の記録

### 中期的対応（1-2週間以内）

1. **レート制限の実装**
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   
   @app.post("/cashflow")
   @limiter.limit("10/minute")
   async def calculate_cashflow():
       # 処理
   ```

2. **基本的なAPIキー認証**
   - 環境変数でAPIキーを管理
   - ヘッダーでの認証実装

### 長期的対応（本番リリース後）

1. **OAuth2.0/JWT認証の実装**
2. **API Gateway（Kong/Tyk）の導入**
3. **CDNレベルでのセキュリティ対策**

## 📞 サポートとトラブルシューティング

### よくある問題と解決方法

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| CORSエラーが継続 | 正規表現パターンの不一致 | Originヘッダーを確認し、パターンを調整 |
| Codespacesでアクセス不可 | 動的URLの変更 | `.*\.app\.github\.dev`パターンを確認 |
| OPTIONS preflight失敗 | メソッド設定の不足 | allow_methodsに"OPTIONS"を追加 |

### デバッグ方法

```python
# app.pyに追加（デバッグ用）
@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get("origin")
    print(f"Request from origin: {origin}")
    response = await call_next(request)
    return response
```

## 📚 参考資料

- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)
- [Starlette CORS Middleware](https://www.starlette.io/middleware/#corsmiddleware)
- [MDN Web Docs - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**作成者**: セキュリティチーム  
**最終更新**: 2025年8月16日  
**次回レビュー予定**: 2025年8月23日