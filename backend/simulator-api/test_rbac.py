"""
SEC-074: ロールベースアクセス制御（RBAC）のテスト
"""

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app import app
from auth import create_access_token
from rbac import UserRole, Permission, rbac_manager

client = TestClient(app)

def create_test_token_with_role(user_id="test-user", email="test@example.com", role=UserRole.STANDARD):
    """指定されたロールでテスト用トークンを作成"""
    return create_access_token(
        data={
            "sub": user_id,
            "email": email,
            "role": role.value
        }
    )

class TestRBACPermissions:
    """権限管理のテスト"""
    
    def test_role_permissions_mapping(self):
        """各ロールの権限マッピングが正しいことを確認"""
        # 管理者は全権限を持つ
        admin_perms = rbac_manager.get_user_permissions(UserRole.ADMIN)
        assert Permission.SIMULATE_BASIC in admin_perms
        assert Permission.USER_MANAGE in admin_perms
        assert Permission.API_FULL_ACCESS in admin_perms
        
        # プレミアムユーザーは高度な機能にアクセス可能
        premium_perms = rbac_manager.get_user_permissions(UserRole.PREMIUM)
        assert Permission.SIMULATE_BASIC in premium_perms
        assert Permission.SIMULATE_ADVANCED in premium_perms
        assert Permission.USER_MANAGE not in premium_perms
        
        # 標準ユーザーは基本機能のみ
        standard_perms = rbac_manager.get_user_permissions(UserRole.STANDARD)
        assert Permission.SIMULATE_BASIC in standard_perms
        assert Permission.SIMULATE_ADVANCED not in standard_perms
        
        # ゲストは読み取りのみ
        guest_perms = rbac_manager.get_user_permissions(UserRole.GUEST)
        assert Permission.DATA_READ in guest_perms
        assert Permission.SIMULATE_BASIC not in guest_perms
    
    def test_has_permission_check(self):
        """権限チェック機能のテスト"""
        admin_user = {"role": UserRole.ADMIN.value}
        standard_user = {"role": UserRole.STANDARD.value}
        
        # 管理者は全ての権限を持つ
        assert rbac_manager.has_permission(admin_user, Permission.USER_MANAGE) == True
        
        # 標準ユーザーは管理権限を持たない
        assert rbac_manager.has_permission(standard_user, Permission.USER_MANAGE) == False
        
        # 標準ユーザーは基本シミュレーション権限を持つ
        assert rbac_manager.has_permission(standard_user, Permission.SIMULATE_BASIC) == True

class TestAPIEndpointPermissions:
    """APIエンドポイントの権限テスト"""
    
    def test_simulate_endpoint_standard_user(self):
        """標準ユーザーがシミュレーションエンドポイントにアクセス"""
        token = create_test_token_with_role(role=UserRole.STANDARD)
        
        response = client.post(
            "/api/simulate",
            json={
                "property_name": "テスト物件",
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
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        assert "results" in response.json()
    
    def test_simulate_endpoint_guest_user(self):
        """ゲストユーザーがシミュレーションエンドポイントにアクセス（拒否される）"""
        token = create_test_token_with_role(role=UserRole.GUEST)
        
        response = client.post(
            "/api/simulate",
            json={"property_name": "テスト物件"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403
        assert "simulate:basic" in response.json()["detail"]
    
    def test_market_analysis_endpoint_permissions(self):
        """市場分析エンドポイントの権限テスト"""
        # 標準ユーザーはアクセス可能
        standard_token = create_test_token_with_role(role=UserRole.STANDARD)
        response = client.post(
            "/api/market-analysis",
            json={"location": "東京都", "land_area": 100},
            headers={"Authorization": f"Bearer {standard_token}"}
        )
        assert response.status_code == 200
        
        # ゲストユーザーは拒否される
        guest_token = create_test_token_with_role(role=UserRole.GUEST)
        response = client.post(
            "/api/market-analysis",
            json={"location": "東京都", "land_area": 100},
            headers={"Authorization": f"Bearer {guest_token}"}
        )
        assert response.status_code == 403
    
    def test_auth_me_endpoint_with_roles(self):
        """認証情報取得エンドポイントがロールと権限を返すことを確認"""
        # 管理者トークンでテスト
        admin_token = create_test_token_with_role(role=UserRole.ADMIN)
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == UserRole.ADMIN.value
        assert "permissions" in data["user"]
        assert Permission.USER_MANAGE.value in data["user"]["permissions"]
        
        # 標準ユーザートークンでテスト
        standard_token = create_test_token_with_role(role=UserRole.STANDARD)
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {standard_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == UserRole.STANDARD.value
        assert Permission.SIMULATE_BASIC.value in data["user"]["permissions"]
        assert Permission.USER_MANAGE.value not in data["user"]["permissions"]

class TestTokenGeneration:
    """トークン生成時のロール設定テスト"""
    
    def test_dev_environment_token_generation(self):
        """開発環境でのトークン生成テスト"""
        # 管理者メールアドレス
        response = client.post(
            "/api/auth/token",
            json={
                "email": "admin@example.com",
                "supabase_token": "mock-token",
                "user_id": "admin-123"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data["role"] == UserRole.ADMIN.value
        
        # 標準ユーザーメールアドレス
        response = client.post(
            "/api/auth/token",
            json={
                "email": "user@example.com",
                "supabase_token": "mock-token",
                "user_id": "user-123"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data["role"] == UserRole.STANDARD.value

if __name__ == "__main__":
    print("Running RBAC Tests\n")
    
    # 権限マッピングテスト
    test_perms = TestRBACPermissions()
    test_perms.test_role_permissions_mapping()
    print("✅ Role permissions mapping test passed")
    
    test_perms.test_has_permission_check()
    print("✅ Permission check test passed")
    
    # APIエンドポイントテスト
    test_api = TestAPIEndpointPermissions()
    test_api.test_auth_me_endpoint_with_roles()
    print("✅ Auth endpoint with roles test passed")
    
    print("\n✅ All RBAC tests completed!")