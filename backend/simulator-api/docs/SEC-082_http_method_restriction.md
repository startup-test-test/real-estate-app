# SEC-082: HTTPメソッド制限の実装

## 概要
APIエンドポイントで許可するHTTPメソッドを適切に制限し、不要なメソッドをブロックすることでセキュリティを向上させました。

## 実装内容

### 1. HTTPメソッドガードの実装 (`http_method_guard.py`)
- 各エンドポイントで許可されるHTTPメソッドを明示的に定義
- 危険なメソッド（TRACE, TRACK, CONNECT）を完全にブロック
- 405 Method Not Allowedレスポンスの適切な返却

### 2. エンドポイント別の制限

| エンドポイント | 許可メソッド | 用途 |
|--------------|------------|------|
| `/` | GET, HEAD | ヘルスチェック |
| `/api/auth/token` | POST | 認証トークン取得 |
| `/api/auth/me` | GET, HEAD | ユーザー情報取得 |
| `/api/simulate` | POST | シミュレーション実行 |
| `/api/market-analysis` | POST | 市場分析実行 |

※すべてのエンドポイントでOPTIONSメソッドは許可（CORS対応）

### 3. セキュリティヘッダーの追加
すべてのレスポンスに以下のセキュリティヘッダーを追加：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 4. ミドルウェアによる強制
- FastAPIのミドルウェアとして実装
- すべてのリクエストに対して自動的に適用
- 許可されていないメソッドは処理前にブロック

## セキュリティ上の利点

1. **攻撃面の削減**
   - 不要なHTTPメソッドを無効化することで攻撃の可能性を減少

2. **情報漏洩の防止**
   - TRACEメソッドによるHTTPヘッダー情報の漏洩を防止

3. **予期しない動作の防止**
   - 想定外のメソッドによる不正な操作を防止

4. **明確なAPI仕様**
   - 各エンドポイントの用途が明確になり、誤用を防止

## テスト方法

```bash
# APIサーバーを起動
cd /workspaces/real-estate-app/backend/simulator-api
uvicorn app:app --reload

# 別のターミナルでテストを実行
python test_http_methods.py
```

## 実装ファイル

1. `/backend/simulator-api/http_method_guard.py` - HTTPメソッド制限ロジック
2. `/backend/simulator-api/app.py` - ミドルウェアの適用
3. `/backend/simulator-api/test_http_methods.py` - テストスクリプト

## 準拠する標準
- OWASP API Security Top 10
- RFC 7231 (HTTP/1.1 Semantics and Content)
- セキュリティベストプラクティス