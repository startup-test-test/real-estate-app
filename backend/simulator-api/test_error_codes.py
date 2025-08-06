"""
エラーコードのテストスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from error_codes import ErrorCode, SimulatorError, create_error_response

def test_error_codes():
    """エラーコードの動作確認"""
    
    print("=== エラーコードテスト開始 ===\n")
    
    # 1. バリデーションエラー
    print("1. バリデーションエラー (E4001)")
    error1 = SimulatorError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        field="property_name",
        detail="物件名が入力されていません"
    )
    print(f"  エラーコード: {error1.error_code}")
    print(f"  メッセージ: {error1.message}")
    print(f"  対処法: {error1.solution}")
    print(f"  詳細: {error1.to_dict()}\n")
    
    # 2. 計算エラー
    print("2. 計算エラー (E5001)")
    error2 = SimulatorError(
        ErrorCode.CALC_DIVISION_BY_ZERO,
        field="exit_cap_rate",
        value=0,
        detail="Cap Rateが0のため計算できません"
    )
    print(f"  エラーコード: {error2.error_code}")
    print(f"  メッセージ: {error2.message}")
    print(f"  対処法: {error2.solution}")
    print(f"  詳細: {error2.to_dict()}\n")
    
    # 3. システムエラー
    print("3. システムエラー (E5500)")
    response = create_error_response(
        ErrorCode.SYSTEM_GENERAL,
        status_code=500,
        detail="予期しないエラーが発生しました"
    )
    print(f"  レスポンス: {response}\n")
    
    # 4. 複数エラーの処理
    print("4. 複数のバリデーションエラー")
    errors = [
        {"field": "property_name", "message": "物件名は必須項目です", "error_code": "E4001"},
        {"field": "location", "message": "所在地は必須項目です", "error_code": "E4001"},
        {"field": "purchase_price", "message": "購入価格は0以上で入力してください", "error_code": "E4002"}
    ]
    print(f"  エラー詳細: {errors}\n")
    
    print("=== テスト完了 ===")

if __name__ == "__main__":
    test_error_codes()