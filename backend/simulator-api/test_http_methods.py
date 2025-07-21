"""
SEC-082: HTTPメソッド制限のテスト
各エンドポイントで適切なHTTPメソッドのみが許可されることを確認
"""

import requests
import json
from typing import Dict, List, Tuple

# テスト対象のベースURL
BASE_URL = "http://localhost:8000"

# テストエンドポイントとその許可メソッド
TEST_ENDPOINTS = {
    "/": {
        "allowed": ["GET", "HEAD", "OPTIONS"],
        "denied": ["POST", "PUT", "DELETE", "PATCH", "TRACE"]
    },
    "/api/auth/token": {
        "allowed": ["POST", "OPTIONS"],
        "denied": ["GET", "PUT", "DELETE", "PATCH", "HEAD", "TRACE"]
    },
    "/api/auth/me": {
        "allowed": ["GET", "HEAD", "OPTIONS"],
        "denied": ["POST", "PUT", "DELETE", "PATCH", "TRACE"]
    },
    "/api/simulate": {
        "allowed": ["POST", "OPTIONS"],
        "denied": ["GET", "PUT", "DELETE", "PATCH", "HEAD", "TRACE"]
    },
    "/api/market-analysis": {
        "allowed": ["POST", "OPTIONS"],
        "denied": ["GET", "PUT", "DELETE", "PATCH", "HEAD", "TRACE"]
    }
}

# テスト用のサンプルデータ
SAMPLE_DATA = {
    "property_data": {
        "property_name": "テスト物件",
        "location": "東京都港区",
        "purchase_price": 5000,
        "monthly_rent": 20,
        "land_area": 100,
        "building_area": 80
    }
}

# テスト用の認証トークン（開発環境）
AUTH_HEADERS = {
    "Authorization": "Bearer test-token"
}


def test_http_method(endpoint: str, method: str, expected_allowed: bool) -> Tuple[bool, str]:
    """
    指定されたエンドポイントとメソッドをテスト
    
    Args:
        endpoint: テストするエンドポイント
        method: HTTPメソッド
        expected_allowed: 許可されているべきか
        
    Returns:
        Tuple[bool, str]: (テスト成功, エラーメッセージ)
    """
    url = BASE_URL + endpoint
    
    try:
        # メソッドに応じてリクエストを送信
        if method == "GET":
            resp = requests.get(url, headers=AUTH_HEADERS, timeout=5)
        elif method == "POST":
            resp = requests.post(url, json=SAMPLE_DATA, headers=AUTH_HEADERS, timeout=5)
        elif method == "PUT":
            resp = requests.put(url, json=SAMPLE_DATA, headers=AUTH_HEADERS, timeout=5)
        elif method == "DELETE":
            resp = requests.delete(url, headers=AUTH_HEADERS, timeout=5)
        elif method == "PATCH":
            resp = requests.patch(url, json=SAMPLE_DATA, headers=AUTH_HEADERS, timeout=5)
        elif method == "HEAD":
            resp = requests.head(url, headers=AUTH_HEADERS, timeout=5)
        elif method == "OPTIONS":
            resp = requests.options(url, timeout=5)
        elif method == "TRACE":
            # TRACEメソッドは手動で送信
            resp = requests.request("TRACE", url, timeout=5)
        else:
            return False, f"Unknown method: {method}"
        
        # 期待される結果と実際の結果を比較
        if expected_allowed:
            # 許可されているメソッドの場合
            if resp.status_code == 405:
                return False, f"Expected allowed but got 405: {resp.text}"
            # 認証エラー(401/403)やその他のエラーは許容（メソッド自体は許可されている）
            return True, "OK"
        else:
            # 拒否されるべきメソッドの場合
            if resp.status_code == 405:
                # 405 Method Not Allowedが返ってきたら成功
                return True, "OK (405 returned)"
            else:
                return False, f"Expected 405 but got {resp.status_code}: {resp.text[:100]}"
                
    except requests.exceptions.RequestException as e:
        return False, f"Request failed: {str(e)}"


def run_all_tests():
    """すべてのHTTPメソッド制限テストを実行"""
    print("SEC-082: HTTPメソッド制限テスト")
    print("=" * 60)
    
    total_tests = 0
    passed_tests = 0
    
    for endpoint, methods in TEST_ENDPOINTS.items():
        print(f"\nエンドポイント: {endpoint}")
        print("-" * 40)
        
        # 許可されているメソッドのテスト
        print("許可メソッド:")
        for method in methods["allowed"]:
            total_tests += 1
            success, message = test_http_method(endpoint, method, True)
            if success:
                passed_tests += 1
                print(f"  ✓ {method}: {message}")
            else:
                print(f"  ✗ {method}: {message}")
        
        # 拒否されるべきメソッドのテスト
        print("拒否メソッド:")
        for method in methods["denied"]:
            total_tests += 1
            success, message = test_http_method(endpoint, method, False)
            if success:
                passed_tests += 1
                print(f"  ✓ {method}: {message}")
            else:
                print(f"  ✗ {method}: {message}")
    
    print("\n" + "=" * 60)
    print(f"テスト結果: {passed_tests}/{total_tests} 成功")
    print(f"成功率: {passed_tests/total_tests*100:.1f}%")
    
    return passed_tests == total_tests


def test_dangerous_methods():
    """危険なHTTPメソッドが完全にブロックされることを確認"""
    print("\n危険なメソッドのブロックテスト")
    print("=" * 60)
    
    dangerous_methods = ["TRACE", "TRACK", "CONNECT"]
    test_endpoints = ["/", "/api/simulate", "/api/auth/token"]
    
    all_blocked = True
    
    for method in dangerous_methods:
        print(f"\n{method}メソッドのテスト:")
        for endpoint in test_endpoints:
            url = BASE_URL + endpoint
            try:
                resp = requests.request(method, url, timeout=5)
                if resp.status_code == 405:
                    print(f"  ✓ {endpoint}: ブロックされました (405)")
                else:
                    print(f"  ✗ {endpoint}: ブロックされませんでした ({resp.status_code})")
                    all_blocked = False
            except Exception as e:
                print(f"  ? {endpoint}: エラー - {str(e)}")
    
    return all_blocked


def test_options_cors():
    """OPTIONSメソッドがCORS対応で適切に動作することを確認"""
    print("\nCORS OPTIONSメソッドテスト")
    print("=" * 60)
    
    test_endpoints = ["/", "/api/simulate", "/api/auth/token"]
    
    for endpoint in test_endpoints:
        url = BASE_URL + endpoint
        try:
            resp = requests.options(url, headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST"
            }, timeout=5)
            
            if resp.status_code in [200, 204]:
                print(f"✓ {endpoint}: OPTIONS成功 ({resp.status_code})")
                # Allowヘッダーの確認
                allow_header = resp.headers.get("Allow", "")
                if allow_header:
                    print(f"  Allow: {allow_header}")
            else:
                print(f"✗ {endpoint}: OPTIONS失敗 ({resp.status_code})")
        except Exception as e:
            print(f"? {endpoint}: エラー - {str(e)}")


if __name__ == "__main__":
    print("HTTPメソッド制限テストを開始します...")
    print("APIサーバーが http://localhost:8000 で起動していることを確認してください\n")
    
    # メインテスト
    main_success = run_all_tests()
    
    # 危険なメソッドのテスト
    dangerous_blocked = test_dangerous_methods()
    
    # CORS OPTIONSテスト
    test_options_cors()
    
    # 総合結果
    print("\n" + "=" * 60)
    print("総合結果:")
    if main_success and dangerous_blocked:
        print("✓ すべてのテストに合格しました！")
        print("SEC-082: HTTPメソッド制限が正しく実装されています")
    else:
        print("✗ 一部のテストに失敗しました")
        print("上記のエラーを確認して修正してください")