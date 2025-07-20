"""
SEC-069: エラーハンドラーの動作確認テスト
"""

import os
import json
from error_handler import (
    SecureErrorHandler,
    ERROR_CODES,
    USER_MESSAGES,
    create_validation_error_response,
    create_auth_error_response,
    create_permission_error_response
)

def test_error_code_mapping():
    """エラーコードマッピングのテスト"""
    print("=== エラーコードマッピングテスト ===")
    
    test_cases = [
        (400, ERROR_CODES["API_VALIDATION"]),
        (401, ERROR_CODES["AUTH_FAILED"]),
        (403, ERROR_CODES["AUTH_INVALID"]),
        (404, ERROR_CODES["API_NOT_FOUND"]),
        (429, ERROR_CODES["RATE_LIMIT"]),
        (500, ERROR_CODES["INTERNAL_ERROR"]),
        (503, ERROR_CODES["SERVICE_UNAVAILABLE"])
    ]
    
    for status_code, expected_code in test_cases:
        actual_code = SecureErrorHandler.get_error_code(status_code)
        assert actual_code == expected_code, f"Status {status_code}: expected {expected_code}, got {actual_code}"
        print(f"✓ Status {status_code} → {actual_code}")

def test_error_response_production():
    """本番環境でのエラーレスポンステスト"""
    print("\n=== 本番環境エラーレスポンステスト ===")
    
    # 本番環境を模擬
    os.environ["ENV"] = "production"
    
    response = SecureErrorHandler.create_error_response(
        status_code=500,
        error_code=ERROR_CODES["INTERNAL_ERROR"],
        detail="Database connection failed: psycopg2.OperationalError",
        request_id="test-123"
    )
    
    # 詳細情報が含まれていないことを確認
    assert "detail" not in response["error"]
    assert response["error"]["message"] == USER_MESSAGES[ERROR_CODES["INTERNAL_ERROR"]]
    assert response["error"]["request_id"] == "test-123"
    
    print(f"✓ 本番環境レスポンス: {json.dumps(response, ensure_ascii=False, indent=2)}")

def test_error_response_development():
    """開発環境でのエラーレスポンステスト"""
    print("\n=== 開発環境エラーレスポンステスト ===")
    
    # 開発環境を模擬
    os.environ["ENV"] = "development"
    
    response = SecureErrorHandler.create_error_response(
        status_code=400,
        error_code=ERROR_CODES["API_VALIDATION"],
        detail="Invalid field: age must be positive",
        request_id="test-456"
    )
    
    # 詳細情報が含まれていることを確認
    assert "detail" in response["error"]
    assert response["error"]["detail"] == "Invalid field: age must be positive"
    
    print(f"✓ 開発環境レスポンス: {json.dumps(response, ensure_ascii=False, indent=2)}")

def test_exception_creation():
    """例外作成関数のテスト"""
    print("\n=== 例外作成関数テスト ===")
    
    # バリデーションエラー
    os.environ["ENV"] = "production"
    validation_error = create_validation_error_response("email", "Invalid email format")
    assert validation_error.status_code == 400
    assert validation_error.detail == "入力データが正しくありません"
    print("✓ 本番環境バリデーションエラー: 詳細情報が隠蔽されている")
    
    os.environ["ENV"] = "development"
    validation_error = create_validation_error_response("email", "Invalid email format")
    assert validation_error.detail == "email: Invalid email format"
    print("✓ 開発環境バリデーションエラー: 詳細情報が含まれている")
    
    # 認証エラー
    auth_error = create_auth_error_response()
    assert auth_error.status_code == 401
    assert auth_error.headers["WWW-Authenticate"] == "Bearer"
    print("✓ 認証エラー: 適切なヘッダーが設定されている")
    
    # 権限エラー
    permission_error = create_permission_error_response()
    assert permission_error.status_code == 403
    print("✓ 権限エラー: 適切なステータスコード")

def test_user_messages():
    """ユーザー向けメッセージのテスト"""
    print("\n=== ユーザー向けメッセージテスト ===")
    
    # すべてのエラーコードにメッセージが定義されていることを確認
    for code_name, code_value in ERROR_CODES.items():
        assert code_value in USER_MESSAGES, f"Missing user message for {code_name}"
        print(f"✓ {code_name}: {USER_MESSAGES[code_value]}")

if __name__ == "__main__":
    print("SEC-069: エラーハンドラーテスト開始\n")
    
    test_error_code_mapping()
    test_error_response_production()
    test_error_response_development()
    test_exception_creation()
    test_user_messages()
    
    print("\n✅ すべてのテストが成功しました！")
    print("\n実装内容:")
    print("- エラーコードの標準化")
    print("- ユーザー向けメッセージの統一")
    print("- 環境に応じた詳細情報の制御")
    print("- リクエストIDによるトレーサビリティ")
    print("- セキュアなエラーレスポンス")