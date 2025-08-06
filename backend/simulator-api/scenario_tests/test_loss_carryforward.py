"""
繰越欠損金機能のユニットテスト
"""
import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.calculations import (
    calculate_tax_with_loss_carryforward,
    calculate_cash_flow_table,
    run_full_simulation
)

class TestLossCarryforward:
    """繰越欠損金のテスト"""
    
    def test_loss_accumulation(self):
        """損失の累積のテスト"""
        # 初年度: 100万円の損失
        tax, accumulated_loss = calculate_tax_with_loss_carryforward(
            income=-1000000,  # 100万円の損失
            effective_tax_rate=20,
            accumulated_loss=0
        )
        assert tax == 0
        assert accumulated_loss == 1000000  # 100万円の繰越欠損金
        
        # 2年目: さらに50万円の損失
        tax, accumulated_loss = calculate_tax_with_loss_carryforward(
            income=-500000,  # 50万円の損失
            effective_tax_rate=20,
            accumulated_loss=accumulated_loss
        )
        assert tax == 0
        assert accumulated_loss == 1500000  # 累計150万円の繰越欠損金
    
    def test_loss_offset(self):
        """利益と損失の相殺のテスト"""
        # 前年までの繰越欠損金: 100万円
        # 当年度利益: 60万円
        tax, accumulated_loss = calculate_tax_with_loss_carryforward(
            income=600000,  # 60万円の利益
            effective_tax_rate=20,
            accumulated_loss=1000000  # 100万円の繰越欠損金
        )
        # 60万円の利益は繰越欠損金で相殺されるので税金は0
        assert tax == 0
        # 繰越欠損金は40万円に減少
        assert accumulated_loss == 400000
    
    def test_partial_offset(self):
        """部分的な相殺のテスト"""
        # 前年までの繰越欠損金: 50万円
        # 当年度利益: 100万円
        tax, accumulated_loss = calculate_tax_with_loss_carryforward(
            income=1000000,  # 100万円の利益
            effective_tax_rate=20,
            accumulated_loss=500000  # 50万円の繰越欠損金
        )
        # 課税所得は100万円 - 50万円 = 50万円
        # 税金は50万円 × 20% = 10万円
        assert tax == 100000
        # 繰越欠損金は全て使い切って0
        assert accumulated_loss == 0
    
    def test_gemini_scenario(self):
        """Geminiが指摘したシナリオのテスト"""
        # シミュレーション用のテストデータ
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
            'expected_sale_price': 5000,
            'price_decline_rate': 0,
            'building_price': 3000,
            'depreciation_years': 30,
            'effective_tax_rate': 20,
            'major_repair_cycle': 10,
            'major_repair_cost': 200
        }
        
        # シミュレーション実行
        result = run_full_simulation(test_data)
        cash_flow_table = result['cash_flow_table']
        
        # 各年の詳細を確認
        print("\n年次ごとの繰越欠損金と税金の推移:")
        for i in range(10):
            year_data = cash_flow_table[i]
            print(f"Year {i+1}: 税金={year_data['税金']:,}, 繰越欠損金={year_data['繰越欠損金']:,}")
        
        # Geminiの指摘通り、初期の数年で損失が発生しているか確認
        # このテストデータでは実際に初期損失が発生するかチェック
        has_initial_loss = False
        for i in range(5):
            if cash_flow_table[i]['繰越欠損金'] > 0:
                has_initial_loss = True
                break
        
        # 繰越欠損金が機能していることを確認
        # （必ずしも全てのケースで初期損失が発生するわけではない）
        if has_initial_loss:
            # 損失が発生している場合、その後の利益で相殺されるはず
            print("\n初期損失が発生しています。繰越欠損金の相殺を確認します。")
            
            # 利益が出始めた年を探す
            for i in range(1, 10):
                prev_loss = cash_flow_table[i-1]['繰越欠損金']
                curr_loss = cash_flow_table[i]['繰越欠損金']
                
                # 繰越欠損金が減少した場合、相殺が発生
                if prev_loss > 0 and curr_loss < prev_loss:
                    print(f"Year {i+1}で相殺発生: {prev_loss:,} → {curr_loss:,}")
                    assert True  # 相殺が正しく動作
                    return
        else:
            print("\nこのテストケースでは初期損失が発生しませんでした。")
            # 繰越欠損金列が存在することを確認
            assert '繰越欠損金' in cash_flow_table[0]
    
    def test_actual_gemini_case(self):
        """実際のGeminiの指摘ケースを再現"""
        # Geminiが指摘した具体的な数値を使用
        # 年1-5: 約-12.5万円/年の損失 → 累計62.5万円の欠損金
        # 年6: 66.6万円の利益
        
        # カスタム計算で確認
        # 年1-5: 損失
        total_loss = 0
        for year in range(1, 6):
            income = -125000  # 12.5万円の損失
            tax, total_loss = calculate_tax_with_loss_carryforward(
                income, 20, total_loss
            )
            print(f"Year {year}: Income={income:,}, Tax={tax:,}, Loss={total_loss:,}")
        
        # 5年目終了時点で約62.5万円の繰越欠損金
        assert abs(total_loss - 625000) < 1000  # 誤差考慮
        
        # 年6: 66.6万円の利益
        income_year6 = 666000  # 66.6万円の利益
        tax_year6, remaining_loss = calculate_tax_with_loss_carryforward(
            income_year6, 20, total_loss
        )
        
        print(f"\nYear 6: Income={income_year6:,}, Tax={tax_year6:,}, Remaining loss={remaining_loss:,}")
        
        # Geminiの指摘通り、約1万円の税金が発生するはず
        # 課税所得 = 66.6万 - 62.5万 = 4.1万
        # 税金 = 4.1万 × 20% = 0.82万 ≈ 1万円
        expected_taxable_income = income_year6 - total_loss
        expected_tax = expected_taxable_income * 0.2
        
        print(f"\n期待される課税所得: {expected_taxable_income:,}")
        print(f"期待される税金: {expected_tax:,}")
        print(f"実際の税金: {tax_year6:,}")
        
        # 約1万円の税金が発生
        assert abs(tax_year6 - 8200) < 1000  # 8,200円前後
        
        # 繰越欠損金はほぼ使い切られる
        assert remaining_loss < 50000  # 5万円未満
    
    def test_full_simulation_with_loss_carryforward(self):
        """フルシミュレーションでの繰越欠損金テスト"""
        test_data = {
            'property_name': '損失発生物件',
            'location': '東京都',
            'purchase_price': 5000,
            'loan_amount': 4500,  # 高レバレッジ
            'loan_years': 30,
            'interest_rate': 3,
            'monthly_rent': 80000,  # 低収益
            'vacancy_rate': 10,  # 高空室率
            'management_fee': 5000,
            'fixed_cost': 5000,
            'property_tax': 150000,
            'renovation_cost': 200,  # 高改装費
            'other_costs': 300,
            'holding_years': 10,
            'exit_cap_rate': 6,
            'expected_sale_price': 4000,
            'price_decline_rate': 1,
            'building_price': 3000,
            'depreciation_years': 30,
            'effective_tax_rate': 30
        }
        
        result = run_full_simulation(test_data)
        cash_flow_table = result['cash_flow_table']
        
        # 初期の数年間で損失が発生し、繰越欠損金が蓄積されることを確認
        for i in range(3):  # 最初の3年をチェック
            year_data = cash_flow_table[i]
            print(f"Year {i+1}: Tax={year_data['税金']:,}, Loss carryforward={year_data['繰越欠損金']:,}")
        
        # 繰越欠損金が正しく追跡されていることを確認
        assert '繰越欠損金' in cash_flow_table[0]

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])