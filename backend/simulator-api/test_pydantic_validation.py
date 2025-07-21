#!/usr/bin/env python3
"""
SEC-071: Pydantic入力検証のテストスクリプト
"""

import json
import sys
from datetime import datetime
from typing import Dict, Any
import logging

# テスト対象のモジュールをインポート
from models import PropertyInputModel, SimulationRequestModel
from models_auth import TokenRequest, TokenResponse
from models_extended import SimulationRequestModelV2
from validators import InputValidator

# ロガー設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestResult:
    """テスト結果を管理するクラス"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []

    def add_result(self, test_name: str, passed: bool, message: str = ""):
        """テスト結果を追加"""
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1

    def print_summary(self):
        """テスト結果のサマリーを表示"""
        print("\n" + "="*60)
        print("テスト結果サマリー")
        print("="*60)
        for result in self.results:
            status = "✓" if result["passed"] else "✗"
            print(f"{status} {result['test']}: {result['message']}")
        
        print(f"\n合計: {self.passed + self.failed} テスト")
        print(f"成功: {self.passed}")
        print(f"失敗: {self.failed}")
        print("="*60)
        
        return self.failed == 0


def test_property_input_validation():
    """PropertyInputModelの検証テスト"""
    results = TestResult()
    
    # 正常なデータ
    valid_data = {
        "property_name": "テストマンション",
        "location": "東京都港区",
        "purchase_price": 5000,
        "monthly_rent": 20,
        "land_area": 100,
        "building_area": 80,
        "loan_amount": 4000,
        "interest_rate": 2.0,
        "loan_years": 35
    }
    
    # テスト1: 正常なデータ
    try:
        model = PropertyInputModel(**valid_data)
        results.add_result("正常データの検証", True, "成功")
    except Exception as e:
        results.add_result("正常データの検証", False, str(e))
    
    # テスト2: XSS攻撃パターン
    xss_data = valid_data.copy()
    xss_data["property_name"] = "<script>alert('XSS')</script>テスト"
    try:
        model = PropertyInputModel(**xss_data)
        # サニタイズされているか確認
        if "<script>" not in model.property_name:
            results.add_result("XSS攻撃の防御", True, "スクリプトタグが除去された")
        else:
            results.add_result("XSS攻撃の防御", False, "スクリプトタグが残っている")
    except Exception as e:
        results.add_result("XSS攻撃の防御", False, str(e))
    
    # テスト3: SQLインジェクション攻撃パターン
    sql_data = valid_data.copy()
    sql_data["location"] = "東京都'; DROP TABLE properties; --"
    try:
        model = PropertyInputModel(**sql_data)
        # 危険な文字が除去されているか確認
        if "'" not in model.location:
            results.add_result("SQLインジェクション対策", True, "危険な文字が除去された")
        else:
            results.add_result("SQLインジェクション対策", False, "危険な文字が残っている")
    except Exception as e:
        results.add_result("SQLインジェクション対策", True, f"検証エラー: {e}")
    
    # テスト4: 数値の範囲検証
    overflow_data = valid_data.copy()
    overflow_data["purchase_price"] = 10000000  # 1000万万円（上限超過）
    try:
        model = PropertyInputModel(**overflow_data)
        results.add_result("数値上限チェック", False, "上限を超えた値が受け入れられた")
    except Exception as e:
        results.add_result("数値上限チェック", True, "上限超過を検出")
    
    # テスト5: 負の値チェック
    negative_data = valid_data.copy()
    negative_data["purchase_price"] = -1000
    try:
        model = PropertyInputModel(**negative_data)
        results.add_result("負の値チェック", False, "負の値が受け入れられた")
    except Exception as e:
        results.add_result("負の値チェック", True, "負の値を拒否")
    
    # テスト6: 危険なURL
    bad_url_data = valid_data.copy()
    bad_url_data["property_url"] = "javascript:alert('XSS')"
    try:
        model = PropertyInputModel(**bad_url_data)
        results.add_result("危険なURLプロトコル", False, "javascriptプロトコルが受け入れられた")
    except Exception as e:
        results.add_result("危険なURLプロトコル", True, "危険なプロトコルを拒否")
    
    # テスト7: 未来の建築年
    future_data = valid_data.copy()
    future_data["building_year"] = datetime.now().year + 10
    try:
        model = PropertyInputModel(**future_data)
        results.add_result("未来の建築年チェック", False, "未来の年が受け入れられた")
    except Exception as e:
        results.add_result("未来の建築年チェック", True, "未来の年を拒否")
    
    return results


def test_auth_model_validation():
    """認証モデルの検証テスト"""
    results = TestResult()
    
    # テスト1: 正常なメールアドレス
    try:
        model = TokenRequest(email="test@example.com", password="secure123")
        results.add_result("正常な認証データ", True, "成功")
    except Exception as e:
        results.add_result("正常な認証データ", False, str(e))
    
    # テスト2: XSSを含むメールアドレス
    try:
        model = TokenRequest(email="test<script>@example.com", password="secure123")
        results.add_result("XSSメールアドレス", False, "危険な文字が受け入れられた")
    except Exception as e:
        results.add_result("XSSメールアドレス", True, "危険な文字を拒否")
    
    # テスト3: 短すぎるパスワード
    try:
        model = TokenRequest(email="test@example.com", password="123")
        results.add_result("短いパスワード", False, "短いパスワードが受け入れられた")
    except Exception as e:
        results.add_result("短いパスワード", True, "短いパスワードを拒否")
    
    # テスト4: 長すぎるパスワード
    try:
        model = TokenRequest(email="test@example.com", password="a" * 200)
        results.add_result("長いパスワード", False, "長すぎるパスワードが受け入れられた")
    except Exception as e:
        results.add_result("長いパスワード", True, "長すぎるパスワードを拒否")
    
    # テスト5: 長すぎるSupabaseトークン
    try:
        model = TokenRequest(supabase_token="x" * 3000)
        results.add_result("長いトークン", False, "長すぎるトークンが受け入れられた")
    except Exception as e:
        results.add_result("長いトークン", True, "長すぎるトークンを拒否")
    
    return results


def test_input_validator():
    """InputValidatorクラスのテスト"""
    results = TestResult()
    
    # テスト1: XSSパターン検出
    xss_patterns = [
        "<script>alert('XSS')</script>",
        "<iframe src='evil.com'></iframe>",
        "javascript:void(0)",
        "<img src=x onerror=alert('XSS')>",
        "<link href='evil.css'>",
        "<meta http-equiv='refresh'>",
    ]
    
    for pattern in xss_patterns:
        try:
            InputValidator.sanitize_string(pattern, "test_field")
            results.add_result(f"XSSパターン検出: {pattern[:20]}...", False, "検出されなかった")
        except Exception:
            results.add_result(f"XSSパターン検出: {pattern[:20]}...", True, "検出された")
    
    # テスト2: SQLインジェクションパターン検出
    sql_patterns = [
        "' OR '1'='1",
        "; DROP TABLE users; --",
        "UNION SELECT * FROM passwords",
        "'; DELETE FROM products; --",
    ]
    
    for pattern in sql_patterns:
        try:
            InputValidator.sanitize_string(pattern, "test_field")
            results.add_result(f"SQLパターン検出: {pattern[:20]}...", False, "検出されなかった")
        except Exception:
            results.add_result(f"SQLパターン検出: {pattern[:20]}...", True, "検出された")
    
    # テスト3: 長すぎる文字列
    try:
        InputValidator.sanitize_string("a" * 15000, "test_field")
        results.add_result("長い文字列チェック", False, "長すぎる文字列が受け入れられた")
    except Exception:
        results.add_result("長い文字列チェック", True, "長すぎる文字列を拒否")
    
    # テスト4: 安全な文字列のサニタイゼーション
    safe_text = "これは安全な<テキスト>です"
    try:
        sanitized = InputValidator.sanitize_string(safe_text, "test_field")
        if "&lt;" in sanitized and "&gt;" in sanitized:
            results.add_result("安全な文字列のサニタイゼーション", True, "HTMLエンティティに変換された")
        else:
            results.add_result("安全な文字列のサニタイゼーション", False, "サニタイゼーションされていない")
    except Exception as e:
        results.add_result("安全な文字列のサニタイゼーション", False, str(e))
    
    # テスト5: 数値検証
    try:
        # 正常な数値
        InputValidator.validate_numeric(1000, "price", 0, 10000)
        results.add_result("正常な数値検証", True, "成功")
    except Exception as e:
        results.add_result("正常な数値検証", False, str(e))
    
    try:
        # 範囲外の数値
        InputValidator.validate_numeric(20000, "price", 0, 10000)
        results.add_result("範囲外数値検証", False, "範囲外の値が受け入れられた")
    except Exception:
        results.add_result("範囲外数値検証", True, "範囲外の値を拒否")
    
    # テスト6: 物件データの完全検証
    property_data = {
        "property_name": "テスト物件",
        "location": "東京都",
        "purchase_price": 5000,
        "monthly_rent": 20,
        "land_area": 100,
        "building_area": 80,
        "loan_amount": 10000  # 購入価格より高い（論理エラー）
    }
    
    try:
        InputValidator.validate_property_data(property_data)
        results.add_result("論理検証（借入金額）", False, "論理エラーが検出されなかった")
    except Exception:
        results.add_result("論理検証（借入金額）", True, "論理エラーを検出")
    
    return results


def test_extended_models():
    """拡張モデルのテスト"""
    results = TestResult()
    
    # テスト1: SimulationRequestModelV2の検証
    try:
        data = {
            "property_data": {
                "purchase_price": 5000,
                "monthly_rent": 20,
                "land_area": 100,
                "building_area": 80
            },
            "include_cash_flow_table": True,
            "include_market_analysis": False
        }
        model = SimulationRequestModelV2(**data)
        results.add_result("SimulationRequestModelV2正常データ", True, "成功")
    except Exception as e:
        results.add_result("SimulationRequestModelV2正常データ", False, str(e))
    
    # テスト2: 必須フィールド不足
    try:
        data = {
            "property_data": {
                "purchase_price": 5000,
                # monthly_rentが不足
                "land_area": 100,
                "building_area": 80
            }
        }
        model = SimulationRequestModelV2(**data)
        results.add_result("必須フィールドチェック", False, "必須フィールド不足が検出されなかった")
    except Exception:
        results.add_result("必須フィールドチェック", True, "必須フィールド不足を検出")
    
    # テスト3: 余分なフィールド
    try:
        data = {
            "property_data": {
                "purchase_price": 5000,
                "monthly_rent": 20,
                "land_area": 100,
                "building_area": 80,
                "malicious_field": "evil_data"  # 余分なフィールド
            },
            "extra_field": "should_be_rejected"  # 余分なフィールド
        }
        model = SimulationRequestModelV2(**data)
        results.add_result("余分なフィールド拒否", False, "余分なフィールドが受け入れられた")
    except Exception:
        results.add_result("余分なフィールド拒否", True, "余分なフィールドを拒否")
    
    return results


def main():
    """メインテスト実行関数"""
    print("SEC-071: Pydantic入力検証テストを開始します...")
    print("="*60)
    
    all_results = []
    
    # 各テストグループを実行
    print("\n[1/4] PropertyInputModelの検証テスト...")
    results1 = test_property_input_validation()
    all_results.append(results1)
    
    print("\n[2/4] 認証モデルの検証テスト...")
    results2 = test_auth_model_validation()
    all_results.append(results2)
    
    print("\n[3/4] InputValidatorクラスのテスト...")
    results3 = test_input_validator()
    all_results.append(results3)
    
    print("\n[4/4] 拡張モデルのテスト...")
    results4 = test_extended_models()
    all_results.append(results4)
    
    # 全体のサマリー
    total_passed = sum(r.passed for r in all_results)
    total_failed = sum(r.failed for r in all_results)
    
    print("\n" + "="*60)
    print("全体のテスト結果")
    print("="*60)
    
    for i, results in enumerate(all_results, 1):
        print(f"\nテストグループ {i}:")
        results.print_summary()
    
    print(f"\n総合結果:")
    print(f"合計テスト数: {total_passed + total_failed}")
    print(f"成功: {total_passed}")
    print(f"失敗: {total_failed}")
    
    if total_failed == 0:
        print("\n✅ すべてのテストが成功しました！")
        print("SEC-071: Pydantic入力検証が正常に動作しています。")
        return 0
    else:
        print(f"\n❌ {total_failed}個のテストが失敗しました。")
        return 1


if __name__ == "__main__":
    sys.exit(main())