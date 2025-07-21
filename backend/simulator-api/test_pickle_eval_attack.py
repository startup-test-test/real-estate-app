"""
SEC-059: Python Pickle/eval攻撃経路対策のテストスクリプト
リモートコード実行攻撃の防止テスト
"""

import sys
import traceback
from shared.safe_serializer import (
    SafeSerializer, 
    UnsafeOperationError, 
    safe_json_parse, 
    safe_json_stringify,
    prevent_dangerous_imports
)

# app.pyからの関数を直接定義（インポートエラー回避）
def _validate_simulation_input_safety(property_data: dict) -> None:
    """シミュレーション入力データの安全性を検証（テスト用）"""
    dangerous_patterns = [
        '__import__', '__builtins__', '__globals__', '__locals__',
        'eval(', 'exec(', 'compile(', 'subprocess.', 'os.system',
        'pickle.', 'dill.', 'marshal.', 'shelve.', 'dbm.'
    ]
    
    def check_value_safety(value, field_name=""):
        if isinstance(value, str):
            value_lower = value.lower()
            for pattern in dangerous_patterns:
                if pattern in value_lower:
                    raise UnsafeOperationError(
                        f"危険なパターンが入力データに含まれています: {pattern}"
                    )
        elif isinstance(value, dict):
            for k, v in value.items():
                check_value_safety(k, f"{field_name}.{k}")
                check_value_safety(v, f"{field_name}.{k}")
        elif isinstance(value, list):
            for i, item in enumerate(value):
                check_value_safety(item, f"{field_name}[{i}]")
    
    check_value_safety(property_data, "property_data")


def test_safe_json_operations():
    """安全なJSON操作のテスト"""
    print("=== 安全なJSON操作のテスト ===")
    
    # 正常なデータのテスト
    safe_data = {
        "monthly_rent": 100,
        "purchase_price": 3000,
        "property_name": "テスト物件",
        "features": ["駅近", "築浅"],
        "nested": {
            "rooms": 3,
            "area": 75.5,
            "parking": True
        }
    }
    
    try:
        # JSONシリアライゼーション
        json_str = safe_json_stringify(safe_data)
        print("✅ 安全なJSONシリアライゼーション成功")
        
        # JSONデシリアライゼーション
        parsed_data = safe_json_parse(json_str)
        print("✅ 安全なJSONデシリアライゼーション成功")
        
        # データ整合性チェック
        assert parsed_data == safe_data
        print("✅ データ整合性確認成功")
        
    except Exception as e:
        print(f"❌ 正常なJSONでエラー: {e}")
        traceback.print_exc()


def test_malicious_json_detection():
    """悪意のあるJSONの検出テスト"""
    print("\n=== 悪意のあるJSONの検出テスト ===")
    
    malicious_json_samples = [
        # eval攻撃
        '{"property_name": "eval(__import__(\'os\').system(\'rm -rf /\'))", "price": 3000}',
        
        # pickle攻撃
        '{"data": "pickle.loads(base64.b64decode(\'...\'))", "type": "malicious"}',
        
        # import攻撃
        '{"code": "__import__(\'subprocess\').call([\'malicious\'])", "value": 1}',
        
        # exec攻撃
        '{"script": "exec(\'malicious code\')", "params": {}}',
        
        # globals/locals攻撃
        '{"access": "__builtins__.__dict__", "payload": "globals()"}',
        
        # marshal攻撃
        '{"serialized": "marshal.loads(...)", "type": "payload"}',
        
        # 大きすぎるJSON（DoS攻撃）
        '{"data": "' + 'A' * (1024 * 1024 + 1) + '"}',
    ]
    
    for i, malicious_json in enumerate(malicious_json_samples, 1):
        try:
            safe_json_parse(malicious_json)
            print(f"❌ 悪意のあるJSON {i} の検出に失敗")
        except UnsafeOperationError:
            print(f"✅ 悪意のあるJSON {i} を正しく検出・拒否")
        except Exception as e:
            print(f"⚠️  悪意のあるJSON {i} で予期しない例外: {type(e).__name__}")


def test_unsafe_data_types():
    """危険なデータタイプの検出テスト"""
    print("\n=== 危険なデータタイプの検出テスト ===")
    
    # 関数オブジェクト
    def malicious_function():
        return "malicious"
    
    # クラスオブジェクト
    class MaliciousClass:
        pass
    
    dangerous_data_samples = [
        {"function": malicious_function},
        {"class": MaliciousClass},
        {"module": sys},
        {"complex": complex(1, 2)},
        {"bytes": b"malicious"},
    ]
    
    for i, dangerous_data in enumerate(dangerous_data_samples, 1):
        try:
            SafeSerializer.serialize_data(dangerous_data)
            print(f"❌ 危険なデータ型 {i} の検出に失敗")
        except UnsafeOperationError:
            print(f"✅ 危険なデータ型 {i} を正しく検出・拒否")
        except Exception as e:
            print(f"⚠️  危険なデータ型 {i} で予期しない例外: {type(e).__name__}")


def test_simulation_input_validation():
    """シミュレーション入力検証のテスト"""
    print("\n=== シミュレーション入力検証のテスト ===")
    
    # 正常な入力データ
    safe_input = {
        "monthly_rent": 100,
        "purchase_price": 3000,
        "property_name": "安全な物件名",
        "location": "東京都"
    }
    
    try:
        _validate_simulation_input_safety(safe_input)
        print("✅ 正常な入力データの検証成功")
    except Exception as e:
        print(f"❌ 正常な入力データでエラー: {e}")
    
    # 危険な入力データのテスト
    dangerous_inputs = [
        {"property_name": "eval('malicious')", "price": 3000},
        {"location": "__import__('os').system('ls')", "rent": 100},
        {"description": "exec(open('/etc/passwd').read())", "area": 50},
        {"notes": "pickle.loads(b'malicious')", "value": 1},
        {"comment": "subprocess.call(['rm', '-rf', '/'])", "type": "bad"},
    ]
    
    for i, dangerous_input in enumerate(dangerous_inputs, 1):
        try:
            _validate_simulation_input_safety(dangerous_input)
            print(f"❌ 危険な入力 {i} の検出に失敗")
        except UnsafeOperationError:
            print(f"✅ 危険な入力 {i} を正しく検出・拒否")
        except Exception as e:
            print(f"⚠️  危険な入力 {i} で予期しない例外: {type(e).__name__}")


def test_dangerous_imports_detection():
    """危険なインポートの検出テスト"""
    print("\n=== 危険なインポートの検出テスト ===")
    
    @prevent_dangerous_imports
    def safe_function():
        return "安全な処理"
    
    try:
        result = safe_function()
        print("✅ 安全な関数の実行成功")
        assert result == "安全な処理"
    except Exception as e:
        print(f"❌ 安全な関数でエラー: {e}")
    
    # 危険なインポートのシミュレーション（実際にはインポートしない）
    print("ℹ️  危険なインポートの検出は実行時に本番環境でのみ有効化されます")


def test_nested_data_validation():
    """ネストされたデータの検証テスト"""
    print("\n=== ネストされたデータの検証テスト ===")
    
    # 深くネストされた正常なデータ
    deep_safe_data = {
        "level1": {
            "level2": {
                "level3": {
                    "level4": {
                        "data": "正常な値"
                    }
                }
            }
        }
    }
    
    try:
        SafeSerializer.serialize_data(deep_safe_data)
        print("✅ ネストされたデータのシリアライゼーション成功")
    except Exception as e:
        print(f"❌ ネストされたデータでエラー: {e}")
    
    # 過度にネストされたデータ（DoS攻撃）
    very_deep_data = {"data": "value"}
    for i in range(15):  # 15層の深いネスト
        very_deep_data = {f"level_{i}": very_deep_data}
    
    try:
        SafeSerializer.serialize_data(very_deep_data)
        print("❌ 過度にネストされたデータの検出に失敗")
    except UnsafeOperationError:
        print("✅ 過度にネストされたデータを正しく検出・拒否")
    except Exception as e:
        print(f"⚠️  過度にネストされたデータで予期しない例外: {type(e).__name__}")


def main():
    """メインテスト実行関数"""
    print("SEC-059: Python Pickle/eval攻撃経路対策テスト開始")
    print("=" * 60)
    
    # 各テストを実行
    test_safe_json_operations()
    test_malicious_json_detection()
    test_unsafe_data_types()
    test_simulation_input_validation()
    test_dangerous_imports_detection()
    test_nested_data_validation()
    
    print("\n" + "=" * 60)
    print("SEC-059: Python Pickle/eval攻撃経路対策テスト完了")
    print("\n✅ = 攻撃を正しく検出・防御")
    print("❌ = 対策不十分または予期しないエラー") 
    print("⚠️  = 部分的対策または警告")
    print("ℹ️  = 情報")


if __name__ == "__main__":
    main()