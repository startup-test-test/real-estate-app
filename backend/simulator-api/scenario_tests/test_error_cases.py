"""
エラーが発生していた箇所のユニットテスト
"""
import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.calculations import (
    calculate_monthly_loan_payment,
    calculate_cash_flow_table,
    run_full_simulation
)

class TestErrorCases:
    """エラーケースのテスト"""
    
    def test_loan_years_zero(self):
        """ローン期間が0の場合のテスト"""
        # ローン期間が0でもエラーにならないことを確認
        result = calculate_monthly_loan_payment(
            loan_amount=1000,  # 1000万円
            interest_rate=3,   # 3%
            loan_years=0       # 0年
        )
        assert result == 0  # 0を返すべき
    
    def test_loan_years_negative(self):
        """ローン期間が負の場合のテスト"""
        result = calculate_monthly_loan_payment(
            loan_amount=1000,
            interest_rate=3,
            loan_years=-5
        )
        assert result == 0
    
    def test_expected_sale_price_none(self):
        """想定売却価格がNoneの場合のテスト"""
        test_data = {
            'property_name': 'テスト物件',
            'location': '東京都',
            'purchase_price': 5000,
            'loan_amount': 3000,
            'loan_years': 30,
            'interest_rate': 3,
            'monthly_rent': 100000,
            'vacancy_rate': 5,
            'management_fee': 5000,
            'fixed_cost': 3000,
            'property_tax': 100000,
            'renovation_cost': 100,
            'other_costs': 200,
            'holding_years': 10,
            'exit_cap_rate': 5,
            'expected_sale_price': None,  # Noneを設定
            'price_decline_rate': 1,
            'building_price': 3000,
            'depreciation_years': 30
        }
        
        # エラーが発生しないことを確認
        cf_table = calculate_cash_flow_table(test_data)
        assert len(cf_table) > 0
        
        # 売却価格内訳が正しく計算されることを確認
        first_year = cf_table[0]
        assert '売却価格内訳' in first_year
        assert first_year['売却価格内訳']['想定価格'] == 0
    
    def test_price_decline_rate_with_none_expected_price(self):
        """価格下落率が設定されていて想定価格がNoneの場合"""
        test_data = {
            'property_name': 'テスト物件',
            'location': '東京都',
            'purchase_price': 5000,
            'loan_amount': 3000,
            'loan_years': 30,
            'interest_rate': 3,
            'monthly_rent': 100000,
            'vacancy_rate': 5,
            'management_fee': 5000,
            'fixed_cost': 3000,
            'property_tax': 100000,
            'renovation_cost': 100,
            'other_costs': 200,
            'holding_years': 10,
            'exit_cap_rate': 5,
            'expected_sale_price': None,
            'price_decline_rate': 10,  # 10%の下落率
            'building_price': 3000,
            'depreciation_years': 30
        }
        
        # エラーが発生しないことを確認
        cf_table = calculate_cash_flow_table(test_data)
        assert len(cf_table) > 0
        
        # 売却価格内訳が正しく計算されることを確認
        for year_data in cf_table:
            assert year_data['売却価格内訳']['想定価格'] == 0
    
    def test_full_simulation_with_edge_cases(self):
        """エッジケースでのフルシミュレーション"""
        test_data = {
            'property_name': 'エッジケーステスト',
            'location': '東京都',
            'purchase_price': 5000,
            'loan_amount': 3000,
            'loan_years': 0,  # ローン期間0
            'interest_rate': 0,  # 金利0
            'monthly_rent': 100000,
            'vacancy_rate': 0,
            'management_fee': 5000,
            'fixed_cost': 3000,
            'property_tax': 100000,
            'renovation_cost': 100,
            'other_costs': 200,
            'holding_years': 10,
            'exit_cap_rate': 5,
            'expected_sale_price': None,  # 想定価格None
            'price_decline_rate': 0,  # 価格下落率0
            'building_price': 3000,
            'depreciation_years': 30
        }
        
        # エラーが発生しないことを確認
        result = run_full_simulation(test_data)
        assert 'results' in result
        assert 'cash_flow_table' in result
        assert len(result['cash_flow_table']) == 10  # 10年分
    
    def test_zero_division_cases(self):
        """ゼロ除算が発生しうるケースのテスト"""
        # ローン期間0、金利0のケース
        monthly_payment = calculate_monthly_loan_payment(
            loan_amount=1000,
            interest_rate=0,  # 金利0
            loan_years=0      # ローン期間0
        )
        assert monthly_payment == 0  # エラーではなく0を返す

if __name__ == "__main__":
    pytest.main([__file__, "-v"])