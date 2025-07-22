"""
メモリガードのテスト (SEC-076)
"""

import pytest
import time
from .memory_guard import (
    MemoryGuard, 
    MemoryGuardError, 
    memory_guard_decorator,
    BatchMemoryGuard,
    safe_calculation_with_memory_guard
)

class TestMemoryGuard:
    """MemoryGuardクラスのテスト"""
    
    def test_memory_usage_check(self):
        """メモリ使用量チェック機能のテスト"""
        guard = MemoryGuard()
        memory_mb = guard.check_memory_usage()
        
        # メモリ使用量が正の値であることを確認
        assert memory_mb > 0
        assert isinstance(memory_mb, float)
    
    def test_memory_limit_enforcement(self):
        """メモリ制限の強制機能のテスト"""
        # 非常に低いメモリ制限を設定（1MB）
        guard = MemoryGuard(memory_limit_mb=1)
        
        # 現在のプロセスは1MB以上使用しているはずなので、例外が発生するはず
        with pytest.raises(MemoryGuardError) as exc_info:
            guard.enforce_memory_limit()
        
        assert "メモリ使用量が制限値を超えました" in str(exc_info.value)

class TestMemoryGuardDecorator:
    """メモリガードデコレーターのテスト"""
    
    def test_normal_function_execution(self):
        """通常の関数実行（メモリ制限内）"""
        @memory_guard_decorator(memory_limit_mb=500, timeout_seconds=5)
        def safe_function(x, y):
            return x + y
        
        result = safe_function(10, 20)
        assert result == 30
    
    def test_memory_intensive_function(self):
        """メモリ集約的な関数のテスト"""
        @memory_guard_decorator(memory_limit_mb=50, timeout_seconds=5)
        def memory_intensive_function():
            # 大量のメモリを使用する処理
            large_list = []
            for i in range(10000000):  # 1000万要素
                large_list.append(i)
            return len(large_list)
        
        # メモリ制限により例外が発生するはず
        with pytest.raises(MemoryGuardError) as exc_info:
            memory_intensive_function()
        
        assert "メモリ使用量が制限値を超えました" in str(exc_info.value)
    
    def test_timeout_function(self):
        """タイムアウト機能のテスト"""
        @memory_guard_decorator(memory_limit_mb=500, timeout_seconds=1)
        def slow_function():
            time.sleep(2)  # 2秒待機
            return "完了"
        
        # タイムアウトにより例外が発生するはず
        with pytest.raises(MemoryGuardError) as exc_info:
            slow_function()
        
        assert "実行時間が制限値を超えました" in str(exc_info.value)
    
    def test_exception_propagation(self):
        """例外の伝播テスト"""
        @memory_guard_decorator(memory_limit_mb=500, timeout_seconds=5)
        def error_function():
            raise ValueError("テストエラー")
        
        # 元の例外が伝播されることを確認
        with pytest.raises(ValueError) as exc_info:
            error_function()
        
        assert "テストエラー" in str(exc_info.value)

class TestBatchMemoryGuard:
    """バッチ処理用メモリガードのテスト"""
    
    def test_batch_processing(self):
        """バッチ処理の正常動作テスト"""
        guard = BatchMemoryGuard(batch_size=3, memory_limit_mb=500)
        
        items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        
        def process_item(item):
            return item * 2
        
        results = guard.process_in_batches(items, process_item)
        
        expected = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
        assert results == expected
    
    def test_empty_batch(self):
        """空のバッチ処理テスト"""
        guard = BatchMemoryGuard(batch_size=10, memory_limit_mb=500)
        
        items = []
        
        def process_item(item):
            return item * 2
        
        results = guard.process_in_batches(items, process_item)
        
        assert results == []

class TestSafeCalculationWrapper:
    """計算処理用安全ラッパーのテスト"""
    
    def test_safe_calculation_decorator(self):
        """計算処理用デコレーターのテスト"""
        @safe_calculation_with_memory_guard
        def calculate_sum(numbers):
            return sum(numbers)
        
        result = calculate_sum([1, 2, 3, 4, 5])
        assert result == 15
    
    def test_calculation_memory_limit(self):
        """計算処理のメモリ制限テスト"""
        @safe_calculation_with_memory_guard
        def create_large_matrix():
            # 大きな行列を作成（メモリ集約的）
            matrix = []
            for i in range(5000):
                row = []
                for j in range(5000):
                    row.append(i * j)
                matrix.append(row)
            return len(matrix)
        
        # メモリ制限（300MB）により例外が発生するはず
        with pytest.raises(MemoryGuardError):
            create_large_matrix()

class TestRealEstateCalculations:
    """不動産計算に対するメモリガードのテスト"""
    
    def test_calculation_with_extreme_values(self):
        """極端な値での計算テスト"""
        from .calculations import calculate_remaining_loan
        
        # 正常な値での計算
        result = calculate_remaining_loan(
            loan_amount=5000,  # 5000万円
            interest_rate=2.0,  # 2%
            loan_years=30,
            elapsed_years=10
        )
        assert result > 0
        
        # 極端に大きな値での計算（メモリ/時間制限により保護される）
        with pytest.raises(Exception):  # DoSProtectionError or MemoryGuardError
            calculate_remaining_loan(
                loan_amount=1000000,  # 1000億円（制限超過）
                interest_rate=50,     # 50%
                loan_years=100,
                elapsed_years=50
            )
    
    def test_batch_simulation(self):
        """複数物件のバッチシミュレーションテスト"""
        from .calculations import calculate_basic_metrics
        
        # テスト用の物件データ
        property_data = {
            'monthly_rent': 20,
            'vacancy_rate': 5,
            'management_fee': 1,
            'fixed_cost': 1,
            'property_tax': 10,
            'purchase_price': 5000,
            'loan_amount': 4000,
            'other_costs': 200,
            'renovation_cost': 100,
            'interest_rate': 2,
            'loan_years': 30,
            'effective_tax_rate': 30,
            'building_price': 3000,
            'depreciation_years': 22
        }
        
        # 単一物件の計算が正常に動作することを確認
        result = calculate_basic_metrics(property_data)
        assert 'gross_yield' in result
        assert 'ccr' in result
        assert result['gross_yield'] > 0

if __name__ == '__main__':
    pytest.main([__file__, '-v'])