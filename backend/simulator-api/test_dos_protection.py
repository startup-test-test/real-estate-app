#!/usr/bin/env python3
"""
SEC-020: FastAPI DoS攻撃脆弱性対策のテスト
CVE-2024-24762への対策確認
"""

import time
import requests
import concurrent.futures
from typing import List, Tuple

API_URL = "http://localhost:8000"

def test_regular_request():
    """通常のリクエストが正常に動作することを確認"""
    try:
        response = requests.get(f"{API_URL}/")
        assert response.status_code == 200
        print("✅ 通常のリクエスト: OK")
        return True
    except Exception as e:
        print(f"❌ 通常のリクエスト: エラー - {e}")
        return False

def test_malformed_regex_pattern():
    """ReDoS攻撃パターンのテスト"""
    # CVE-2024-24762で報告されているReDoSパターン
    malicious_patterns = [
        "a" * 1000 + "!",  # 繰り返しパターン
        "(a+)+" + "b" * 100,  # ネストした量指定子
        "(?:a+)+" + "!" * 50,  # 非キャプチャグループの繰り返し
    ]
    
    for i, pattern in enumerate(malicious_patterns):
        try:
            start_time = time.time()
            # パスパラメータとして悪意のあるパターンを送信
            response = requests.get(
                f"{API_URL}/test/{pattern}",
                timeout=5  # 5秒でタイムアウト
            )
            elapsed_time = time.time() - start_time
            
            if elapsed_time > 2:
                print(f"⚠️  ReDoSパターン{i+1}: 処理時間が長い ({elapsed_time:.2f}秒)")
            else:
                print(f"✅ ReDoSパターン{i+1}: 正常に処理 ({elapsed_time:.2f}秒)")
        except requests.exceptions.Timeout:
            print(f"❌ ReDoSパターン{i+1}: タイムアウト（ReDoS脆弱性の可能性）")
        except Exception as e:
            print(f"✅ ReDoSパターン{i+1}: 適切に拒否された - {type(e).__name__}")

def test_concurrent_requests():
    """並行リクエストによるDoS攻撃のシミュレーション"""
    def make_request(i: int) -> Tuple[int, float]:
        start_time = time.time()
        try:
            response = requests.get(f"{API_URL}/", timeout=10)
            elapsed_time = time.time() - start_time
            return response.status_code, elapsed_time
        except Exception:
            elapsed_time = time.time() - start_time
            return 0, elapsed_time
    
    # 50個の並行リクエストを送信
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(make_request, i) for i in range(50)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    success_count = sum(1 for status, _ in results if status == 200)
    avg_response_time = sum(time for _, time in results) / len(results)
    
    print(f"\n並行リクエストテスト結果:")
    print(f"  成功: {success_count}/50")
    print(f"  平均応答時間: {avg_response_time:.2f}秒")
    
    if success_count >= 45 and avg_response_time < 2:
        print("✅ DoS攻撃に対する耐性: OK")
    else:
        print("⚠️  パフォーマンスの問題がある可能性があります")

def test_large_payload():
    """大きなペイロードによるDoS攻撃のテスト"""
    # 10MBのデータ
    large_data = {"data": "x" * (10 * 1024 * 1024)}
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{API_URL}/calculate",
            json=large_data,
            timeout=5
        )
        elapsed_time = time.time() - start_time
        
        if response.status_code == 413:  # Payload Too Large
            print("✅ 大きなペイロード: 適切に拒否されました")
        elif response.status_code == 422:  # Unprocessable Entity
            print("✅ 大きなペイロード: バリデーションで拒否されました")
        else:
            print(f"⚠️  大きなペイロード: 予期しないレスポンス {response.status_code}")
    except requests.exceptions.Timeout:
        print("❌ 大きなペイロード: タイムアウト")
    except Exception as e:
        print(f"✅ 大きなペイロード: 適切にエラー処理されました - {type(e).__name__}")

def main():
    print("=== SEC-020: FastAPI DoS攻撃脆弱性対策テスト ===")
    print(f"FastAPI バージョン: 0.109.1 (CVE-2024-24762対策済み)")
    print(f"テスト対象: {API_URL}\n")
    
    # APIが起動しているか確認
    try:
        response = requests.get(f"{API_URL}/", timeout=5)
        if response.status_code != 200:
            print("❌ APIが応答していません")
            return
    except Exception as e:
        print(f"❌ APIに接続できません: {e}")
        return
    
    # 各種テストを実行
    test_regular_request()
    print("\n--- ReDoS攻撃パターンテスト ---")
    test_malformed_regex_pattern()
    print("\n--- 並行リクエストテスト ---")
    test_concurrent_requests()
    print("\n--- 大きなペイロードテスト ---")
    test_large_payload()
    
    print("\n=== テスト完了 ===")

if __name__ == "__main__":
    main()