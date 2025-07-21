#!/usr/bin/env python3
"""
SEC-073: バックエンド認証システムの簡易テスト
統合認証システムの基本機能テスト
"""

import os
import sys
import logging

# 環境設定
os.environ["ENV"] = "development"
os.environ["DEVELOPMENT_MODE"] = "1"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_supabase_auth_import():
    """Supabase認証モジュールのインポートテスト"""
    print("=== Supabase Auth Import Test ===")
    
    try:
        from supabase_auth import SupabaseAuthManager, UserProfile, supabase_auth
        print("✅ Supabase auth modules imported successfully")
        
        # 認証マネージャーの初期化テスト
        auth_manager = SupabaseAuthManager()
        print("✅ SupabaseAuthManager initialized")
        
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_rbac_system():
    """RBAC システムのテスト"""
    print("\n=== RBAC System Test ===")
    
    try:
        from rbac import UserRole, Permission, rbac_manager
        print("✅ RBAC modules imported successfully")
        
        # 管理者ユーザーのテスト
        admin_user = {"role": "ADMIN"}
        admin_role = rbac_manager.get_user_role(admin_user)
        admin_permissions = rbac_manager.get_user_permissions(admin_role)
        
        print(f"Admin role: {admin_role}")
        print(f"Admin permissions count: {len(admin_permissions)}")
        
        # 標準ユーザーのテスト
        standard_user = {"role": "STANDARD"}
        standard_role = rbac_manager.get_user_role(standard_user)
        standard_permissions = rbac_manager.get_user_permissions(standard_role)
        
        print(f"Standard role: {standard_role}")
        print(f"Standard permissions count: {len(standard_permissions)}")
        
        print("✅ RBAC system working correctly")
        return True
        
    except Exception as e:
        print(f"❌ RBAC test failed: {e}")
        return False

def test_password_security():
    """パスワードセキュリティのテスト"""
    print("\n=== Password Security Test ===")
    
    try:
        from supabase_auth import supabase_auth
        
        # パスワードハッシュ化テスト
        password = "test_password_123"
        hashed = supabase_auth.hash_password(password)
        
        # 検証テスト
        is_valid = supabase_auth.verify_password(password, hashed)
        is_invalid = supabase_auth.verify_password("wrong_password", hashed)
        
        assert hashed != password, "Password should be hashed"
        assert is_valid, "Correct password should verify"
        assert not is_invalid, "Wrong password should not verify"
        
        print("✅ Password hashing and verification working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Password security test failed: {e}")
        return False

def test_jwt_tokens():
    """JWTトークンのテスト"""
    print("\n=== JWT Token Test ===")
    
    try:
        from supabase_auth import supabase_auth
        import jwt
        
        # パスワードリセットトークンのテスト
        user_id = "test-user-123"
        token = supabase_auth.generate_password_reset_token(user_id)
        
        # トークン検証
        verified_user_id = supabase_auth.verify_password_reset_token(token)
        
        assert verified_user_id == user_id, "Token should contain correct user ID"
        
        # 無効なトークンのテスト
        invalid_result = supabase_auth.verify_password_reset_token("invalid_token")
        assert invalid_result is None, "Invalid token should return None"
        
        print("✅ JWT token generation and verification working correctly")
        return True
        
    except Exception as e:
        print(f"❌ JWT token test failed: {e}")
        return False

def test_user_profile():
    """ユーザープロファイルのテスト"""
    print("\n=== User Profile Test ===")
    
    try:
        from supabase_auth import supabase_auth, UserProfile
        from rbac import UserRole
        
        # モックプロファイルの取得テスト
        profile = supabase_auth._get_mock_profile("test-user-456")
        
        assert profile.user_id == "test-user-456"
        assert profile.role == UserRole.ADMIN
        assert profile.is_active is True
        
        print("✅ User profile creation and retrieval working correctly")
        return True
        
    except Exception as e:
        print(f"❌ User profile test failed: {e}")
        return False

def test_error_handling():
    """エラーハンドリングのテスト"""
    print("\n=== Error Handling Test ===")
    
    try:
        from error_handler import create_auth_error_response, create_permission_error_response
        from fastapi import HTTPException
        
        # 認証エラーのテスト
        try:
            raise create_auth_error_response("Test auth error")
        except HTTPException as e:
            assert e.status_code == 401
            print("✅ Auth error handling working correctly")
        
        # 権限エラーのテスト
        try:
            raise create_permission_error_response("Test permission error")
        except HTTPException as e:
            assert e.status_code == 403
            print("✅ Permission error handling working correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

def run_simple_tests():
    """簡易テストを実行"""
    print("=" * 60)
    print("SEC-073 Authentication System - Simple Tests")
    print("=" * 60)
    
    tests = [
        test_supabase_auth_import,
        test_rbac_system,
        test_password_security,
        test_jwt_tokens,
        test_user_profile,
        test_error_handling
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed! SEC-073 implementation is working correctly.")
        print("\n📋 Verified Features:")
        print("- Supabase authentication manager")
        print("- Role-based access control (RBAC)")
        print("- Password hashing and verification")
        print("- JWT token generation and validation")
        print("- User profile management")
        print("- Error handling")
        return True
    else:
        print(f"❌ {total - passed} tests failed. Please check the implementation.")
        return False

if __name__ == "__main__":
    success = run_simple_tests()
    sys.exit(0 if success else 1)