"""
SEC-075: 入力サニタイゼーションのテスト
"""

import pytest
from shared.input_sanitizer import (
    sanitize_numeric_value,
    sanitize_string_value,
    sanitize_calculation_input,
    validate_calculation_safety,
    sanitize_and_validate_input,
    InputSanitizationError,
    ALLOWED_PROPERTY_NAME_PATTERN,
    ALLOWED_LOCATION_PATTERN
)


class TestSanitizeNumericValue:
    """数値サニタイゼーションのテスト"""

    def test_valid_numeric_values(self):
        """有効な数値の処理"""
        assert sanitize_numeric_value(100, "test") == 100.0
        assert sanitize_numeric_value("1000", "test") == 1000.0
        assert sanitize_numeric_value(123.45, "test") == 123.45

    def test_comma_removal(self):
        """カンマの除去"""
        assert sanitize_numeric_value("1,000", "test") == 1000.0
        assert sanitize_numeric_value("1,234,567", "test") == 1234567.0

    def test_full_width_numbers(self):
        """全角数字の変換"""
        assert sanitize_numeric_value("１２３", "test") == 123.0
        assert sanitize_numeric_value("９８７．６５", "test") == 987.65

    def test_invalid_values(self):
        """無効な値の処理"""
        with pytest.raises(InputSanitizationError):
            sanitize_numeric_value("not_a_number", "test")
        
        with pytest.raises(InputSanitizationError):
            sanitize_numeric_value("NaN", "test")
        
        with pytest.raises(InputSanitizationError):
            sanitize_numeric_value(float('inf'), "test")

    def test_range_constraints(self):
        """範囲制限"""
        assert sanitize_numeric_value(150, "test", min_val=0, max_val=100) == 100.0
        assert sanitize_numeric_value(-10, "test", min_val=0, max_val=100) == 0.0

    def test_none_and_empty(self):
        """Noneと空文字列の処理"""
        assert sanitize_numeric_value(None, "test") == 0.0
        assert sanitize_numeric_value("", "test") == 0.0


class TestSanitizeStringValue:
    """文字列サニタイゼーションのテスト"""

    def test_valid_strings(self):
        """有効な文字列の処理"""
        assert sanitize_string_value("テスト物件", "property_name") == "テスト物件"
        assert sanitize_string_value("東京都港区", "location") == "東京都港区"

    def test_control_character_removal(self):
        """制御文字の除去"""
        assert sanitize_string_value("test\x00\x01\x02", "test") == "test"
        assert sanitize_string_value("line1\nline2", "test") == "line1line2"

    def test_html_tag_removal(self):
        """HTMLタグの除去"""
        # <script>タグとalert()が両方除去される
        result = sanitize_string_value("<script>alert('xss')</script>", "test")
        assert "<script>" not in result
        assert "</script>" not in result
        assert "alert(" not in result
        
        assert sanitize_string_value("<b>bold</b> text", "test") == "bold text"

    def test_script_pattern_removal(self):
        """スクリプト関連パターンの除去"""
        assert "javascript" not in sanitize_string_value("javascript:alert(1)", "test")
        assert "eval" not in sanitize_string_value("eval(code)", "test")
        assert "onclick" not in sanitize_string_value("onclick=alert()", "test")

    def test_sql_keyword_removal(self):
        """SQLキーワードの除去"""
        assert "DROP" not in sanitize_string_value("DROP TABLE users", "test")
        assert "SELECT" not in sanitize_string_value("SELECT * FROM users", "test")

    def test_max_length_truncation(self):
        """最大長での切り詰め"""
        long_string = "a" * 300
        result = sanitize_string_value(long_string, "test", max_length=200)
        assert len(result) == 200

    def test_pattern_validation(self):
        """パターン検証"""
        # 日本語を含む有効なパターン
        assert sanitize_string_value("物件123", "property_name", 
                                   allowed_pattern=ALLOWED_PROPERTY_NAME_PATTERN) == "物件123"
        
        # 許可されない文字の除去
        result = sanitize_string_value("物件@#$%", "property_name", 
                                     allowed_pattern=ALLOWED_PROPERTY_NAME_PATTERN)
        assert "@" not in result
        assert "#" not in result


class TestSanitizeCalculationInput:
    """計算入力データのサニタイゼーションテスト"""

    def test_basic_sanitization(self):
        """基本的なサニタイゼーション"""
        input_data = {
            'monthly_rent': '100,000',
            'purchase_price': '5000',  # 万円単位
            'property_name': '<script>テスト物件</script>',
            'vacancy_rate': '5.5'
        }
        
        result = sanitize_calculation_input(input_data)
        
        assert result['monthly_rent'] == 100000.0
        assert result['purchase_price'] == 5000.0  # 万円単位のまま
        assert result['property_name'] == 'テスト物件'
        assert result['vacancy_rate'] == 5.5

    def test_out_of_range_values(self):
        """範囲外の値の補正"""
        input_data = {
            'monthly_rent': '20000000',  # 2000万円（上限1000万円）
            'vacancy_rate': '150',  # 150%（上限100%）
            'loan_years': '200'  # 200年（上限100年）
        }
        
        result = sanitize_calculation_input(input_data)
        
        assert result['monthly_rent'] == 10000000.0  # 上限に補正
        assert result['vacancy_rate'] == 100.0  # 上限に補正
        assert result['loan_years'] == 100.0  # 上限に補正

    def test_loan_amount_adjustment(self):
        """ローン額の自動調整"""
        input_data = {
            'purchase_price': '5000',  # 5000万円
            'loan_amount': '6000'  # 6000万円（購入価格を超える）
        }
        
        result = sanitize_calculation_input(input_data)
        
        assert result['loan_amount'] == result['purchase_price']  # 購入価格に調整

    def test_default_values(self):
        """デフォルト値の設定"""
        result = sanitize_calculation_input({})
        
        assert result['loan_type'] == '元利均等'
        assert result['property_type'] == '不明'
        assert result['vacancy_rate'] == 5.0
        assert result['management_fee'] == 5.0
        assert result['effective_tax_rate'] == 30.0

    def test_malicious_input_sanitization(self):
        """悪意のある入力のサニタイゼーション"""
        input_data = {
            'property_name': '"><script>alert(1)</script>',
            'location': "'; DROP TABLE properties; --",
            'monthly_rent': 'eval(malicious_code)',
            'interest_rate': float('inf')
        }
        
        result = sanitize_calculation_input(input_data)
        
        # スクリプトタグが除去されている
        assert '<script>' not in result['property_name']
        assert 'alert' not in result['property_name']
        
        # SQLインジェクションが無効化されている
        assert 'DROP' not in result['location']
        assert 'TABLE' not in result['location']
        
        # 数値フィールドがデフォルト値になっている
        assert isinstance(result['monthly_rent'], (int, float))
        assert result['monthly_rent'] == 0  # デフォルト値
        
        # 無限大が上限値に補正されている
        assert result['interest_rate'] == 0.0


class TestValidateCalculationSafety:
    """計算安全性検証のテスト"""

    def test_extreme_compound_interest(self):
        """極端な複利計算の防止"""
        data = {
            'loan_years': 80,
            'interest_rate': 20
        }
        
        is_safe, error = validate_calculation_safety(data)
        assert is_safe is False
        assert "長期間かつ高金利" in error

    def test_memory_consumption_attack(self):
        """メモリ消費攻撃の防止"""
        data = {
            'loan_years': 150
        }
        
        is_safe, error = validate_calculation_safety(data)
        assert is_safe is False
        assert "ローン期間が長すぎます" in error

    def test_zero_division_prevention(self):
        """ゼロ除算の防止"""
        data = {
            'purchase_price': 0
        }
        
        is_safe, error = validate_calculation_safety(data)
        assert is_safe is False
        assert "0より大きい値" in error

    def test_safe_calculation(self):
        """安全な計算パラメータ"""
        data = {
            'loan_years': 30,
            'interest_rate': 2.5,
            'purchase_price': 5000
        }
        
        is_safe, error = validate_calculation_safety(data)
        assert is_safe is True
        assert error is None


class TestSanitizeAndValidateInput:
    """統合関数のテスト"""

    def test_complete_sanitization_flow(self):
        """完全なサニタイゼーションフロー"""
        input_data = {
            'property_name': '<b>マンション123号室</b>',
            'location': '東京都渋谷区',
            'monthly_rent': '250,000',
            'purchase_price': '8000',
            'loan_amount': '6000',
            'interest_rate': '2.5',
            'loan_years': '35'
        }
        
        result = sanitize_and_validate_input(input_data)
        
        # HTMLタグが除去されている
        assert result['property_name'] == 'マンション123号室'
        
        # 数値が正しく変換されている
        assert result['monthly_rent'] == 250000.0
        assert result['purchase_price'] == 8000.0
        assert result['loan_amount'] == 6000.0
        
        # デフォルト値が設定されている
        assert 'vacancy_rate' in result
        assert 'management_fee' in result

    def test_unsafe_input_rejection(self):
        """安全でない入力の拒否"""
        input_data = {
            'loan_years': 100,
            'interest_rate': 15,  # 高金利すぎる組み合わせ
            'purchase_price': 5000
        }
        
        with pytest.raises(InputSanitizationError):
            sanitize_and_validate_input(input_data)

    def test_edge_cases(self):
        """エッジケースの処理"""
        # 空の入力
        result = sanitize_and_validate_input({})
        assert 'loan_type' in result
        assert 'property_type' in result
        
        # 全て文字列の入力
        input_data = {
            'monthly_rent': 'one hundred thousand',
            'purchase_price': 'five million'
        }
        result = sanitize_and_validate_input(input_data)
        assert result['monthly_rent'] == 0.0
        assert result['purchase_price'] == 1.0  # 最小値


if __name__ == "__main__":
    pytest.main([__file__, "-v"])