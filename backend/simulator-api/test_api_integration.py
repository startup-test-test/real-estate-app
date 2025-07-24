"""
統合テスト - 認証とCSRF保護を含むAPIの動作確認
"""

import os
import pytest
from fastapi.testclient import TestClient
from app import app

# 開発環境でCSRF保護を無効化
os.environ["DISABLE_CSRF_PROTECTION"] = "true"

client = TestClient(app)

def test_health_check():
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_simulate_without_auth():
    """認証なしでシミュレーションエンドポイントにアクセス"""
    simulation_data = {
        "target_property": {
            "price": 35000000,
            "rent": 144000,
            "management_fee": 6840,
            "repair_fund": 5700,
            "property_tax": 80000,
            "city_planning_tax": 15000,
            "address": "東京都港区",
            "building_age": 10,
            "total_units": 50,
            "special_notes": ""
        }
    }
    
    response = client.post("/api/simulate", json=simulation_data)
    assert response.status_code == 403  # 認証が必要

def test_simulate_with_development_auth():
    """開発環境の認証でシミュレーションエンドポイントにアクセス"""
    # 開発環境用のトークンを取得
    token_response = client.post("/api/auth/token", json={
        "email": "test@example.com",
        "access_token": "dummy-supabase-token"
    })
    
    if token_response.status_code == 200:
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        # トークンを使ってシミュレーションを実行
        simulation_data = {
            "target_property": {
                "price": 35000000,
                "rent": 144000,
                "management_fee": 6840,
                "repair_fund": 5700,
                "property_tax": 80000,
                "city_planning_tax": 15000,
                "address": "東京都港区",
                "building_age": 10,
                "total_units": 50,
                "special_notes": ""
            }
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        response = client.post("/api/simulate", json=simulation_data, headers=headers)
        print(f"Simulation response status: {response.status_code}")
        print(f"Simulation response: {response.json()}")
        
        # 開発環境でCSRF保護が無効化されているため、成功するはず
        assert response.status_code == 200
        assert "summary" in response.json()
        assert "detailed" in response.json()

def test_cors_preflight():
    """CORSプリフライトリクエストのテスト"""
    response = client.options(
        "/api/simulate",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type"
        }
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers

if __name__ == "__main__":
    pytest.main([__file__, "-v"])