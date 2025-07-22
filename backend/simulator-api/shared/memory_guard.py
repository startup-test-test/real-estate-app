"""
メモリ消費攻撃対策モジュール (SEC-076対応)
大量メモリ消費によるDoS攻撃を防ぐためのメモリ監視・制限機能
"""

import psutil
import time
import functools
import threading
from typing import Any, Callable, Optional, List
import gc

class MemoryGuardError(Exception):
    """メモリ制限超過エラー"""
    pass

class MemoryGuard:
    """メモリ使用量監視・制限クラス"""
    
    # デフォルトのメモリ制限値（MB）
    DEFAULT_MEMORY_LIMIT_MB = 500  # 500MB
    DEFAULT_TIMEOUT_SECONDS = 30   # 30秒
    
    def __init__(self, memory_limit_mb: Optional[int] = None, timeout_seconds: Optional[int] = None):
        """
        メモリガードの初期化
        
        Args:
            memory_limit_mb: メモリ使用量の上限（MB）
            timeout_seconds: 実行時間の上限（秒）
        """
        self.memory_limit_mb = memory_limit_mb or self.DEFAULT_MEMORY_LIMIT_MB
        self.timeout_seconds = timeout_seconds or self.DEFAULT_TIMEOUT_SECONDS
        self.process = psutil.Process()
        
    def check_memory_usage(self) -> float:
        """
        現在のメモリ使用量を取得（MB）
        
        Returns:
            メモリ使用量（MB）
        """
        return self.process.memory_info().rss / 1024 / 1024
    
    def enforce_memory_limit(self) -> None:
        """
        メモリ使用量をチェックし、制限を超えていれば例外を発生
        
        Raises:
            MemoryGuardError: メモリ使用量が制限を超えた場合
        """
        current_memory_mb = self.check_memory_usage()
        if current_memory_mb > self.memory_limit_mb:
            # ガベージコレクションを実行
            gc.collect()
            
            # 再度チェック
            current_memory_mb = self.check_memory_usage()
            if current_memory_mb > self.memory_limit_mb:
                raise MemoryGuardError(
                    f"メモリ使用量が制限値を超えました: {current_memory_mb:.2f}MB / {self.memory_limit_mb}MB"
                )

def memory_guard_decorator(memory_limit_mb: Optional[int] = None, 
                         timeout_seconds: Optional[int] = None) -> Callable:
    """
    メモリ使用量と実行時間を制限するデコレーター
    
    Args:
        memory_limit_mb: メモリ使用量の上限（MB）
        timeout_seconds: 実行時間の上限（秒）
        
    Returns:
        デコレートされた関数
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            guard = MemoryGuard(memory_limit_mb, timeout_seconds)
            
            # 開始時のメモリ使用量を記録
            start_memory = guard.check_memory_usage()
            start_time = time.time()
            
            # タイムアウト監視用の変数
            result = None
            exception = None
            finished = threading.Event()
            
            def target():
                nonlocal result, exception
                try:
                    # 定期的にメモリ使用量をチェック
                    def check_memory():
                        while not finished.is_set():
                            try:
                                guard.enforce_memory_limit()
                                time.sleep(0.5)  # 0.5秒ごとにチェック
                            except MemoryGuardError as e:
                                exception = e
                                return
                    
                    # メモリ監視スレッドを開始
                    monitor_thread = threading.Thread(target=check_memory)
                    monitor_thread.daemon = True
                    monitor_thread.start()
                    
                    # 関数を実行
                    result = func(*args, **kwargs)
                    
                except Exception as e:
                    exception = e
                finally:
                    finished.set()
            
            # 実行スレッドを開始
            exec_thread = threading.Thread(target=target)
            exec_thread.start()
            exec_thread.join(timeout=guard.timeout_seconds)
            
            # タイムアウトチェック
            if exec_thread.is_alive():
                finished.set()
                raise MemoryGuardError(
                    f"実行時間が制限値を超えました: {guard.timeout_seconds}秒"
                )
            
            # 例外チェック
            if exception:
                raise exception
            
            # 実行後のメモリ使用量を記録
            end_memory = guard.check_memory_usage()
            end_time = time.time()
            
            # デバッグ情報（開発環境のみ）
            import os
            if os.getenv('DEBUG', 'false').lower() == 'true':
                print(f"[MemoryGuard] {func.__name__}: "
                      f"メモリ {start_memory:.2f}MB → {end_memory:.2f}MB, "
                      f"実行時間 {end_time - start_time:.2f}秒")
            
            return result
            
        return wrapper
    return decorator

# バッチ処理用のメモリ制限機能
class BatchMemoryGuard:
    """バッチ処理のメモリ使用量を管理"""
    
    def __init__(self, batch_size: int = 100, memory_limit_mb: int = 500):
        """
        バッチ処理用メモリガードの初期化
        
        Args:
            batch_size: バッチサイズ
            memory_limit_mb: メモリ使用量の上限（MB）
        """
        self.batch_size = batch_size
        self.memory_limit_mb = memory_limit_mb
        self.guard = MemoryGuard(memory_limit_mb)
        
    def process_in_batches(self, items: List[Any], process_func: Callable) -> List[Any]:
        """
        大量データをバッチ処理
        
        Args:
            items: 処理対象のアイテムリスト
            process_func: 各アイテムを処理する関数
            
        Returns:
            処理結果のリスト
        """
        results = []
        
        for i in range(0, len(items), self.batch_size):
            batch = items[i:i + self.batch_size]
            
            # バッチ処理前にメモリチェック
            self.guard.enforce_memory_limit()
            
            # バッチを処理
            batch_results = [process_func(item) for item in batch]
            results.extend(batch_results)
            
            # バッチ処理後にガベージコレクション
            gc.collect()
            
        return results

# 計算処理に特化したメモリ制限
def safe_calculation_with_memory_guard(func: Callable) -> Callable:
    """
    計算処理用の安全なラッパー（メモリ制限付き）
    
    不動産計算に適したメモリ制限（300MB）と時間制限（10秒）を設定
    """
    return memory_guard_decorator(
        memory_limit_mb=300,  # 計算処理には300MBまで
        timeout_seconds=10    # 10秒でタイムアウト
    )(func)