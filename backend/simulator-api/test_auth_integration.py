#!/usr/bin/env python3
"""
SEC-073: バックエンド認証システムの包括的テストスクリプト
統合認証システム全体のテスト
"""

import os
import sys
import logging
import pytest
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any
from unittest.mock import Mock, patch

# テスト対象モジュールをインポート
try:
    from supabase_auth import (
        SupabaseAuthManager, 
        UserProfile,
        supabase_auth, 
        get_authenticated_user
    )
    from rbac import UserRole, Permission, rbac_manager
    from auth import create_access_token, SECRET_KEY, ALGORITHM
    from error_handler import create_auth_error_response
    from user_management import user_router
    from fastapi.testclient import TestClient
    from app import app
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all dependencies are installed")
    sys.exit(1)

# ロガーの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestSupabaseAuth:
    """Supabase認証システムのテスト"""
    
    def setup_method(self):
        """テストセットアップ"""
        # 開発環境モードに設定
        os.environ["ENV"] = "development"
        os.environ["DEVELOPMENT_MODE"] = "1"
        self.auth_manager = SupabaseAuthManager()
    
    def test_mock_token_verification(self):
        """開発環境でのモック認証テスト"""
        print("\n=== Mock Token Verification Test ===")
        
        # 開発環境用のトークンを作成
        dev_token = jwt.encode(
            {
                "sub": "dev-user-123",
                "email": "admin@example.com",
                "exp": datetime.utcnow() + timedelta(hours=1)
            },
            "dev-secret",
            algorithm="HS256"
        )
        
        # トークンを検証
        user_info = self.auth_manager._mock_token_verification(dev_token)
        
        assert user_info["user_id"] == "dev-user-123"
        assert user_info["email"] == "admin@example.com"
        assert user_info["role"] == UserRole.ADMIN
        assert user_info["is_active"] is True
        
        print("✅ Mock token verification passed!")
    
    def test_get_mock_profile(self):
        """開発環境でのモックプロファイル取得テスト"""
        print("\n=== Mock Profile Test ===")
        
        profile = self.auth_manager._get_mock_profile("test-user-123")
        
        assert profile.user_id == "test-user-123"
        assert profile.email == "dev@example.com"
        assert profile.role == UserRole.ADMIN
        assert profile.is_active is True
        assert profile.login_count == 1
        
        print("✅ Mock profile test passed!")
    
    def test_password_hash_verify(self):
        """パスワードハッシュ化と検証テスト"""
        print("\n=== Password Hash & Verify Test ===")
        
        password = "test_password_123"
        hashed = self.auth_manager.hash_password(password)
        
        assert hashed != password  # ハッシュ化されている
        assert self.auth_manager.verify_password(password, hashed)  # 検証成功
        assert not self.auth_manager.verify_password("wrong_password", hashed)  # 検証失敗
        
        print("✅ Password hash and verify test passed!")
    
    def test_password_reset_token(self):
        """パスワードリセットトークンのテスト"""
        print("\n=== Password Reset Token Test ===")
        
        user_id = "test-user-123"
        token = self.auth_manager.generate_password_reset_token(user_id)
        
        # トークンを検証
        verified_user_id = self.auth_manager.verify_password_reset_token(token)
        assert verified_user_id == user_id
        
        # 不正なトークン
        invalid_result = self.auth_manager.verify_password_reset_token("invalid_token")
        assert invalid_result is None
        
        print("✅ Password reset token test passed!")


class TestAuthIntegration:
    """認証システム統合テスト"""
    
    def setup_method(self):
        """テストセットアップ"""
        os.environ["ENV"] = "development"
        os.environ["DEVELOPMENT_MODE"] = "1"
        self.client = TestClient(app)
    
    def test_health_check(self):
        """ヘルスチェックエンドポイント"""
        print("\n=== Health Check Test ===")
        
        response = self.client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["message"] == "大家DX API"
        assert data["status"] == "running"
        assert data["authenticated"] is False
        
        print("✅ Health check test passed!")
    
    def test_token_endpoint(self):
        """トークン取得エンドポイント"""
        print("\n=== Token Endpoint Test ===")
        
        # 開発環境での認証
        credentials = {
            "email": "admin@example.com",
            "password": "test_password"
        }
        
        response = self.client.post("/api/auth/token", json=credentials)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "ADMIN"
        
        print("✅ Token endpoint test passed!")
    
    def test_me_endpoint(self):
        """認証ユーザー情報エンドポイント"""
        print("\n=== Me Endpoint Test ===")
        
        # まずトークンを取得
        credentials = {"email": "admin@example.com"}
        token_response = self.client.post("/api/auth/token", json=credentials)
        token = token_response.json()["access_token"]
        
        # /me エンドポイントをテスト
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["authenticated"] is True
        assert "user" in data
        assert data["user"]["role"] == "ADMIN"
        assert "permissions" in data["user"]
        
        print("✅ Me endpoint test passed!")
    
    def test_protected_endpoint_without_auth(self):
        """認証なしでの保護されたエンドポイントアクセス"""
        print("\n=== Protected Endpoint Without Auth Test ===")
        
        response = self.client.get("/api/auth/me")
        assert response.status_code == 403  # Forbidden
        
        print("✅ Protected endpoint without auth test passed!")
    
    def test_simulation_endpoint_auth(self):
        """シミュレーションエンドポイントの認証テスト"""
        print("\n=== Simulation Endpoint Auth Test ===")
        
        # 認証トークンを取得
        credentials = {"email": "admin@example.com"}
        token_response = self.client.post("/api/auth/token", json=credentials)
        token = token_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # シミュレーション用のテストデータ
        simulation_data = {
            "property_data": {
                "purchase_price": 3000,
                "monthly_rent": 10,
                "initial_cost": 300,
                "management_cost": 1,
                "repair_cost": 1,
                "vacancy_rate": 5,
                "land_area": 100,
                "building_area": 80,
                "holding_years": 10
            },
            "include_cash_flow_table": False
        }
        
        response = self.client.post("/api/simulate", json=simulation_data, headers=headers)
        
        # 認証されたユーザーはアクセス可能
        assert response.status_code == 200
        
        print("✅ Simulation endpoint auth test passed!")


class TestUserManagement:
    """ユーザー管理APIのテスト"""
    
    def setup_method(self):
        """テストセットアップ"""
        os.environ["ENV"] = "development"
        os.environ["DEVELOPMENT_MODE"] = "1"
        self.client = TestClient(app)
        
        # 管理者トークンを取得
        credentials = {"email": "admin@example.com"}
        token_response = self.client.post("/api/auth/token", json=credentials)
        self.admin_token = token_response.json()["access_token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_user_list_endpoint(self):
        """ユーザーリスト取得エンドポイント"""
        print("\n=== User List Endpoint Test ===")
        
        response = self.client.get("/api/users/", headers=self.admin_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "users" in data
        assert "total_count" in data
        assert isinstance(data["users"], list)
        
        print("✅ User list endpoint test passed!")
    
    def test_user_management_permission(self):
        """ユーザー管理権限のテスト"""
        print("\n=== User Management Permission Test ===")
        
        # 標準ユーザーのトークンを取得
        credentials = {"email": "user@example.com"}
        token_response = self.client.post("/api/auth/token", json=credentials)
        user_token = token_response.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        # 標準ユーザーはユーザー管理にアクセスできない
        response = self.client.get("/api/users/", headers=user_headers)
        assert response.status_code == 403  # Forbidden
        
        print("✅ User management permission test passed!")


def test_rbac_integration():
    """RBAC統合テスト"""
    print("\n=== RBAC Integration Test ===")
    
    # 管理者権限のテスト
    admin_user = {"role": "ADMIN"}
    admin_role = rbac_manager.get_user_role(admin_user)
    admin_permissions = rbac_manager.get_user_permissions(admin_role)
    
    assert admin_role == UserRole.ADMIN
    assert Permission.USER_MANAGEMENT in admin_permissions
    assert Permission.SIMULATE_BASIC in admin_permissions
    
    # 標準ユーザー権限のテスト
    standard_user = {"role": "STANDARD"}
    standard_role = rbac_manager.get_user_role(standard_user)
    standard_permissions = rbac_manager.get_user_permissions(standard_role)
    
    assert standard_role == UserRole.STANDARD
    assert Permission.USER_MANAGEMENT not in standard_permissions
    assert Permission.SIMULATE_BASIC in standard_permissions
    
    print("✅ RBAC integration test passed!")


def test_error_handling():
    """エラーハンドリングのテスト"""
    print("\n=== Error Handling Test ===")
    
    # 認証エラーレスポンスのテスト
    try:
        raise create_auth_error_response("テスト認証エラー")
    except Exception as e:
        assert e.status_code == 401
        assert "認証" in str(e.detail)
    
    print("✅ Error handling test passed!")


def run_all_tests():
    """すべてのテストを実行"""
    print("=" * 60)
    print("SEC-073 Authentication System Integration Tests")
    print("=" * 60)
    
    try:
        # Supabase認証テスト
        auth_test = TestSupabaseAuth()
        auth_test.setup_method()
        auth_test.test_mock_token_verification()
        auth_test.test_get_mock_profile()
        auth_test.test_password_hash_verify()
        auth_test.test_password_reset_token()
        
        # 認証システム統合テスト
        integration_test = TestAuthIntegration()
        integration_test.setup_method()
        integration_test.test_health_check()
        integration_test.test_token_endpoint()
        integration_test.test_me_endpoint()
        integration_test.test_protected_endpoint_without_auth()
        integration_test.test_simulation_endpoint_auth()
        
        # ユーザー管理テスト
        user_mgmt_test = TestUserManagement()
        user_mgmt_test.setup_method()
        user_mgmt_test.test_user_list_endpoint()
        user_mgmt_test.test_user_management_permission()
        
        # その他の統合テスト
        test_rbac_integration()
        test_error_handling()
        
        print("\n" + "=" * 60)
        print("✅ All SEC-073 Authentication Tests Passed!")
        print("=" * 60)
        
        # テスト結果をサマリーで出力
        print("\n📋 Test Summary:")
        print("- Supabase Authentication Manager: ✅ PASS")
        print("- Mock Authentication (Development): ✅ PASS")
        print("- Password Hashing & Verification: ✅ PASS")
        print("- Password Reset Tokens: ✅ PASS")
        print("- API Endpoint Authentication: ✅ PASS")
        print("- Role-Based Access Control (RBAC): ✅ PASS")
        print("- User Management APIs: ✅ PASS")
        print("- Error Handling: ✅ PASS")
        
        print("\n🔒 Security Features Verified:")
        print("- JWT Token Generation & Validation")
        print("- Supabase Integration (Mock)")
        print("- User Profile Management")
        print("- Role-Based Permissions")
        print("- Password Security")
        print("- Authentication Error Handling")
        print("- Protected Endpoint Access Control")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)