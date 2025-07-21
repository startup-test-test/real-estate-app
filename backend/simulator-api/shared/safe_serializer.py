"""
SEC-059: Python Pickle/eval攻撃経路対策
安全なシリアライゼーション機能と危険な関数の使用防止
"""

import json
import logging
from typing import Any, Dict, List, Union, Optional
from functools import wraps

logger = logging.getLogger(__name__)


class UnsafeOperationError(Exception):
    """危険な操作を検出した際の例外"""
    pass


class SafeSerializer:
    """安全なデータシリアライゼーションクラス"""
    
    DANGEROUS_FUNCTIONS = {
        'eval', 'exec', 'compile', '__import__', 
        'globals', 'locals', 'vars', 'dir',
        'getattr', 'setattr', 'delattr', 'hasattr'
    }
    
    DANGEROUS_MODULES = {
        'pickle', 'dill', 'cloudpickle', 'marshal',
        'shelve', 'dbm', 'subprocess', 'os'
    }
    
    @staticmethod
    def serialize_data(data: Any) -> str:
        """
        データを安全にJSON形式でシリアライズ
        
        Args:
            data: シリアライズするデータ
            
        Returns:
            JSON文字列
            
        Raises:
            UnsafeOperationError: 危険なデータ型が含まれる場合
            TypeError: シリアライズできないデータ型の場合
        """
        try:
            # 危険なオブジェクトタイプをチェック
            SafeSerializer._validate_data_safety(data)
            
            # JSONシリアライゼーション（安全）
            return json.dumps(
                data, 
                ensure_ascii=False, 
                separators=(',', ':'),
                default=SafeSerializer._default_handler
            )
        except (TypeError, ValueError) as e:
            logger.error(f"Safe serialization failed: {e}")
            raise UnsafeOperationError(f"シリアライゼーションエラー: {e}")
    
    @staticmethod
    def deserialize_data(json_str: str) -> Any:
        """
        JSON文字列を安全にデシリアライズ
        
        Args:
            json_str: JSON文字列
            
        Returns:
            デシリアライズされたデータ
            
        Raises:
            UnsafeOperationError: 不正なJSONまたは危険なデータの場合
        """
        try:
            # 文字列の基本的な検証
            if not isinstance(json_str, str):
                raise UnsafeOperationError("入力はJSON文字列である必要があります")
            
            # 危険なパターンをチェック
            SafeSerializer._validate_json_string(json_str)
            
            # JSON デシリアライゼーション（安全）
            data = json.loads(json_str)
            
            # デシリアライズ後のデータ検証
            SafeSerializer._validate_data_safety(data)
            
            return data
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Safe deserialization failed: {e}")
            raise UnsafeOperationError(f"デシリアライゼーションエラー: {e}")
    
    @staticmethod
    def _validate_data_safety(data: Any, max_depth: int = 10, current_depth: int = 0) -> None:
        """
        データの安全性を検証
        
        Args:
            data: 検証するデータ
            max_depth: 最大ネスト深度
            current_depth: 現在の深度
            
        Raises:
            UnsafeOperationError: 危険なデータが検出された場合
        """
        if current_depth > max_depth:
            raise UnsafeOperationError("データのネスト深度が深すぎます")
        
        # 許可されたタイプのチェック
        safe_types = (str, int, float, bool, type(None), list, dict)
        
        if not isinstance(data, safe_types):
            raise UnsafeOperationError(f"危険なデータ型が検出されました: {type(data)}")
        
        # 再帰的にチェック
        if isinstance(data, dict):
            for key, value in data.items():
                if not isinstance(key, (str, int)):
                    raise UnsafeOperationError(f"危険なキー型が検出されました: {type(key)}")
                SafeSerializer._validate_data_safety(value, max_depth, current_depth + 1)
                
        elif isinstance(data, list):
            for item in data:
                SafeSerializer._validate_data_safety(item, max_depth, current_depth + 1)
    
    @staticmethod
    def _validate_json_string(json_str: str) -> None:
        """
        JSON文字列の危険なパターンをチェック
        
        Args:
            json_str: チェックするJSON文字列
            
        Raises:
            UnsafeOperationError: 危険なパターンが検出された場合
        """
        dangerous_patterns = [
            '__import__',
            '__builtins__',
            '__globals__',
            '__locals__',
            'eval(',
            'exec(',
            'compile(',
            'subprocess.',
            'os.system',
            'os.popen',
            'pickle.',
            'dill.',
            'marshal.',
        ]
        
        json_lower = json_str.lower()
        for pattern in dangerous_patterns:
            if pattern in json_lower:
                raise UnsafeOperationError(f"危険なパターンが検出されました: {pattern}")
        
        # 異常に長い文字列をチェック（DoS攻撃防止）
        if len(json_str) > 1024 * 1024:  # 1MB制限
            raise UnsafeOperationError("JSON文字列が大きすぎます")
    
    @staticmethod
    def _default_handler(obj: Any) -> str:
        """JSONシリアライズ用のデフォルトハンドラー"""
        if hasattr(obj, '__dict__'):
            return str(obj)  # オブジェクトを文字列として扱う
        raise TypeError(f"型 {type(obj)} はシリアライズできません")


def prevent_dangerous_imports(func):
    """危険なインポートを防ぐデコレータ"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 実行時に危険なモジュールがインポートされていないかチェック
        import sys
        for module_name in SafeSerializer.DANGEROUS_MODULES:
            if module_name in sys.modules:
                logger.warning(f"危険なモジュールが検出されました: {module_name}")
                # 本番環境では例外を発生させる
                if not __debug__:  # 本番環境（python -O）
                    raise UnsafeOperationError(f"危険なモジュール {module_name} の使用は禁止されています")
        
        return func(*args, **kwargs)
    return wrapper


def safe_json_parse(json_str: str) -> Dict[str, Any]:
    """
    安全なJSON解析関数
    
    Args:
        json_str: 解析するJSON文字列
        
    Returns:
        解析されたディクショナリ
        
    Raises:
        UnsafeOperationError: 危険なデータが検出された場合
    """
    return SafeSerializer.deserialize_data(json_str)


def safe_json_stringify(data: Any) -> str:
    """
    安全なJSON文字列化関数
    
    Args:
        data: 文字列化するデータ
        
    Returns:
        JSON文字列
        
    Raises:
        UnsafeOperationError: 危険なデータが検出された場合
    """
    return SafeSerializer.serialize_data(data)


# 使用例とテスト用の関数
def test_safe_serialization():
    """安全なシリアライゼーションのテスト"""
    
    # 正常なデータのテスト
    safe_data = {
        "name": "テスト物件",
        "price": 3000,
        "features": ["駅近", "築浅"],
        "details": {
            "rooms": 3,
            "area": 75.5,
            "parking": True
        }
    }
    
    try:
        # シリアライズ
        serialized = SafeSerializer.serialize_data(safe_data)
        print("✅ 安全なシリアライゼーション成功")
        
        # デシリアライズ
        deserialized = SafeSerializer.deserialize_data(serialized)
        print("✅ 安全なデシリアライゼーション成功")
        
        # データの整合性確認
        assert deserialized == safe_data
        print("✅ データ整合性確認成功")
        
    except UnsafeOperationError as e:
        print(f"❌ 安全なデータでエラー: {e}")
    
    # 危険なデータのテスト
    dangerous_json = '{"__import__": "os", "exec": "malicious code"}'
    
    try:
        SafeSerializer.deserialize_data(dangerous_json)
        print("❌ 危険なデータの検出に失敗")
    except UnsafeOperationError:
        print("✅ 危険なデータを正しく検出・拒否")


if __name__ == "__main__":
    test_safe_serialization()