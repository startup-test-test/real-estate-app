"""
SEC-022: API認証システムの簡易テスト
"""

import jwt
from datetime import datetime, timedelta
from auth import create_access_token, SECRET_KEY, ALGORITHM

def test_create_access_token():
    """アクセストークンが正しく作成されることを確認"""
    print("=== JWT Token Creation Test ===")
    
    token_data = {"sub": "user-123", "email": "test@example.com"}
    token = create_access_token(data=token_data)
    
    print(f"Generated token: {token[:50]}...")
    
    # トークンをデコードして検証
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    
    print(f"Decoded payload: {payload}")
    print(f"User ID: {payload['sub']}")
    print(f"Email: {payload['email']}")
    print(f"Expiry: {datetime.fromtimestamp(payload['exp'])}")
    
    assert payload["sub"] == "user-123"
    assert payload["email"] == "test@example.com"
    assert "exp" in payload
    
    print("✅ Token creation test passed!")

def test_expired_token():
    """期限切れトークンの検証"""
    print("\n=== Expired Token Test ===")
    
    # 1秒前に期限切れになるトークンを作成
    token_data = {"sub": "user-123", "email": "test@example.com"}
    token = create_access_token(data=token_data, expires_delta=timedelta(seconds=-1))
    
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("❌ Expired token was accepted (should have failed)")
        assert False
    except jwt.ExpiredSignatureError:
        print("✅ Expired token was correctly rejected!")

def test_invalid_signature():
    """不正な署名のトークンの検証"""
    print("\n=== Invalid Signature Test ===")
    
    # 異なる秘密鍵で署名されたトークン
    fake_token = jwt.encode(
        {"sub": "user-123", "exp": datetime.utcnow() + timedelta(hours=1)},
        "wrong-secret-key",
        algorithm=ALGORITHM
    )
    
    try:
        jwt.decode(fake_token, SECRET_KEY, algorithms=[ALGORITHM])
        print("❌ Invalid signature was accepted (should have failed)")
        assert False
    except jwt.InvalidSignatureError:
        print("✅ Invalid signature was correctly rejected!")

def test_api_endpoints():
    """APIエンドポイントの認証設定確認"""
    print("\n=== API Endpoints Authentication Check ===")
    
    from app import app
    
    # 認証が必要なエンドポイントを確認
    protected_endpoints = []
    
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'dependencies'):
            if route.dependencies:
                protected_endpoints.append(route.path)
    
    print("Protected endpoints:")
    for endpoint in protected_endpoints:
        print(f"  - {endpoint}")
    
    # 期待されるエンドポイントが保護されているか確認
    expected_protected = ["/api/simulate", "/api/market-analysis", "/api/auth/me"]
    for endpoint in expected_protected:
        if endpoint in protected_endpoints:
            print(f"✅ {endpoint} is protected")
        else:
            print(f"❌ {endpoint} is NOT protected")

if __name__ == "__main__":
    print("Running SEC-022 API Authentication Tests\n")
    
    test_create_access_token()
    test_expired_token()
    test_invalid_signature()
    test_api_endpoints()
    
    print("\n✅ All tests completed!")