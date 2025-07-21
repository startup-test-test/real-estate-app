# CSRFトークン保護実装ガイド

## 概要

Cross-Site Request Forgery (CSRF) 攻撃から保護するための包括的な実装を行いました。

## 実装内容

### 1. CSRFトークン保護モジュール (`csrf_protection.py`)

#### 主な機能
- **トークン生成**: 暗号学的に安全な256ビットのトークン生成
- **トークン検証**: HMAC署名による改ざん防止
- **リプレイ攻撃防止**: 使用済みトークンの追跡
- **有効期限管理**: 60分のタイムアウト設定

#### セキュリティ対策
```python
# ダブルサブミットクッキーパターンとシンクロナイザートークンパターンの組み合わせ
- HTTPヘッダー: X-CSRF-Token
- クッキー: csrf_token (httponly, secure, samesite=strict)
- フォームフィールド: _csrf_token
```

### 2. APIエンドポイントへの統合

#### 保護されたエンドポイント
- `POST /api/auth/logout` - ログアウト処理
- `POST /api/simulate` - シミュレーション実行
- `POST /api/market-analysis` - 市場分析

#### 実装例
```python
@app.post("/api/simulate")
async def run_simulation(
    request: SimulationRequestModel,
    http_request: Request,
    current_user: dict = Depends(get_current_user)
):
    # CSRFトークンを検証
    await validate_csrf_token(
        http_request, 
        current_user.get('user_id'), 
        current_user.get('session_id')
    )
    # 処理を継続...
```

### 3. 認証フローへの統合

#### ログイン時のトークン発行
```python
# /api/auth/token エンドポイント
1. ユーザー認証成功
2. セッションID生成
3. CSRFトークン生成
4. レスポンスにトークンを含める
5. セキュアクッキーに設定
```

## フロントエンド実装ガイド

### 1. トークンの取得と保存
```typescript
// ログイン時にCSRFトークンを取得
const loginResponse = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
});

const data = await loginResponse.json();
const csrfToken = data.csrf_token;

// セキュアに保存（メモリまたは暗号化ストレージ）
sessionStorage.setItem('csrf_token', csrfToken);
```

### 2. APIリクエストへのトークン付与
```typescript
// 状態変更を伴うリクエストにCSRFトークンを含める
const response = await fetch('/api/simulate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-CSRF-Token': csrfToken  // CSRFトークンをヘッダーに追加
    },
    body: JSON.stringify(simulationData)
});
```

### 3. axiosインターセプターの設定例
```typescript
// axios設定
axios.interceptors.request.use((config) => {
    // 認証トークン
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CSRFトークン（POST, PUT, DELETE, PATCHリクエストに追加）
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
        const csrfToken = sessionStorage.getItem('csrf_token');
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }
    
    return config;
});
```

## セキュリティベストプラクティス

### 1. トークンの安全な管理
- メモリに保存（推奨）
- 暗号化されたストレージを使用
- XSSから保護するため、localStorageへの平文保存は避ける

### 2. エラーハンドリング
```typescript
try {
    const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
            'X-CSRF-Token': csrfToken
        },
        // ...
    });
} catch (error) {
    if (error.status === 403 && error.detail.includes('CSRF')) {
        // CSRFトークンエラー：再ログインを促す
        redirectToLogin();
    }
}
```

### 3. トークンのリフレッシュ
- セッションタイムアウト前に新しいトークンを取得
- ログイン時に必ず新しいトークンを発行

## テスト

### ユニットテスト
```bash
# CSRFトークン保護のテスト実行
cd backend/simulator-api
python -m pytest test_csrf_protection.py -v
```

### 統合テスト例
```python
def test_csrf_protection():
    # 1. ログインしてCSRFトークンを取得
    login_response = client.post("/api/auth/token", json={...})
    csrf_token = login_response.json()["csrf_token"]
    
    # 2. CSRFトークンなしでリクエスト（失敗）
    response = client.post("/api/simulate", json={...})
    assert response.status_code == 403
    
    # 3. CSRFトークンありでリクエスト（成功）
    response = client.post(
        "/api/simulate",
        json={...},
        headers={"X-CSRF-Token": csrf_token}
    )
    assert response.status_code == 200
```

## トラブルシューティング

### よくあるエラー

1. **"CSRF token missing"**
   - リクエストヘッダーにX-CSRF-Tokenが含まれていない
   - 解決策：ヘッダーを確認し、トークンを追加

2. **"Invalid CSRF token"**
   - トークンが期限切れまたは改ざんされている
   - 解決策：再ログインして新しいトークンを取得

3. **"CSRF token already used"**
   - 同じトークンを複数回使用（リプレイ攻撃防止）
   - 解決策：各リクエストで新しいトークンを使用

## 今後の改善点

1. **トークンローテーション**: 定期的なトークン更新
2. **OriginとRefererヘッダーの検証**: 追加のセキュリティレイヤー
3. **SameSite Cookie属性の動的設定**: 環境に応じた調整
4. **カスタムヘッダー名の設定可能化**: 柔軟性の向上

## 参考資料

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN Web Docs - CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)