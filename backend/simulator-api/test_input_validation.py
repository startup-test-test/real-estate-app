"""
SEC-075: 入力サニタイゼーションのテスト
"""

import unittest
from models import PropertyInputModel, SimulationRequestModel
from models_market import MarketAnalysisRequestModel
from pydantic import ValidationError


class TestInputValidation(unittest.TestCase):
    """入力検証のテストケース"""
    
    def test_valid_property_input(self):
        """正常な入力データの検証"""
        valid_data = {
            "property_name": "東京マンション",
            "location": "東京都港区",
            "purchase_price": 5000,
            "monthly_rent": 20,
            "land_area": 100,
            "building_area": 80,
            "loan_amount": 4000,
            "interest_rate": 2.0,
            "loan_years": 35
        }
        
        model = PropertyInputModel(**valid_data)
        self.assertEqual(model.property_name, "東京マンション")
        self.assertEqual(model.purchase_price, 5000)
        
    def test_text_field_sanitization(self):
        """テキストフィールドのサニタイゼーション"""
        data = {
            "property_name": "<script>alert('XSS')</script>東京マンション",
            "location": "東京都港区<img src=x onerror=alert(1)>",
            "purchase_price": 5000,
            "monthly_rent": 20,
            "land_area": 100,
            "building_area": 80
        }
        
        model = PropertyInputModel(**data)
        # 危険な文字が除去されていることを確認
        self.assertNotIn("<script>", model.property_name)
        self.assertNotIn("<", model.property_name)
        self.assertNotIn("onerror", model.location)
        
    def test_numeric_field_validation(self):
        """数値フィールドの範囲検証"""
        # 購入価格が負の値
        with self.assertRaises(ValidationError) as context:
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=-1000,  # 負の値
                monthly_rent=20,
                land_area=100,
                building_area=80
            )
        
        # 購入価格が上限を超える
        with self.assertRaises(ValidationError) as context:
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=2000000,  # 上限超過
                monthly_rent=20,
                land_area=100,
                building_area=80
            )
    
    def test_percentage_validation(self):
        """パーセンテージ値の検証"""
        # 空室率が100%を超える
        with self.assertRaises(ValidationError) as context:
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=5000,
                monthly_rent=20,
                land_area=100,
                building_area=80,
                vacancy_rate=150  # 100%超過
            )
        
        # 金利が負の値
        with self.assertRaises(ValidationError) as context:
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=5000,
                monthly_rent=20,
                land_area=100,
                building_area=80,
                interest_rate=-1  # 負の値
            )
    
    def test_loan_amount_validation(self):
        """借入金額の検証"""
        # 借入金額が購入価格を超える
        with self.assertRaises(ValidationError) as context:
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=5000,
                monthly_rent=20,
                land_area=100,
                building_area=80,
                loan_amount=6000  # 購入価格を超える
            )
    
    def test_url_validation(self):
        """URLフィールドの検証"""
        # 危険なプロトコル
        with self.assertRaises(ValidationError) as context:
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=5000,
                monthly_rent=20,
                land_area=100,
                building_area=80,
                property_url="javascript:alert(1)"  # XSS攻撃
            )
        
        # 正常なURL
        model = PropertyInputModel(
            property_name="テスト",
            location="東京",
            purchase_price=5000,
            monthly_rent=20,
            land_area=100,
            building_area=80,
            property_url="https://example.com/property/123"
        )
        self.assertEqual(model.property_url, "https://example.com/property/123")
    
    def test_building_year_validation(self):
        """建築年の検証"""
        # 未来の年
        with self.assertRaises(ValidationError) as context:
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=5000,
                monthly_rent=20,
                land_area=100,
                building_area=80,
                building_year=2050  # 未来の年
            )
    
    def test_market_analysis_request_validation(self):
        """市場分析リクエストの検証"""
        # 正常なデータ
        model = MarketAnalysisRequestModel(
            location="東京都港区",
            land_area=100,
            year_built=2020,
            purchase_price=5000
        )
        self.assertEqual(model.location, "東京都港区")
        
        # 不正なデータ
        with self.assertRaises(ValidationError):
            MarketAnalysisRequestModel(
                location="",  # 空文字
                land_area=100,
                year_built=2020,
                purchase_price=5000
            )
    
    def test_extreme_values(self):
        """極端な値の検証"""
        # 非常に大きな値
        with self.assertRaises(ValidationError):
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=9999999999,  # 極端に大きい
                monthly_rent=20,
                land_area=100,
                building_area=80
            )
        
        # Infinity
        with self.assertRaises(ValidationError):
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=float('inf'),  # Infinity
                monthly_rent=20,
                land_area=100,
                building_area=80
            )
    
    def test_null_character_removal(self):
        """NULL文字の除去"""
        data = {
            "property_name": "東京\x00マンション",
            "location": "東京都\x00港区",
            "purchase_price": 5000,
            "monthly_rent": 20,
            "land_area": 100,
            "building_area": 80
        }
        
        model = PropertyInputModel(**data)
        self.assertNotIn("\x00", model.property_name)
        self.assertNotIn("\x00", model.location)
    
    def test_string_length_limits(self):
        """文字列長の制限"""
        # 長すぎる物件名
        with self.assertRaises(ValidationError):
            PropertyInputModel(
                property_name="あ" * 201,  # 200文字を超える
                location="東京",
                purchase_price=5000,
                monthly_rent=20,
                land_area=100,
                building_area=80
            )
        
        # 長すぎるメモ
        with self.assertRaises(ValidationError):
            PropertyInputModel(
                property_name="テスト",
                location="東京",
                purchase_price=5000,
                monthly_rent=20,
                land_area=100,
                building_area=80,
                memo="あ" * 5001  # 5000文字を超える
            )


if __name__ == '__main__':
    unittest.main()