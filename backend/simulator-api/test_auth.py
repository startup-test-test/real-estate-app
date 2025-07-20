"""
SEC-022: API認証システムのバックエンドテスト
"""

import pytest
import jwt
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app import app
from auth import create_access_token, verify_token, SECRET_KEY, ALGORITHM
from fastapi.security import HTTPAuthorizationCredentials

client = TestClient(app)

def create_test_token(user_id="test-user-123", email="test@example.com", expires_delta=None):
    """テスト用のJWTトークンを作成"""
    if expires_delta is None:
        expires_delta = timedelta(hours=1)
    return create_access_token(data={"sub": user_id, "email": email}, expires_delta=expires_delta)

class TestJWTAuthentication:
    """JWT認証のテスト"""
    
    def test_create_access_token(self):
        """アクセストークンが正しく作成されること"""
        token_data = {"sub": "user-123", "email": "test@example.com"}
        token = create_access_token(data=token_data)
        
        # トークンをデコードして検証
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "user-123"
        assert payload["email"] == "test@example.com"
        assert "exp" in payload
    
    def test_verify_valid_token(self):
        """有効なトークンが正しく検証されること"""
        token = create_test_token()
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        payload = verify_token(credentials)
        assert payload["sub"] == "test-user-123"
        assert payload["email"] == "test@example.com"
    
    def test_verify_expired_token(self):
        """期限切れトークンが拒否されること"""
        # 1秒前に期限切れになるトークンを作成
        token = create_test_token(expires_delta=timedelta(seconds=-1))
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        with pytest.raises(Exception):  # HTTPExceptionがraiseされる
            verify_token(credentials)
    
    def test_verify_invalid_token(self):
        """無効なトークンが拒否されること"""
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid-token")
        
        with pytest.raises(Exception):
            verify_token(credentials)

class TestAuthEndpoints:
    """認証エンドポイントのテスト"""
    
    def test_health_check_no_auth(self):
        """ヘルスチェックは認証不要でアクセスできること"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["authenticated"] == False
    
    def test_login_endpoint_development(self):
        """開発環境でのログインエンドポイント"""
        # 開発環境用のモックログイン
        response = client.post("/api/auth/token", json={
            "email": "dev@example.com",
            "supabase_token": "mock-token",
            "user_id": "dev-123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 3600
    
    def test_me_endpoint_with_auth(self):
        """認証付きでユーザー情報取得"""
        token = create_test_token()
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] == True
        assert data["user"]["user_id"] == "test-user-123"
        assert data["user"]["email"] == "test@example.com"
    
    def test_me_endpoint_without_auth(self):
        """認証なしでユーザー情報取得は失敗すること"""
        response = client.get("/api/auth/me")
        assert response.status_code == 403  # Forbidden

class TestProtectedEndpoints:
    """保護されたエンドポイントのテスト"""
    
    def test_simulate_with_auth(self):
        """認証付きでシミュレーションエンドポイントにアクセス"""
        token = create_test_token()
        
        simulation_data = {
            "property_name": "テスト物件",
            "location": "東京都",
            "purchase_price": 10000,
            "monthly_rent": 100000,
            "loan_amount": 8000,
            "interest_rate": 2.5,
            "loan_years": 30,
            "holding_years": 10,
            "vacancy_rate": 5,
            "property_tax": 100000,
            "ownership_type": "個人",
            "effective_tax_rate": 30,
            "major_repair_cycle": 15,
            "major_repair_cost": 500,
            "building_price": 5000,
            "depreciation_years": 22
        }
        
        response = client.post(
            "/api/simulate",
            json=simulation_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "requested_by" in data
        assert data["requested_by"] == "test-user-123"
    
    def test_simulate_without_auth(self):
        """認証なしでシミュレーションエンドポイントは失敗すること"""
        response = client.post("/api/simulate", json={})
        assert response.status_code == 403
    
    def test_market_analysis_with_auth(self):
        """認証付きで市場分析エンドポイントにアクセス"""
        token = create_test_token()
        
        response = client.post(
            "/api/market-analysis",
            json={
                "location": "東京都渋谷区",
                "land_area": 100,
                "year_built": 2020,
                "purchase_price": 10000
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "similar_properties" in data
        assert "statistics" in data
    
    def test_market_analysis_without_auth(self):
        """認証なしで市場分析エンドポイントは失敗すること"""
        response = client.post("/api/market-analysis", json={})
        assert response.status_code == 403

class TestTokenValidation:
    """トークン検証の詳細テスト"""
    
    def test_token_with_invalid_signature(self):
        """不正な署名のトークンは拒否されること"""
        # 異なる秘密鍵で署名されたトークン
        fake_token = jwt.encode(
            {"sub": "user-123", "exp": datetime.utcnow() + timedelta(hours=1)},
            "wrong-secret-key",
            algorithm=ALGORITHM
        )
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {fake_token}"}
        )
        
        assert response.status_code == 403
    
    def test_token_missing_required_claims(self):
        """必須クレームがないトークンは拒否されること"""
        # subクレームなしのトークン
        incomplete_token = jwt.encode(
            {"email": "test@example.com", "exp": datetime.utcnow() + timedelta(hours=1)},
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {incomplete_token}"}
        )
        
        assert response.status_code == 403

if __name__ == "__main__":
    pytest.main([__file__, "-v"])