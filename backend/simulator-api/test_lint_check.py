"""
Lintエラーの確認テスト
"""

# error_handler.pyがインポートできるか確認
try:
    from error_handler import (
        is_production,
        SecureErrorHandler,
        ERROR_CODES,
        USER_MESSAGES,
        handle_http_exception,
        handle_general_exception,
        create_validation_error_response,
        create_auth_error_response,
        create_permission_error_response
    )
    print("✅ error_handler.pyは正常にインポートできました")
    
    # 関数が正常に動作するか確認
    print(f"✅ is_production() = {is_production()}")
    
    # エラーコードの取得
    code = SecureErrorHandler.get_error_code(400)
    print(f"✅ get_error_code(400) = {code}")
    
    # エラーレスポンスの作成
    response = SecureErrorHandler.create_error_response(
        status_code=500,
        error_code=ERROR_CODES["INTERNAL_ERROR"],
        detail="Test error"
    )
    print(f"✅ create_error_response() = {response}")
    
    # 例外の作成
    exc = create_validation_error_response("test_field", "test error")
    print(f"✅ create_validation_error_response() = {exc.detail}")
    
    print("\n🎉 すべての関数が正常に動作しています！")
    
except Exception as e:
    print(f"❌ エラーが発生しました: {e}")
    import traceback
    traceback.print_exc()