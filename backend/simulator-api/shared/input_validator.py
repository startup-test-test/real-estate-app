"""
SEC-058: 数値計算における整数オーバーフロー攻撃対策
DoS攻撃防止のための入力検証とメモリ制限
"""

import sys
import time
import psutil
import threading
from typing import Dict, Any, Optional, Union, List
from functools import wraps


class SecurityLimits:
    """セキュリティ制限の定義"""
    
    # 数値制限（万円単位）
    MAX_PROPERTY_PRICE = 100000  # 100億円
    MAX_LOAN_AMOUNT = 100000     # 100億円
    MAX_RENT = 10000            # 1000万円/月
    MAX_YEARS = 100             # 100年
    MAX_INTEREST_RATE = 50      # 50%
    MAX_TAX_RATE = 100          # 100%
    
    # メモリとパフォーマンス制限
    MAX_MEMORY_MB = 100         # 100MB
    MAX_CALCULATION_TIME_SEC = 10  # 10秒
    MAX_ITERATIONS = 1000       # 最大反復回数
    
    # 文字列制限
    MAX_STRING_LENGTH = 200
    MAX_ARRAY_SIZE = 100


class DoSProtectionError(Exception):
    """DoS攻撃防止エラー"""
    pass


class MemoryMonitor:
    """メモリ使用量監視"""
    
    def __init__(self, max_memory_mb: int = SecurityLimits.MAX_MEMORY_MB):
        self.max_memory_mb = max_memory_mb
        self.initial_memory = self._get_current_memory()
        
    def _get_current_memory(self) -> float:
        """現在のメモリ使用量を取得（MB）"""
        try:
            process = psutil.Process()
            return process.memory_info().rss / 1024 / 1024
        except:
            return 0
            
    def check_memory_usage(self) -> None:
        """メモリ使用量をチェック"""
        current_memory = self._get_current_memory()
        memory_used = current_memory - self.initial_memory
        
        if memory_used > self.max_memory_mb:
            raise DoSProtectionError(
                f"メモリ使用量が制限を超過しました: {memory_used:.2f}MB > {self.max_memory_mb}MB"
            )


def timeout_handler(func):
    """計算時間制限デコレータ"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = [None]
        exception = [None]
        
        def target():
            try:
                result[0] = func(*args, **kwargs)
            except Exception as e:
                exception[0] = e
        
        thread = threading.Thread(target=target)
        thread.daemon = True
        thread.start()
        thread.join(timeout=SecurityLimits.MAX_CALCULATION_TIME_SEC)
        
        if thread.is_alive():
            raise DoSProtectionError(
                f"計算時間が制限を超過しました: {SecurityLimits.MAX_CALCULATION_TIME_SEC}秒"
            )
        
        if exception[0]:
            raise exception[0]
            
        return result[0]
    
    return wrapper


def validate_numeric_input(
    value: Union[int, float, str], 
    field_name: str,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None,
    allow_zero: bool = True,
    allow_negative: bool = False
) -> float:
    """数値入力の厳密な検証"""
    
    # 型変換
    try:
        if isinstance(value, str):
            # 危険な文字列パターンをチェック
            if any(char in value for char in ['e', 'E', 'inf', 'nan', 'x']):
                raise ValueError("不正な数値形式")
            numeric_value = float(value)
        else:
            numeric_value = float(value)
    except (ValueError, TypeError, OverflowError):
        raise DoSProtectionError(f"不正な数値: {field_name}")
    
    # 特殊値チェック
    if not isinstance(numeric_value, (int, float)) or \
       numeric_value != numeric_value or \
       numeric_value == float('inf') or \
       numeric_value == float('-inf'):
        raise DoSProtectionError(f"不正な数値（特殊値）: {field_name}")
    
    # 範囲チェック
    if not allow_zero and numeric_value == 0:
        raise DoSProtectionError(f"ゼロは許可されていません: {field_name}")
    
    if not allow_negative and numeric_value < 0:
        raise DoSProtectionError(f"負の値は許可されていません: {field_name}")
    
    if min_val is not None and numeric_value < min_val:
        raise DoSProtectionError(f"値が最小値を下回ります: {field_name} ({numeric_value} < {min_val})")
    
    if max_val is not None and numeric_value > max_val:
        raise DoSProtectionError(f"値が最大値を上回ります: {field_name} ({numeric_value} > {max_val})")
    
    # 極大値による攻撃をチェック
    if abs(numeric_value) > sys.maxsize / 10000:
        raise DoSProtectionError(f"値が大きすぎます: {field_name}")
    
    return numeric_value


def validate_calculation_params(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """計算パラメータの厳密な検証"""
    
    validated_data = {}
    
    # 基本的な数値フィールドの検証
    numeric_validations = {
        'monthly_rent': (0, SecurityLimits.MAX_RENT, False, True),
        'purchase_price': (1, SecurityLimits.MAX_PROPERTY_PRICE, False, True),
        'loan_amount': (0, SecurityLimits.MAX_LOAN_AMOUNT, True, True),
        'interest_rate': (0, SecurityLimits.MAX_INTEREST_RATE, True, True),
        'loan_years': (1, SecurityLimits.MAX_YEARS, False, True),
        'holding_years': (1, SecurityLimits.MAX_YEARS, False, True),
        'vacancy_rate': (0, 100, True, True),
        'management_fee': (0, SecurityLimits.MAX_RENT, True, True),
        'fixed_cost': (0, SecurityLimits.MAX_RENT, True, True),
        'property_tax': (0, SecurityLimits.MAX_RENT * 12, True, True),
        'other_costs': (0, SecurityLimits.MAX_PROPERTY_PRICE, True, True),
        'renovation_cost': (0, SecurityLimits.MAX_PROPERTY_PRICE, True, True),
        'effective_tax_rate': (0, SecurityLimits.MAX_TAX_RATE, True, True),
        'exit_cap_rate': (0, 50, True, True),
        'building_price': (0, SecurityLimits.MAX_PROPERTY_PRICE, True, True),
        'depreciation_years': (1, SecurityLimits.MAX_YEARS, False, True),
        'land_area': (0, 1000000, True, True),  # 1000000平米まで
        'building_area': (0, 100000, True, True),  # 100000平米まで
        'road_price': (0, 100000000, True, True),  # 1億円/平米まで
        'rent_decline': (0, 50, True, True),
        'market_value': (0, SecurityLimits.MAX_PROPERTY_PRICE, True, True),
        'expected_sale_price': (0, SecurityLimits.MAX_PROPERTY_PRICE, True, True)
    }
    
    for field, (min_val, max_val, allow_zero, allow_negative) in numeric_validations.items():
        if field in property_data:
            validated_data[field] = validate_numeric_input(
                property_data[field], 
                field, 
                min_val, 
                max_val, 
                allow_zero, 
                allow_negative
            )
        else:
            # デフォルト値を設定
            validated_data[field] = 0 if allow_zero else min_val
    
    # 文字列フィールドの検証
    string_fields = ['property_name', 'location', 'property_type', 'loan_type', 'building_structure']
    for field in string_fields:
        value = property_data.get(field, '')
        if isinstance(value, str):
            # 危険な文字を除去
            sanitized = ''.join(char for char in value if char.isprintable())
            sanitized = sanitized.replace('<', '').replace('>', '').replace('"', '').replace("'", '')
            validated_data[field] = sanitized[:SecurityLimits.MAX_STRING_LENGTH]
        else:
            validated_data[field] = ''
    
    # 論理的整合性チェック
    _validate_business_logic(validated_data)
    
    return validated_data


def _validate_business_logic(data: Dict[str, Any]) -> None:
    """ビジネスロジックの整合性チェック"""
    
    # ローン額が物件価格を上回らないかチェック
    if data.get('loan_amount', 0) > data.get('purchase_price', 0):
        raise DoSProtectionError("ローン額が物件価格を上回っています")
    
    # 保有年数がローン年数を大幅に上回らないかチェック
    if data.get('holding_years', 0) > data.get('loan_years', 0) * 2:
        raise DoSProtectionError("保有年数が異常に長く設定されています")
    
    # 家賃収入が物件価格に対して異常に高くないかチェック
    annual_rent = data.get('monthly_rent', 0) * 12
    purchase_price = data.get('purchase_price', 1) * 10000
    if annual_rent > purchase_price * 0.5:  # 50%を超える利回りは異常
        raise DoSProtectionError("家賃収入が物件価格に対して異常に高く設定されています")


def safe_calculation_wrapper(func):
    """安全な計算実行のためのラッパー"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # メモリ監視開始
        memory_monitor = MemoryMonitor()
        
        try:
            # タイムアウト付きで実行
            @timeout_handler
            def safe_execution():
                result = func(*args, **kwargs)
                # 定期的にメモリをチェック
                memory_monitor.check_memory_usage()
                return result
            
            return safe_execution()
            
        except DoSProtectionError:
            raise
        except MemoryError:
            raise DoSProtectionError("メモリ不足により計算を中断しました")
        except OverflowError:
            raise DoSProtectionError("数値オーバーフローにより計算を中断しました")
        except ZeroDivisionError:
            raise DoSProtectionError("ゼロ除算エラーが発生しました")
        except Exception as e:
            # 予期しない例外も DoS攻撃の可能性があるため制限
            raise DoSProtectionError(f"計算エラーが発生しました: {type(e).__name__}")
    
    return wrapper


def validate_array_size(data: List[Any], field_name: str) -> List[Any]:
    """配列サイズの検証"""
    if len(data) > SecurityLimits.MAX_ARRAY_SIZE:
        raise DoSProtectionError(f"配列サイズが制限を超過しました: {field_name} ({len(data)} > {SecurityLimits.MAX_ARRAY_SIZE})")
    return data


def prevent_computation_bomb(iterations: int, field_name: str = "computation") -> None:
    """計算爆弾攻撃の防止"""
    if iterations > SecurityLimits.MAX_ITERATIONS:
        raise DoSProtectionError(f"反復回数が制限を超過しました: {field_name} ({iterations} > {SecurityLimits.MAX_ITERATIONS})")


# 使用例とテスト用の関数
def test_security_limits():
    """セキュリティ制限のテスト"""
    
    # 正常なデータ
    normal_data = {
        'monthly_rent': 100,
        'purchase_price': 3000,
        'loan_amount': 2400,
        'interest_rate': 2.5,
        'loan_years': 30,
        'holding_years': 10
    }
    
    try:
        result = validate_calculation_params(normal_data)
        print("正常データの検証成功:", result)
    except DoSProtectionError as e:
        print("正常データでエラー:", e)
    
    # 異常なデータ
    malicious_data = {
        'monthly_rent': 999999999999999999999,  # 極大値
        'purchase_price': float('inf'),          # 無限大
        'loan_amount': 'evil_string',           # 不正な型
        'interest_rate': -100,                  # 負の値
    }
    
    try:
        validate_calculation_params(malicious_data)
        print("異常データの検証が通ってしまいました（問題あり）")
    except DoSProtectionError as e:
        print("異常データを正しく検出:", e)


if __name__ == "__main__":
    test_security_limits()